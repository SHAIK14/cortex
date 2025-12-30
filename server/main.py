from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from auth.routes import router as auth_router
from memory.routes import router as memory_router

app = FastAPI(
    title="Cortex API",
    description="Long-term memory for LLMs",
    version="0.1.0"
)

# CORS middleware - allow frontend to call backend
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",  # Next.js dev server
        "http://127.0.0.1:3000",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router)
app.include_router(memory_router)

@app.get("/")
async def root():
    return {"message": "Cortex API", "version": "0.1.0"}

@app.get("/health")
async def health():
    return {"status": "healthy"}
