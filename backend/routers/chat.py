import json
import threading
from fastapi import APIRouter, WebSocket, WebSocketDisconnect
from sqlalchemy.orm import Session

from database import SessionLocal
from models import User, Conversation
from agents.graph import run_agent

router = APIRouter(prefix="/api/chat", tags=["chat"])


@router.websocket("/ws/{user_id}")
async def websocket_chat(websocket: WebSocket, user_id: str):
    """WebSocket 聊天端点，user_id 支持 UUID 或用户名"""
    await websocket.accept()
    db = SessionLocal()
    try:
        while True:
            data = await websocket.receive_text()

            # 解析客户端消息
            try:
                payload = json.loads(data)
            except json.JSONDecodeError:
                await websocket.send_json({"type": "error", "message": "消息格式错误，需要 JSON"})
                continue

            message = payload.get("content", "").strip()
            if not message:
                continue

            # 查找用户（支持 UUID 或用户名）
            user = db.query(User).filter(
                (User.id == user_id) | (User.username == user_id)
            ).first()
            if not user:
                await websocket.send_json({"type": "error", "message": "用户不存在"})
                continue

            # 保存用户消息
            user_msg = Conversation(user_id=user.id, role="user", content=message)
            db.add(user_msg)
            db.commit()

            # 获取最近对话历史
            history = (
                db.query(Conversation)
                .filter(Conversation.user_id == user.id)
                .order_by(Conversation.created_at.desc())
                .limit(10)
                .all()
            )
            history.reverse()
            message_history = [{"role": m.role, "content": m.content} for m in history]

            # 运行 Agent 管线
            try:
                enriched_state = run_agent(user.id, message, message_history, db)
            except Exception as e:
                await websocket.send_json({"type": "error", "message": f"Agent 错误: {e}"})
                continue

            # 发送情绪数据
            await websocket.send_json({
                "type": "emotion",
                "data": {
                    "emotion": enriched_state["emotion"],
                    "score": enriched_state["emotion_score"],
                },
            })

            # 流式发送 AI 回复
            full_response = ""
            try:
                for chunk in response_node_stream(enriched_state, db):
                    full_response += chunk
                    await websocket.send_json({"type": "stream", "content": chunk})
            except Exception as e:
                await websocket.send_json({"type": "error", "message": f"回复生成失败: {e}"})
                continue

            # 完成标记
            await websocket.send_json({"type": "done"})

            # 后台延迟提取记忆
            if enriched_state.get("_deferred_memory"):
                threading.Thread(
                    target=_deferred_memory_extract,
                    args=(user.id, message, enriched_state.get("emotion", "calm")),
                    daemon=True,
                ).start()

    except WebSocketDisconnect:
        pass
    except Exception as e:
        try:
            await websocket.send_json({"type": "error", "message": str(e)})
        except Exception:
            pass
    finally:
        db.close()


def _deferred_memory_extract(user_id: str, message: str, emotion: str):
    """后台线程：延迟提取记忆"""
    from agents.nodes import deferred_extract_memory
    db = SessionLocal()
    try:
        deferred_extract_memory(user_id, message, emotion, db)
    finally:
        db.close()


def response_node_stream(state: dict, db: Session):
    """生成 AI 回复（同步生成器）"""
    from services.llm import call_ai_stream_sync
    from prompts.companion import build_companion_system_prompt

    system_prompt = build_companion_system_prompt(
        persona_prompt=state.get("persona_prompt", ""),
        memories=state.get("memories", []),
        user_profile=state.get("user_profile", ""),
        emotion=state.get("emotion", ""),
        emotion_score=state.get("emotion_score", 0.0),
    )

    recent_messages = state.get("messages", [])[-6:]
    conversation = ""
    for msg in recent_messages:
        role = "用户" if msg.get("role") == "user" else "AI"
        conversation += f"{role}: {msg.get('content', '')}\n"
    conversation += f"用户: {state['user_message']}"

    full_response = ""
    for chunk in call_ai_stream_sync(conversation, system=system_prompt, temperature=0.8):
        full_response += chunk
        yield chunk

    # 保存助手回复
    msg = Conversation(
        user_id=state["user_id"],
        role="assistant",
        content=full_response,
        emotion=state.get("emotion"),
        emotion_score=state.get("emotion_score"),
    )
    db.add(msg)
    db.commit()


@router.get("/history/{user_id}")
def get_chat_history(user_id: str, limit: int = 50):
    """获取聊天历史"""
    from database import SessionLocal
    db = SessionLocal()
    try:
        messages = (
            db.query(Conversation)
            .filter(Conversation.user_id == user_id)
            .order_by(Conversation.created_at.desc())
            .limit(limit)
            .all()
        )
        messages.reverse()
        return [
            {
                "id": m.id,
                "role": m.role,
                "content": m.content,
                "emotion": m.emotion,
                "emotion_score": m.emotion_score,
                "created_at": m.created_at.isoformat(),
            }
            for m in messages
        ]
    finally:
        db.close()
