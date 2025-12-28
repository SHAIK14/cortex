from database.supabase import supabase_admin
from embeddings.openai import generate_embedding


async def find_similar_memories(
    text: str,
    api_key_id: str,
    user_id: str,
    limit: int = 5,
    threshold: float = 0.7
) -> list[dict]:

    embedding = await generate_embedding(text)

    result = supabase_admin.rpc(
        "match_memories",
        {
            "query_embedding": embedding,
            "match_threshold": threshold,
            "match_count": limit,
            "p_api_key_id": api_key_id,
            "p_user_id": user_id,
        }
    ).execute()

    return result.data or []
