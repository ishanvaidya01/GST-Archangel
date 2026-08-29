import time
from typing import Optional
from fastapi import HTTPException, Request
from redis.asyncio import Redis
from app.core.config import settings

redis_client: Optional[Redis] = None

async def init_redis():
    global redis_client
    redis_client = Redis.from_url(settings.REDIS_URL, decode_responses=True)

async def close_redis():
    global redis_client
    if redis_client:
        await redis_client.close()

async def check_rate_limit(key: str, max_requests: int, window_seconds: int = 60):
    if not redis_client:
        return
    
    current = int(time.time())
    window_start = current - window_seconds
    
    pipeline = redis_client.pipeline()
    pipeline.zremrangebyscore(key, 0, window_start)
    pipeline.zadd(key, {str(current): current})
    pipeline.zcard(key)
    pipeline.expire(key, window_seconds)
    
    results = await pipeline.execute()
    request_count = results[2]
    
    if request_count > max_requests:
        raise HTTPException(status_code=429, detail="Too Many Requests")

async def auth_rate_limit(request: Request):
    ip = request.client.host if request.client else "unknown"
    await check_rate_limit(f"rate_limit:login:{ip}", max_requests=5, window_seconds=60)

async def upload_rate_limit(request: Request):
    ip = request.client.host if request.client else "unknown"
    await check_rate_limit(f"rate_limit:upload:{ip}", max_requests=10, window_seconds=60)

async def evidence_rate_limit(request: Request):
    ip = request.client.host if request.client else "unknown"
    await check_rate_limit(f"rate_limit:evidence:{ip}", max_requests=10, window_seconds=60)
