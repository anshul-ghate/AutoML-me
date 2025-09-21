from fastapi import APIRouter, UploadFile, File, Depends, HTTPException, status
from app.storage.local_storage import LocalStorage
from app.auth.jwt_auth import JWTBearer

router = APIRouter(prefix="/upload", tags=["upload"])
storage = LocalStorage(base_path="data")

@router.post("/structured", dependencies=[Depends(JWTBearer())])
async def upload_structured(file: UploadFile = File(...)):
    content = await file.read()
    path = storage.save_file(f"structured/{file.filename}", content)
    return {"path": path}

@router.post("/text", dependencies=[Depends(JWTBearer())])
async def upload_text(file: UploadFile = File(...)):
    content = await file.read()
    path = storage.save_file(f"text/{file.filename}", content)
    return {"path": path}

@router.post("/image", dependencies=[Depends(JWTBearer())])
async def upload_image(file: UploadFile = File(...)):
    content = await file.read()
    path = storage.save_file(f"image/{file.filename}", content)
    return {"path": path}

@router.post("/audio", dependencies=[Depends(JWTBearer())])
async def upload_audio(file: UploadFile = File(...)):
    content = await file.read()
    path = storage.save_file(f"audio/{file.filename}", content)
    return {"path": path}
