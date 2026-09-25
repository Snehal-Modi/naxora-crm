"""Authentication system tests."""

from fastapi.testclient import TestClient
from app.core.security import hash_password, verify_password


def test_password_hashing():
    raw = "MySecurePassword123!"
    hashed = hash_password(raw)
    assert hashed != raw
    assert hashed.startswith("$argon2id$")
    assert verify_password(raw, hashed) is True
    assert verify_password("WrongPassword!", hashed) is False


def test_login_success(client: TestClient, admin_credentials: dict):
    response = client.post("/api/v1/auth/login", json=admin_credentials)
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert "refresh_token" in data
    assert data["token_type"] == "bearer"
    assert data["user"]["email"] == admin_credentials["email"]
    assert "super_admin" in data["user"]["roles"]


def test_login_invalid_password(client: TestClient):
    response = client.post(
        "/api/v1/auth/login",
        json={"email": "admin@nexorastaffing.com", "password": "WrongPassword123!"}
    )
    assert response.status_code == 401
    assert "Invalid email or password" in response.json()["detail"]


def test_login_invalid_email(client: TestClient):
    response = client.post(
        "/api/v1/auth/login",
        json={"email": "nonexistent@nexorastaffing.com", "password": "SomePassword123!"}
    )
    assert response.status_code == 401
    assert "Invalid email or password" in response.json()["detail"]


def test_get_current_user_me(client: TestClient, admin_token: str):
    response = client.get(
        "/api/v1/auth/me",
        headers={"Authorization": f"Bearer {admin_token}"}
    )
    assert response.status_code == 200
    data = response.json()
    assert data["email"] == "admin@nexorastaffing.com"
    assert data["is_superuser"] is True
    assert "super_admin" in data["roles"]


def test_token_refresh_and_rotation(client: TestClient, staff_credentials: dict):
    # 1. Login to get initial tokens
    login_res = client.post("/api/v1/auth/login", json=staff_credentials)
    assert login_res.status_code == 200
    orig_refresh = login_res.json()["refresh_token"]

    # 2. Refresh token
    refresh_res = client.post(
        "/api/v1/auth/refresh",
        json={"refresh_token": orig_refresh}
    )
    assert refresh_res.status_code == 200
    new_data = refresh_res.json()
    assert "access_token" in new_data
    assert "refresh_token" in new_data
    rotated_refresh = new_data["refresh_token"]
    assert rotated_refresh != orig_refresh

    # 3. Old refresh token must be invalidated (rotation security)
    replay_res = client.post(
        "/api/v1/auth/refresh",
        json={"refresh_token": orig_refresh}
    )
    assert replay_res.status_code == 401


def test_logout(client: TestClient, staff_credentials: dict):
    login_res = client.post("/api/v1/auth/login", json=staff_credentials)
    refresh_token = login_res.json()["refresh_token"]

    logout_res = client.post(
        "/api/v1/auth/logout",
        json={"refresh_token": refresh_token}
    )
    assert logout_res.status_code == 200
    assert logout_res.json()["success"] is True

    # After logout, token must be revoked
    refresh_res = client.post(
        "/api/v1/auth/refresh",
        json={"refresh_token": refresh_token}
    )
    assert refresh_res.status_code == 401

