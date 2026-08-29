import uuid
import structlog
from contextlib import asynccontextmanager
from fastapi import FastAPI, Request, Response
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.gzip import GZipMiddleware

from app.core.config import settings

# Configure structlog
structlog.configure(
    processors=[
        structlog.contextvars.merge_contextvars,
        structlog.processors.TimeStamper(fmt="iso"),
        structlog.processors.JSONRenderer(),
    ],
    wrapper_class=structlog.make_filtering_bound_logger(20), # INFO
    context_class=dict,
    logger_factory=structlog.PrintLoggerFactory(),
)

logger = structlog.get_logger()

# Placeholder for DB and Redis initialization
state = {"db": False, "redis": False}

from app.core.rate_limit import init_redis, close_redis

# Import routers
from app.api.routes_auth import router as auth_router
from app.api.routes_ws import router as ws_router
from app.api.routes_upload import router as upload_router
from app.api.routes_cases import router as cases_router
from app.api.routes_config import router as config_router
from app.api.routes_observability import router as observability_router
from app.api.routes_ml import router as ml_router

@asynccontextmanager
async def lifespan(app: FastAPI):
    await init_redis()
    state["db"] = True
    state["redis"] = True
    yield
    await close_redis()
    state["db"] = False
    state["redis"] = False

app = FastAPI(lifespan=lifespan)

# Register routers
app.include_router(auth_router)
app.include_router(ws_router)
app.include_router(upload_router)
app.include_router(cases_router)
app.include_router(config_router)
app.include_router(observability_router)
app.include_router(ml_router)

# CORS restricted to http://localhost:3000 only
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.add_middleware(GZipMiddleware, minimum_size=1000)

@app.middleware("http")
async def logging_and_security_middleware(request: Request, call_next):
    request_id = str(uuid.uuid4())
    structlog.contextvars.bind_contextvars(request_id=request_id)
    
    logger.info("request_started", method=request.method, url=str(request.url))
    
    response = await call_next(request)
    
    # Security headers
    response.headers["X-Content-Type-Options"] = "nosniff"
    response.headers["X-Frame-Options"] = "DENY"
    if settings.ENV == "production":
        response.headers["Strict-Transport-Security"] = "max-age=31536000; includeSubDomains"
        
    logger.info("request_finished", status_code=response.status_code)
    
    structlog.contextvars.clear_contextvars()
    
    return response

@app.get("/api/health")
async def health_check():
    return {"status": "ok", "db": state["db"], "redis": state["redis"]}
