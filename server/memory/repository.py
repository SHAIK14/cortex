import hashlib
from datetime import datetime
from database.supabase import async_supabase_admin

class MemoryRepository:
    def __init__(self):
        self.table = "memories"
        self.history_table = "memory_history"

    async def get_by_id(self, memory_id: str, api_key_id: str) -> dict:
        result = await async_supabase_admin.table(self.table)\
            .select("*")\
            .eq("id", memory_id)\
            .eq("api_key_id", api_key_id)\
            .execute()
        return result.data[0] if result.data else None

    async def get_user_memories(self, api_key_id: str, user_id: str) -> list[dict]:
        result = await async_supabase_admin.table(self.table)\
            .select("*")\
            .eq("api_key_id", api_key_id)\
            .eq("user_id", user_id)\
            .eq("status", "active")\
            .order("created_at", descending=True)\
            .execute()
        return result.data

    async def create(self, data: dict) -> dict:
        if "hash" not in data and "text" in data:
            data["hash"] = hashlib.md5(data["text"].encode()).hexdigest()
        
        result = await async_supabase_admin.table(self.table).insert(data).execute()
        return result.data[0]

    async def update(self, memory_id: str, data: dict) -> dict:
        if "text" in data:
            data["hash"] = hashlib.md5(data["text"].encode()).hexdigest()
        data["updated_at"] = datetime.utcnow().isoformat()
        
        result = await async_supabase_admin.table(self.table)\
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
            
        result = await async_supabase_admin.table(self.table)\
            .update(update_data)\
            .eq("id", memory_id)\
            .execute()
        return result.data[0]

    async def record_history(self, memory_id: str, action: str, prev_text: str = None, new_text: str = None, conversation_id: str = None):
        await async_supabase_admin.table(self.history_table).insert({
            "memory_id": memory_id,
            "action": action,
            "prev_text": prev_text,
            "new_text": new_text,
            "conversation_id": conversation_id
        }).execute()
