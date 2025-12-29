"""

"""

EXTRACTION_PROMPT = """You are a memory extraction system. Analyze the conversation and extract facts worth remembering about the user.

For each fact, provide:
- text: The fact in third-person ("User likes...", "User works at...")
- type: One of [identity, fact, preference, event, context]
- confidence: 0.0 to 1.0 (how certain?)
- category: What category? (location, employment, skill, food, hobby, health, etc.)
- source: Quote the exact text this was extracted from
- entities: List of named entities (people, companies, places, technologies)

TYPES explained:
- identity: Core identity ("User is a doctor", "User is vegetarian")
- fact: Verifiable info ("Works at Google", "Lives in Berlin")
- preference: Likes/dislikes ("Prefers dark mode", "Hates meetings")
- event: One-time occurrence ("Started new job", "Learned React yesterday")
- context: Temporary/situational ("Working on auth bug", "Preparing for interview")

RULES:
1. Extract from USER messages only, ignore assistant messages
2. Split compound facts into separate items
3. Rephrase as third-person ("User..." not "I...")
4. Return empty array if nothing worth extracting

Return valid JSON only:
{
    "facts": [
        {
            "text": "User works at Google",
            "type": "fact",
            "confidence": 0.9,
            "category": "employment",
            "source": "I just started at Google",
            "entities": ["Google"]
        }
    ]
}
"""


DECISION_PROMPT = """You are a memory management system. Given new facts and existing memories, decide what action to take.

ACTIONS:
- ADD: New information, not in existing memories
- UPDATE: More detailed/recent version of existing memory (provide target_id)
- DELETE: Hard contradiction - old memory is factually wrong (provide target_id)
- CONFLICT: Soft contradiction - both could be true, lower old memory's confidence (provide target_id, new_confidence)
- NONE: Already exists with same meaning (duplicate, skip it)

CONFLICT vs DELETE:
- DELETE = HARD contradiction (old fact is WRONG):
  - "Lives in NYC" → "Lives in Berlin" = DELETE (can't live in two places)
  - "Works at Google" → "Works at Meta" = DELETE (changed jobs)

- CONFLICT = SOFT contradiction (both could be true):
  - "User is vegetarian" + "User ate steak" = CONFLICT (exception doesn't change identity)
  - "User prefers dark mode" + "User used light mode" = CONFLICT (temporary choice)
  - "User hates meetings" + "User enjoyed standup" = CONFLICT (exception)

CONFLICT RULES:
1. identity + event = CONFLICT (lower confidence by 0.1-0.2)
2. preference + event = CONFLICT (lower confidence by 0.1-0.2)
3. Same type + same category = usually DELETE

For CONFLICT, set new_confidence to current confidence minus 0.1-0.2 (minimum 0.3).

Return valid JSON:
{
    "decisions": [
        {
            "fact_index": 0,
            "action": "ADD",
            "target_id": null,
            "new_confidence": null,
            "reasoning": "New information"
        }
    ]
}
"""
