from prompts.personas import PERSONAS


def get_persona_prompt(persona_key: str) -> str:
    persona = PERSONAS.get(persona_key, PERSONAS["gentle_sister"])
    return persona["prompt"]


def get_persona_info(persona_key: str) -> dict:
    return PERSONAS.get(persona_key, PERSONAS["gentle_sister"])


def list_personas() -> list[dict]:
    return [
        {"key": p["key"], "name": p["name"], "description": p["description"]}
        for p in PERSONAS.values()
    ]
