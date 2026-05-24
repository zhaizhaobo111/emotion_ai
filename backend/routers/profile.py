from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from database import get_db, resolve_user_id
from services.profile_service import get_user_profile, get_user_profile_summary

router = APIRouter(prefix="/api/profile", tags=["profile"])


@router.get("/{user_id}")
def get_profile(user_id: str, db: Session = Depends(get_db)):
    """获取用户画像（含记忆和近期情绪）"""
    uid = resolve_user_id(db, user_id)
    data = get_user_profile(db, uid)
    if not data:
        raise HTTPException(status_code=404, detail="用户不存在")

    user = data["user"]
    memories = data["memories"]
    emotions = data["recent_emotions"]

    emotion_map = {
        "happy": "开心", "anxious": "焦虑", "stressed": "压力",
        "sad": "低落", "lonely": "孤独", "angry": "生气",
        "calm": "平静", "excited": "兴奋",
    }

    return {
        "username": user.username,
        "persona": user.persona,
        "memories": [{"content": m.content, "category": m.category, "importance": m.importance} for m in memories],
        "recent_emotions": [{"emotion": emotion_map.get(e.emotion, e.emotion), "score": e.score, "created_at": e.created_at.isoformat()} for e in emotions],
    }


@router.get("/{user_id}/summary")
def get_profile_summary(user_id: str, db: Session = Depends(get_db)):
    """获取用户画像摘要（AI 生成）"""
    uid = resolve_user_id(db, user_id)
    summary = get_user_profile_summary(db, uid)
    return {"summary": summary}
