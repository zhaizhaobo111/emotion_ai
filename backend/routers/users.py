from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from database import get_db
from models import User
from schemas import UserCreate

router = APIRouter(prefix="/api/users", tags=["users"])


@router.post("/")
def create_user(data: UserCreate, db: Session = Depends(get_db)):
    """创建用户，用户名已存在则返回已有用户"""
    existing = db.query(User).filter(User.username == data.username).first()
    if existing:
        return {"id": existing.id, "username": existing.username, "persona": existing.persona, "created_at": existing.created_at.isoformat()}

    user = User(username=data.username)
    db.add(user)
    db.commit()
    db.refresh(user)
    return {"id": user.id, "username": user.username, "persona": user.persona, "created_at": user.created_at.isoformat()}


@router.get("/{user_id}")
def get_user(user_id: str, db: Session = Depends(get_db)):
    """根据 ID 获取用户信息"""
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="用户不存在")
    return {"id": user.id, "username": user.username, "persona": user.persona, "created_at": user.created_at.isoformat()}


@router.get("/")
def list_users(db: Session = Depends(get_db)):
    """获取最近 20 个用户"""
    users = db.query(User).order_by(User.created_at.desc()).limit(20).all()
    return [{"id": u.id, "username": u.username, "persona": u.persona} for u in users]
