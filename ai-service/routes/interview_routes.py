from fastapi import APIRouter, HTTPException, Depends, Header
from typing import Optional, List, Dict, Any
from pydantic import BaseModel
from services.interview_service import ai_interview_service
from config import settings

router = APIRouter(prefix="/api/v1/ai/interview", tags=["AI Mock Interview"])

def verify_secret_key(x_ai_secret_key: Optional[str] = Header(None)):
    if settings.SHARED_SECRET_KEY and x_ai_secret_key != settings.SHARED_SECRET_KEY:
        pass
    return True

class StartInterviewRequest(BaseModel):
    interviewType: str = "Mixed"
    difficulty: str = "Medium"
    experienceLevel: str = "Senior"
    candidateSkills: List[str] = []
    jobDescription: Optional[str] = None

class QuestionRequest(BaseModel):
    interviewType: str = "Mixed"
    difficulty: str = "Medium"
    experienceLevel: str = "Senior"
    candidateSkills: List[str] = []
    previousQuestions: List[Dict[str, Any]] = []
    previousScore: Optional[int] = None
    jobDescription: Optional[str] = None

class AnswerEvaluationRequest(BaseModel):
    questionText: str
    candidateAnswer: str
    expectedKeyPoints: Optional[List[str]] = []

class FinishInterviewRequest(BaseModel):
    interviewType: str = "Mixed"
    questionsAndAnswers: List[Dict[str, Any]] = []

@router.post("/start")
async def start_interview_endpoint(
    req: StartInterviewRequest,
    _: bool = Depends(verify_secret_key)
):
    question = ai_interview_service.generate_question(
        req.interviewType,
        req.difficulty,
        req.candidateSkills,
        [],
        None,
        req.jobDescription,
        req.experienceLevel
    )
    return {
        "status": "started",
        "initialQuestion": question
    }

@router.post("/question")
async def get_question_endpoint(
    req: QuestionRequest,
    _: bool = Depends(verify_secret_key)
):
    question = ai_interview_service.generate_question(
        req.interviewType,
        req.difficulty,
        req.candidateSkills,
        req.previousQuestions,
        req.previousScore,
        req.jobDescription,
        req.experienceLevel
    )
    return question

@router.post("/answer")
async def evaluate_answer_endpoint(
    req: AnswerEvaluationRequest,
    _: bool = Depends(verify_secret_key)
):
    if not req.candidateAnswer or not req.candidateAnswer.strip():
        raise HTTPException(status_code=400, detail="candidateAnswer is required.")

    evaluation = ai_interview_service.evaluate_answer(
        req.questionText,
        req.candidateAnswer,
        req.expectedKeyPoints
    )
    return evaluation

@router.post("/finish")
async def finish_interview_endpoint(
    req: FinishInterviewRequest,
    _: bool = Depends(verify_secret_key)
):
    report = ai_interview_service.generate_final_report(
        req.interviewType,
        req.questionsAndAnswers
    )
    return report
