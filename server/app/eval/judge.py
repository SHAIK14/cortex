import json
import os

import dspy
from dotenv import load_dotenv

load_dotenv()


class JudgeSignature(dspy.Signature):
    """you are an evaluator juding the qulity of ai assistants's response"""

    question: str = dspy.InputField(desc="the question that was asked")
    context: str = dspy.InputField(desc="the memory context given to the assistant")
    response: str = dspy.OutputField(desc=" the assistant's response to evaluate")
    groundedness: int = dspy.OutputField(
        desc="1-5: does the response use facts from context? 1 = ignores context, 5 = fully grounded "
    )
    accuracy: int = dspy.OutputField(
        desc="1-5: are the facts stated actually correct based on context? 1= wrong, 5 = allcorrect"
    )
    helpfulness: int = dspy.OutputField(
        desc="1-5: does it actually answer the question asked? 1 = avoids it, 5 = directly answers"
    )
    reasoning: str = dspy.OutputField(desc="one sentence explaining your scores")


judge_predictor = dspy.Predict(JudgeSignature)


async def judge_response(question: str, context: str, response: str) -> dict:
    with dspy.context(lm=dspy.LM(model="gpt-4o")):
        result = judge_predictor(question=question, context=context, response=response)
    return {
        "groundedness": int(result.groundedness),
        "accuracy": int(result.accuracy),
        "helpfulness": int(result.helpfulness),
        "reasoning": result.reasoning,
    }
