from fastapi.testclient import TestClient
from app import app

client = TestClient(app)

def test_root_endpoint():
    response = client.get("/")
    assert response.status_code == 200
    assert response.json()["status"] == "running"

def test_health_endpoint():
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json()["status"] == "healthy"

def test_analyze_resume_endpoint():
    payload = {
        "resumeText": "Experienced Senior Software Engineer with 5 years experience in Node.js, React, MongoDB, and AWS cloud development."
    }
    response = client.post("/api/v1/ai/analyze-resume", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert "overallAtsScore" in data
    assert 0 <= data["overallAtsScore"] <= 100
    assert "top5Improvements" in data

def test_job_match_endpoint():
    payload = {
        "resumeText": "Node.js and MongoDB backend developer.",
        "jobDescription": "We are seeking a Backend Engineer with expertise in Node.js, MongoDB, and Docker."
    }
    response = client.post("/api/v1/ai/match-job", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert "matchScore" in data
    assert "recommendation" in data
