from pydantic import BaseModel, Field
from typing import List, Dict, Any, Optional

class TextExtractionResult(BaseModel):
    text: str
    name: str = ""
    email: str = ""
    phone: str = ""
    skills: List[str] = []
    education: List[str] = []
    experience: List[str] = []
    projects: List[str] = []
    certificates: List[str] = []
    summary: str = ""

class SkillMatchSchema(BaseModel):
    technicalSkills: List[str] = []
    softSkills: List[str] = []
    missingSkills: List[str] = []

class ATSAnalysisResult(BaseModel):
    overallAtsScore: int = Field(ge=0, le=100)
    skillMatch: SkillMatchSchema = Field(default_factory=SkillMatchSchema)
    keywordAnalysis: Dict[str, Any] = Field(default_factory=dict)
    strengths: List[str] = []
    weaknesses: List[str] = []
    grammarReview: str = ""
    formattingSuggestions: List[str] = []
    projectReview: str = ""
    experienceReview: str = ""
    educationReview: str = ""
    certificationReview: str = ""
    resumeSummary: str = ""
    improvementSuggestions: List[str] = []
    recruiterImpression: str = ""
    top5Improvements: List[str] = []

class JobMatchResult(BaseModel):
    matchScore: int = Field(ge=0, le=100)
    missingKeywords: List[str] = []
    missingSkills: List[str] = []
    keywordDensity: Dict[str, Any] = Field(default_factory=dict)
    atsCompatibility: str = "Medium"
    recommendation: str = "Yes"
    explanation: str = ""

class AnalyzeResumeRequest(BaseModel):
    resumeText: str
    jobDescription: Optional[str] = None

class JobMatchRequest(BaseModel):
    resumeText: str
    jobDescription: str
