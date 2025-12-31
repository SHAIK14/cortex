import asyncio
from fastapi import APIRouter, Depends, HTTPException

from memory.models import (
    AddMemoryRequest,
    SearchRequest,
    ListMemoriesRequest,
    GetMemoryRequest,
    DeleteMemoryRequest,
    StatsRequest,
    ChatRequest,
    Credentials
)
from auth.middleware import get_current_user_id
from memory.extract import extract_memories
from memory.compare import find_similar_memories
from memory.decide import decide_actions
from memory.store import store_memory, update_memory, delete_memory, lower_confidence, MemoryLimitExceeded
from memory.retrieve import search_memories, get_user_memories, get_memory_by_id, delete_memory_by_id
from llm.openai import create_openai_client, chat_completion, format_memories_context, ChatCompletionResult
from memory.prompts import CHAT_SYSTEM_PROMPT
from database.supabase import create_user_supabase
from rerank.cohere import create_cohere_client
from config_logging import logger

router = APIRouter(prefix="/memory", tags=["memory"])


def create_clients(credentials: Credentials):
    """Create all clients from user-provided credentials."""
    llm_client = create_openai_client(credentials.openai_key)
    db_client = create_user_supabase(credentials.supabase_url, credentials.supabase_key)
    rerank_client = create_cohere_client(credentials.cohere_key)
    return llm_client, db_client, rerank_client


@router.post("/add")
async def add_memory_endpoint(
    request: AddMemoryRequest,
    user_id: str = Depends(get_current_user_id)
):
    """
    Process conversation and extract/store memories.

    - Extracts facts from conversation using LLM
    - Compares with existing memories
    - Decides action (ADD/UPDATE/DELETE/CONFLICT/NONE)
    - Stores results in user's database
    """
    logger.info(f"Processing add_memory request for user: {user_id}")

    # Create clients from user's credentials
    llm_client, db_client, _ = create_clients(request.credentials)

    # Convert Pydantic models to dicts
    messages = [{"role": m.role, "content": m.content} for m in request.messages]

    # Step 1: EXTRACT
    try:
        facts = await extract_memories(messages, llm_client)
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Extraction failed: {str(e)}")

    if not facts:
        return {"memories": [], "message": "No facts extracted", "extracted_count": 0, "stored_count": 0}

    # Step 2: COMPARE (parallel)
    compare_tasks = [
        find_similar_memories(
            text=fact["text"],
            user_id=user_id,
            db_client=db_client,
            llm_client=llm_client
        )
        for fact in facts
    ]
    similar_memories = await asyncio.gather(*compare_tasks)

    # Step 3: DECIDE
    decisions = await decide_actions(facts, list(similar_memories), llm_client)

    # Step 4: STORE
    results = []

    for decision in decisions:
        fact_index = decision.get("fact_index", 0)
        if fact_index < 0 or fact_index >= len(facts):
            continue
        fact = facts[fact_index]
        action = decision["action"]

        try:
            if action == "ADD":
                mem = await store_memory(
                    user_id=user_id,
                    fact=fact,
                    db_client=db_client,
                    llm_client=llm_client,
                    conversation_id=request.conversation_id
                )
                results.append({"action": "ADD", "memory": mem})

            elif action == "UPDATE":
                mem = await update_memory(
                    memory_id=decision["target_id"],
                    new_text=fact["text"],
                    db_client=db_client,
                    llm_client=llm_client,
                    new_confidence=fact.get("confidence"),
                    conversation_id=request.conversation_id
                )
                results.append({"action": "UPDATE", "memory": mem})

            elif action == "DELETE":
                new_mem = await store_memory(
                    user_id=user_id,
                    fact=fact,
                    db_client=db_client,
                    llm_client=llm_client,
                    conversation_id=request.conversation_id
                )
                await delete_memory(
                    memory_id=decision["target_id"],
                    db_client=db_client,
                    replaced_by=new_mem["id"],
                    conversation_id=request.conversation_id
                )
                results.append({"action": "DELETE+ADD", "memory": new_mem})

            elif action == "CONFLICT":
                await lower_confidence(
                    memory_id=decision["target_id"],
                    new_confidence=decision.get("new_confidence", 0.5),
                    db_client=db_client,
                    conversation_id=request.conversation_id
                )
                new_mem = await store_memory(
                    user_id=user_id,
                    fact=fact,
                    db_client=db_client,
                    llm_client=llm_client,
                    conversation_id=request.conversation_id
                )
                results.append({
                    "action": "CONFLICT",
                    "memory": new_mem,
                    "lowered_memory_id": decision["target_id"],
                    "new_confidence": decision.get("new_confidence", 0.5)
                })

            elif action == "NONE":
                results.append({"action": "NONE", "reasoning": decision.get("reasoning")})

        except MemoryLimitExceeded as e:
            raise HTTPException(status_code=429, detail=str(e))
        except Exception as e:
            logger.error(f"Error processing action {action}: {str(e)}")
            results.append({"action": action, "error": str(e)})

    return {
        "memories": results,
        "extracted_count": len(facts),
        "stored_count": len([r for r in results if r.get("action") not in ["NONE", None] and "error" not in r])
    }


