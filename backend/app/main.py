from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app import models
from app.database import Base, engine
from app.routes import expenses, summary
 

Base.metadata.create_all(bind = engine)



app = FastAPI(title = "Kharcha API")


app.add_middleware(
    CORSMiddleware,
    allow_origins = ["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_methods = ["GET", "POST", "PATCH", "DELETE"],
    allow_headers = ["Content-Type"]
)

app.include_router(expenses.router)
app.include_router(summary.router)

@app.get("/api/health")
def health():
    return {"status": "ok"}

