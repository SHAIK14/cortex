from openai import OpenAI
from config import settings

client = OpenAI(api_key=settings.openai_api_key)


def generate_embeddings(text:str) ->list[float]:
    response = client.embeddings.create(
        model ="text-embedding-ada-002",
        input = text,
    )
    return response.data[0].embedding
    