from contextlib import asynccontextmanager

from fastapi import FastAPI

from app.routes import health


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Initialize connections, clients, or caches here.
    yield
    # Close resources gracefully here.


app = FastAPI(title="Monolith Bootstrap API", lifespan=lifespan)

app.include_router(health.router)


@app.get("/", tags=["root"])
async def read_root():
    return {"message": "API is ready"}
