import json
from llm.openai import chat_completion
from memory.prompts import EXTRACTION_PROMPT


async def extract_memories(messages: list[dict]) -> list[dict]:

    conversation = "\n".join([
        f"{msg['role'].upper()}: {msg['content']}" for msg in messages
    ])
    user_prompt = f"Conversation:\n{conversation}"

    response = await chat_completion(
        system_prompt=EXTRACTION_PROMPT,
        user_prompt=user_prompt,
        response_format={"type": "json_object"}
    )

    try:
        result = json.loads(response)
        return result.get("facts", [])
    except json.JSONDecodeError:
        return []
