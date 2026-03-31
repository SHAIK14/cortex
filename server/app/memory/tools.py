from datetime import date

from app.memory.embed_memory import embed_single
from app.memory.vector_DB import (
    EmbeddedMemory,
    sync_delete_memory,
    sync_get_memory_by_id,
    sync_insert_memory,
    sync_update_memory,
)


def add(user_id: int, memory_text: str, categories: list[str] = []) -> str:
    embedding = embed_single(memory_text)
    memory = EmbeddedMemory(
        user_id=user_id,
        memory_text=memory_text,
        categories=categories,
        date=str(date.today()),
        embedding=embedding,
    )
    sync_insert_memory(memory)
    return f"added: {memory_text}"


def update(memory_id: str, new_text: str, categories: list[str] = []) -> str:
    existing = sync_get_memory_by_id(memory_id)
    if not existing:
        return f"memory {memory_id} not found"
    embedding = embed_single(new_text)
    sync_update_memory(
        memory_id=memory_id,
        new_text=new_text,
        categories=categories,
        user_id=existing.payload["user_id"],
        embedding=embedding,
    )
    return f"updated: {memory_id}"


def delete(memory_id: str) -> str:
    sync_delete_memory(memory_id)
    return f"deleted: {memory_id}"


def noop(reason: str) -> str:
    return f"no action: {reason}"
