from app.api.auth import get_current_user
from app.api.models import (
    ChatRequest,
    ChatResponse,
    IngestRequest,
    MemoryResult,
    SearchRequest,
    SearchResponse,
)
from app.memory.embed_memory import embed_single
from app.memory.extract_memory import memory_extract_from_messages
from app.memory.response_generator import generate_answer
from app.memory.tool_caller import process_memory
from app.memory.vector_DB import search_memories
from fastapi import APIRouter, Depends

router = APIRouter()


@router.post("/memories")
async def ingest_memories(request: IngestRequest, user_id: str = Depends(get_current_user)):
    messages = [m.model_dump() for m in request.messages]
    memories = memory_extract_from_messages(messages, [])
    for memory in memories:
        embedding = embed_single(memory.information)
        results = await search_memories(embedding, user_id)
        existing_str = "\n".join(
            [f"id: {r.id} | text:{r.payload['memory_text']}" for r in results]
        )
        await process_memory(memory.information, existing_str, user_id)
    return {"status": "ok", "processed": len(memories)}


@router.get("/memories/search")
async def search(request: SearchRequest, user_id: str = Depends(get_current_user)):
    embedding = embed_single(request.query)
    results = await search_memories(embedding, user_id)
    memories = [
        MemoryResult(memory_text=r.payload["memory_text"], score=r.score)
        for r in results
    ]
    return SearchResponse(memories=memories)


@router.post("/chat")
async def chat(request: ChatRequest, user_id: str = Depends(get_current_user)):
    embedding = embed_single(request.question)
    results = await search_memories(embedding, user_id)
    context = "\n".join([r.payload["memory_text"] for r in results])
    past_messages = [m.model_dump() for m in request.past_messages]
    answer = await generate_answer(request.question, context, past_messages)
    return ChatResponse(answer=answer)
