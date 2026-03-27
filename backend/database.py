import os
from sqlmodel import create_engine, SQLModel, Session

DATABASE_URL = os.getenv("DATABASE_URL")
engine = create_engine(DATABASE_URL, echo=True)

def create_db_and_tables():
    from models import SQLModel # Ensure models are imported so they are registered
    SQLModel.metadata.create_all(engine)

def get_session():
    with Session(engine) as session:
        yield session
