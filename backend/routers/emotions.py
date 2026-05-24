from datetime import datetime, timedelta, timezone

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from database import get_db, resolve_user_id
from models import EmotionRecord

router = APIRouter(prefix="/api/emotions", tags=["emotions"])


def _utcnow() -> datetime:
    """获取当前 UTC 时间，兼容 Python 3.12+"""
    return datetime.now(timezone.utc)


@router.get("/{user_id}")
def get_emotions(user_id: str, limit: int = 50, db: Session = Depends(get_db)):
    """获取用户情绪记录列表"""
    uid = resolve_user_id(db, user_id)
    records = (
        db.query(EmotionRecord)
        .filter(EmotionRecord.user_id == uid)
        .order_by(EmotionRecord.created_at.desc())
        .limit(limit)
        .all()
    )
    return [
        {"id": r.id, "emotion": r.emotion, "score": r.score, "context": r.context, "created_at": r.created_at.isoformat()}
        for r in records
    ]


@router.get("/{user_id}/today")
def get_today_emotions(user_id: str, db: Session = Depends(get_db)):
    """获取今日情绪数据及分布"""
    uid = resolve_user_id(db, user_id)
    today = _utcnow().replace(hour=0, minute=0, second=0, microsecond=0)
    records = (
        db.query(EmotionRecord)
        .filter(EmotionRecord.user_id == uid, EmotionRecord.created_at >= today)
        .order_by(EmotionRecord.created_at.desc())
        .all()
    )

    if not records:
        return {"period": "today", "records": [], "dominant_emotion": None, "distribution": {}}

    dist: dict[str, float] = {}
    for r in records:
        dist[r.emotion] = dist.get(r.emotion, 0) + 1
    total = len(records)
    for k in dist:
        dist[k] = round(dist[k] / total, 2)

    return {
        "period": "today",
        "records": [{"emotion": r.emotion, "score": r.score, "context": r.context, "created_at": r.created_at.isoformat()} for r in records],
        "dominant_emotion": max(dist, key=dist.get),
        "distribution": dist,
    }


@router.get("/{user_id}/week")
def get_week_emotions(user_id: str, db: Session = Depends(get_db)):
    """获取近 7 天情绪数据、分布及每日趋势"""
    uid = resolve_user_id(db, user_id)
    week_ago = _utcnow() - timedelta(days=7)
    records = (
        db.query(EmotionRecord)
        .filter(EmotionRecord.user_id == uid, EmotionRecord.created_at >= week_ago)
        .order_by(EmotionRecord.created_at.asc())
        .all()
    )

    if not records:
        return {"period": "week", "records": [], "dominant_emotion": None, "distribution": {}, "daily_trend": []}

    dist: dict[str, float] = {}
    for r in records:
        dist[r.emotion] = dist.get(r.emotion, 0) + 1
    total = len(records)
    for k in dist:
        dist[k] = round(dist[k] / total, 2)

    daily: dict[str, list] = {}
    for r in records:
        day = r.created_at.strftime("%Y-%m-%d")
        daily.setdefault(day, []).append(r.emotion)

    daily_trend = [
        {"date": day, "dominant": max(set(emotions), key=emotions.count), "count": len(emotions)}
        for day, emotions in sorted(daily.items())
    ]

    return {
        "period": "week",
        "records": [{"emotion": r.emotion, "score": r.score, "context": r.context, "created_at": r.created_at.isoformat()} for r in records],
        "dominant_emotion": max(dist, key=dist.get),
        "distribution": dist,
        "daily_trend": daily_trend,
    }


@router.get("/{user_id}/report")
def get_emotion_report(user_id: str, db: Session = Depends(get_db)):
    """生成 AI 情绪周报"""
    from services.llm import call_ai

    uid = resolve_user_id(db, user_id)
    week_ago = _utcnow() - timedelta(days=7)
    records = (
        db.query(EmotionRecord)
        .filter(EmotionRecord.user_id == uid, EmotionRecord.created_at >= week_ago)
        .order_by(EmotionRecord.created_at.asc())
        .all()
    )

    if not records:
        return {"report": "本周暂无情绪记录，开始和 AI 聊天来记录你的情绪吧！"}

    emotion_map = {
        "happy": "开心", "anxious": "焦虑", "stressed": "压力",
        "sad": "低落", "lonely": "孤独", "angry": "生气",
        "calm": "平静", "excited": "兴奋",
    }

    summary_lines = [f"- {r.created_at.strftime('%m-%d %H:%M')} {emotion_map.get(r.emotion, r.emotion)}({r.score:.0%})" for r in records[-30:]]
    summary_text = "\n".join(summary_lines)

    prompt = f"""根据以下用户本周的情绪记录，生成一份温暖的情绪报告。

情绪记录：
{summary_text}

报告要求：总结本周情绪整体状态，指出高频情绪和变化趋势，给出 2-3 条具体建议，结尾加一句鼓励的话，用中文，300 字以内。"""

    report = call_ai(prompt, temperature=0.7, max_tokens=500)
    return {"report": report}
