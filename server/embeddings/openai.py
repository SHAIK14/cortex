from openai import AsyncOpenAI


async def generate_embedding(client: AsyncOpenAI, text: str) -> list[float]:
    """
    Generate embedding using the provided client.
    Client is created from user's API key.
    """
    response = await client.embeddings.create(
        model="text-embedding-ada-002",
        input=text,
    )
    return response.data[0].embedding
