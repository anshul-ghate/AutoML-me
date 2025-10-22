# ai_assistant.py
from fastapi import APIRouter, UploadFile, File, HTTPException
from app.services.ai_supervisor import get_ai_supervisor
import pandas as pd
import io
from starlette.responses import JSONResponse

router = APIRouter()

@router.post("/ai/analyze-upload")
async def ai_analyze_upload(file: UploadFile = File(...)):
    if not file.filename.endswith('.csv'):
        raise HTTPException(status_code=400, detail="Only CSV files supported")
    content = await file.read()
    df = pd.read_csv(io.BytesIO(content))
    ai_supervisor = get_ai_supervisor()
    result = await ai_supervisor.analyze_data_upload(df, file.filename)
    return JSONResponse(content=result)