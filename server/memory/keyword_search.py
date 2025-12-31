from supabase import Client


async def keyword_search_memories(
    query: str,
    user_id: str,
    db_client: Client,
    limit: int = 10
) -> list[dict]:
    """
    Keyword/BM25 search for memories.

    Args:
        query: Search query text
        user_id: User ID from JWT
        db_client: User's Supabase client
        limit: Max results

    Returns:
        List of matching memories
    """
    result = db_client.rpc(
        "keyword_search_memories",
        {
            "query_text": query,
            "p_user_id": user_id,
            "match_count": limit
        }
    ).execute()

    return result.data or []
