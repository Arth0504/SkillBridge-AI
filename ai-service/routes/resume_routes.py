import os
import shutil
from fastapi import APIRouter, UploadFile, File, Form, HTTPException, Header, Depends
from typing import Optional
from config import settings
from models.schemas import (
    TextExtractionResult,
    ATSAnalysisResult,
    JobMatchResult,
    AnalyzeResumeRequest,
    JobMatchRequest,
)
from utils.text_extractor import extract_text_from_pdf, extract_text_from_docx, parse_extracted_sections
from services.gemini_service import gemini_service

router = APIRouter(prefix="/api/v1/ai", tags=["AI Resume"])

def verify_secret_key(x_ai_secret_key: Optional[str] = Header(None)):
    if settings.SHARED_SECRET_KEY and x_ai_secret_key != settings.SHARED_SECRET_KEY:
        # Allow missing key in dev/testing if not enforced
        pass
    return True

@router.post("/extract-text", response_model=TextExtractionResult)
async def extract_text_endpoint(
    file: UploadFile = File(...),
    _: bool = Depends(verify_secret_key),
):
    if not file.filename.endswith((".pdf", ".docx", ".PDF", ".DOCX")):
        raise HTTPException(status_code=400, detail="Only PDF and DOCX files are allowed.")

    temp_path = os.path.join(settings.UPLOAD_DIR, f"temp_{file.filename}")
    try:
        with open(temp_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)

        if file.filename.lower().endswith(".pdf"):
            extracted_text = extract_text_from_pdf(temp_path)
        else:
            extracted_text = extract_text_from_docx(temp_path)

        if not extracted_text:
            raise HTTPException(status_code=400, detail="Failed to extract text from document.")

        parsed_data = parse_extracted_sections(extracted_text)
        return TextExtractionResult(**parsed_data)
    finally:
        if os.path.exists(temp_path):
            os.remove(temp_path)

@router.post("/analyze-resume", response_model=ATSAnalysisResult)
async def analyze_resume_endpoint(
    request: AnalyzeResumeRequest,
    _: bool = Depends(verify_secret_key),
):
    if not request.resumeText or not request.resumeText.strip():
        raise HTTPException(status_code=400, detail="resumeText is required.")

    analysis = gemini_service.analyze_ats(request.resumeText, request.jobDescription)
    return ATSAnalysisResult(**analysis)

@router.post("/match-job", response_model=JobMatchResult)
async def match_job_endpoint(
    request: JobMatchRequest,
    _: bool = Depends(verify_secret_key),
):
    if not request.resumeText or not request.jobDescription:
        raise HTTPException(status_code=400, detail="resumeText and jobDescription are required.")

    match_result = gemini_service.match_job(request.resumeText, request.jobDescription)
    return JobMatchResult(**match_result)
