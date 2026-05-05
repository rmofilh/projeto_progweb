from fastapi import FastAPI
from infrastructure.database import create_db_and_tables
from adapters.api.routes import auth, favorites, patterns

app = FastAPI(title="Fio & Luz API (Clean Architecture)")

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
        "docs": "/docs"
    }
