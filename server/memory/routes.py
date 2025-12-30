from fastapi import APIRouter, Depends, HTTPException
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials

from memory.models import Message, AddMemoryRequest, SearchRequest
from auth.middleware import validate_api_key
from memory.extract import extract_memories
from memory.compare import find_similar_memories
from memory.decide import decide_actions
from memory.store import store_memory, update_memory, delete_memory, lower_confidence
from memory.retrieve import search_memories, get_user_memories, get_memory_by_id, delete_memory_by_id
from config_logging import logger

router = APIRouter(prefix="/memory", tags=["memory"])
security = HTTPBearer()

@router.post("/add")
async def add_memory(
    request: AddMemoryRequest,
    credentials: HTTPAuthorizationCredentials = Depends(security)
):
    """
    Process conversation and extract/store memories.
    """
    logger.info(f"Processing add_memory request for user: {request.user_id}")
    
    # Step 1: Validate API key
    api_key_record = await validate_api_key(credentials)
    api_key_id = api_key_record["id"]
    
    # Step 2: Convert Pydantic models to dicts
    messages = [{"role": m.role, "content": m.content} for m in request.messages]
    
    # Step 3: EXTRACT
    facts = await extract_memories(messages)
    
    if not facts:
        return {"memories": [], "message": "No facts extracted"}
    
    # Step 4: COMPARE
    # Potential optimization: Run comparisons in parallel
    import asyncio
    compare_tasks = [
        find_similar_memories(text=fact["text"], api_key_id=api_key_id, user_id=request.user_id)
        for fact in facts
    ]
    similar_memories = await asyncio.gather(*compare_tasks)
    
    # Step 5: DECIDE
    decisions = await decide_actions(facts, list(similar_memories))
    
    # Step 6: STORE
    results = []
    store_tasks = []
    
    for decision in decisions:
        fact_index = decision.get("fact_index", 0)
        if fact_index < 0 or fact_index >= len(facts):
            continue
        fact = facts[fact_index]
        action = decision["action"]
        
        if action == "ADD":
            results.append(store_memory(
                api_key_id=api_key_id,
                user_id=request.user_id,
                fact=fact,
                conversation_id=request.conversation_id
            ))
        elif action == "UPDATE":
            results.append(update_memory(
                memory_id=decision["target_id"],
                new_text=fact["text"],
                new_confidence=fact.get("confidence"),
                conversation_id=request.conversation_id
            ))
        elif action == "DELETE":
            async def handle_delete_add(f=fact, d=decision, rid=api_key_id, uid=request.user_id, cid=request.conversation_id):
                new_mem = await store_memory(api_key_id=rid, user_id=uid, fact=f, conversation_id=cid)
                await delete_memory(memory_id=d["target_id"], replaced_by=new_mem["id"], conversation_id=cid)
                return {"action": "DELETE+ADD", "memory": new_mem}
            results.append(handle_delete_add())
        elif action == "CONFLICT":
            async def handle_conflict(f=fact, d=decision, rid=api_key_id, uid=request.user_id, cid=request.conversation_id):
                await lower_confidence(memory_id=d["target_id"], new_confidence=d["new_confidence"], conversation_id=cid)
                new_mem = await store_memory(api_key_id=rid, user_id=uid, fact=f, conversation_id=cid)
                return {
                    "action": "CONFLICT",
                    "memory": new_mem,
                    "lowered_memory_id": d["target_id"],
                    "new_confidence": d["new_confidence"]
                }
            results.append(handle_conflict())
        elif action == "NONE":
            # For NONE, we don't need a task, just wrap it in an awaitable or handle separately
            async def handle_none(r=decision.get("reasoning")):
                return {"action": "NONE", "reasoning": r}
            results.append(handle_none())

    # Execute all store operations
    final_results = await asyncio.gather(*results)
    
    # Wrap results to match original structure where needed (some are already wrapped)
    formatted_results = []
    for r in final_results:
        if isinstance(r, dict) and "action" in r:
            formatted_results.append(r)
        else:
            # For ADD and UPDATE, store_memory/update_memory returns the memory dict directly
            # We need to wrap it if it's not already wrapped by DELETE/CONFLICT/NONE
            # Wait, let's look at store_memory/update_memory return values
            # ADD returns memory dict
            # UPDATE returns memory dict
            # So we should wrap them here.
            pass
            
    # Let's fix the logic above to be more consistent
    actual_results = []
    for i, r in enumerate(final_results):
        decision = decisions[i]
        action = decision["action"]
        if action == "ADD":
            actual_results.append({"action": "ADD", "memory": r})
        elif action == "UPDATE":
            actual_results.append({"action": "UPDATE", "memory": r})
        else:
            actual_results.append(r)

    return {
        "memories": actual_results,
        "extracted_count": len(facts),
        "stored_count": len([r for r in actual_results if r["action"] != "NONE"])
    }

@router.post("/search")
async def search_memory(
    request: SearchRequest,
    credentials: HTTPAuthorizationCredentials = Depends(security)
):
    api_key_record = await validate_api_key(credentials)
    api_key_id = api_key_record["id"]
    
    memories = await search_memories(
        query=request.query,
        api_key_id=api_key_id,
        user_id=request.user_id,
        limit=request.limit
    )
    return {
        "memories": memories,
        "query": request.query,
        "count": len(memories)
    }

@router.get("/user/{user_id}")
async def list_user_memories(
    user_id: str,
    credentials: HTTPAuthorizationCredentials = Depends(security)
):
    api_key_record = await validate_api_key(credentials)
    api_key_id = api_key_record["id"]
    
    memories = await get_user_memories(
        api_key_id=api_key_id,
        user_id=user_id
    )
    return {
        "memories": memories,
        "total_count": len(memories)
    }

@router.get("/{memory_id}")
async def get_single_memory(
    memory_id: str,
    credentials: HTTPAuthorizationCredentials = Depends(security)
):
    api_key_record = await validate_api_key(credentials)
    api_key_id = api_key_record["id"]
    
    memory = await get_memory_by_id(
        memory_id=memory_id,
        api_key_id=api_key_id
    )
    
    if not memory:
        raise HTTPException(status_code=404, detail="Memory not found")
    
    return {"memory": memory}

@router.delete("/{memory_id}")
async def delete_single_memory(
    memory_id: str,
    credentials: HTTPAuthorizationCredentials = Depends(security)
):
    api_key_record = await validate_api_key(credentials)
    api_key_id = api_key_record["id"]
    
    deleted = await delete_memory_by_id(
        memory_id=memory_id,
        api_key_id=api_key_id
    )
    
    if not deleted:
        raise HTTPException(status_code=404, detail="Memory not found")
    
    return {"message": "Memory deleted", "id": memory_id}
