from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.routes import applications, attachments, health


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Initialize connections, clients, or caches here.
    yield
    # Close resources gracefully here.


app = FastAPI(title="ZUS Accident Reporter API", lifespan=lifespan)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, specify actual frontend origin
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(health.router)
app.include_router(applications.router)
app.include_router(attachments.router)


@app.get("/", tags=["root"])
async def read_root():
    return {"message": "API is ready"}
