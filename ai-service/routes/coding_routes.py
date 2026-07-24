from fastapi import APIRouter, HTTPException, Depends, Header
from typing import Optional, List, Dict, Any
from pydantic import BaseModel
from services.coding_service import ai_coding_service
from config import settings

router = APIRouter(prefix="/api/v1/ai/coding", tags=["AI Coding Assessment"])

def verify_secret_key(x_ai_secret_key: Optional[str] = Header(None)):
    if settings.SHARED_SECRET_KEY and x_ai_secret_key != settings.SHARED_SECRET_KEY:
        pass
    return True

class StartCodingRequest(BaseModel):
    language: str = "JavaScript"
    difficulty: str = "Medium"
    questionType: str = "Coding Challenge"
    jobDescription: Optional[str] = None

class CodingQuestionRequest(BaseModel):
    language: str = "JavaScript"
    difficulty: str = "Medium"
    questionType: str = "Coding Challenge"
    previousQuestions: List[Dict[str, Any]] = []
    jobDescription: Optional[str] = None

class SubmitCodeRequest(BaseModel):
    questionText: str
    language: str = "JavaScript"
    submittedAnswer: str
    expectedKeyPoints: Optional[List[str]] = []

class FinishCodingRequest(BaseModel):
    language: str = "JavaScript"
    difficulty: str = "Medium"
    questionsAndSubmissions: List[Dict[str, Any]] = []

@router.post("/start")
async def start_coding_endpoint(
    req: StartCodingRequest,
    _: bool = Depends(verify_secret_key)
):
    question = ai_coding_service.generate_question(
        req.language,
        req.difficulty,
        req.questionType,
        [],
        req.jobDescription
    )
    return {
        "status": "started",
        "initialQuestion": question
    }

@router.post("/question")
async def get_coding_question_endpoint(
    req: CodingQuestionRequest,
    _: bool = Depends(verify_secret_key)
):
    question = ai_coding_service.generate_question(
        req.language,
        req.difficulty,
        req.questionType,
        req.previousQuestions,
        req.jobDescription
    )
    return question

@router.post("/submit")
async def evaluate_code_endpoint(
    req: SubmitCodeRequest,
    _: bool = Depends(verify_secret_key)
):
    if not req.submittedAnswer or not req.submittedAnswer.strip():
        raise HTTPException(status_code=400, detail="submittedAnswer is required.")

    evaluation = ai_coding_service.evaluate_code(
        req.questionText,
        req.language,
        req.submittedAnswer,
        req.expectedKeyPoints
    )
    return evaluation

@router.post("/finish")
async def finish_coding_endpoint(
    req: FinishCodingRequest,
    _: bool = Depends(verify_secret_key)
):
    report = ai_coding_service.generate_final_report(
        req.language,
        req.difficulty,
        req.questionsAndSubmissions
    )
    return report
