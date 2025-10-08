from fastapi import APIRouter, UploadFile, File, HTTPException, Depends, BackgroundTasks, Form
from fastapi.responses import JSONResponse, FileResponse
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from pydantic import BaseModel, validator
import pandas as pd
import numpy as np
import io, os, json, time, hashlib
from datetime import datetime, timedelta
from typing import Optional, List, Dict, Any
import joblib
import redis
import jwt
from sklearn.ensemble import RandomForestClassifier, RandomForestRegressor
from sklearn.model_selection import train_test_split, cross_val_score
from sklearn.preprocessing import StandardScaler, LabelEncoder
from sklearn.metrics import (
    accuracy_score, precision_score, recall_score, f1_score,
    roc_auc_score, confusion_matrix, roc_curve, precision_recall_curve,
    classification_report
)
import matplotlib
matplotlib.use('Agg')  # Non-GUI backend
import matplotlib.pyplot as plt
import seaborn as sns
from io import BytesIO
import base64
from reportlab.lib.pagesizes import letter
from reportlab.pdfgen import canvas
from reportlab.lib.utils import ImageReader

# Initialize Redis for caching
try:
    redis_client = redis.Redis(host='localhost', port=6379, decode_responses=True)
except:
    redis_client = None

router = APIRouter(prefix="/api/enterprise-training", tags=["enterprise-training"])
security = HTTPBearer()

# Configuration
JWT_SECRET = os.getenv("JWT_SECRET", "your-secret-key")
RATE_LIMIT_REQUESTS = 100  # Per hour per user
CACHE_TTL = 3600  # 1 hour

# Models
class PredictRequest(BaseModel):
    session_id: str
    features: Dict[str, float]
    
    @validator('features')
    def validate_features(cls, v):
        if not v or len(v) == 0:
            raise ValueError('Features cannot be empty')
        for key, value in v.items():
            if not isinstance(value, (int, float)):
                raise ValueError(f'Feature {key} must be numeric')
        return v

class BatchPredictRequest(BaseModel):
    session_id: str
    file: UploadFile = File(...)

class AuditLog(BaseModel):
    user_id: str
    session_id: str
    action: str
    timestamp: datetime
    input_data: Optional[Dict] = None
    result: Optional[Dict] = None

# Authentication & Rate Limiting
def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    try:
        token = credentials.credentials
        payload = jwt.decode(token, JWT_SECRET, algorithms=["HS256"])
        user_id = payload.get("user_id")
        if not user_id:
            raise HTTPException(401, "Invalid token")
        
        # Rate limiting
        if redis_client:
            key = f"rate_limit:{user_id}"
            current = redis_client.get(key)
            if current and int(current) >= RATE_LIMIT_REQUESTS:
                raise HTTPException(429, "Rate limit exceeded")
            
            # Increment counter
            pipe = redis_client.pipeline()
            pipe.incr(key)
            pipe.expire(key, 3600)  # 1 hour
            pipe.execute()
        
        return user_id
    except jwt.InvalidTokenError:
        raise HTTPException(401, "Invalid token")

# Audit logging
def log_audit(user_id: str, session_id: str, action: str, input_data: Dict = None, result: Dict = None):
    if redis_client:
        audit_entry = {
            "user_id": user_id,
            "session_id": session_id,
            "action": action,
            "timestamp": datetime.utcnow().isoformat(),
            "input_data": input_data,
            "result": result
        }
        key = f"audit:{user_id}:{datetime.utcnow().date()}"
        redis_client.lpush(key, json.dumps(audit_entry))
        redis_client.expire(key, 86400 * 30)  # Keep for 30 days

# Cache helpers
def get_cached_metrics(session_id: str) -> Optional[Dict]:
    if redis_client:
        cached = redis_client.get(f"metrics:{session_id}")
        return json.loads(cached) if cached else None
    return None

