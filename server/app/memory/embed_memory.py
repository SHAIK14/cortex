import os

from app.memory.extract_memory import Memory
from dotenv import load_dotenv
from openai import OpenAI

load_dotenv()

client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))


def embed_memories(memories: list[Memory]) -> list[list[float]]:
    emb_strings = [
        f"{mem.information} Categories: {', '.join(mem.predicted_categories)}"
        for mem in memories
    ]
    response = client.embeddings.create(
        model="text-embedding-3-small",
        input=emb_strings,
    )

    return [item.embedding for item in response.data]


def embed_single(memory: str):
    response = client.embeddings.create(
        model="text-embedding-3-small",
        input=memory,
    )
    return response.data[0].embedding
