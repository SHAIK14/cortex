import cohere


def create_cohere_client(api_key: str | None) -> cohere.Client | None:
    """Create a Cohere client if API key is provided."""
    if not api_key:
        return None
    return cohere.Client(api_key)


async def rerank_with_cohere(
    client: cohere.Client | None,
    query: str,
    memories: list[dict],
    top_n: int = 10
) -> list[dict]:
    """
    Rerank memories using Cohere.
    If no client provided, returns memories as-is (fallback).
    """
    if not memories:
        return []

    # Skip reranking if no client (user didn't provide Cohere key)
    if not client:
        return memories[:top_n]

    # Prepare documents for reranking
    documents = [mem["text"] for mem in memories]

    # Call Cohere rerank
    response = client.rerank(
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
