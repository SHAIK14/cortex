import hashlib
from datetime import datetime
from supabase import Client


class MemoryRepository:
    """
    Repository for memory operations.
    Uses user's Supabase client (passed in, not hardcoded).
    """

    def __init__(self, db_client: Client):
        self.db = db_client
        self.table = "memories"
        self.history_table = "memory_history"

    async def get_by_id(self, memory_id: str, user_id: str) -> dict | None:
        result = self.db.table(self.table)\
            .select("*")\
            .eq("id", memory_id)\
            .eq("user_id", user_id)\
            .execute()
        return result.data[0] if result.data else None

    async def get_user_memories(self, user_id: str) -> list[dict]:
        result = self.db.table(self.table)\
            .select("*")\
            .eq("user_id", user_id)\
            .eq("status", "active")\
            .order("created_at", desc=True)\
            .execute()
        return result.data

    async def count_user_memories(self, user_id: str) -> int:
        result = self.db.table(self.table)\
            .select("id", count="exact")\
            .eq("user_id", user_id)\
            .eq("status", "active")\
            .execute()
        return result.count or 0

    async def create(self, data: dict) -> dict:
        if "hash" not in data and "text" in data:
            data["hash"] = hashlib.md5(data["text"].encode()).hexdigest()

        result = self.db.table(self.table).insert(data).execute()
        return result.data[0]

    async def update(self, memory_id: str, data: dict) -> dict:
        if "text" in data:
            data["hash"] = hashlib.md5(data["text"].encode()).hexdigest()
        data["updated_at"] = datetime.utcnow().isoformat()

        result = self.db.table(self.table)\
            .update(data)\
            .eq("id", memory_id)\
            .execute()
        return result.data[0]

    async def delete(self, memory_id: str, replaced_by: str = None) -> dict:
        update_data = {
            "status": "outdated",
            "updated_at": datetime.utcnow().isoformat()
        }
        if replaced_by:
            update_data["replaced_by"] = replaced_by

        result = self.db.table(self.table)\
            .update(update_data)\
            .eq("id", memory_id)\
            .execute()
        return result.data[0]

    async def hard_delete(self, memory_id: str, user_id: str) -> bool:
        """Actually delete the memory (for user-initiated deletes)."""
        result = self.db.table(self.table)\
            .delete()\
            .eq("id", memory_id)\
            .eq("user_id", user_id)\
            .execute()
        return len(result.data) > 0

    async def record_history(
        self,
        memory_id: str,
        action: str,
        prev_text: str = None,
        new_text: str = None,
        conversation_id: str = None
    ):
        self.db.table(self.history_table).insert({
            "memory_id": memory_id,
            "action": action,
            "prev_text": prev_text,
            "new_text": new_text,
            "conversation_id": conversation_id
        }).execute()
