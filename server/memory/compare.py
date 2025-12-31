from openai import AsyncOpenAI
from supabase import Client
from embeddings.openai import generate_embedding


async def find_similar_memories(
    text: str,
    user_id: str,
    db_client: Client,
    llm_client: AsyncOpenAI,
    limit: int = 5,
    threshold: float = 0.7
) -> list[dict]:
    """
    Find similar memories in the user's database.

    Args:
        text: Text to find similar memories for
        user_id: User ID from JWT
        db_client: Supabase client (user's database)
        llm_client: OpenAI client (for embeddings)
        limit: Max number of results
        threshold: Similarity threshold

    Returns:
        List of similar memories
    """
    embedding = await generate_embedding(llm_client, text)

    result = db_client.rpc(
        "match_memories",
        {
            "query_embedding": embedding,
            "match_threshold": threshold,
            "match_count": limit,
            "p_user_id": user_id,
        }
    ).execute()

    return result.data or []
