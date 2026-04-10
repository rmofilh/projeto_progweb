from fastapi import FastAPI
from core.database import create_db_and_tables

app = FastAPI(title="Fio & Luz API")

@app.on_event("startup")
async def on_startup():
    await create_db_and_tables()

@app.get("/")
async def root():
    return {
        "status": "ok", 
        "message": "Fio & Luz API is operational",
        "docs": "/docs"
    }
