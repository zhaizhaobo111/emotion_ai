from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from database import get_db, resolve_user_id
from models import User
from schemas import PersonaUpdate
from services.persona_service import list_personas, get_persona_info

router = APIRouter(prefix="/api/personas", tags=["personas"])


@router.get("/")
def get_personas():
    """获取所有人格列表"""
    return list_personas()


@router.get("/{persona_key}")
def get_persona(persona_key: str):
    """获取指定人格详情"""
    return get_persona_info(persona_key)


@router.put("/{user_id}")
def update_persona(user_id: str, data: PersonaUpdate, db: Session = Depends(get_db)):
    """更新用户人格"""
    valid_keys = ["gentle_sister", "rational_friend", "energetic_girl", "healing_companion"]
    if data.persona not in valid_keys:
        raise HTTPException(status_code=400, detail=f"无效人格，可选: {valid_keys}")

    uid = resolve_user_id(db, user_id)
    user = db.query(User).filter(User.id == uid).first()
    user.persona = data.persona
    db.commit()
    return {"message": "人格已更新", "persona": data.persona}
