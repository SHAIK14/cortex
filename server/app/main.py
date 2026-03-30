import asyncio
from datetime import date

from app.eval.data import MESSAGES
from app.memory.embed_memory import embed_memories, embed_single
from app.memory.extract_memory import memory_extract_from_messages
from app.memory.response_generator import generate_answer
from app.memory.vector_DB import EmbeddedMemory, insert_memories, search_memories


async def main():
    messages = MESSAGES
    existing_categories = []
    extracted_mem = memory_extract_from_messages(messages, existing_categories)
    if not extracted_mem:
        print("nothing extracted")
        return

    print("--- extracted memories ---")
    for mem in extracted_mem:
        print(mem)

    embeddings = embed_memories(extracted_mem)
    print("\n--- embeddings (first 5 values each) ---")
    for emb in embeddings:
        print(emb[:5])

    memories = [
        EmbeddedMemory(
            user_id=1,
            memory_text=mem.information,
            categories=mem.predicted_categories,
            date=str(date.today()),
            embedding=emb,
        )
        for mem, emb in zip(extracted_mem, embeddings)
    ]

    await insert_memories(memories)
    print("\n--- inserted memories ---")
    for mem in memories:
        print(f"{mem.memory_text} | {mem.categories}")
        # search
    question = "where is the user from?"
    search_vector = embed_single(question)
    results = await search_memories(search_vector, user_id=1)

    context = "\n".join([r.payload["memory_text"] for r in results])
    print("\n--- search results ---")
    print(context)

    # generate
    answer = await generate_answer(question=question, context=context)
    print("\n--- generated answer ---")
    print(answer)


if __name__ == "__main__":
    asyncio.run(main())
