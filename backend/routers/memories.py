from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from database import get_db, resolve_user_id
from models import Memory
from schemas import MemoryCreate
from services.memory_service import create_memory, get_memories

router = APIRouter(prefix="/api/memories", tags=["memories"])


@router.get("/{user_id}")
def list_memories(user_id: str, limit: int = 20, db: Session = Depends(get_db)):
    """获取用户记忆列表"""
    uid = resolve_user_id(db, user_id)
    memories = get_memories(db, uid, limit)
    return [
        {"id": m.id, "content": m.content, "category": m.category, "importance": m.importance, "last_accessed": m.last_accessed.isoformat(), "created_at": m.created_at.isoformat()}
        for m in memories
    ]


@router.post("/{user_id}")
def add_memory(user_id: str, data: MemoryCreate, db: Session = Depends(get_db)):
    """添加新记忆"""
    uid = resolve_user_id(db, user_id)
    m = create_memory(db, uid, data.content, data.category, data.importance)
    return {"id": m.id, "content": m.content, "category": m.category, "importance": m.importance}


@router.delete("/{memory_id}")
def delete_memory(memory_id: str, db: Session = Depends(get_db)):
    """删除指定记忆"""
    memory = db.query(Memory).filter(Memory.id == memory_id).first()
    if not memory:
        raise HTTPException(status_code=404, detail="记忆不存在")
    db.delete(memory)
    db.commit()
    return {"message": "已删除"}
