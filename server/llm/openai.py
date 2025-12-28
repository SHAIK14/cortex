from openai import AsyncOpenAI
from config import settings

client = AsyncOpenAI(api_key=settings.openai_api_key)


async def chat_completion(
    system_prompt: str,
    user_prompt: str,
    response_format: dict = None,
) -> str:

    messages = [
        {"role": "system", "content": system_prompt},
        {"role": "user", "content": user_prompt}
    ]

    kwargs = {
        "model": "gpt-4o-mini",
        "messages": messages,
        "temperature": 0.1
    }

    if response_format:
        kwargs["response_format"] = response_format

    response = await client.chat.completions.create(**kwargs)
    return response.choices[0].message.content
