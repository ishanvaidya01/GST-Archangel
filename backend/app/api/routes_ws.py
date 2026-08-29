import asyncio
from fastapi import APIRouter, WebSocket, WebSocketDisconnect
from app.core.events import get_event_bus

router = APIRouter(tags=["websocket"])

@router.websocket("/ws/audit/{run_id}")
async def websocket_endpoint(websocket: WebSocket, run_id: str):
    await websocket.accept()
    bus = get_event_bus()
    queue = await bus.subscribe(run_id)
    
    async def send_heartbeat():
        while True:
            await asyncio.sleep(30)
            try:
                await websocket.send_json({"type": "heartbeat"})
            except Exception:
                break
                
    heartbeat_task = asyncio.create_task(send_heartbeat())
    
    try:
        while True:
            event_json = await queue.get()
            await websocket.send_text(event_json)
    except WebSocketDisconnect:
        pass
    except Exception as e:
        print(f"WebSocket error: {e}")
    finally:
        heartbeat_task.cancel()
        await bus.unsubscribe(run_id, queue)
