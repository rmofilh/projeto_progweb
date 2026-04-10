from contextlib import asynccontextmanager
from fastapi import FastAPI
from core.database import create_db_and_tables

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Executado ao ligar a API
    await create_db_and_tables()
    yield
    # Código após o yield executaria ao desligar a API

app = FastAPI(title="Fio & Luz API", lifespan=lifespan)

@app.get("/")
async def root():
    return {
        "status": "ok", 
        "message": "Fio & Luz API is operational",
        "docs": "/docs"
    }
