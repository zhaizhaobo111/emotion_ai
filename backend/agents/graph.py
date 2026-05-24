from sqlalchemy.orm import Session
from agents.nodes import emotion_node, memory_node, profile_node, persona_node


def run_agent(user_id: str, user_message: str, message_history: list[dict], db: Session) -> dict:
    """运行 Agent 管线，优化为最小化 API 调用次数"""
    state = {
        "messages": message_history,
        "user_id": user_id,
        "user_message": user_message,
        "emotion": "",
        "emotion_score": 0.0,
        "memories": [],
        "user_profile": "",
        "persona": "gentle_sister",
        "persona_prompt": "",
        "ai_response": "",
    }

    # 第一步：情绪分析（必须，用于回复语气调整）
    state.update(emotion_node(state, db))

    # 第二步：记忆检索（仅查数据库，不调 API）
    state.update(memory_node(state, db, skip_extract=True))

    # 第三步：人格选择（仅查数据库，不调 API）
    state.update(persona_node(state, db))

    # 画像摘要跳过（每次调 API 太慢，改为记忆直接提供上下文）
    # 记忆提取移到回复完成后异步执行
    state["_deferred_memory"] = True

    return state
