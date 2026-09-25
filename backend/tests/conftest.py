"""Pytest fixtures and test setup."""

import pytest
from fastapi.testclient import TestClient
from sqlalchemy.orm import Session
from app.main import app
from app.core.database import SessionLocal
from app.models.user import User


@pytest.fixture(scope="session")
def client() -> TestClient:
    return TestClient(app)


@pytest.fixture(scope="function")
def db() -> Session:
    session = SessionLocal()
    try:
        yield session
    finally:
        session.close()


@pytest.fixture(scope="session")
def admin_credentials() -> dict:
    return {
        "email": "admin@nexorastaffing.com",
        "password": "NexoraAdmin@2026!"
    }


@pytest.fixture(scope="session")
def staff_credentials() -> dict:
    return {
        "email": "staff@nexorastaffing.com",
        "password": "NexoraStaff@2026!"
    }


@pytest.fixture(scope="session")
def admin_token(client: TestClient, admin_credentials: dict) -> str:
    res = client.post("/api/v1/auth/login", json=admin_credentials)
    assert res.status_code == 200
    return res.json()["access_token"]


@pytest.fixture(scope="session")
def staff_token(client: TestClient, staff_credentials: dict) -> str:
    res = client.post("/api/v1/auth/login", json=staff_credentials)
    assert res.status_code == 200
    return res.json()["access_token"]

