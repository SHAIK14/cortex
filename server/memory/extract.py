import json
from openai import AsyncOpenAI
from llm.openai import chat_completion
from memory.prompts import EXTRACTION_PROMPT


async def extract_memories(messages: list[dict], llm_client: AsyncOpenAI) -> list[dict]:
    """
    Extract facts/memories from a conversation.

    Args:
        messages: List of conversation messages
        llm_client: OpenAI client (created from user's API key)

    Returns:
        List of extracted facts with type, confidence, category, etc.
    """
    conversation = "\n".join([
        f"{msg['role'].upper()}: {msg['content']}" for msg in messages
    ])
    user_prompt = f"Conversation:\n{conversation}"

    response = await chat_completion(
        client=llm_client,
        system_prompt=EXTRACTION_PROMPT,
        user_prompt=user_prompt,
        response_format={"type": "json_object"}
    )

    try:
        result = json.loads(response)
        return result.get("facts", [])
    except json.JSONDecodeError:
        return []
