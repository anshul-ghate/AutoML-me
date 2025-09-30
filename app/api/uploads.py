from fastapi import APIRouter, File, UploadFile, HTTPException, Depends
from fastapi.responses import JSONResponse
from ..auth.jwt_handler import get_current_user
import os
import shutil

router = APIRouter(prefix="/upload", tags=["uploads"])

UPLOAD_DIRECTORY = "uploads"
os.makedirs(UPLOAD_DIRECTORY, exist_ok=True)

@router.post("/structured")
async def upload_structured(
    file: UploadFile = File(...),
    current_user: str = Depends(get_current_user)
):
    if not file.filename.endswith(('.csv', '.json', '.xlsx')):
        raise HTTPException(status_code=400, detail="Only CSV, JSON, and Excel files are allowed")
    
    file_path = os.path.join(UPLOAD_DIRECTORY, f"structured_{file.filename}")
    
    try:
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
        
        return JSONResponse(
            content={"message": f"File {file.filename} uploaded successfully", "path": file_path}
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to upload file: {str(e)}")

@router.post("/text")
async def upload_text(
    file: UploadFile = File(...),
    current_user: str = Depends(get_current_user)
):
    if not file.filename.endswith(('.txt', '.doc', '.docx')):
        raise HTTPException(status_code=400, detail="Only text files are allowed")
    
    file_path = os.path.join(UPLOAD_DIRECTORY, f"text_{file.filename}")
    
    try:
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
        
        return JSONResponse(
            content={"message": f"File {file.filename} uploaded successfully", "path": file_path}
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to upload file: {str(e)}")

@router.post("/image")
async def upload_image(
    file: UploadFile = File(...),
    current_user: str = Depends(get_current_user)
):
    if not file.filename.lower().endswith(('.png', '.jpg', '.jpeg', '.gif')):
        raise HTTPException(status_code=400, detail="Only image files are allowed")
    
    file_path = os.path.join(UPLOAD_DIRECTORY, f"image_{file.filename}")
    
    try:
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
        
        return JSONResponse(
            content={"message": f"File {file.filename} uploaded successfully", "path": file_path}
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to upload file: {str(e)}")

@router.post("/audio")
async def upload_audio(
    file: UploadFile = File(...),
    current_user: str = Depends(get_current_user)
):
    if not file.filename.lower().endswith(('.mp3', '.wav', '.flac', '.m4a')):
        raise HTTPException(status_code=400, detail="Only audio files are allowed")
    
    file_path = os.path.join(UPLOAD_DIRECTORY, f"audio_{file.filename}")
    
    try:
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
        
        return JSONResponse(
            content={"message": f"File {file.filename} uploaded successfully", "path": file_path}
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to upload file: {str(e)}")
