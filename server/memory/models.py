from pydantic import BaseModel

# Credentials provided by user (stored in their browser, sent with each request)
class Credentials(BaseModel):
    openai_key: str
    supabase_url: str
    supabase_key: str
    cohere_key: str | None = None


class Message(BaseModel):
    role: str
    content: str


# Request models - all include credentials
class AddMemoryRequest(BaseModel):
    credentials: Credentials
    messages: list[Message]
    conversation_id: str | None = None
    # user_id comes from JWT, not request body


class SearchRequest(BaseModel):
    credentials: Credentials
    query: str
    limit: int = 10
    # user_id comes from JWT


class ListMemoriesRequest(BaseModel):
    credentials: Credentials
    # user_id comes from JWT


class GetMemoryRequest(BaseModel):
    credentials: Credentials
    # memory_id comes from path


class DeleteMemoryRequest(BaseModel):
    credentials: Credentials
    # memory_id comes from path


class StatsRequest(BaseModel):
    credentials: Credentials
    # user_id comes from JWT


class ChatRequest(BaseModel):
    credentials: Credentials
    message: str
    conversation_id: str | None = None
    retrieve_k: int = 5  # Number of memories to retrieve for context
    extract_memories: bool = True  # Whether to extract facts after response