@router.post("/search")
async def search_memory_endpoint(
    request: SearchRequest,
    user_id: str = Depends(get_current_user_id)
):
    """Search memories by query."""
    llm_client, db_client, rerank_client = create_clients(request.credentials)

    try:
        memories = await search_memories(
            query=request.query,
            user_id=user_id,
            db_client=db_client,
            llm_client=llm_client,
            rerank_client=rerank_client,
            limit=request.limit
        )
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Search failed: {str(e)}")

    return {
        "memories": memories,
        "query": request.query,
        "count": len(memories)
    }


@router.post("/list")
async def list_memories_endpoint(
    request: ListMemoriesRequest,
    user_id: str = Depends(get_current_user_id)
):
    """List all memories for the authenticated user."""
    _, db_client, _ = create_clients(request.credentials)

    try:
        memories = await get_user_memories(
            user_id=user_id,
            db_client=db_client
        )
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Failed to list memories: {str(e)}")

    return {
        "memories": memories,
        "total_count": len(memories)
    }


@router.post("/stats")
async def get_stats_endpoint(
    request: StatsRequest,
    user_id: str = Depends(get_current_user_id)
):
    """Get memory statistics for the authenticated user."""
    _, db_client, _ = create_clients(request.credentials)

    try:
        memories = await get_user_memories(user_id=user_id, db_client=db_client)

        # Calculate stats
        type_counts = {}
        for mem in memories:
            mem_type = mem.get("type", "unknown")
            type_counts[mem_type] = type_counts.get(mem_type, 0) + 1

        return {
            "total_memories": len(memories),
            "by_type": type_counts,
            "user_id": user_id
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Failed to get stats: {str(e)}")


@router.post("/chat")
async def chat_endpoint(
    request: ChatRequest,
    user_id: str = Depends(get_current_user_id)
):
    """
    Chat with memory-augmented context.

    1. Retrieves relevant memories based on user's message
    2. Builds context-aware system prompt
    3. Generates response using LLM
    4. Optionally extracts new facts from conversation (background)

    Returns response + retrieved memories for debug display.
    """
    import time
    start_time = time.time()

    logger.info(f"Processing chat request for user: {user_id}")

    # Token tracking
    total_tokens_in = 0
    total_tokens_out = 0

    # Create clients from user's credentials
    llm_client, db_client, rerank_client = create_clients(request.credentials)

    # Step 1: RETRIEVE relevant memories
    try:
        retrieved_memories = await search_memories(
            query=request.message,
            user_id=user_id,
            db_client=db_client,
            llm_client=llm_client,
            rerank_client=rerank_client,
            limit=request.retrieve_k
        )
    except Exception as e:
        logger.warning(f"Memory retrieval failed, continuing without context: {str(e)}")
        retrieved_memories = []

    # Step 2: BUILD context-aware prompt
    memories_context = format_memories_context(retrieved_memories)
    system_prompt = CHAT_SYSTEM_PROMPT.format(memories_context=memories_context)

    # Step 3: GENERATE response (with token tracking)
    try:
        chat_result = await chat_completion(
            client=llm_client,
            system_prompt=system_prompt,
            user_prompt=request.message,
            temperature=0.7,  # Higher temp for conversational responses
            return_usage=True
        )
        response_text = chat_result.content
        total_tokens_in += chat_result.prompt_tokens
        total_tokens_out += chat_result.completion_tokens
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Chat generation failed: {str(e)}")

    latency_ms = int((time.time() - start_time) * 1000)

    # Step 4: EXTRACT facts (if enabled) - run in background after response
    extracted_facts = []
    decisions = []

    if request.extract_memories:
        try:
            # Build conversation for extraction
            messages = [
                {"role": "user", "content": request.message},
                {"role": "assistant", "content": response_text}
            ]

            facts = await extract_memories(messages, llm_client)

            if facts:
                # Compare with existing memories
                compare_tasks = [
                    find_similar_memories(
                        text=fact["text"],
                        user_id=user_id,
                        db_client=db_client,
                        llm_client=llm_client
                    )
                    for fact in facts
                ]
                similar_memories = await asyncio.gather(*compare_tasks)

                # Decide actions
                decisions = await decide_actions(facts, list(similar_memories), llm_client)

                # Store memories based on decisions
                for decision in decisions:
                    fact_index = decision.get("fact_index", 0)
                    if fact_index < 0 or fact_index >= len(facts):
                        continue
                    fact = facts[fact_index]
                    action = decision["action"]

                    try:
                        if action == "ADD":
                            await store_memory(
                                user_id=user_id,
                                fact=fact,
                                db_client=db_client,
                                llm_client=llm_client,
                                conversation_id=request.conversation_id
                            )
                        elif action == "UPDATE":
                            await update_memory(
                                memory_id=decision["target_id"],
                                new_text=fact["text"],
                                db_client=db_client,
                                llm_client=llm_client,
                                new_confidence=fact.get("confidence"),
                                conversation_id=request.conversation_id
                            )
                        elif action == "DELETE":
                            new_mem = await store_memory(
                                user_id=user_id,
                                fact=fact,
                                db_client=db_client,
                                llm_client=llm_client,
                                conversation_id=request.conversation_id
                            )
                            await delete_memory(
                                memory_id=decision["target_id"],
                                db_client=db_client,
                                replaced_by=new_mem["id"],
                                conversation_id=request.conversation_id
                            )
                        elif action == "CONFLICT":
                            await lower_confidence(
                                memory_id=decision["target_id"],
                                new_confidence=decision.get("new_confidence", 0.5),
                                db_client=db_client,
                                conversation_id=request.conversation_id
                            )
                            await store_memory(
                                user_id=user_id,
                                fact=fact,
                                db_client=db_client,
                                llm_client=llm_client,
                                conversation_id=request.conversation_id
                            )
                    except MemoryLimitExceeded:
                        logger.warning("Memory limit exceeded during chat extraction")
                    except Exception as e:
                        logger.error(f"Error storing memory during chat: {str(e)}")

                extracted_facts = facts

        except Exception as e:
            logger.warning(f"Memory extraction during chat failed: {str(e)}")

    return {
        "response": response_text,
        "retrieved_memories": retrieved_memories,
        "debug_info": {
            "extracted_facts": extracted_facts,
            "decisions": decisions,
            "latency_ms": latency_ms,
            "memories_used": len(retrieved_memories),
            "tokens_in": total_tokens_in,
            "tokens_out": total_tokens_out
        }
    }


# NOTE: Parameterized routes MUST come after specific routes like /stats, /list, /search, /chat
# Otherwise FastAPI will match "stats" as a memory_id

@router.post("/{memory_id}")
async def get_memory_endpoint(
    memory_id: str,
    request: GetMemoryRequest,
    user_id: str = Depends(get_current_user_id)
):
    """Get a single memory by ID."""
    _, db_client, _ = create_clients(request.credentials)

    memory = await get_memory_by_id(
        memory_id=memory_id,
        user_id=user_id,
        db_client=db_client
    )

    if not memory:
        raise HTTPException(status_code=404, detail="Memory not found")

    return {"memory": memory}


@router.post("/{memory_id}/delete")
async def delete_memory_endpoint(
    memory_id: str,
    request: DeleteMemoryRequest,
    user_id: str = Depends(get_current_user_id)
):
    """Delete a memory."""
    _, db_client, _ = create_clients(request.credentials)

    deleted = await delete_memory_by_id(
        memory_id=memory_id,
        user_id=user_id,
        db_client=db_client
    )

    if not deleted:
        raise HTTPException(status_code=404, detail="Memory not found")

    return {"message": "Memory deleted", "id": memory_id}
