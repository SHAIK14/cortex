# Supabase Auth + Qdrant Fix Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Fix the Qdrant user_id index bug and add Supabase JWT auth so every API request uses a real user ID extracted from the token.

**Architecture:** The Qdrant collection currently has a stale INTEGER index on user_id — we delete and recreate it with KEYWORD type. Then we add a FastAPI dependency that reads the Authorization header, verifies the Supabase JWT, and returns the user's UUID. All 3 routes use this dependency instead of trusting user_id from the request body.

**Tech Stack:** FastAPI, PyJWT, Supabase (JWT issuer), Qdrant

---

### Task 1: Delete the stale Qdrant collection

The existing collection has an INTEGER index on `user_id`. It must be deleted so `create_collection()` can recreate it with the correct KEYWORD index on next server startup.

**Files:**
- No code changes — just run a script

**Step 1: Run the delete script**

From inside `server/` with venv activated:

```bash
python -c "
from dotenv import load_dotenv
load_dotenv()
from app.memory.vector_DB import sync_client
sync_client.delete_collection('memories')
print('deleted')
"
```

Expected output: `deleted`

**Step 2: Restart the server**

```bash
uvicorn app.main:app --reload
```

Expected log: `collections created` (not "alrdy exists")

**Step 3: Verify the fix**

Hit `POST /chat` from the frontend. Should no longer get 400 from Qdrant.

**Step 4: Commit**

```bash
git add .
git commit -m "fix: delete stale qdrant collection with wrong user_id index type"
```

---

### Task 2: Install PyJWT

**Files:**
- Modify: `server/requirements.txt` (if it exists) or just pip install

**Step 1: Install**

```bash
pip install PyJWT
```

**Step 2: Verify**

```bash
python -c "import jwt; print(jwt.__version__)"
```

Expected: prints a version number like `2.x.x`

---

### Task 3: Create JWT auth dependency

This is a FastAPI dependency function. It reads the `Authorization: Bearer <token>` header, verifies it using `SUPABASE_JWT_SECRET`, and returns the user's UUID string.

**Files:**
- Create: `server/app/api/auth.py`

**Step 1: Write the auth module**

```python
import os

import jwt
from dotenv import load_dotenv
from fastapi import Header, HTTPException

load_dotenv()

JWT_SECRET = os.getenv("SUPABASE_JWT_SECRET")
ALGORITHM = "HS256"


def get_current_user(authorization: str = Header()) -> str:
    if not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Missing Bearer token")
    token = authorization.removeprefix("Bearer ")
    try:
        payload = jwt.decode(
            token,
            JWT_SECRET,
            algorithms=[ALGORITHM],
            options={"verify_aud": False},
        )
        return payload["sub"]  # Supabase user UUID
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expired")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid token")
```

**Step 2: Verify it parses correctly**

```bash
python -c "from app.api.auth import get_current_user; print('ok')"
```

Expected: `ok`

---

### Task 4: Wire auth into all 3 routes

Remove `user_id` from request bodies — the real user ID now comes from the JWT. Update all 3 endpoints to use `get_current_user` as a FastAPI dependency.

**Files:**
- Modify: `server/app/api/routes.py`
- Modify: `server/app/api/models.py`

**Step 1: Remove user_id from request models in models.py**

```python
class IngestRequest(BaseModel):
    messages: list[Message]          # removed user_id

class SearchRequest(BaseModel):
    query: str                        # removed user_id

class ChatRequest(BaseModel):
    question: str
    past_messages: list[Message] = []  # removed user_id
```

**Step 2: Update routes.py to use the auth dependency**

```python
from app.api.auth import get_current_user
from fastapi import Depends

@router.post("/memories")
async def ingest_memories(request: IngestRequest, user_id: str = Depends(get_current_user)):
    messages = [m.model_dump() for m in request.messages]
    memories = memory_extract_from_messages(messages, [])
    for memory in memories:
        embedding = embed_single(memory.information)
        results = await search_memories(embedding, user_id)
        existing_str = "\n".join(
            [f"id: {r.id} | text:{r.payload['memory_text']}" for r in results]
        )
        await process_memory(memory.information, existing_str, user_id)
    return {"status": "ok", "processed": len(memories)}


@router.get("/memories/search")
async def search(request: SearchRequest, user_id: str = Depends(get_current_user)):
    embedding = embed_single(request.query)
    results = await search_memories(embedding, user_id)
    memories = [
        MemoryResult(memory_text=r.payload["memory_text"], score=r.score)
        for r in results
    ]
    return SearchResponse(memories=memories)


@router.post("/chat")
async def chat(request: ChatRequest, user_id: str = Depends(get_current_user)):
    embedding = embed_single(request.question)
    results = await search_memories(embedding, user_id)
    context = "\n".join([r.payload["memory_text"] for r in results])
    past_messages = [m.model_dump() for m in request.past_messages]
    answer = await generate_answer(request.question, context, past_messages)
    return ChatResponse(answer=answer)
```

**Step 3: Restart server and verify `/docs` still loads**

```bash
uvicorn app.main:app --reload
```

Open `http://localhost:8000/docs` — all 3 endpoints should show with no `user_id` in their request bodies.

**Step 4: Commit**

```bash
git add server/app/api/auth.py server/app/api/routes.py server/app/api/models.py
git commit -m "feat: add supabase jwt auth, remove hardcoded user_id from requests"
```

---

### Task 5: Update frontend to send JWT (hand off to Cursor)

This is frontend work — do this in Cursor, not here.

**What needs to change in the frontend:**
1. Install Supabase JS: `npm install @supabase/supabase-js`
2. Create `lib/supabase.ts`:
```ts
import { createClient } from '@supabase/supabase-js'
export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)
```
3. Add `.env.local` with:
```
NEXT_PUBLIC_SUPABASE_URL=your_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
```
4. Create login/signup page at `app/login/page.tsx` using `supabase.auth.signUp()` and `supabase.auth.signInWithPassword()`
5. In every API call (`postChat`, `ingestMemory`, search), get the session token and add the header:
```ts
const { data: { session } } = await supabase.auth.getSession()
headers: {
  "Content-Type": "application/json",
  "Authorization": `Bearer ${session?.access_token}`
}
```
6. Remove `user_id` from all request bodies — the backend now reads it from the token
7. Add auth guard: if no session, redirect to `/login`
