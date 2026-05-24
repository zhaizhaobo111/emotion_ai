from sqlalchemy.orm import Session

from services.emotion_analyzer import analyze_emotion
from services.memory_service import get_relevant_memories, extract_and_save_memory
from services.profile_service import get_user_profile_summary
from services.persona_service import get_persona_prompt
from prompts.companion import build_companion_system_prompt


def emotion_node(state: dict, db: Session) -> dict:
    """分析用户情绪并保存记录，任何异常返回默认值"""
    message = state["user_message"]
    try:
        result = analyze_emotion(message)
    except Exception as e:
        print(f"[emotion_node] 异常: {e}")
        result = {"emotion": "calm", "score": 0.5}

    try:
        from models import EmotionRecord
        record = EmotionRecord(
            user_id=state["user_id"],
            emotion=result["emotion"],
            score=result["score"],
            context=message[:200],
        )
        db.add(record)
        db.commit()
    except Exception as e:
        print(f"[emotion_node] 保存记录失败: {e}")

    return {"emotion": result["emotion"], "emotion_score": result["score"]}


def memory_node(state: dict, db: Session, skip_extract: bool = False) -> dict:
    """检索相关记忆，可选跳过记忆提取（延迟到回复后执行）"""
    user_id = state["user_id"]
    message = state["user_message"]

    memories = get_relevant_memories(db, user_id, message)

    # 仅在非跳过模式下调用 API 提取记忆
    if not skip_extract:
        extract_and_save_memory(db, user_id, message, state.get("emotion", "calm"))

    return {"memories": memories}


def profile_node(state: dict, db: Session) -> dict:
    """生成用户画像摘要"""
    user_id = state["user_id"]
    profile = get_user_profile_summary(db, user_id)
    return {"user_profile": profile}


def persona_node(state: dict, db: Session) -> dict:
    """获取用户当前人格配置"""
    from models import User

    user_id = state["user_id"]
    user = db.query(User).filter(User.id == user_id).first()
    persona_key = user.persona if user else "gentle_sister"

    prompt = get_persona_prompt(persona_key)
    return {"persona": persona_key, "persona_prompt": prompt}


def deferred_extract_memory(user_id: str, message: str, emotion: str, db: Session):
    """延迟执行的记忆提取，在回复发送后调用"""
    try:
        extract_and_save_memory(db, user_id, message, emotion)
    except Exception:
        pass  # 后台任务不影响用户体验
