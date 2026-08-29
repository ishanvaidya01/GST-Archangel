import pytest
import pytest_asyncio
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, async_sessionmaker
from app.db.models import Base
from app.core.config import settings
from app.main import app
from httpx import AsyncClient, ASGITransport

TEST_DB_URL = settings.DATABASE_URL + "_test" if not settings.DATABASE_URL.endswith("_test") else settings.DATABASE_URL

@pytest_asyncio.fixture(scope="session")
async def engine():
    engine = create_async_engine(TEST_DB_URL, echo=False)
    # This requires pgvector extension to exist in the test DB manually,
    # or the tests will fail. In CI we assume it exists.
    # We will just yield the engine. Real tests would setup DB properly.
    yield engine
    await engine.dispose()

@pytest_asyncio.fixture
async def db_session(engine):
    connection = await engine.connect()
    transaction = await connection.begin()
    
    async_session = async_sessionmaker(bind=connection, class_=AsyncSession, expire_on_commit=False)
    
    async with async_session() as session:
        yield session
        
    await transaction.rollback()
    await connection.close()

@pytest_asyncio.fixture
async def client(db_session):
    from app.db.session import get_db
    
    async def override_get_db():
        yield db_session
        
    app.dependency_overrides[get_db] = override_get_db
    
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as c:
        yield c
        
    app.dependency_overrides.clear()
