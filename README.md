# Cortex

A memory layer for AI chat. Cortex pulls durable facts out of conversations, stores them per user in a vector database, and feeds the relevant ones back as context when answering later questions.

Ordinary chat apps forget you the moment the context window rolls over. Cortex writes the important parts down.

## How it works

```
message  ->  extract facts  ->  embed  ->  compare with existing memories
                                              |
                                    add / update / delete / skip
                                              |
                                           Qdrant

question ->  embed  ->  search user's memories  ->  answer with that context
```

Three things make this more than a chat log:

- **Facts are atomic.** "I moved to Delhi from Mumbai" becomes two separate entries, which retrieve more precisely than one blob of text.
- **Writes are reconciled, not appended.** Before storing anything, an agent looks at similar existing memories and decides whether to add, update, delete, or do nothing. Saying you moved cities rewrites the old memory instead of leaving both to contradict each other.
- **Memories are user-scoped in the database.** Every search filters on the user ID that came out of the auth token, so one account can never retrieve another's memories.

## Stack

| Layer | Choice |
| --- | --- |
| Frontend | Next.js (App Router), Tailwind, TypeScript |
| Backend | FastAPI, Pydantic |
| Auth | Supabase, JWT verified on every request |
| Vectors | Qdrant, cosine, 1536 dimensions |
| LLM plumbing | DSPy (`Predict` for extraction and answering, `ReAct` for memory writes) |
| Embeddings | OpenAI `text-embedding-3-small` |

## Layout

```
frontend/
  app/
    page.tsx            landing
    login/              sign in and sign up
    (app)/              routes behind auth
      chat/
      memories/
  components/
    app-shell.tsx       sidebar and nav
    auth-gate.tsx       redirects when there is no session
    session-user.tsx    user id and access token context
  lib/supabase.ts

server/app/
  main.py               app setup and CORS
  api/
    routes.py           the three endpoints
    auth.py             JWT -> user id
    models.py
  memory/
    extract_memory.py   conversation -> facts
    embed_memory.py     OpenAI embeddings
    vector_DB.py        Qdrant reads and writes
    tool_caller.py      the add/update/delete agent
    tools.py            what that agent can actually call
    response_generator.py
  eval/                 test cases and an LLM judge
```

## API

Every endpoint requires `Authorization: Bearer <supabase access token>`. The user ID is read from the token's `sub` claim and never from the request body, so a client cannot ask for someone else's data.

| Endpoint | Body | Returns |
| --- | --- | --- |
| `POST /chat` | `{ question, past_messages }` | `{ answer }` |
| `POST /memories` | `{ messages }` | `{ status, processed }` |
| `POST /memories/search` | `{ query }` | `{ memories: [{ memory_text, score }] }` |

`/chat` retrieves the top 4 memories above a 0.1 similarity score. The frontend sends the last 10 messages as `past_messages` and fires `/memories` in the background so storing a fact never blocks the reply.

## Running it

You need an OpenAI key, a Qdrant instance, and a Supabase project with email auth turned on.

**Backend**

`server/.env`:

```
OPENAI_API_KEY=
QDRANT_URL=
QDRANT_API_KEY=
SUPABASE_URL=
SUPABASE_JWT_SECRET=
```

```bash
cd server
source venv/bin/activate
pip install -r app/requirements.txt
uvicorn app.main:app --reload
```

The Qdrant collection is created on first startup. Watch for `collections created` in the logs.

**Frontend**

`frontend/.env.local`:

```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
```

```bash
cd frontend
npm install
npm run dev
```

Backend runs on `:8000`, frontend on `:3000`. CORS is set for `localhost:3000`, so change `server/app/main.py` if you move the frontend.

## Evaluation

`server/app/eval/` checks that retrieved context actually reaches the answer. Each case is scored two ways: a literal check that expected facts appear in the response, and a `gpt-4o` judge rating groundedness, accuracy, and helpfulness from 1 to 5.

```bash
cd server
python -m app.eval.run_eval
```

The runner still searches against a hardcoded `user_id=1` from before auth landed, so it returns nothing against a live collection keyed by Supabase UUIDs. Point it at a real user ID to get meaningful retrieval.

## Notes

Two things that will bite you if you change them carelessly.

**Qdrant index types are fixed at creation.** `user_id` is indexed as `KEYWORD` because Supabase user IDs are UUID strings. A collection created back when IDs were integers keeps the old `INTEGER` index and every filtered search fails. Fixing it means deleting the collection and letting startup rebuild it.

**Supabase signs tokens with ES256.** `server/app/api/auth.py` reads the algorithm from the token header and verifies ES256 against the project's JWKS endpoint, falling back to HS256 with the shared secret. Hardcoding HS256 rejects every real token with a 401 that looks like a credentials problem but isn't.
