from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from config import CORS_ORIGINS, APP_HOST, APP_PORT, DEBUG
from database import init_db

from routers import chat, emotions, memories, profile, personas, users


@asynccontextmanager
async def lifespan(app: FastAPI):
    init_db()
    yield


app = FastAPI(
    title="EmotionAI",
    description="AI 情绪陪伴与长期记忆系统",
    version="1.0.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(chat.router)
app.include_router(emotions.router)
app.include_router(memories.router)
app.include_router(profile.router)
app.include_router(personas.router)
app.include_router(users.router)


@app.get("/")
def root():
    return {"message": "EmotionAI API", "version": "1.0.0"}


@app.get("/health")
def health():
    return {"status": "ok"}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host=APP_HOST, port=APP_PORT, reload=DEBUG)
