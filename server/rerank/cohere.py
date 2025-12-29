import cohere
from config import settings


async def rerank_with_cohere(
    query: str,
    memories: list[dict],
    top_n: int = 10
) -> list[dict]:
 
    if not memories:
        return []
    
    # Skip if no API key configured
    if not settings.COHERE_API_KEY:
        return memories[:top_n]
    
    co = cohere.Client(settings.COHERE_API_KEY)
    
    # Prepare documents for reranking
    documents = [mem["text"] for mem in memories]
    
    # Call Cohere rerank
    response = co.rerank(
        model="rerank-english-v3.0",
        query=query,
        documents=documents,
        top_n=min(top_n, len(documents))
    )
    
    # Reorder memories based on Cohere's ranking
    reranked = []
    for result in response.results:
        mem = memories[result.index]
        mem["relevance_score"] = result.relevance_score
        reranked.append(mem)
    
    return reranked
