def build_companion_system_prompt(persona_prompt: str, memories: list[str], user_profile: str, emotion: str, emotion_score: float) -> str:
    memory_text = ""
    if memories:
        memory_text = "\n".join(f"- {m}" for m in memories)
        memory_text = f"\n\n你记住的关于用户的信息：\n{memory_text}"

    profile_text = ""
    if user_profile:
        profile_text = f"\n\n用户画像：\n{user_profile}"

    emotion_text = ""
    if emotion:
        emotion_map = {
            "happy": "开心",
            "anxious": "焦虑",
            "stressed": "有压力",
            "sad": "低落",
            "lonely": "孤独",
            "angry": "生气",
            "calm": "平静",
            "excited": "兴奋",
        }
        emotion_cn = emotion_map.get(emotion, emotion)
        emotion_text = f"\n\n用户当前情绪：{emotion_cn}（强度 {emotion_score:.0%}）"

    return f"""{persona_prompt}
{memory_text}
{profile_text}
{emotion_text}

注意事项：
- 回复要自然、温暖、有共情
- 适当引用你记住的信息，让对话有连续感
- 根据用户情绪调整语气和建议
- 回复控制在 2-4 句话，不要太长
- 使用中文回复
- 不要像机器人，像一个关心用户的朋友"""
