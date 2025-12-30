from memory.repository import MemoryRepository
from embeddings.openai import generate_embedding

repository = MemoryRepository()

async def store_memory(
    api_key_id: str,
    user_id: str,
    fact: dict,
    conversation_id: str = None
) -> dict:
    text = fact["text"]
    embedding = await generate_embedding(text)

    memory_data = {
        "api_key_id": api_key_id,
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
    new_confidence: float = None,
    conversation_id: str = None
) -> dict:
    # Get old text for history
    # Note: We already have a repository method for this, or we can just fetch it here
    # old_memory = await repository.get_by_id(memory_id, ...) # Need api_key_id though
    
    # For now, let's assume we can fetch it if we had api_key_id, but the original code didn't check permissions here
    # To keep it simple and consistent with original logic (which used supabase_admin):
    from database.supabase import async_supabase_admin
    old = await async_supabase_admin.table("memories").select("text").eq("id", memory_id).execute()
    old_text = old.data[0]["text"] if old.data else None

    embedding = await generate_embedding(new_text)
    
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
    replaced_by: str = None,
    conversation_id: str = None
) -> dict:
    from database.supabase import async_supabase_admin
    old = await async_supabase_admin.table("memories").select("text").eq("id", memory_id).execute()
    old_text = old.data[0]["text"] if old.data else None

    deleted_memory = await repository.delete(memory_id, replaced_by)
    await repository.record_history(memory_id, "DELETE", old_text, None, conversation_id)

    return deleted_memory


async def lower_confidence(
    memory_id: str,
    new_confidence: float,
    conversation_id: str = None
) -> dict:
    from database.supabase import async_supabase_admin
    old = await async_supabase_admin.table("memories").select("text, confidence").eq("id", memory_id).execute()
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
