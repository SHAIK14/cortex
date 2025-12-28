import hashlib
from database.supabase import supabase_admin
from embeddings.openai import generate_embedding


async def store_memory(
    api_key_id: str,
    user_id: str,
    fact: dict,
    conversation_id: str = None
) -> dict:

    text = fact["text"]
    embedding = await generate_embedding(text)
    hash_value = hashlib.md5(text.encode()).hexdigest()

    memory = {
        "api_key_id": api_key_id,
        "user_id": user_id,
        "text": text,
        "embedding": embedding,
        "hash": hash_value,
        "type": fact.get("type", "fact"),
        "confidence": fact.get("confidence", 0.8),
        "category": fact.get("category"),
        "source_text": fact.get("source"),
        "entities": fact.get("entities", []),
        "conversation_id": conversation_id
    }

    result = supabase_admin.table("memories").insert(memory).execute()
    new_memory = result.data[0]

    await record_history(new_memory["id"], "ADD", None, text, conversation_id)

    return new_memory


async def update_memory(
    memory_id: str,
    new_text: str,
    new_confidence: float = None,
    conversation_id: str = None
) -> dict:

    old = supabase_admin.table("memories")\
        .select("text")\
        .eq("id", memory_id)\
        .execute()
    old_text = old.data[0]["text"] if old.data else None

    embedding = await generate_embedding(new_text)
    hash_value = hashlib.md5(new_text.encode()).hexdigest()

    update_data = {
        "text": new_text,
        "embedding": embedding,
        "hash": hash_value,
        "updated_at": "now()"
    }
    if new_confidence:
        update_data["confidence"] = new_confidence

    result = supabase_admin.table("memories")\
        .update(update_data)\
        .eq("id", memory_id)\
        .execute()

    await record_history(memory_id, "UPDATE", old_text, new_text, conversation_id)

    return result.data[0]


async def delete_memory(
    memory_id: str,
    replaced_by: str = None,
    conversation_id: str = None
) -> dict:

    old = supabase_admin.table("memories")\
        .select("text")\
        .eq("id", memory_id)\
        .execute()
    old_text = old.data[0]["text"] if old.data else None

    result = supabase_admin.table("memories")\
        .update({
            "status": "outdated",
            "replaced_by": replaced_by,
            "updated_at": "now()"
        })\
        .eq("id", memory_id)\
        .execute()

    await record_history(memory_id, "DELETE", old_text, None, conversation_id)

    return result.data[0]


async def record_history(
    memory_id: str,
    action: str,
    prev_text: str,
    new_text: str,
    conversation_id: str = None
):

    supabase_admin.table("memory_history").insert({
        "memory_id": memory_id,
        "action": action,
        "prev_text": prev_text,
        "new_text": new_text,
        "conversation_id": conversation_id
    }).execute()