def cache_metrics(session_id: str, metrics: Dict):
    if redis_client:
        redis_client.setex(f"metrics:{session_id}", CACHE_TTL, json.dumps(metrics))

# Enhanced visualization generation
def generate_roc_curve_plot(fpr: List[float], tpr: List[float], auc_score: float) -> str:
    """Generate ROC curve as base64 encoded image"""
    plt.figure(figsize=(8, 6))
    plt.plot(fpr, tpr, color='darkorange', lw=2, label=f'ROC curve (AUC = {auc_score:.3f})')
    plt.plot([0, 1], [0, 1], color='navy', lw=2, linestyle='--', label='Random')
    plt.xlim([0.0, 1.0])
    plt.ylim([0.0, 1.05])
    plt.xlabel('False Positive Rate')
    plt.ylabel('True Positive Rate')
    plt.title('Receiver Operating Characteristic (ROC) Curve')
    plt.legend(loc="lower right")
    plt.grid(True, alpha=0.3)
    
    buffer = BytesIO()
    plt.savefig(buffer, format='png', dpi=150, bbox_inches='tight')
    buffer.seek(0)
    plot_data = base64.b64encode(buffer.getvalue()).decode()
    plt.close()
    return plot_data

def generate_confusion_matrix_heatmap(cm: np.ndarray, class_labels: List[str]) -> str:
    """Generate confusion matrix heatmap as base64 encoded image"""
    plt.figure(figsize=(10, 8))
    
    # Create heatmap with custom colormap
    sns.heatmap(cm, annot=True, fmt='d', cmap='Blues', 
                xticklabels=class_labels, yticklabels=class_labels,
                cbar_kws={'label': 'Count'})
    
    plt.title('Confusion Matrix Heatmap', fontsize=16, fontweight='bold')
    plt.ylabel('True Label', fontsize=12)
    plt.xlabel('Predicted Label', fontsize=12)
    plt.tight_layout()
    
    buffer = BytesIO()
    plt.savefig(buffer, format='png', dpi=150, bbox_inches='tight')
    buffer.seek(0)
    plot_data = base64.b64encode(buffer.getvalue()).decode()
    plt.close()
    return plot_data

def generate_precision_recall_curve(precision: List[float], recall: List[float]) -> str:
    """Generate precision-recall curve as base64 encoded image"""
    plt.figure(figsize=(8, 6))
    plt.plot(recall, precision, color='blue', lw=2)
    plt.xlabel('Recall')
    plt.ylabel('Precision')
    plt.title('Precision-Recall Curve')
    plt.grid(True, alpha=0.3)
    plt.xlim([0.0, 1.0])
    plt.ylim([0.0, 1.05])
    
    buffer = BytesIO()
    plt.savefig(buffer, format='png', dpi=150, bbox_inches='tight')
    buffer.seek(0)
    plot_data = base64.b64encode(buffer.getvalue()).decode()
    plt.close()
    return plot_data

