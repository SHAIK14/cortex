import asyncio
from datetime import datetime, timezone
from openai import AsyncOpenAI
from supabase import Client
import cohere

from embeddings.openai import generate_embedding
from memory.keyword_search import keyword_search_memories
from memory.fusion import reciprocal_rank_fusion
from rerank.cohere import rerank_with_cohere
from memory.repository import MemoryRepository


def calculate_hybrid_score(memory: dict, similarity: float) -> float:
    """Calculate hybrid ranking score combining multiple signals."""
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
    user_id: str,
    db_client: Client,
    llm_client: AsyncOpenAI,
    rerank_client: cohere.Client | None = None,
    limit: int = 10,
    threshold: float = 0.5
) -> list[dict]:
    """
    Search memories using hybrid search (vector + keyword + rerank).

    Args:
        query: Search query
        user_id: User ID from JWT
        db_client: User's Supabase client
        llm_client: OpenAI client for embeddings
        rerank_client: Optional Cohere client for reranking
        limit: Max results
        threshold: Similarity threshold

    Returns:
        List of ranked memories
    """
    # Step 1: Vector search
    embedding = await generate_embedding(llm_client, query)
    vector_result = db_client.rpc(
        "match_memories",
        {
            "query_embedding": embedding,
            "match_threshold": threshold,
            "match_count": limit * 3,
            "p_user_id": user_id,
        }
    ).execute()
    vector_memories = vector_result.data or []

    # Step 2: Keyword search (BM25)
    keyword_memories = await keyword_search_memories(
        query=query,
        user_id=user_id,
        db_client=db_client,
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

    # Step 5: Cohere rerank (if client provided)
    if rerank_client and candidates:
        ranked = await rerank_with_cohere(rerank_client, query, candidates, top_n=limit)
    else:
        ranked = candidates[:limit]

    # Update access tracking
    update_tasks = []
    for mem in ranked[:limit]:
        update_tasks.append(
            update_access_tracking(db_client, mem)
        )
    if update_tasks:
        await asyncio.gather(*update_tasks)

    return ranked[:limit]


async def update_access_tracking(db_client: Client, memory: dict):
    """Update last_accessed_at and access_count for a memory."""
    db_client.table("memories").update({
        "last_accessed_at": datetime.now(timezone.utc).isoformat(),
        "access_count": memory.get("access_count", 0) + 1
    }).eq("id", memory["id"]).execute()


async def get_user_memories(
    user_id: str,
    db_client: Client
) -> list[dict]:
    """List all active memories for a user."""
    repository = MemoryRepository(db_client)
    return await repository.get_user_memories(user_id)


async def get_memory_by_id(
    memory_id: str,
    user_id: str,
    db_client: Client
) -> dict | None:
    """Get a single memory by ID."""
    repository = MemoryRepository(db_client)
    return await repository.get_by_id(memory_id, user_id)


async def delete_memory_by_id(
    memory_id: str,
    user_id: str,
    db_client: Client
) -> bool:
    """Delete a memory (hard delete for user-initiated deletes)."""
    repository = MemoryRepository(db_client)
    return await repository.hard_delete(memory_id, user_id)
