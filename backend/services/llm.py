import json
import httpx
from config import DASHSCOPE_API_KEY, DASHSCOPE_BASE_URL, DASHSCOPE_MODEL


def call_ai(prompt: str, system: str = "", temperature: float = 0.7, max_tokens: int = 1024) -> str:
    """调用 LLM API，返回 content 文本"""
    messages = []
    if system:
        messages.append({"role": "system", "content": system})
    messages.append({"role": "user", "content": prompt})

    with httpx.Client(timeout=60) as client:
        resp = client.post(
            DASHSCOPE_BASE_URL,
            headers={
                "Authorization": f"Bearer {DASHSCOPE_API_KEY}",
                "Content-Type": "application/json",
            },
            json={
                "model": DASHSCOPE_MODEL,
                "messages": messages,
                "temperature": temperature,
                "max_tokens": max_tokens,
                "stream": False,
            },
        )
        resp.raise_for_status()
        data = resp.json()
        msg = data["choices"][0]["message"]
        content = msg.get("content", "") or ""
        # MiMo 推理模型：content 为空时尝试取 reasoning_content
        if not content.strip():
            content = msg.get("reasoning_content", "") or ""
        return content


def call_ai_stream(prompt: str, system: str = "", temperature: float = 0.7, max_tokens: int = 1024):
    """流式调用 LLM API，缓冲后批量 yield，避免碎片化输出"""
    messages = []
    if system:
        messages.append({"role": "system", "content": system})
    messages.append({"role": "user", "content": prompt})

    # 缓冲配置：遇到标点或达到最小长度时 flush
    BUFFER_MIN_LEN = 10
    FLUSH_CHARS = set("，。！？；：、,.!?;\n")

    buffer = ""

    with httpx.Client(timeout=120) as client:
        with client.stream(
            "POST",
            DASHSCOPE_BASE_URL,
            headers={
                "Authorization": f"Bearer {DASHSCOPE_API_KEY}",
                "Content-Type": "application/json",
            },
            json={
                "model": DASHSCOPE_MODEL,
                "messages": messages,
                "temperature": temperature,
                "max_tokens": max_tokens,
                "stream": True,
            },
        ) as resp:
            resp.raise_for_status()
            for line in resp.iter_lines():
                if not line.startswith("data: "):
                    continue
                data = line[6:]
                if data.strip() == "[DONE]":
                    break
                try:
                    chunk = json.loads(data)
                    delta = chunk["choices"][0].get("delta", {})
                    content = delta.get("content", "")
                    if not content:
                        continue
                    buffer += content
                    # 遇到标点或缓冲区够大时 flush
                    if content in FLUSH_CHARS or len(buffer) >= BUFFER_MIN_LEN:
                        yield buffer
                        buffer = ""
                except (json.JSONDecodeError, KeyError, IndexError):
                    continue

            # flush 剩余内容
            if buffer:
                yield buffer


# 兼容别名
call_ai_stream_sync = call_ai_stream


def call_ai_json(prompt: str, system: str = "", temperature: float = 0.3, max_tokens: int = 512) -> dict:
    """调用 LLM 并解析 JSON 响应，多层容错提取 JSON"""
    import re

    raw = call_ai(prompt, system, temperature, max_tokens).strip()
    if not raw:
        raise ValueError("LLM 返回空响应")

    # 1. 直接解析
    try:
        return json.loads(raw)
    except json.JSONDecodeError:
        pass

    # 2. 去除 markdown 代码块
    match = re.search(r"```(?:json)?\s*\n?(.*?)\n?\s*```", raw, re.DOTALL)
    if match:
        try:
            return json.loads(match.group(1).strip())
        except json.JSONDecodeError:
            pass

    # 3. 提取第一个 { ... } JSON 对象
    match = re.search(r"\{[^{}]*\}", raw)
    if match:
        try:
            return json.loads(match.group(0))
        except json.JSONDecodeError:
            pass

    raise ValueError(f"无法从 LLM 响应中提取 JSON: {raw[:200]}")
