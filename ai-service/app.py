from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from config import settings
from routes.resume_routes import router as resume_router
from routes.interview_routes import router as interview_router
from routes.coding_routes import router as coding_router
from routes.video_interview_routes import router as video_interview_router

app = FastAPI(
    title=settings.SERVICE_NAME,
    description="SkillBridge AI FastAPI Microservice for ATS Analysis, AI Mock Interview, AI Coding Assessment, AI Video Interview, and Gemini AI Processing",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
async def root():
    return {
        "service": settings.SERVICE_NAME,
        "status": "running"
    }

@app.get("/health")
async def health_check():
    return {
        "status": "healthy"
    }

app.include_router(resume_router)
app.include_router(interview_router)
app.include_router(coding_router)
app.include_router(video_interview_router)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app:app", host="0.0.0.0", port=settings.PORT, reload=True)
