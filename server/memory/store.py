from openai import AsyncOpenAI
from supabase import Client
from memory.repository import MemoryRepository
from embeddings.openai import generate_embedding
from config import settings

# Memory limit per user (from config)
MAX_MEMORIES_PER_USER = settings.max_memories_per_user


async def store_memory(
    user_id: str,
    fact: dict,
    db_client: Client,
    llm_client: AsyncOpenAI,
    conversation_id: str = None
) -> dict:
    """
    Store a new memory in user's database.

    Args:
        user_id: User ID from JWT
        fact: Extracted fact dict
        db_client: User's Supabase client
        llm_client: OpenAI client for embeddings
        conversation_id: Optional conversation ID

    Returns:
        Created memory dict
    """
    repository = MemoryRepository(db_client)

    # Check memory limit
    current_count = await repository.count_user_memories(user_id)
    if current_count >= MAX_MEMORIES_PER_USER:
        raise MemoryLimitExceeded(
            f"Memory limit reached ({MAX_MEMORIES_PER_USER}). Delete some memories to continue."
        )

    text = fact["text"]
    embedding = await generate_embedding(llm_client, text)

    memory_data = {
        "user_id": user_id,
        "text": text,
        "embedding": embedding,
        "type": fact.get("type", "fact"),
        "confidence": fact.get("confidence", 0.8),
        "category": fact.get("category"),
        "source_text": fact.get("source"),
        "entities": fact.get("entities", []),
        "conversation_id": conversation_id,
        "status": "active"
    }

    new_memory = await repository.create(memory_data)
    await repository.record_history(new_memory["id"], "ADD", None, text, conversation_id)

    return new_memory


async def update_memory(
    memory_id: str,
    new_text: str,
    db_client: Client,
    llm_client: AsyncOpenAI,
    new_confidence: float = None,
    conversation_id: str = None
) -> dict:
    """
    Update an existing memory.

    Args:
        memory_id: Memory ID to update
        new_text: New text for the memory
        db_client: User's Supabase client
        llm_client: OpenAI client for embeddings
        new_confidence: Optional new confidence value
        conversation_id: Optional conversation ID

    Returns:
        Updated memory dict
    """
    repository = MemoryRepository(db_client)

    # Get old text for history
    old = db_client.table("memories").select("text").eq("id", memory_id).execute()
    old_text = old.data[0]["text"] if old.data else None

    embedding = await generate_embedding(llm_client, new_text)

    update_data = {
        "text": new_text,
        "embedding": embedding,
    }
    if new_confidence is not None:
        update_data["confidence"] = new_confidence

    updated_memory = await repository.update(memory_id, update_data)
    await repository.record_history(memory_id, "UPDATE", old_text, new_text, conversation_id)

    return updated_memory


async def delete_memory(
    memory_id: str,
    db_client: Client,
    replaced_by: str = None,
    conversation_id: str = None
) -> dict:
    """
    Soft delete a memory (mark as outdated).

    Args:
        memory_id: Memory ID to delete
        db_client: User's Supabase client
        replaced_by: ID of memory that replaces this one
        conversation_id: Optional conversation ID

    Returns:
        Deleted memory dict
    """
    repository = MemoryRepository(db_client)

    old = db_client.table("memories").select("text").eq("id", memory_id).execute()
    old_text = old.data[0]["text"] if old.data else None

    deleted_memory = await repository.delete(memory_id, replaced_by)
    await repository.record_history(memory_id, "DELETE", old_text, None, conversation_id)

    return deleted_memory


async def lower_confidence(
    memory_id: str,
    new_confidence: float,
    db_client: Client,
    conversation_id: str = None
) -> dict:
    """
    Lower confidence of a memory (for CONFLICT action).

    Args:
        memory_id: Memory ID
        new_confidence: New confidence value
        db_client: User's Supabase client
        conversation_id: Optional conversation ID

    Returns:
        Updated memory dict
    """
    repository = MemoryRepository(db_client)

    old = db_client.table("memories").select("text, confidence").eq("id", memory_id).execute()
    old_text = old.data[0]["text"] if old.data else None
    old_confidence = old.data[0]["confidence"] if old.data else None

    updated_memory = await repository.update(memory_id, {"confidence": new_confidence})

    await repository.record_history(
        memory_id,
        "CONFLICT",
        f"{old_text} (confidence: {old_confidence})",
        f"{old_text} (confidence: {new_confidence})",
        conversation_id
    )

    return updated_memory


class MemoryLimitExceeded(Exception):
    """Raised when user has reached their memory limit."""
    pass
