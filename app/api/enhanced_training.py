# app/api/enhanced_training.py
from fastapi import APIRouter, UploadFile, File, BackgroundTasks, WebSocket
from app.preprocessing.profiler import DataProfiler, AutoFeatureEngineer
from app.training.advanced_trainer import AdvancedModelTrainer
import pandas as pd
import asyncio
import json

router = APIRouter(prefix="/api/training", tags=["enhanced-training"])

# Store training progress
training_progress = {}

@router.post("/analyze")
async def analyze_dataset(file: UploadFile = File(...)):
    """Analyze dataset and provide recommendations"""
    df = pd.read_csv(file.file)
    profiler = DataProfiler()
    profile = profiler.analyze_dataset(df)
    return profile

@router.post("/auto-feature-engineer")
async def auto_feature_engineering(file: UploadFile = File(...), target_col: str = None):
    """Automatically engineer features"""
    df = pd.read_csv(file.file)
    engineer = AutoFeatureEngineer()
    df_engineered = engineer.engineer_features(df, target_col)
    
    # Return sample of engineered data
    return {
        'original_shape': df.shape,
        'engineered_shape': df_engineered.shape,
        'new_features': [col for col in df_engineered.columns if col not in df.columns],
        'sample_data': df_engineered.head().to_dict('records')
    }

@router.post("/train-advanced")
async def train_advanced_models(
    background_tasks: BackgroundTasks,
    file: UploadFile = File(...), 
    target_col: str = "target",
    auto_engineer: bool = True
):
    """Train multiple models with advanced features"""
    session_id = f"training_{len(training_progress)}"
    training_progress[session_id] = {"status": "starting", "progress": 0}
    
    background_tasks.add_task(
        run_advanced_training, 
        session_id, 
        await file.read(), 
        target_col, 
        auto_engineer
    )
    
    return {"session_id": session_id}

async def run_advanced_training(session_id: str, file_content: bytes, target_col: str, auto_engineer: bool):
    """Background training task"""
    try:
        training_progress[session_id] = {"status": "loading_data", "progress": 10}
        
        # Load data
        df = pd.read_csv(file_content)
        
        training_progress[session_id] = {"status": "profiling", "progress": 20}
        
        # Auto feature engineering
        if auto_engineer:
            engineer = AutoFeatureEngineer()
            df = engineer.engineer_features(df, target_col)
            
        training_progress[session_id] = {"status": "feature_engineering", "progress": 40}
        
        # Prepare data
        y = df[target_col]
        X = df.drop(columns=[target_col])
        
        training_progress[session_id] = {"status": "training", "progress": 60}
        
        # Train models
        trainer = AdvancedModelTrainer()
        results = trainer.train_multiple_models(X, y)
        
        training_progress[session_id] = {
            "status": "completed", 
            "progress": 100,
            "results": {name: res['metrics'] for name, res in results.items()}
        }
        
    except Exception as e:
        training_progress[session_id] = {"status": "failed", "error": str(e)}

@router.get("/progress/{session_id}")
async def get_training_progress(session_id: str):
    """Get training progress"""
    return training_progress.get(session_id, {"status": "not_found"})

@router.websocket("/ws/training/{session_id}")
async def training_websocket(websocket: WebSocket, session_id: str):
    """Real-time training progress via WebSocket"""
    await websocket.accept()
    
    while True:
        progress = training_progress.get(session_id, {"status": "not_found"})
        await websocket.send_text(json.dumps(progress))
        
        if progress.get("status") in ["completed", "failed", "not_found"]:
            break
            
        await asyncio.sleep(1)
