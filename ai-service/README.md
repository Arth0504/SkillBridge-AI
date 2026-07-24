# SkillBridge AI Microservice (FastAPI + Gemini AI)

Independent, scalable AI microservice built with Python and FastAPI for SkillBridge AI. Powers ATS Resume Analysis, Text Extraction, and Job Match Scoring.

## Architecture
- **FastAPI Core**: Asynchronous, high-performance web service
- **Gemini API**: Generative AI processing using Google Gemini models
- **Parsing Engine**: `pdfplumber`, `PyPDF2`, and `python-docx` for document text extraction

## Running Locally

```bash
cd ai-service
python -m venv venv
# On Windows
venv\Scripts\activate
# On Unix/macOS
source venv/bin/activate

pip install -r requirements.txt
uvicorn app:app --port 8000 --reload
```

## Environment Variables
- `AI_SERVICE_PORT`: Port to run the service (default: 8000)
- `GEMINI_API_KEY`: Google Gemini API Key
- `AI_SHARED_SECRET`: Secret key for authentication with Node.js backend

## Endpoints
- `GET /` -> `{"service": "SkillBridge AI Service", "status": "running"}`
- `GET /health` -> `{"status": "healthy"}`
- `POST /api/v1/ai/extract-text` -> Extracts structured sections from PDF/DOCX
- `POST /api/v1/ai/analyze-resume` -> Analyzes resume text against ATS rules
- `POST /api/v1/ai/match-job` -> Compares resume against job description
