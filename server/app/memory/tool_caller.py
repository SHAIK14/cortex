import asyncio

import dspy
from app.memory.tools import add, delete, noop, update
from dotenv import load_dotenv

load_dotenv()


class MemoryToolCaller(dspy.Signature):
    """You are a memory manager. Given a new memory and existing
    memories,
    decide what action to take.

    Rules:
    - If the new memory is completely new info with no related existing
    memory → call add
    - If the new memory UPDATES or CONTRADICTS an existing one (e.g.
    moved cities, changed jobs) → call update with the existing memory's
    id
    - If the new memory is already stored with same meaning → call noop
    - If an existing memory is fully replaced by new info → call delete
    then add
    """

    new_memory: str = dspy.InputField(desc="the new memory to process")
    existing_memories: str = dspy.InputField(
        desc="existing memories from the database formatted string"
    )
    user_id: str = dspy.InputField(desc="the user id")
    action_taken: str = dspy.OutputField(desc="the action taken and result")


agent = dspy.ReAct(
    MemoryToolCaller,
    tools=[add, update, delete, noop],
    max_iters=5,
)


async def process_memory(new_memory: str, existing_memories: str, user_id: str):
    def _run():
        with dspy.context(lm=dspy.LM(model="gpt-4o")):
            return agent(
                new_memory=new_memory,
                existing_memories=existing_memories,
                user_id=user_id,
            )

    result = await asyncio.to_thread(_run)
    return result
