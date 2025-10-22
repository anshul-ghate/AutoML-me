# AutoML-me/app/main.py - COMPLETE INTEGRATION
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from loguru import logger
import sys

# Configure logging
logger.remove()
logger.add(sys.stderr, level="INFO")

# Import all routers
from app.api.ai_assistant import router as ai_router
from app.api.websocket import router as ws_router
from app.api.monitoring import router as monitoring_router
from app.api.projects import router as projects_router
from app.database import init_db

# Create FastAPI app
app = FastAPI(
    title="AutoML Platform API",
    description="Enterprise-grade AutoML Platform with AI Supervision",
    version="2.0.0"
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:8301"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include all routers
app.include_router(ai_router, prefix="/api", tags=["AI Supervisor"])
app.include_router(ws_router, tags=["WebSocket"])
app.include_router(monitoring_router, prefix="/api", tags=["Monitoring & XAI"])
app.include_router(projects_router, prefix="/api", tags=["Projects & Teams"])

# Startup event
@app.on_event("startup")
async def startup_event():
    logger.info("🚀 Starting AutoML Platform...")
    init_db()
    logger.info("✅ Database initialized")
    logger.info("✅ All routers loaded")
    logger.info("🎉 AutoML Platform ready!")

# Health check
@app.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "version": "2.0.0",
        "features": {
            "ai_supervisor": True,
            "drift_monitoring": True,
            "explainability": True,
            "websocket": True,
            "projects": True
        }
    }

# Root endpoint
@app.get("/")
async def root():
    return {
        "message": "Welcome to AutoML Platform API",
        "version": "2.0.0",
        "docs": "/docs",
        "health": "/health"
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8301, reload=True)
