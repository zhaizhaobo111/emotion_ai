from sqlalchemy.orm import Session
from models import Memory, EmotionRecord, User
from services.llm import call_ai


def get_user_profile_summary(db: Session, user_id: str) -> str:
    memories = (
        db.query(Memory)
        .filter(Memory.user_id == user_id)
        .order_by(Memory.importance.desc())
        .limit(15)
        .all()
    )
    emotions = (
        db.query(EmotionRecord)
        .filter(EmotionRecord.user_id == user_id)
        .order_by(EmotionRecord.created_at.desc())
        .limit(20)
        .all()
    )

    if not memories and not emotions:
        return ""

    memory_text = "\n".join(f"- [{m.category}] {m.content}" for m in memories) if memories else "暂无记忆"

    emotion_map = {
        "happy": "开心", "anxious": "焦虑", "stressed": "压力",
        "sad": "低落", "lonely": "孤独", "angry": "生气",
        "calm": "平静", "excited": "兴奋",
    }
    emotion_text = "\n".join(
        f"- {emotion_map.get(e.emotion, e.emotion)}({e.score:.0%}): {e.context or '无上下文'}"
        for e in emotions
    ) if emotions else "暂无情绪记录"

    prompt = f"""根据以下信息，生成简洁的用户画像摘要（3-5 句话）。

记忆信息：
{memory_text}

近期情绪记录：
{emotion_text}

要求：概括用户主要特征、生活状态、关注点，提及情绪趋势，用中文，简洁有力"""

    try:
        return call_ai(prompt, temperature=0.5, max_tokens=200)
    except Exception:
        return f"记忆 {len(memories)} 条，近期情绪记录 {len(emotions)} 条"


def get_user_profile(db: Session, user_id: str) -> dict:
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        return {}

    memories = (
        db.query(Memory)
        .filter(Memory.user_id == user_id)
        .order_by(Memory.importance.desc())
        .limit(10)
        .all()
    )
    emotions = (
        db.query(EmotionRecord)
        .filter(EmotionRecord.user_id == user_id)
        .order_by(EmotionRecord.created_at.desc())
        .limit(10)
        .all()
    )

    return {"user": user, "memories": memories, "recent_emotions": emotions}
