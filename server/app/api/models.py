from pydantic import BaseModel


class Message(BaseModel):
    role: str
    content: str


class IngestRequest(BaseModel):
    messages: list[Message]


class SearchRequest(BaseModel):
    query: str


class ChatRequest(BaseModel):
    question: str
    past_messages: list[Message] = []


class MemoryResult(BaseModel):
    memory_text: str
    score: float


class SearchResponse(BaseModel):
    memories: list[MemoryResult]


class ChatResponse(BaseModel):
    answer: str
