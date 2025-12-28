import json
from llm.openai import chat_completion
from memory.prompts import DECISION_PROMPT


async def decide_actions(
    new_facts: list[dict],
    existing_memories: list[list[dict]]
) -> list[dict]:

    if not new_facts:
        return []

    id_mapping = {}
    mapped_memories = []

    for fact_idx, memories in enumerate(existing_memories):
        mapped_fact_memories = []
        for mem_idx, mem in enumerate(memories):
            temp_id = f"{fact_idx}_{mem_idx}"
            id_mapping[temp_id] = mem["id"]
            mapped_fact_memories.append({
                "id": temp_id,
                "text": mem["text"],
                "type": mem.get("type"),
                "category": mem.get("category"),
                "confidence": mem.get("confidence")
            })
        mapped_memories.append(mapped_fact_memories)

    user_prompt = f"""
New Facts:
{json.dumps(new_facts, indent=2)}

Existing Memories (per fact):
{json.dumps(mapped_memories, indent=2)}
"""

    response = await chat_completion(
        system_prompt=DECISION_PROMPT,
        user_prompt=user_prompt,
        response_format={"type": "json_object"}
    )

    try:
        result = json.loads(response)
        decisions = result.get("decisions", [])

        for decision in decisions:
            temp_id = decision.get("target_id")
            if temp_id and temp_id in id_mapping:
                decision["target_id"] = id_mapping[temp_id]

        return decisions

    except json.JSONDecodeError:
        return [
            {"fact_index": i, "action": "ADD", "target_id": None, "reasoning": "Default"}
            for i in range(len(new_facts))
        ]
