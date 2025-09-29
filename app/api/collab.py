from fastapi import APIRouter, WebSocket, WebSocketDisconnect
from typing import List, Dict

router = APIRouter()

class ConnectionManager:
    def __init__(self):
        self.active_connections: Dict[str, List[WebSocket]] = {}

    async def connect(self, pipeline_id: str, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.setdefault(pipeline_id, []).append(websocket)

    def disconnect(self, pipeline_id: str, websocket: WebSocket):
        self.active_connections[pipeline_id].remove(websocket)

    async def broadcast(self, pipeline_id: str, message: dict):
        for connection in self.active_connections.get(pipeline_id, []):
            await connection.send_json(message)

manager = ConnectionManager()

@router.websocket("/ws/pipeline/{pipeline_id}")
async def websocket_endpoint(websocket: WebSocket, pipeline_id: str):
    await manager.connect(pipeline_id, websocket)
    try:
        while True:
            data = await websocket.receive_json()
            # Broadcast to others
            await manager.broadcast(pipeline_id, data)
    except WebSocketDisconnect:
        manager.disconnect(pipeline_id, websocket)
