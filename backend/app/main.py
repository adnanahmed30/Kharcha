from fastapi import Depends, FastAPI

from app import models
from app.database import Base, engine
from app.deps import check_origin
from app.routes import auth, expenses, summary
from app.error_handler import register_error_handlers


Base.metadata.create_all(bind = engine)


# No CORS middleware: the Vite dev server proxies /api to this app (frontend/vite.config.ts),
# so the browser sees one origin. check_origin blocks data-changing requests from other sites.
app = FastAPI(title = "Kharcha API", dependencies = [Depends(check_origin)])
register_error_handlers(app)

app.include_router(auth.router)
app.include_router(expenses.router)
app.include_router(summary.router)

@app.get("/api/health")
def health():
    return {"status": "ok"}

