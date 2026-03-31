import asyncio

from app.eval.data import MESSAGES
from app.memory.embed_memory import embed_single
from app.memory.extract_memory import memory_extract_from_messages
from app.memory.response_generator import generate_answer
from app.memory.tool_caller import process_memory
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
        search_vector = embed_single(mem.information)
        existing = await search_memories(search_vector, user_id=1)
        existing_str = (
            "\n".join(
                [f"id: {r.id} | text: {r.payload['memory_text']}" for r in existing]
            )
            or "no existing memories"
        )
        print(f"\nProcessing: {mem.information}")
        print(f"Existing similar: {existing_str}")

        result = await process_memory(
            new_memory=mem.information,
            existing_memories=existing_str,
            user_id=1,
        )
        print(f"Action: {result.action_taken}")
        print("done")
    # embeddings = embed_memories(extracted_mem)
    # print("\n--- embeddings (first 5 values each) ---")
    # for emb in embeddings:
    #     print(emb[:5])

    # memories = [
    #     EmbeddedMemory(
    #         user_id=1,
    #         memory_text=mem.information,
    #         categories=mem.predicted_categories,
    #         date=str(date.today()),
    #         embedding=emb,
    #     )
    #     for mem, emb in zip(extracted_mem, embeddings)
    # ]

    # await insert_memories(memories)

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
