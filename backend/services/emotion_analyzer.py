import json
import re
from services.llm import call_ai
from prompts.emotion import EMOTION_ANALYSIS_SYSTEM, build_emotion_prompt

# 合法情绪列表
VALID_EMOTIONS = {"happy", "anxious", "stressed", "sad", "lonely", "angry", "calm", "excited"}

# 默认值（LLM 解析失败时使用）
DEFAULT_RESULT = {"emotion": "calm", "score": 0.5}


def analyze_emotion(message: str) -> dict:
    """分析用户消息情绪，多层容错保证不抛异常"""
    prompt = build_emotion_prompt(message)

    try:
        raw = call_ai(prompt, system=EMOTION_ANALYSIS_SYSTEM, temperature=0.3, max_tokens=512)
    except Exception as e:
        print(f"[emotion_analyzer] LLM 调用失败: {e}")
        return DEFAULT_RESULT.copy()

    result = _parse_emotion_json(raw)
    if result is None:
        print(f"[emotion_analyzer] JSON 解析失败，原始响应: {raw[:200]}")
        return DEFAULT_RESULT.copy()

    # 校验 emotion 字段
    emotion = result.get("emotion", "calm")
    if emotion not in VALID_EMOTIONS:
        emotion = "calm"

    # 校验 score 字段
    try:
        score = float(result.get("score", 0.5))
        score = max(0.0, min(1.0, score))
    except (ValueError, TypeError):
        score = 0.5

    return {"emotion": emotion, "score": score}


def _parse_emotion_json(raw: str) -> dict | None:
    """从 LLM 响应中提取 JSON，支持 markdown 包裹、前后缀杂文等"""
    if not raw or not raw.strip():
        return None

    text = raw.strip()

    # 1. 直接尝试解析
    try:
        return json.loads(text)
    except json.JSONDecodeError:
        pass

    # 2. 去除 markdown 代码块
    match = re.search(r"```(?:json)?\s*\n?(.*?)\n?\s*```", text, re.DOTALL)
    if match:
        try:
            return json.loads(match.group(1).strip())
        except json.JSONDecodeError:
            pass

    # 3. 提取第一个 { ... } JSON 对象
    match = re.search(r"\{[^{}]*\}", text)
    if match:
        try:
            return json.loads(match.group(0))
        except json.JSONDecodeError:
            pass

    return None