# Enhanced evaluation endpoint
@router.get("/evaluate/{session_id}")
async def get_enhanced_evaluation_metrics(
    session_id: str,
    user_id: str = Depends(get_current_user)
):
    """Get comprehensive evaluation metrics with interactive visualizations"""
    
    # Check cache first
    cached_metrics = get_cached_metrics(session_id)
    if cached_metrics:
        log_audit(user_id, session_id, "evaluation_cached", result={"cached": True})
        return JSONResponse(content=cached_metrics)
    
    # Load metrics from file
    metrics_path = f"models/{session_id}_metrics.json"
    if not os.path.exists(metrics_path):
        raise HTTPException(404, "Evaluation metrics not found")
    
    with open(metrics_path, 'r') as f:
        base_metrics = json.load(f)
    
    # Enhanced metrics with visualizations
    enhanced_metrics = {**base_metrics}
    
    # Generate interactive plots
    if 'roc_curve' in base_metrics:
        fpr = base_metrics['roc_curve']['fpr']
        tpr = base_metrics['roc_curve']['tpr']
        auc_score = base_metrics['roc_auc']
        enhanced_metrics['roc_plot'] = generate_roc_curve_plot(fpr, tpr, auc_score)
    
    if 'confusion_matrix' in base_metrics and 'class_labels' in base_metrics:
        cm = np.array(base_metrics['confusion_matrix'])
        labels = base_metrics['class_labels']
        enhanced_metrics['confusion_heatmap'] = generate_confusion_matrix_heatmap(cm, labels)
    
    if 'pr_curve' in base_metrics:
        precision = base_metrics['pr_curve']['precision']
        recall = base_metrics['pr_curve']['recall']
        enhanced_metrics['pr_plot'] = generate_precision_recall_curve(precision, recall)
    
    # Add per-class detailed metrics
    if 'confusion_matrix' in base_metrics and 'class_labels' in base_metrics:
        cm = np.array(base_metrics['confusion_matrix'])
        labels = base_metrics['class_labels']
        
        per_class_metrics = []
        for i, label in enumerate(labels):
            tp = cm[i, i]
            fp = sum(cm[:, i]) - tp
            fn = sum(cm[i, :]) - tp
            tn = cm.sum() - tp - fp - fn
            
            precision = tp / (tp + fp) if (tp + fp) > 0 else 0
            recall = tp / (tp + fn) if (tp + fn) > 0 else 0
            f1 = 2 * precision * recall / (precision + recall) if (precision + recall) > 0 else 0
            
            per_class_metrics.append({
                "class": label,
                "precision": precision,
                "recall": recall,
                "f1_score": f1,
                "support": sum(cm[i, :])
            })
        
        enhanced_metrics['per_class_metrics'] = per_class_metrics
    
    # Cache the enhanced metrics
    cache_metrics(session_id, enhanced_metrics)
    
    # Log audit
    log_audit(user_id, session_id, "evaluation_computed", 
              result={"metrics_count": len(enhanced_metrics)})
    
    return JSONResponse(content=enhanced_metrics)

