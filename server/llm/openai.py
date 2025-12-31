from openai import AsyncOpenAI
from dataclasses import dataclass


@dataclass
class ChatCompletionResult:
    """Result from chat completion including usage stats."""
    content: str
    prompt_tokens: int
    completion_tokens: int
    total_tokens: int
    model: str


def create_openai_client(api_key: str) -> AsyncOpenAI:
    """Create an OpenAI client with user-provided API key."""
    return AsyncOpenAI(api_key=api_key)


async def chat_completion(
    client: AsyncOpenAI,
    system_prompt: str,
    user_prompt: str,
    response_format: dict = None,
    temperature: float = 0.1,
    model: str = "gpt-4o-mini",
    return_usage: bool = False,
) -> str | ChatCompletionResult:
    """
    Run chat completion using the provided client.
    Client is created from user's API key.

    Args:
        return_usage: If True, returns ChatCompletionResult with token stats.
                     If False, returns just the content string (backward compatible).
    """
    messages = [
        {"role": "system", "content": system_prompt},
        {"role": "user", "content": user_prompt}
    ]

    kwargs = {
        "model": model,
        "messages": messages,
        "temperature": temperature
    }

    if response_format:
        kwargs["response_format"] = response_format

    response = await client.chat.completions.create(**kwargs)

    if return_usage:
        return ChatCompletionResult(
            content=response.choices[0].message.content,
            prompt_tokens=response.usage.prompt_tokens,
            completion_tokens=response.usage.completion_tokens,
            total_tokens=response.usage.total_tokens,
            model=response.model
        )

    return response.choices[0].message.content


def format_memories_context(memories: list[dict]) -> str:
    """
    Format retrieved memories into a context string for the chat prompt.

    Args:
        memories: List of memory dicts with 'text', 'type', 'confidence' fields

    Returns:
        Formatted string for injection into system prompt
    """
    if not memories:
        return "No relevant memories found for this user yet."

    lines = ["RELEVANT MEMORIES:"]
    for i, mem in enumerate(memories, 1):
        confidence = mem.get("confidence", 0.8)
        mem_type = mem.get("type", "fact")
        text = mem.get("text", "")
        lines.append(f"[{i}] ({mem_type}, {confidence:.0%} confidence) {text}")

    return "\n".join(lines)
