def assert_not_redirect(resp):
    if resp.status_code == 301:
        raise AssertionError(f"Received 301 redirect to {getattr(resp, 'url', None)}. Check SECURE_SSL_REDIRECT, APPEND_SLASH, and DEBUG settings for test environment.")

import os
import logging
import pytest
from django.conf import settings
from django.contrib.auth import get_user_model
from django.urls import reverse
from rest_framework.test import APIClient
from rest_framework_simplejwt.tokens import RefreshToken

# --- Logging setup ---
LOG_PATH = os.path.join(settings.BASE_DIR, 'logs', 'auth_test.log')
os.makedirs(os.path.dirname(LOG_PATH), exist_ok=True)
logger = logging.getLogger("auth_test")
logger.setLevel(logging.DEBUG)
fh = logging.FileHandler(LOG_PATH, mode='w')
fh.setFormatter(logging.Formatter('%(asctime)s %(levelname)s %(message)s'))
logger.addHandler(fh)

User = get_user_model()

# --- Fixtures ---

@pytest.fixture
def user_data():
    return {
        "username": "testuser",
        "password": "StrongPass123!",
        "email": "testuser@example.com",
        "role": "staff",
        "department": "QA",
        "phone": "+911234567890"
    }

@pytest.fixture
def user(db, user_data):
    user = User.objects.create_user(**user_data)
    user.set_password(user_data["password"])
    user.save()
    return user

@pytest.fixture
def admin_user(db):
    user = User.objects.create_superuser(
        username="admin", password="AdminPass123!", email="admin@example.com"
    )
    return user

@pytest.fixture
def api_client():
    return APIClient()

@pytest.fixture
def auth_tokens(user, api_client):
    url = reverse("auth-login")
    resp = api_client.post(url, {"username": user.username, "password": "StrongPass123!"}, format="json")
    assert resp.status_code == 200
    return resp.data

# --- 1. User Model Validation ---

def test_user_model_fields(user):
    logger.info("Testing User model fields and methods")
    assert user.username == "testuser"
    assert user.email == "testuser@example.com"
    assert user.role == "staff"
    assert user.department == "QA"
    assert user.phone == "+911234567890"
    logger.info("User model validation passed")

# --- 2. JWT Login/Logout/Refresh Endpoints ---

def test_jwt_login_success(api_client, user):
    url = reverse("auth-login")
    print(f"[DEBUG] Resolved auth-login URL: {url}")
    from django.conf import settings
    print(f"[DEBUG] SECURE_SSL_REDIRECT: {getattr(settings, 'SECURE_SSL_REDIRECT', None)}")
    resp = api_client.post(url, {"username": user.username, "password": "StrongPass123!"}, format="json")
    logger.info(f"Login response: {resp.status_code} {getattr(resp, 'data', None)}")
    assert_not_redirect(resp)
    assert resp.status_code == 200
    assert "access" in resp.data and "refresh" in resp.data
    assert resp.data["user"]["username"] == user.username

def test_jwt_login_failure(api_client):
    url = reverse("auth-login")
    print(f"[DEBUG] Resolved auth-login URL: {url}")
    resp = api_client.post(url, {"username": "nouser", "password": "badpass"}, format="json")
    logger.info(f"Login failure response: {resp.status_code} {getattr(resp, 'data', None)}")
    assert_not_redirect(resp)
    assert resp.status_code == 400
    assert "error" in resp.data

def test_jwt_logout(api_client, auth_tokens):
    url = reverse("auth-logout")
    print(f"[DEBUG] Resolved auth-logout URL: {url}")
    api_client.credentials(HTTP_AUTHORIZATION=f"Bearer {auth_tokens['access']}")
    resp = api_client.post(url, {"refresh": auth_tokens["refresh"]}, format="json")
    logger.info(f"Logout response: {resp.status_code} {getattr(resp, 'data', None)}")
    assert_not_redirect(resp)
    assert resp.status_code == 200
    assert "detail" in resp.data

