from fastapi import FastAPI
import os
from dotenv import load_dotenv
from fastapi.middleware.cors import CORSMiddleware

load_dotenv()

from app.api.uploads import router as upload_router
from app.api.auth import router as auth_router
from app.api.genai import router as genai_router
from app.api.automl import router as automl_router
from app.api.collab import router as collab_router

app = FastAPI(
    title="AutoML Platform API",
    version="0.1.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:8301", "http://127.0.0.1:8301"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include endpoints
app.include_router(upload_router)
app.include_router(auth_router)
app.include_router(genai_router)
app.include_router(automl_router)
app.include_router(collab_router)
app.include_router(router)

@app.get("/health")
def health_check():
    return {"status": "ok"}
