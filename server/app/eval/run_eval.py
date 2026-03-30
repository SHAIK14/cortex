import asyncio
import os
import sys

sys.path.append(os.path.join(os.path.dirname(__file__), "../../.."))

from app.eval.judge import judge_response
from app.eval.test_case import TEST_CASES
from app.memory.embed_memory import embed_single
from app.memory.response_generator import generate_answer
from app.memory.vector_DB import search_memories


async def main():
    passed = 0
    failed = 0

    for case in TEST_CASES:
        search_vector = embed_single(case["question"])
        results = await search_memories(search_vector, user_id=1)
        context = "\n".join([r.payload["memory_text"] for r in results])
        response = await generate_answer(
            question=case["question"],
            context=context,
        )

        # check if every expected fact appears in the response
        # facts_found = [
        #     fact for fact in case["expected_facts"] if fact.lower() in response.lower()
        # ]
        facts_missing = [
            fact
            for fact in case["expected_facts"]
            if fact.lower() not in response.lower()
        ]

        rule_result = "PASS" if not facts_missing else "FAIL"

        scores = await judge_response(
            question=case["question"], context=context, response=response
        )
        if rule_result == "PASS":
            passed += 1
        else:
            failed += 1

        print(f"\nQuestion:      {case['question']}")
        print(f"Response:      {response}")
        print(f"Rule check:    {rule_result} | Missing: {facts_missing}")
        print(f"Groundedness:  {scores['groundedness']}/5")
        print(f"Accuracy:      {scores['accuracy']}/5")
        print(f"Helpfulness:   {scores['helpfulness']}/5")
        print(f"Judge says:    {scores['reasoning']}")
        print("-" * 60)

    print(f"\nFinal Score: {passed}/{passed + failed} passed")


if __name__ == "__main__":
    asyncio.run(main())
