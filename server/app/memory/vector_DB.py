import asyncio
import os
from typing import Optional
from uuid import uuid4

from dotenv import load_dotenv
from pydantic import BaseModel
from qdrant_client import AsyncQdrantClient
from qdrant_client.models import Distance, Filter, VectorParams, models

COLLECTION_NAME = "memories"


class EmbeddedMemory(BaseModel):
    user_id: int
    memory_text: str
    categories: list[str]
    date: str
    embedding: list[float]


load_dotenv()

client = AsyncQdrantClient(
    url=os.getenv("QDRANT_URL"), api_key=os.getenv("QDRANT_API_KEY")
)


async def create_collection():
    if not (await client.collection_exists("memories")):
        await client.create_collection(
            collection_name=COLLECTION_NAME,
            vectors_config=VectorParams(size=1536, distance=Distance.COSINE),
        )
        await client.create_payload_index(
            collection_name="memories",
            field_name="user_id",
            field_schema=models.PayloadSchemaType.INTEGER,
        )
        await client.create_payload_index(
            collection_name="memories",
            field_name="categories",
            field_schema=models.PayloadSchemaType.KEYWORD,
        )
        print("collections created")
    else:
        print("collections alrdy exists")


async def insert_memories(memories: list[EmbeddedMemory]):
    await client.upsert(
        collection_name=COLLECTION_NAME,
        points=[
            models.PointStruct(
                id=uuid4().hex,
                payload={
                    "user_id": memory.user_id,
                    "categories": memory.categories,
                    "memory_text": memory.memory_text,
                    "date": memory.date,
                },
                vector=memory.embedding,
            )
            for memory in memories
        ],
    )


async def search_memories(
    search_vector: list[float], user_id: int, categories: Optional[list[str]] = None
):

    must_conditions: list[models.Condition] = [
        models.FieldCondition(key="user_id", match=models.MatchValue(value=user_id))
    ]
    if categories:
        must_conditions.append(
            models.FieldCondition(
                key="categories", match=models.MatchAny(any=categories)
            )
        )
    res = await client.search(
        collection_name=COLLECTION_NAME,
        query_vector=search_vector,
        with_payload=True,
        query_filter=Filter(must=must_conditions),
        score_threshold=0.1,
        limit=4,
    )
    return res
