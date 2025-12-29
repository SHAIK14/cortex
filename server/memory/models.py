from pydantic import BaseModel

class Message(BaseModel):
    role:str
    content:str
    
class AddMemoryRequest(BaseModel):
    messages: list[Message]
    user_id: str
    conversation_id: str = None
    
class SearchRequest(BaseModel):
    query:str
    user_id:str
    limit:int = 10