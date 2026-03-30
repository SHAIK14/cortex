import json

import dspy
from dotenv import load_dotenv
from pydantic import BaseModel

load_dotenv()


class Memory(BaseModel):
    information: str
    predicted_categories: list[str]


class MemoryExtract(dspy.Signature):
    """
    extract relevant information from the converstation . create memory entires that you should remeber when speaking with the user later. Each memory is an unique atomic factoid.return a list of individual memory entries, one fact per item

    you will be provided a list of existing categories in the memory database. when predicting the category of this information, you can decide to create new categories , or pick from an existing one if it exists
    """

    transcript: str = dspy.InputField()
    existing_categories: list[str] = dspy.InputField()
    no_info: bool = dspy.OutputField(
        description="set true if no information to be extracted"
    )
    memories: list[Memory] = dspy.OutputField()


memory_extractor = dspy.Predict(MemoryExtract)


def memory_extract_from_messages(messages, existing_categories):
    transcript = json.dumps(messages)
    with dspy.context(lm=dspy.LM(model="gpt-4o-mini")):
        out = memory_extractor(
            transcript=transcript, existing_categories=existing_categories
        )
    if out.no_info:
        return []
    return out.memories


if __name__ == "__main__":
    messages = [
        {"role": "user", "content": " hi, my name is asif"},
        {"role": "assistant", "content": "got it"},
        {"role": "user", "content": "i am from india ,  i love india"},
        {"role": "user", "content": " my sde at the optimum solution"},
    ]
    existing_categories = []
    memory_extract_from_messages(messages, existing_categories)
