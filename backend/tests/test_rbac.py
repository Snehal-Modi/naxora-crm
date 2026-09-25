"""RBAC and permission authorization tests."""

import uuid
from fastapi.testclient import TestClient


def test_unauthorized_access_fails(client: TestClient):
    # Attempting to access protected resource without bearer token
    res = client.get("/api/v1/users")
    assert res.status_code == 401


def test_admin_has_full_access(client: TestClient, admin_token: str):
    # Super admin can list users
    res = client.get(
        "/api/v1/users",
        headers={"Authorization": f"Bearer {admin_token}"}
    )
    assert res.status_code == 200
    users = res.json()
    assert len(users) >= 2


def test_staff_permission_restriction(client: TestClient, staff_token: str):
    # Staff doesn't have users:create permission (only users:view / operational perms)
    random_email = f"user_{uuid.uuid4().hex[:8]}@example.com"
    res = client.post(
        "/api/v1/users",
        headers={"Authorization": f"Bearer {staff_token}"},
        json={
            "email": random_email,
            "password": "Password123!",
            "first_name": "Test",
            "last_name": "User"
        }
    )
    # Must be 403 Forbidden
    assert res.status_code == 403
    assert "Missing required permission" in res.json()["detail"]


def test_admin_can_create_user(client: TestClient, admin_token: str):
    random_email = f"staff_{uuid.uuid4().hex[:8]}@nexorastaffing.com"
    res = client.post(
        "/api/v1/users",
        headers={"Authorization": f"Bearer {admin_token}"},
        json={
            "email": random_email,
            "password": "StaffPassword123!",
            "first_name": "New",
            "last_name": "Recruiter"
        }
    )
    assert res.status_code == 201
    data = res.json()
    assert data["email"] == random_email


def test_roles_and_permissions_endpoints(client: TestClient, admin_token: str):
    # List roles
    res_roles = client.get(
        "/api/v1/roles",
        headers={"Authorization": f"Bearer {admin_token}"}
    )
    assert res_roles.status_code == 200
    roles = res_roles.json()
    role_names = [r["name"] for r in roles]
    assert "super_admin" in role_names
    assert "staff" in role_names

    # List permissions
    res_perms = client.get(
        "/api/v1/permissions",
        headers={"Authorization": f"Bearer {admin_token}"}
    )
    assert res_perms.status_code == 200
    perms = res_perms.json()
    assert len(perms) >= 15

