import pytest
from fastapi.testclient import TestClient
from app.main import app
from app.database import Base, SessionLocal
from app.models import User
from dotenv import load_dotenv

# Load env variables
load_dotenv()

# Initialize the FastAPI test client
client = TestClient(app)

# Create the database and tables before running the tests
# and drop them after the tests are done
@pytest.fixture(scope="module", autouse=True)
def setup():
    Base.metadata.create_all(bind=SessionLocal().get_bind())

# Test cases
def test_healthcheck():
    response = client.get("/health")
    assert response.status_code == 200

def test_create_user():
    response = client.post(
        "/api/register",
        json={"name": "Usuário Teste", "email": "test@example.com", "password": "testpassword"},
    )
    assert response.status_code == 201
    assert response.json()["name"] == "Usuário Teste"
    assert response.json()["email"] == "test@example.com"

def test_login():
    response = client.post(
        "/api/login",
        json={"email": "test@example.com", "password": "testpassword"}
    )
    assert response.status_code == 200
    assert "access_token" in response.json()
    assert response.json()["token_type"] == "Bearer"

def test_create_task():
    login_response = client.post(
        "/api/login",
        json={"email": "test@example.com", "password": "testpassword"},
    )
    token = login_response.json()["access_token"]

    response = client.post(
        "/api/tasks",
        json={"title": "Test Task", "description": "Test Description"},
        headers={"Authorization": f"Bearer {token}"},
    )
    assert response.status_code == 201
    assert response.json()["title"] == "Test Task"
    assert response.json()["description"] == "Test Description"

def test_read_tasks():
    login_response = client.post(
        "/api/login",
        json={"email": "test@example.com", "password": "testpassword"},
    )
    token = login_response.json()["access_token"]

    response = client.get(
        "/api/tasks",
        headers={"Authorization": f"Bearer {token}"},
    )
    assert response.status_code == 200
    assert len(response.json()) > 0