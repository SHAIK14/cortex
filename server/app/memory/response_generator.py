import asyncio
from typing import Dict

import dspy


class ResponseGenerator(dspy.Signature):
    """You are a helpful assistant. Use the context (user memories) and history to give a personalized response."""

    history: str = dspy.InputField(desc="past conversation messages")
    context: str = dspy.InputField(desc="relevant memories about the user")
    question: str = dspy.InputField()
    response: str = dspy.OutputField()


response_generator = dspy.Predict(ResponseGenerator)


async def generate_answer(question: str, context: str, past_messages: list[Dict] = []):
    history = "\n".join([f"{m['role']}: {m['content']}" for m in past_messages])

    def _run():
        with dspy.context(lm=dspy.LM(model="gpt-4o-mini")):
            return response_generator(
                history=history, question=question, context=context
            )

    result = await asyncio.to_thread(_run)
    return result.response
