import logging
import os

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from adapters.api.routes import auth, favorites, patterns
from infrastructure.database import create_db_and_tables

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(name)s: %(message)s")

app = FastAPI(title="Fio & Luz API (Clean Architecture)")

origins = os.getenv("CORS_ORIGINS", "http://localhost:3000").split(",")

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
async def startup_event():
    # System initialization in infrastructure layer
    await create_db_and_tables()


# Register Adapters (API Routes)
app.include_router(auth.router)
app.include_router(favorites.router)
app.include_router(patterns.router)


@app.get("/")
async def root():
    return {
        "status": "ok",
        "architecture": "Clean Architecture with strict DDD isolation",
        "docs": "/docs",
    }
