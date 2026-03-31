import asyncio
import os
from datetime import date
from typing import Optional
from uuid import uuid4

from dotenv import load_dotenv
from pydantic import BaseModel
from qdrant_client import AsyncQdrantClient, QdrantClient
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

# sync client for use in non-async contexts (tools)
sync_client = QdrantClient(
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


async def delete_memory(memory_id: str):
    await client.delete(
        collection_name=COLLECTION_NAME,
        points_selector=models.PointIdsList(points=[memory_id]),
    )


async def get_memory_by_id(memory_id: str):
    result = await client.retrieve(
        collection_name=COLLECTION_NAME,
        ids=[memory_id],
        with_payload=True,
        with_vectors=True,
    )
    return result[0] if result else None


async def update_memory(
    memory_id: str,
    new_text: str,
    categories: list[str],
    user_id: int,
    embedding: list[float],
):
    await client.upsert(
        collection_name=COLLECTION_NAME,
        points=[
            models.PointStruct(
                id=memory_id,
                payload={
                    "user_id": user_id,
                    "memory_text": new_text,
                    "categories": categories,
                    "date": str(date.today()),
                },
                vector=embedding,
            )
        ],
    )


# sync versions for tools
def sync_insert_memory(memory: EmbeddedMemory):
    sync_client.upsert(
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
        ],
    )


def sync_delete_memory(memory_id: str):
    sync_client.delete(
        collection_name=COLLECTION_NAME,
        points_selector=models.PointIdsList(points=[memory_id]),
    )


def sync_get_memory_by_id(memory_id: str):
    result = sync_client.retrieve(
        collection_name=COLLECTION_NAME,
        ids=[memory_id],
        with_payload=True,
        with_vectors=True,
    )
    return result[0] if result else None


def sync_update_memory(memory_id: str, new_text: str, categories: list[str], user_id: int, embedding: list[float]):
    sync_client.upsert(
        collection_name=COLLECTION_NAME,
        points=[
            models.PointStruct(
                id=memory_id,
                payload={
                    "user_id": user_id,
                    "memory_text": new_text,
                    "categories": categories,
                    "date": str(date.today()),
                },
                vector=embedding,
            )
        ],
    )