def test_jwt_refresh_success(api_client, auth_tokens):
    url = reverse("auth-refresh")
    print(f"[DEBUG] Resolved auth-refresh URL: {url}")
    resp = api_client.post(url, {"refresh": auth_tokens["refresh"]}, format="json")
    logger.info(f"Refresh response: {resp.status_code} {getattr(resp, 'data', None)}")
    assert_not_redirect(resp)
    assert resp.status_code == 200
    assert "access" in resp.data

def test_jwt_refresh_failure(api_client):
    url = reverse("auth-refresh")
    print(f"[DEBUG] Resolved auth-refresh URL: {url}")
    resp = api_client.post(url, {"refresh": "invalidtoken"}, format="json")
    logger.info(f"Refresh failure response: {resp.status_code} {getattr(resp, 'data', None)}")
    assert_not_redirect(resp)
    assert resp.status_code == 401
    assert "error" in resp.data

# --- 3. Password Validation Rules ---

import pytest

@pytest.mark.django_db
@pytest.mark.parametrize("password,valid", [
    ("short", False),
    ("allnumeric123456", False),
    ("password", False),
    ("StrongPass123!", True),
    ("AnotherGood1!", True),
])
def test_password_validation(password, valid, user_data):
    user = User(username="pwtest", email="pwtest@example.com")
    try:
        user.set_password(password)
        user.full_clean()
        if not valid:
            logger.error(f"Password '{password}' should be invalid but passed validation")
            assert False
    except Exception as e:
        if valid:
            logger.error(f"Password '{password}' should be valid but failed: {e}")
            assert False
        logger.info(f"Password '{password}' correctly failed validation: {e}")

# --- 4. CORS Functionality ---

def test_cors_headers(api_client, settings):
    url = reverse("auth-login")
    print(f"[DEBUG] Resolved auth-login URL: {url}")
    origin = settings.CORS_ALLOWED_ORIGINS[0] if settings.CORS_ALLOWED_ORIGINS else "http://localhost:3000"
    resp = api_client.options(url, HTTP_ORIGIN=origin, HTTP_ACCESS_CONTROL_REQUEST_METHOD="POST")
    logger.info(f"CORS preflight response: {resp.status_code} {dict(resp.items())}")
    assert_not_redirect(resp)
    assert resp.status_code in (200, 204)
    assert "access-control-allow-origin" in dict(resp.items())
    assert resp["access-control-allow-origin"] == origin

# --- 5. Error Logging for Authentication Failures ---

def test_login_error_logging(api_client, caplog):
    url = reverse("auth-login")
    with caplog.at_level(logging.WARNING):
        resp = api_client.post(url, {"username": "nouser", "password": "badpass"}, format="json")
        assert "Login failed" in caplog.text
        logger.info(f"Captured log: {caplog.text}")

# --- 6. Fixtures for User Scenarios ---

@pytest.fixture
def manager_user(db):
    user = User.objects.create_user(
        username="manager", password="ManagerPass123!", role="manager", email="manager@example.com"
    )
    return user

@pytest.fixture
def inactive_user(db):
    user = User.objects.create_user(
        username="inactive", password="InactivePass123!", email="inactive@example.com", is_active=False
    )
    return user

def test_inactive_user_login(api_client, inactive_user):
    url = reverse("auth-login")
    print(f"[DEBUG] Resolved auth-login URL: {url}")
    resp = api_client.post(url, {"username": "inactive", "password": "InactivePass123!"}, format="json")
    logger.info(f"Inactive user login response: {resp.status_code} {getattr(resp, 'data', None)}")
    assert_not_redirect(resp)
    assert resp.status_code == 400
    assert "error" in resp.data

def test_manager_role_login(api_client, manager_user):
    url = reverse("auth-login")
    print(f"[DEBUG] Resolved auth-login URL: {url}")
    resp = api_client.post(url, {"username": "manager", "password": "ManagerPass123!"}, format="json")
    logger.info(f"Manager login response: {resp.status_code} {getattr(resp, 'data', None)}")
    assert_not_redirect(resp)
    assert resp.status_code == 200
    assert resp.data["user"]["role"] == "manager"

# --- Pytest hook to log all failures ---

def pytest_runtest_makereport(item, call):
    if call.excinfo is not None:
        logger.error(f"Test {item.name} failed: {call.excinfo.value}")