# PDF Report Generation
@router.get("/export/report/{session_id}")
async def generate_evaluation_report(
    session_id: str,
    format: str = "pdf",
    user_id: str = Depends(get_current_user)
):
    """Generate comprehensive evaluation report in PDF or HTML format"""
    
    # Load enhanced metrics
    enhanced_metrics = await get_enhanced_evaluation_metrics(session_id, user_id)
    metrics_data = enhanced_metrics.body.decode() if hasattr(enhanced_metrics, 'body') else enhanced_metrics
    
    if format.lower() == "pdf":
        # Generate PDF report
        buffer = BytesIO()
        p = canvas.Canvas(buffer, pagesize=letter)
        width, height = letter
        
        # Title
        p.setFont("Helvetica-Bold", 16)
        p.drawString(50, height - 50, f"Model Evaluation Report - Session: {session_id}")
        
        # Timestamp
        p.setFont("Helvetica", 10)
        p.drawString(50, height - 70, f"Generated: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
        
        y_position = height - 100
        
        # Add metrics
        if isinstance(metrics_data, dict):
            p.setFont("Helvetica-Bold", 12)
            p.drawString(50, y_position, "Performance Metrics:")
            y_position -= 30
            
            p.setFont("Helvetica", 10)
            for key, value in metrics_data.items():
                if key not in ['roc_plot', 'confusion_heatmap', 'pr_plot', 'roc_curve', 'pr_curve']:
                    if isinstance(value, (int, float)):
                        p.drawString(70, y_position, f"{key}: {value:.4f}")
                        y_position -= 20
        
        p.save()
        buffer.seek(0)
        
        # Save to file
        report_path = f"reports/evaluation_report_{session_id}.pdf"
        os.makedirs("reports", exist_ok=True)
        with open(report_path, 'wb') as f:
            f.write(buffer.getvalue())
        
        log_audit(user_id, session_id, "report_generated", 
                  input_data={"format": format})
        
        return FileResponse(report_path, filename=f"evaluation_report_{session_id}.pdf")
    
    else:
        raise HTTPException(400, "Only PDF format supported currently")

# Batch Prediction Endpoint
@router.post("/predict/batch")
async def batch_predict(
    session_id: str,
    file: UploadFile = File(...),
    user_id: str = Depends(get_current_user)
):
    """Perform batch predictions on CSV file"""
    
    if not file.filename.endswith('.csv'):
        raise HTTPException(400, "Only CSV files are supported")
    
    # Load model
    model_path = f"models/{session_id}_best_model.pkl"
    if not os.path.exists(model_path):
        raise HTTPException(404, "Model not found")
    
    try:
        # Load model and preprocessing objects
        model_data = joblib.load(model_path)
        model = model_data['model']
        scaler = model_data['scaler']
        label_encoders = model_data['label_encoders']
        target_encoder = model_data['target_encoder']
        feature_names = model_data['feature_names']
        is_classification = model_data['is_classification']
        
        # Read input CSV
        content = await file.read()
        df = pd.read_csv(io.StringIO(content.decode('utf-8')))
        
        # Validate required columns
        missing_cols = [col for col in feature_names if col not in df.columns]
        if missing_cols:
            raise HTTPException(400, f"Missing required columns: {missing_cols}")
        
        # Prepare data
        X = df[feature_names].copy()
        
        # Apply preprocessing
        for col in X.columns:
            if col in label_encoders:
                try:
                    X[col] = label_encoders[col].transform(X[col].astype(str))
                except:
                    # Handle unseen categories
                    X[col] = 0
        
        # Scale features
        X_scaled = scaler.transform(X)
        
        # Make predictions
        predictions = model.predict(X_scaled)
        
        # Prepare results
        results_df = df.copy()
        results_df['prediction'] = predictions
        
        # Add probabilities for classification
        if is_classification and hasattr(model, 'predict_proba'):
            probabilities = model.predict_proba(X_scaled)
            for i, prob in enumerate(probabilities.T):
                results_df[f'probability_class_{i}'] = prob
            
            # Decode predictions if target was encoded
            if target_encoder:
                results_df['predicted_class'] = target_encoder.inverse_transform(predictions.astype(int))
        
        # Save results to CSV
        results_path = f"predictions/batch_predictions_{session_id}_{int(time.time())}.csv"
        os.makedirs("predictions", exist_ok=True)
        results_df.to_csv(results_path, index=False)
        
        log_audit(user_id, session_id, "batch_prediction", 
                  input_data={"rows": len(df)}, 
                  result={"output_path": results_path})
        
        return FileResponse(results_path, filename=f"batch_predictions_{session_id}.csv")
        
    except Exception as e:
        log_audit(user_id, session_id, "batch_prediction_failed", 
                  input_data={"error": str(e)})
        raise HTTPException(400, f"Batch prediction failed: {str(e)}")

# Enhanced single prediction with validation
@router.post("/predict")
async def enhanced_predict(
    request: PredictRequest,
    user_id: str = Depends(get_current_user)
):
    """Enhanced single prediction with comprehensive validation and logging"""
    
    model_path = f"models/{request.session_id}_best_model.pkl"
    if not os.path.exists(model_path):
        raise HTTPException(404, "Model not found")
    
    try:
        # Load model data
        model_data = joblib.load(model_path)
        model = model_data['model']
        scaler = model_data['scaler']
        label_encoders = model_data['label_encoders']
        target_encoder = model_data['target_encoder']
        feature_names = model_data['feature_names']
        is_classification = model_data['is_classification']
        
        # Validate input schema
        missing_features = [f for f in feature_names if f not in request.features]
        if missing_features:
            raise HTTPException(400, f"Missing required features: {missing_features}")
        
        # Create DataFrame
        input_df = pd.DataFrame([request.features])
        input_df = input_df[feature_names]  # Ensure correct order
        
        # Apply preprocessing
        for col in input_df.columns:
            if col in label_encoders:
                try:
                    input_df[col] = label_encoders[col].transform(input_df[col].astype(str))
                except:
                    input_df[col] = 0
        
        # Scale features
        input_scaled = scaler.transform(input_df)
        
        # Make prediction
        predictions = model.predict(input_scaled)
        
        result = {
            "predictions": predictions.tolist(),
            "confidence": None,
            "feature_contributions": None
        }
        
        # Add classification-specific details
        if is_classification and hasattr(model, 'predict_proba'):
            probabilities = model.predict_proba(input_scaled)
            result["probabilities"] = probabilities.tolist()
            result["confidence"] = float(np.max(probabilities))
            
            if target_encoder:
                result["predicted_classes"] = target_encoder.inverse_transform(predictions.astype(int)).tolist()
        
        # Add feature contributions (simplified)
        if hasattr(model, 'feature_importances_'):
            feature_contributions = {}
            for i, feature in enumerate(feature_names):
                contribution = float(model.feature_importances_[i] * input_scaled[0, i])
                feature_contributions[feature] = contribution
            result["feature_contributions"] = feature_contributions
        
        log_audit(user_id, request.session_id, "single_prediction", 
                  input_data=request.features, 
                  result={"prediction": predictions.tolist()})
        
        return JSONResponse(content=result)
        
    except Exception as e:
        log_audit(user_id, request.session_id, "prediction_failed", 
                  input_data=request.features, 
                  result={"error": str(e)})
        raise HTTPException(400, f"Prediction failed: {str(e)}")

# Audit Dashboard
@router.get("/audit/{user_id}")
async def get_audit_history(
    audit_user_id: str,
    days: int = 7,
    current_user: str = Depends(get_current_user)
):
    """Get audit history for a user (admin only or self)"""
    
    if current_user != audit_user_id and current_user != "admin":
        raise HTTPException(403, "Access denied")
    
    if not redis_client:
        raise HTTPException(503, "Audit service unavailable")
    
    audit_entries = []
    
    # Get entries for the last N days
    for i in range(days):
        date = (datetime.utcnow() - timedelta(days=i)).date()
        key = f"audit:{audit_user_id}:{date}"
        entries = redis_client.lrange(key, 0, -1)
        
        for entry_str in entries:
            try:
                entry = json.loads(entry_str)
                audit_entries.append(entry)
            except:
                continue
    
    # Sort by timestamp
    audit_entries.sort(key=lambda x: x.get('timestamp', ''), reverse=True)
    
    return JSONResponse(content={
        "user_id": audit_user_id,
        "total_entries": len(audit_entries),
        "entries": audit_entries[:100]  # Limit to last 100
    })

# Schema Generation
@router.get("/schema/{session_id}")
async def get_prediction_schema(
    session_id: str,
    user_id: str = Depends(get_current_user)
):
    """Generate JSON schema for prediction input validation"""
    
    model_path = f"models/{session_id}_best_model.pkl"
    if not os.path.exists(model_path):
        raise HTTPException(404, "Model not found")
    
    try:
        model_data = joblib.load(model_path)
        feature_names = model_data['feature_names']
        
        # Generate JSON schema
        schema = {
            "type": "object",
            "properties": {
                "session_id": {
                    "type": "string",
                    "const": session_id
                },
                "features": {
                    "type": "object",
                    "properties": {},
                    "required": feature_names,
                    "additionalProperties": False
                }
            },
            "required": ["session_id", "features"]
        }
        
        # Add feature schemas
        for feature in feature_names:
            schema["properties"]["features"]["properties"][feature] = {
                "type": "number",
                "description": f"Numeric value for feature {feature}"
            }
        
        return JSONResponse(content=schema)
        
    except Exception as e:
        raise HTTPException(400, f"Schema generation failed: {str(e)}")
