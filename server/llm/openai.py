from openai import OpenAI
from config import settings

client = OpenAI(api_key=settings.openai_api_key)

def chat_completion(
    system_prompt: str,
    user_prompt: str,
    response_format: dict = None,
    
) -> str:
    
    messages = [
        {"role": "system","content": system_prompt},
        {"role": "user","content": user_prompt}
    ]
    kwargs = {
        "model": "gpt-4o-mini",
        "messages": messages,
        "temperature": 0.1
        
    }
    if response_format:
        kwargs["response_format"] = response_format
    response =  client.chat.completions.create(**kwargs)
    return response.choices[0].message.content
