from database.supabase import supabase_admin


async def keyword_search_memories(
    query: str,
    api_key_id: str,
    user_id: str,
    limit: int = 10
) -> list[dict]:

    result = supabase_admin.rpc(
        "keyword_search_memories",
        {
            "query_text": query,
            "p_api_key_id": api_key_id,
            "p_user_id": user_id,
            "match_count": limit
        }
    ).execute()
    
    return result.data or []
