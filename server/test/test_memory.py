import httpx
import json

BASE_URL = "http://localhost:8000"
API_KEY = "ctx_d203d3fb74181237649832a45e130688b5879fa683b3cc74"

headers = {
    "Authorization": f"Bearer {API_KEY}",
    "Content-Type": "application/json"
}

def add_memory(messages: list, user_id: str, conversation_id: str = None):
    payload = {
        "messages": messages,
        "user_id": user_id,
        "conversation_id": conversation_id
    }
    response = httpx.post(
        f"{BASE_URL}/memory/add",
        headers=headers,
        json=payload,
        timeout=30.0
    )
    return response.json()


if __name__ == "__main__":
    messages = [
        {"role": "user", "content": "Hi, I'm Asif. I'm a software engineer."},
        {"role": "assistant", "content": "Nice to meet you Asif!"},
        {"role": "user", "content": "I'm vegetarian and prefer dark mode."}
    ]
    
    result = add_memory(messages, user_id="asif_123", conversation_id="conv_001")
    print(json.dumps(result, indent=2))
