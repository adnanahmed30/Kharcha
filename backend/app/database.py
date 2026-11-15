import os

from sqlalchemy import create_engine
from sqlalchemy.orm import DeclarativeBase, sessionmaker


# Tests set KHARCHA_DATABASE_URL to a throwaway database; normal runs use kharcha.db.
DATABASE_URL = os.environ.get("KHARCHA_DATABASE_URL", "sqlite:///./kharcha.db")

engine = create_engine(DATABASE_URL, connect_args = {"check_same_thread": False})


SessionLocal = sessionmaker(bind = engine)

class Base(DeclarativeBase):
    pass

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

