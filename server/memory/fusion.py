def reciprocal_rank_fusion(
    vector_results: list[dict],
    keyword_results: list[dict],
    k: int = 60
) -> list[dict]:

    scores = {}  # id -> {"score": float, "memory": dict}
    
    # Score vector results
    for rank, mem in enumerate(vector_results, start=1):
        mem_id = mem["id"]
        rrf_score = 1 / (k + rank)
        scores[mem_id] = {
            "score": rrf_score,
            "memory": mem,
            "sources": ["vector"]
        }
    
    # Score keyword results (add to existing if found in both)
    for rank, mem in enumerate(keyword_results, start=1):
        mem_id = mem["id"]
        rrf_score = 1 / (k + rank)
        
        if mem_id in scores:
            # Found in both - add scores together
            scores[mem_id]["score"] += rrf_score
            scores[mem_id]["sources"].append("keyword")
        else:
            # Only in keyword results
            scores[mem_id] = {
                "score": rrf_score,
                "memory": mem,
                "sources": ["keyword"]
            }
    
    # Sort by combined RRF score
    ranked = sorted(scores.values(), key=lambda x: x["score"], reverse=True)
    
    # Return memories with RRF score attached
    results = []
    for item in ranked:
        mem = item["memory"]
        mem["rrf_score"] = item["score"]
        mem["search_sources"] = item["sources"]
        results.append(mem)
    
    return results
