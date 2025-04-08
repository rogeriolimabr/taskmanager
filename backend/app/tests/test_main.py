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

# Global variable to store data
task_id = None
token = None


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
    global token
    response = client.post(
        "/api/login",
        json={"email": "test@example.com", "password": "testpassword"}
    )
    assert response.status_code == 200
    assert "access_token" in response.json()
    assert response.json()["token_type"] == "Bearer"

    # Store the task ID
    token = response.json()["access_token"]

def test_create_task():
    global token
    global task_id

    response = client.post(
        "/api/tasks",
        json={"title": "Test Task", "description": "Test Description"},
        headers={"Authorization": f"Bearer {token}"},
    )
    assert response.status_code == 201
    assert response.json()["title"] == "Test Task"
    assert response.json()["description"] == "Test Description"
    task_id = response.json()["id"]

def test_read_tasks():
    global token

    response = client.get(
        "/api/tasks",
        headers={"Authorization": f"Bearer {token}"},
    )
    assert response.status_code == 200
    assert len(response.json()) > 0

def test_read_task():
    global token
    global task_id
    response = client.get(
        f"/api/tasks/{task_id}",
        headers={"Authorization": f"Bearer {token}"},
    )

    assert response.status_code == 200
    assert response.json()["id"] == task_id

def test_update_task():
    global id
    global task_id

    response = client.put(
        f"/api/tasks/{task_id}",
        json={"status": "completed"},
        headers={"Authorization": f"Bearer {token}"},
    )

    print(response.json())
    assert response.status_code == 200
    assert response.json()["status"] == "completed"
    assert response.json()["completed_at"] is not None
    assert response.json()["id"] == task_id
