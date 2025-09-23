from fastapi import FastAPI
import os
from dotenv import load_dotenv

load_dotenv()

from app.api.uploads import router as upload_router
from app.api.auth import router as auth_router
from app.api.genai import router as genai_router
from app.api.automl import router as automl_router

app = FastAPI(
    title="AutoML Platform API",
    version="0.1.0"
)

# Include endpoints
app.include_router(upload_router)
app.include_router(auth_router)
app.include_router(genai_router)
app.include_router(automl_router)


@app.get("/health")
def health_check():
    return {"status": "ok"}
