from datetime import datetime, timezone
from sqlalchemy.orm import Session
from models import Memory


def _utcnow() -> datetime:
    """获取当前 UTC 时间，兼容 Python 3.12+"""
    return datetime.now(timezone.utc)


def create_memory(db: Session, user_id: str, content: str, category: str = "general", importance: float = 0.5) -> Memory:
    """创建新记忆"""
    memory = Memory(user_id=user_id, content=content, category=category, importance=importance)
    db.add(memory)
    db.commit()
    db.refresh(memory)
    return memory


def get_memories(db: Session, user_id: str, limit: int = 10) -> list[Memory]:
    """获取用户记忆列表，按重要性和最后访问时间排序"""
    return (
        db.query(Memory)
        .filter(Memory.user_id == user_id)
        .order_by(Memory.importance.desc(), Memory.last_accessed.desc())
        .limit(limit)
        .all()
    )


def _tokenize_chinese(text: str) -> set[str]:
    """使用 jieba 对中文文本进行分词，返回词集合"""
    try:
        import jieba
        # jieba 分词，过滤掉单字符标点和空白
        words = jieba.lcut(text)
        return {w.strip().lower() for w in words if len(w.strip()) > 1}
    except ImportError:
        # jieba 不可用时回退到简单字符级匹配
        import re
        # 提取中文字符和英文单词
        chinese_chars = set(re.findall(r'[一-鿿]{2,}', text))
        english_words = set(re.findall(r'[a-zA-Z]{2,}', text.lower()))
        return chinese_chars | english_words


def get_relevant_memories(db: Session, user_id: str, message: str, limit: int = 5) -> list[str]:
    """基于分词相似度检索与当前消息相关的记忆"""
    memories = get_memories(db, user_id, limit=20)
    if not memories:
        return []

    # 对用户消息分词
    message_words = _tokenize_chinese(message)
    if not message_words:
        # 分词结果为空，回退到按重要性返回
        return [m.content for m in memories[:limit]]

    scored = []
    for m in memories:
        # 对记忆内容分词
        memory_words = _tokenize_chinese(m.content)
        # 计算交集大小作为相关性得分
        overlap = len(message_words & memory_words)
        # 综合考虑重叠度和重要性
        score = overlap * 2 + m.importance
        scored.append((score, m))

    # 按综合得分降序排列
    scored.sort(key=lambda x: x[0], reverse=True)
    result = [m.content for _, m in scored[:limit]]

    # 更新最后访问时间
    for _, m in scored[:limit]:
        m.last_accessed = _utcnow()
    db.commit()

    return result


def extract_and_save_memory(db: Session, user_id: str, message: str, emotion: str):
    """调用 LLM 从用户消息中提取值得长期记住的信息"""
    from services.llm import call_ai_json

    prompt = f"""分析以下用户消息，提取值得长期记住的信息。

用户消息：{message}
当前情绪：{emotion}

输出 JSON 格式：
{{"should_save": true/false, "content": "记忆内容", "category": "分类", "importance": 0.0-1.0}}

分类选项：work/health/emotion/relationship/hobby/general
只提取明确的、具体的个人信息。只输出 JSON。"""

    try:
        result = call_ai_json(prompt, temperature=0.2)
        if result.get("should_save") and result.get("content"):
            create_memory(
                db, user_id,
                content=result["content"],
                category=result.get("category", "general"),
                importance=min(1.0, max(0.0, float(result.get("importance", 0.5)))),
            )
    except Exception:
        pass
