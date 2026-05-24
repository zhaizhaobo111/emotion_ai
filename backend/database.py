from fastapi import HTTPException
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, DeclarativeBase, Session

from config import DATABASE_URL

engine = create_engine(DATABASE_URL, echo=False, pool_pre_ping=True)
SessionLocal = sessionmaker(bind=engine, autoflush=False, expire_on_commit=False)


class Base(DeclarativeBase):
    pass


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def init_db():
    Base.metadata.create_all(bind=engine)


def resolve_user_id(db: Session, identifier: str) -> str:
    """将用户名或 UUID 解析为用户 ID，找不到则抛 404"""
    from models import User
    user = db.query(User).filter(
        (User.id == identifier) | (User.username == identifier)
    ).first()
    if not user:
        raise HTTPException(status_code=404, detail="用户不存在")
    return user.id
