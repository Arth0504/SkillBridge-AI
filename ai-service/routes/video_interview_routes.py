from fastapi import APIRouter, HTTPException, Depends, Header, UploadFile, File
from typing import Optional, List, Dict, Any
from pydantic import BaseModel
from services.video_interview_service import ai_video_interview_service
from config import settings

router = APIRouter(prefix="/api/v1/ai/video", tags=["AI Video Interview"])

def verify_secret_key(x_ai_secret_key: Optional[str] = Header(None)):
    if settings.SHARED_SECRET_KEY and x_ai_secret_key != settings.SHARED_SECRET_KEY:
        pass
    return True

class StartVideoInterviewRequest(BaseModel):
    interviewType: str = "HR"
    candidateSkills: Optional[List[str]] = []
    jobDescription: Optional[str] = None
    customQuestions: Optional[List[str]] = []

class VideoQuestionRequest(BaseModel):
    interviewType: str = "HR"
    candidateSkills: Optional[List[str]] = []
    jobDescription: Optional[str] = None
    customQuestions: Optional[List[str]] = []

class AnalyzeVideoRequest(BaseModel):
    questionText: str
    transcriptText: str
    videoMetadata: Optional[Dict[str, Any]] = {}

class FinishVideoInterviewRequest(BaseModel):
    title: str = "AI Video Interview"
    questionsAndResponses: List[Dict[str, Any]] = []

@router.post("/start")
async def start_video_interview_endpoint(
    req: StartVideoInterviewRequest,
    _: bool = Depends(verify_secret_key)
):
    question = ai_video_interview_service.generate_question(
        req.interviewType,
        req.candidateSkills,
        req.jobDescription,
        req.customQuestions
    )
    return {
        "status": "started",
        "initialQuestion": question
    }

@router.post("/question")
async def get_video_question_endpoint(
    req: VideoQuestionRequest,
    _: bool = Depends(verify_secret_key)
):
    question = ai_video_interview_service.generate_question(
        req.interviewType,
        req.candidateSkills,
        req.jobDescription,
        req.customQuestions
    )
    return question

@router.post("/upload")
async def upload_video_metadata_endpoint(
    videoUrl: str,
    durationSeconds: int = 60,
    fileSizeBytes: int = 1000000,
    resolution: str = "1280x720",
    _: bool = Depends(verify_secret_key)
):
    return {
        "status": "accepted",
        "videoMetadata": {
            "videoUrl": videoUrl,
            "durationSeconds": durationSeconds,
            "fileSizeBytes": fileSizeBytes,
            "resolution": resolution,
        }
    }

@router.post("/analyze")
async def analyze_video_response_endpoint(
    req: AnalyzeVideoRequest,
    _: bool = Depends(verify_secret_key)
):
    if not req.transcriptText or not req.transcriptText.strip():
        raise HTTPException(status_code=400, detail="transcriptText is required.")

    evaluation = ai_video_interview_service.analyze_video_response(
        req.questionText,
        req.transcriptText,
        req.videoMetadata
    )
    return evaluation

@router.post("/finish")
async def finish_video_interview_endpoint(
    req: FinishVideoInterviewRequest,
    _: bool = Depends(verify_secret_key)
):
    report = ai_video_interview_service.generate_final_report(
        req.title,
        req.questionsAndResponses
    )
    return report

@router.get("/report/{report_id}")
async def get_video_report_endpoint(
    report_id: str,
    _: bool = Depends(verify_secret_key)
):
    return {
        "reportId": report_id,
        "status": "generated",
        "message": "AI video interview analysis report is ready."
    }
