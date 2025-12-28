
from fastapi import APIRouter, Depends, HTTPException
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials

from memory.models import Message, AddMemoryRequest
from auth.middleware import validate_api_key
from memory.extract import extract_memories
from memory.compare import find_similar_memories
from memory.decide import decide_actions
from memory.store import store_memory, update_memory, delete_memory
router = APIRouter(prefix="/memory", tags=["memory"])
security = HTTPBearer()



 


@router.post("/add")
async def add_memory(
    request: AddMemoryRequest,
    credentials: HTTPAuthorizationCredentials = Depends(security)
):
    """
    Process conversation and extract/store memories.
    
    Flow:
    1. Validate API key
    2. Extract facts from conversation
    3. Compare each fact to existing memories
    4. Decide: ADD, UPDATE, DELETE, or NONE
    5. Execute the decisions
    6. Return results
    """
    
    # Step 1: Validate API key (get developer info)
    api_key_record = await validate_api_key(credentials)
    api_key_id = api_key_record["id"]
    
    # Step 2: Convert Pydantic models to dicts for extract function
    messages = [{"role": m.role, "content": m.content} for m in request.messages]
    
    # Step 3: EXTRACT - Get facts from conversation
    facts = await extract_memories(messages)
    
    if not facts:
        return {"memories": [], "message": "No facts extracted"}
    
    # Step 4: COMPARE - Find similar memories for each fact
    similar_memories = []
    for fact in facts:
        similar = await find_similar_memories(
            text=fact["text"],
            api_key_id=api_key_id,
            user_id=request.user_id
        )
        similar_memories.append(similar)
    
    # Step 5: DECIDE - What action for each fact
    decisions = await decide_actions(facts, similar_memories)
    
    # Step 6: STORE - Execute each decision
    results = []
    for decision in decisions:
        fact = facts[decision["fact_index"]]
        action = decision["action"]
        
        if action == "ADD":
            memory = await store_memory(
                api_key_id=api_key_id,
                user_id=request.user_id,
                fact=fact,
                conversation_id=request.conversation_id
            )
            results.append({"action": "ADD", "memory": memory})
        
        elif action == "UPDATE":
            memory = await update_memory(
                memory_id=decision["target_id"],
                new_text=fact["text"],
                new_confidence=fact.get("confidence"),
                conversation_id=request.conversation_id
            )
            results.append({"action": "UPDATE", "memory": memory})
        
        elif action == "DELETE":
            # Add new fact first
            new_memory = await store_memory(
                api_key_id=api_key_id,
                user_id=request.user_id,
                fact=fact,
                conversation_id=request.conversation_id
            )
            # Mark old as outdated
            await delete_memory(
                memory_id=decision["target_id"],
                replaced_by=new_memory["id"],
                conversation_id=request.conversation_id
            )
            results.append({"action": "DELETE+ADD", "memory": new_memory})
        
        elif action == "NONE":
            results.append({"action": "NONE", "reasoning": decision.get("reasoning")})
    
    return {
        "memories": results,
        "extracted_count": len(facts),
        "stored_count": len([r for r in results if r["action"] != "NONE"])
    }
