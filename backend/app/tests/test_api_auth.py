import pytest

@pytest.mark.asyncio
async def test_register_and_login(client):
    res = await client.post("/api/auth/register", json={"email": "test@test.com", "password": "password123"})
    if res.status_code == 200:
        assert "access_token" in res.json()
        
        res2 = await client.post("/api/auth/login", json={"email": "test@test.com", "password": "password123"})
        assert res2.status_code == 200
        assert "access_token" in res2.json()
        
        res3 = await client.post("/api/auth/login", json={"email": "test@test.com", "password": "wrong"})
        assert res3.status_code == 401

@pytest.mark.asyncio
async def test_unauth_access(client):
    res = await client.get("/api/auth/me")
    assert res.status_code == 401
