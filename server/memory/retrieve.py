from database.supabase import async_supabase_admin
from embeddings.openai import generate_embedding
from datetime import datetime, timezone
from memory.keyword_search import keyword_search_memories
from memory.fusion import reciprocal_rank_fusion
from rerank.cohere import rerank_with_cohere
from memory.repository import MemoryRepository

repository = MemoryRepository()

def calculate_hybrid_score(memory: dict, similarity: float) -> float:
    # Similarity score (already 0-1)
    sim_score = similarity
    
    # Recency score (decay over 30 days)
    created_at = memory.get("created_at")
    if isinstance(created_at, str):
        created = datetime.fromisoformat(created_at.replace("Z", "+00:00"))
    else:
        created = datetime.now(timezone.utc)
        
    days_old = (datetime.now(timezone.utc) - created).days
    recency_score = max(0, 1 - (days_old / 30))
    
    # Type importance score
    type_weights = {
        "identity": 1.0,
        "preference": 0.8,
        "fact": 0.6,
        "event": 0.4,
        "context": 0.2
    }
    type_score = type_weights.get(memory.get("type", "fact"), 0.5)
    
    # Access frequency score (normalize by max 100 accesses)
    access_count = memory.get("access_count", 0)
    access_score = min(1, access_count / 100)
    
    # Weighted combination
    final = (
        sim_score * 0.50 +
        recency_score * 0.25 +
        type_score * 0.15 +
        access_score * 0.10
    )
    return final


async def search_memories(
    query: str,
    api_key_id: str,
    user_id: str,
    limit: int = 10,
    threshold: float = 0.5,
    use_rerank: bool = True
) -> list[dict]:

    # Step 1: Vector search
    embedding = await generate_embedding(query)
    vector_result = await async_supabase_admin.rpc(
        "match_memories",
        {
            "query_embedding": embedding,
            "match_threshold": threshold,
            "match_count": limit * 3,
            "p_api_key_id": api_key_id,
            "p_user_id": user_id,
        }
    ).execute()
    vector_memories = vector_result.data or []
    
    # Step 2: Keyword search (BM25)
    keyword_memories = await keyword_search_memories(
        query=query,
        api_key_id=api_key_id,
        user_id=user_id,
        limit=limit * 3
    )
    
    # Step 3: RRF fusion
    fused = reciprocal_rank_fusion(vector_memories, keyword_memories)
    
    # Step 4: Hybrid scoring
    for mem in fused:
        similarity = mem.get("similarity", mem.get("rrf_score", 0.5))
        mem["hybrid_score"] = calculate_hybrid_score(mem, similarity)
    
    fused.sort(key=lambda m: m["hybrid_score"], reverse=True)
    candidates = fused[:limit * 2]
    
    # Step 5: Cohere rerank (optional)
    if use_rerank and candidates:
        ranked = await rerank_with_cohere(query, candidates, top_n=limit)
    else:
        ranked = candidates[:limit]
    
    # Update access tracking (Async)
    import asyncio
    update_tasks = []
    for mem in ranked[:limit]:
        update_tasks.append(
            async_supabase_admin.table("memories").update({
                "last_accessed_at": datetime.now(timezone.utc).isoformat(),
                "access_count": mem.get("access_count", 0) + 1
            }).eq("id", mem["id"]).execute()
        )
    if update_tasks:
        await asyncio.gather(*update_tasks)
    
    return ranked[:limit]


async def get_user_memories(
    api_key_id: str,
    user_id: str,
    limit: int = 50
) -> list[dict]:
    """List all active memories for a user (no search)."""
    return await repository.get_user_memories(api_key_id, user_id)


async def get_memory_by_id(
    memory_id: str,
    api_key_id: str
) -> dict | None:
    """Get a single memory by ID."""
    return await repository.get_by_id(memory_id, api_key_id)


async def delete_memory_by_id(
    memory_id: str,
    api_key_id: str
) -> bool:
    """Soft delete a memory (set status to archived)."""
    # Using repository.delete but repository.delete sets status to 'outdated'.
    # Original code set it to 'archived'. Let's stick to 'outdated' as per repository design or adjust.
    # Actually, repository.delete is more tailored for the ADD/UPDATE/DELETE flow.
    # For a direct delete endpoint, 'archived' might be preferred.
    result = await async_supabase_admin.table("memories")\
        .update({"status": "archived"})\
        .eq("id", memory_id)\
        .eq("api_key_id", api_key_id)\
        .execute()
    return len(result.data) > 0
