from fastapi import APIRouter, UploadFile, File, BackgroundTasks, WebSocket, HTTPException, Query
from app.preprocessing.profiler import DataProfiler, AutoFeatureEngineer
from app.training.advanced_trainer import AdvancedModelTrainer
import pandas as pd
import asyncio
import json
import io
from typing import Optional
import numpy as np

router = APIRouter(prefix="/api/training", tags=["enhanced-training"])

# Store training progress and results
training_progress = {}
training_results = {}

@router.post("/analyze")
async def analyze_dataset(file: UploadFile = File(...)):
    """Comprehensive dataset analysis with enterprise-grade profiling"""
    try:
        content = await file.read()
        df = pd.read_csv(io.BytesIO(content))
        
        if df.empty:
            raise HTTPException(status_code=400, detail="Uploaded file is empty")
        
        profiler = DataProfiler()
        profile = profiler.analyze_dataset(df)
        
        return {
            "status": "success",
            "filename": file.filename,
            "profile": profile,
            "summary": {
                "total_rows": profile['shape'][0],
                "total_columns": profile['shape'][1],
                "data_quality_score": profile['data_quality_score'],
                "missing_data_percentage": sum(profile['missing_percentage'].values()) / len(profile['missing_percentage']),
                "recommendation_count": len(profile['recommendations'])
            }
        }
        
    except pd.errors.EmptyDataError:
        raise HTTPException(status_code=400, detail="Invalid CSV file or file is empty")
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Error analyzing dataset: {str(e)}")

@router.post("/feature-engineer")
async def auto_feature_engineering(
    file: UploadFile = File(...), 
    target_col: Optional[str] = Query(None, description="Target column name"),
    include_interactions: bool = Query(True, description="Include feature interactions"),
    include_polynomials: bool = Query(True, description="Include polynomial features")
):
    """Advanced automated feature engineering with customizable options"""
    try:
        content = await file.read()
        df = pd.read_csv(io.BytesIO(content))
        
        if df.empty:
            raise HTTPException(status_code=400, detail="Uploaded file is empty")
        
        if target_col and target_col not in df.columns:
            raise HTTPException(status_code=400, detail=f"Target column '{target_col}' not found in dataset")
        
        engineer = AutoFeatureEngineer()
        df_engineered = engineer.engineer_features(df, target_col)
        
        # Get transformation summary
        transformations = engineer.get_transformation_summary()
        
        return {
            "status": "success",
            "original_shape": df.shape,
            "engineered_shape": df_engineered.shape,
            "new_features": [col for col in df_engineered.columns if col not in df.columns],
            "features_added": df_engineered.shape[1] - df.shape[1],
            "transformations_applied": transformations,
            "sample_data": df_engineered.head(5).fillna(0).to_dict('records'),
            "feature_types": {
                "numeric": len(df_engineered.select_dtypes(include=[np.number]).columns),
                "categorical": len(df_engineered.select_dtypes(include=['object']).columns)
            }
        }
        
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Error in feature engineering: {str(e)}")

@router.post("/train-models")
async def train_advanced_models(
    background_tasks: BackgroundTasks,
    file: UploadFile = File(...),
    target_col: str = Query(..., description="Target column name"),
    auto_engineer: bool = Query(True, description="Apply automatic feature engineering"),
    test_size: float = Query(0.2, ge=0.1, le=0.5, description="Test set size (0.1-0.5)"),
    cv_folds: int = Query(5, ge=3, le=10, description="Cross-validation folds (3-10)")
):
    """Train multiple models with comprehensive evaluation"""
    try:
        content = await file.read()
        session_id = f"training_{hash(content + target_col.encode()) % 100000}"
        
        training_progress[session_id] = {
            "status": "initialized",
            "progress": 0,
            "stage": "Starting training pipeline",
            "timestamp": pd.Timestamp.now().isoformat()
        }
        
        background_tasks.add_task(
            run_comprehensive_training,
            session_id, content, target_col, auto_engineer, test_size, cv_folds
        )
        
        return {
            "status": "success",
            "session_id": session_id,
            "message": "Training started successfully",
            "estimated_duration": "2-5 minutes"
        }
        
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Error starting training: {str(e)}")

