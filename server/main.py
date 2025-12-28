from fastapi import FastAPI
from auth.routes import router as auth_router
from memory.routes import router as memory_router

app = FastAPI(
    title="Cortex API",
    description="Long-term memory for LLMs",
    version="0.1.0"
)

app.include_router(auth_router)
app.include_router(memory_router)

@app.get("/")
async def root():
    return {"message": "Cortex API", "version": "0.1.0"}

@app.get("/health")
async def health():
    return {"status": "healthy"}
