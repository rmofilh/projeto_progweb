from contextlib import asynccontextmanager
from fastapi import FastAPI
from core.database import create_db_and_tables
from api.routes import auth, favorites, patterns

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Executado ao ligar a API
    await create_db_and_tables()
    yield

app = FastAPI(title="Fio & Luz API", lifespan=lifespan)

# Register Routers
app.include_router(auth.router)
app.include_router(favorites.router)
app.include_router(patterns.router)

@app.get("/")
async def root():
    return {
        "status": "ok", 
        "message": "Fio & Luz API is operational",
        "docs": "/docs"
    }
