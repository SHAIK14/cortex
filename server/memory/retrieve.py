from database.supabase import supabase_admin
from embeddings.openai import generate_embedding
from datetime import datetime, timezone


def calculate_hybrid_score(memory: dict, similarity: float) -> float:

    # Similarity score (already 0-1)
    sim_score = similarity
    
    # Recency score (decay over 30 days)
    created = datetime.fromisoformat(memory["created_at"].replace("Z", "+00:00"))
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
    threshold: float = 0.5
) -> list[dict]:

    embedding = await generate_embedding(query)
    result = supabase_admin.rpc(
        "match_memories",
        {
            "query_embedding": embedding,
            "match_threshold": threshold,
            "match_count": limit * 2,  # Fetch extra for re-ranking
            "p_api_key_id": api_key_id,
            "p_user_id": user_id,
        }
    ).execute()
    memories = result.data or []
    
    # Apply hybrid scoring
    for mem in memories:
        similarity = mem.get("similarity", 0.5)
        mem["hybrid_score"] = calculate_hybrid_score(mem, similarity)
    
    # Re-rank by hybrid score (not just similarity)
    memories.sort(key=lambda m: m["hybrid_score"], reverse=True)
    ranked = memories[:limit]
    
    # Update access tracking
    for mem in ranked:
        supabase_admin.table("memories").update({
            "last_accessed_at": "now()",
            "access_count": mem.get("access_count", 0) + 1
        }).eq("id", mem["id"]).execute()
    
    return ranked


async def get_user_memories(
    api_key_id: str,
    user_id: str,
    limit: int = 50
) -> list[dict]:
    """List all active memories for a user (no search)."""
    result = supabase_admin.table("memories")\
        .select("id, text, type, category, confidence, created_at, status")\
        .eq("api_key_id", api_key_id)\
        .eq("user_id", user_id)\
        .eq("status", "active")\
        .order("created_at", desc=True)\
        .limit(limit)\
        .execute()
    return result.data or []

async def get_memory_by_id(
    memory_id: str,
    api_key_id: str
) -> dict | None:
    """Get a single memory by ID."""
    result = supabase_admin.table("memories")\
        .select("*")\
        .eq("id", memory_id)\
        .eq("api_key_id", api_key_id)\
        .single()\
        .execute()
    return result.data


async def delete_memory_by_id(
    memory_id: str,
    api_key_id: str
) -> bool:
    """Soft delete a memory (set status to archived)."""
    result = supabase_admin.table("memories")\
        .update({"status": "archived"})\
        .eq("id", memory_id)\
        .eq("api_key_id", api_key_id)\
        .execute()
    return len(result.data) > 0