async def run_comprehensive_training(
    session_id: str, 
    file_content: bytes, 
    target_col: str, 
    auto_engineer: bool,
    test_size: float,
    cv_folds: int
):
    """Comprehensive background training with detailed progress tracking"""
    try:
        # Stage 1: Data Loading
        training_progress[session_id].update({
            "status": "loading_data",
            "progress": 10,
            "stage": "Loading and validating dataset"
        })
        
        df = pd.read_csv(io.BytesIO(file_content))
        
        if target_col not in df.columns:
            training_progress[session_id] = {
                "status": "failed",
                "error": f"Target column '{target_col}' not found in dataset",
                "available_columns": list(df.columns)
            }
            return
        
        # Stage 2: Data Profiling
        training_progress[session_id].update({
            "status": "profiling",
            "progress": 20,
            "stage": "Analyzing dataset characteristics"
        })
        
        profiler = DataProfiler()
        data_profile = profiler.analyze_dataset(df)
        
        # Stage 3: Feature Engineering
        if auto_engineer:
            training_progress[session_id].update({
                "status": "feature_engineering",
                "progress": 35,
                "stage": "Applying automated feature engineering"
            })
            
            engineer = AutoFeatureEngineer()
            df = engineer.engineer_features(df, target_col)
            feature_transformations = engineer.get_transformation_summary()
        else:
            feature_transformations = ["No feature engineering applied"]
        
        # Stage 4: Data Preparation
        training_progress[session_id].update({
            "status": "preparing_data",
            "progress": 50,
            "stage": "Preparing features and target variable"
        })
        
        y = df[target_col]
        X = df.drop(columns=[target_col])
        
        # Ensure we have numeric features
        numeric_features = X.select_dtypes(include=[np.number]).columns
        if len(numeric_features) == 0:
            training_progress[session_id] = {
                "status": "failed",
                "error": "No numeric features available for training after preprocessing"
            }
            return
        
        X = X[numeric_features]
        
        # Stage 5: Model Training
        training_progress[session_id].update({
            "status": "training",
            "progress": 65,
            "stage": "Training multiple machine learning models"
        })
        
        trainer = AdvancedModelTrainer()
        results = trainer.train_multiple_models(X, y, test_size=test_size, cv_folds=cv_folds)
        
        # Stage 6: Results Analysis
        training_progress[session_id].update({
            "status": "analyzing_results",
            "progress": 85,
            "stage": "Analyzing model performance and generating recommendations"
        })
        
        model_recommendations = trainer.get_model_recommendations(results)
        
        # Stage 7: Completion
        final_results = {
            "data_profile": data_profile,
            "feature_engineering": {
                "applied": auto_engineer,
                "transformations": feature_transformations,
                "original_features": len(df.drop(columns=[target_col]).columns) - (len(numeric_features) if auto_engineer else 0),
                "final_features": len(numeric_features)
            },
            "model_results": {name: res['metrics'] for name, res in results.items() if res.get('status') == 'success'},
            "model_errors": {name: res['error'] for name, res in results.items() if res.get('status') == 'failed'},
            "recommendations": model_recommendations,
            "training_config": {
                "test_size": test_size,
                "cv_folds": cv_folds,
                "models_trained": len(results),
                "successful_models": len([r for r in results.values() if r.get('status') == 'success'])
            }
        }
        
        training_results[session_id] = final_results
        
        training_progress[session_id] = {
            "status": "completed",
            "progress": 100,
            "stage": "Training completed successfully",
            "results_summary": {
                "best_model": max(
                    [(name, res['metrics']['test_accuracy']) for name, res in results.items() if res.get('status') == 'success'],
                    key=lambda x: x[1], default=("None", 0.0)
                )[0],
                "models_trained": len(results),
                "average_accuracy": np.mean([
                    res['metrics']['test_accuracy'] for res in results.values() 
                    if res.get('status') == 'success'
                ]) if any(res.get('status') == 'success' for res in results.values()) else 0.0
            }
        }
        
    except Exception as e:
        training_progress[session_id] = {
            "status": "failed",
            "error": f"Training failed: {str(e)}",
            "stage": "Error occurred during training"
        }

@router.get("/progress/{session_id}")
async def get_training_progress(session_id: str):
    """Get real-time training progress and status"""
    if session_id not in training_progress:
        raise HTTPException(status_code=404, detail="Session not found")
    
    return training_progress[session_id]

@router.get("/results/{session_id}")
async def get_training_results(session_id: str):
    """Get comprehensive training results"""
    if session_id not in training_results:
        raise HTTPException(status_code=404, detail="Results not found or training not completed")
    
    return training_results[session_id]

@router.websocket("/ws/training/{session_id}")
async def training_websocket(websocket: WebSocket, session_id: str):
    """Real-time training progress via WebSocket"""
    await websocket.accept()
    
    try:
        while True:
            progress = training_progress.get(session_id, {"status": "not_found"})
            await websocket.send_text(json.dumps(progress, default=str))
            
            if progress.get("status") in ["completed", "failed", "not_found"]:
                break
                
            await asyncio.sleep(1)
            
    except Exception as e:
        print(f"WebSocket error: {e}")
    finally:
        try:
            await websocket.close()
        except:
            pass

@router.delete("/cleanup/{session_id}")
async def cleanup_session(session_id: str):
    """Clean up training session data"""
    deleted_items = []
    
    if session_id in training_progress:
        del training_progress[session_id]
        deleted_items.append("progress")
        
    if session_id in training_results:
        del training_results[session_id]
        deleted_items.append("results")
    
    return {
        "status": "success",
        "message": f"Cleaned up {len(deleted_items)} items for session {session_id}",
        "deleted": deleted_items
    }
