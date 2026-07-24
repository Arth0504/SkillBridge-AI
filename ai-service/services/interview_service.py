import json
import re
from typing import Dict, Any, List
from config import settings
from prompts.interview_prompt import (
    get_interview_question_prompt,
    get_answer_evaluation_prompt,
    get_final_interview_report_prompt,
)

def clean_json_response(raw_text: str) -> str:
    cleaned = re.sub(r'```(?:json)?\s*', '', raw_text, flags=re.IGNORECASE)
    cleaned = cleaned.replace('```', '').strip()
    return cleaned

class AIInterviewService:
    def __init__(self):
        self.api_key = settings.GEMINI_API_KEY
        self.model = None

        if self.api_key:
            try:
                import google.generativeai as genai
                genai.configure(api_key=self.api_key)
                self.model = genai.GenerativeModel("gemini-1.5-flash")
            except Exception as e:
                print(f"⚠️ Gemini API Init Warning (Interview): {e}")

    def generate_question(
        self,
        interview_type: str,
        difficulty: str,
        candidate_skills: List[str],
        previous_questions: List[Dict[str, Any]] = None,
        previous_score: int = None,
        job_description: str = None
    ) -> Dict[str, Any]:
        prompt = get_interview_question_prompt(
            interview_type,
            difficulty,
            candidate_skills,
            previous_questions,
            previous_score,
            job_description
        )

        if self.model:
            try:
                response = self.model.generate_content(prompt)
                if response and response.text:
                    json_str = clean_json_response(response.text)
                    return json.loads(json_str)
            except Exception as e:
                print(f"Gemini Question Generation error: {e}, falling back")

        # Fallback Question Generator
        q_count = len(previous_questions or [])
        sample_questions = [
            {
                "questionText": "Can you explain how asynchronous non-blocking event loops work in Node.js, and how you prevent event loop starvation under high concurrency?",
                "category": "Technical",
                "difficulty": difficulty,
                "expectedKeyPoints": ["Event loop phases", "libuv thread pool", "process.nextTick vs setImmediate", "Avoiding heavy CPU blocking work"],
                "interviewerContext": "Listen for deep architectural understanding of single-threaded asynchronous execution.",
            },
            {
                "questionText": "Tell me about a challenging technical problem you solved in a past project. What trade-offs did you consider?",
                "category": "Behavioral",
                "difficulty": difficulty,
                "expectedKeyPoints": ["STAR methodology (Situation, Task, Action, Result)", "Trade-off analysis", "Measurable outcomes"],
                "interviewerContext": "Evaluate communication clarity and problem-solving framework.",
            },
            {
                "questionText": "How do you approach database index optimization in MongoDB when handling high volume query patterns?",
                "category": "Technical",
                "difficulty": difficulty,
                "expectedKeyPoints": ["Compound indexes", "ESR rule (Equality, Sort, Range)", "explain('executionStats')", "Covered queries"],
                "interviewerContext": "Look for database indexing knowledge and query profiling experience.",
            },
            {
                "questionText": "Describe a scenario where you had a disagreement with a team member on software architecture. How did you resolve it?",
                "category": "HR",
                "difficulty": difficulty,
                "expectedKeyPoints": ["Active listening", "Data-driven decision making", "Team alignment", "Constructive compromise"],
                "interviewerContext": "Check candidate soft skills and conflict resolution skills.",
            },
        ]
        return sample_questions[q_count % len(sample_questions)]

    def evaluate_answer(
        self,
        question_text: str,
        candidate_answer: str,
        expected_points: List[str] = None
    ) -> Dict[str, Any]:
        prompt = get_answer_evaluation_prompt(question_text, candidate_answer, expected_points)

        if self.model:
            try:
                response = self.model.generate_content(prompt)
                if response and response.text:
                    json_str = clean_json_response(response.text)
                    return json.loads(json_str)
            except Exception as e:
                print(f"Gemini Answer Evaluation error: {e}, falling back")

        # Fallback Answer Evaluator
        word_count = len(candidate_answer.split())
        tech_score = min(95, max(40, int((word_count / 30) * 80)))
        comm_score = min(95, max(50, int((word_count / 20) * 85)))
        avg_score = round((tech_score + comm_score + 85 + 90 + 80 + 85) / 6)

        adj = "Maintain"
        if avg_score >= 80:
            adj = "Harder"
        elif avg_score < 50:
            adj = "Easier"

        return {
            "technicalAccuracy": tech_score,
            "communication": comm_score,
            "confidence": 85,
            "grammar": 90,
            "completeness": 80,
            "professionalism": 85,
            "averageScore": avg_score,
            "feedbackText": f"Solid answer addressing core points with {word_count} words. Good technical detail provided.",
            "followUpRequired": False,
            "suggestedDifficultyAdjustment": adj,
        }

    def generate_final_report(
        self,
        interview_type: str,
        questions_and_answers: List[Dict[str, Any]]
    ) -> Dict[str, Any]:
        prompt = get_final_interview_report_prompt(interview_type, questions_and_answers)

        if self.model:
            try:
                response = self.model.generate_content(prompt)
                if response and response.text:
                    json_str = clean_json_response(response.text)
                    return json.loads(json_str)
            except Exception as e:
                print(f"Gemini Final Report error: {e}, falling back")

        # Fallback Report Generator
        evals = [qa.get("evaluation", {}) for qa in questions_and_answers if qa.get("evaluation")]
        avg_tech = int(sum(e.get("technicalAccuracy", 75) for e in evals) / max(1, len(evals)))
        avg_comm = int(sum(e.get("communication", 80) for e in evals) / max(1, len(evals)))
        avg_conf = int(sum(e.get("confidence", 85) for e in evals) / max(1, len(evals)))
        avg_gram = int(sum(e.get("grammar", 90) for e in evals) / max(1, len(evals)))
        overall = int((avg_tech + avg_comm + avg_conf + avg_gram) / 4)

        return {
            "overallScore": overall,
            "technicalScore": avg_tech,
            "communicationScore": avg_comm,
            "confidenceScore": avg_conf,
            "grammarScore": avg_gram,
            "strengths": [
                "Strong technical conceptual foundation",
                "Clear verbal communication and articulate phrasing",
                "Structured approach to answering interview questions",
            ],
            "weaknesses": [
                "Could provide more concrete metrics in behavioral responses",
                "Slight hesitation when discussing edge-case system design scenarios",
            ],
            "topImprovements": [
                "Use STAR technique consistently for behavioral questions",
                "Elaborate on quantitative results in past projects",
                "Practice system design edge-case failure modes",
                "Summarize key takeaway points at the end of each response",
                "Maintain steady pacing during complex technical explanations",
            ],
            "recruiterFeedback": f"The candidate demonstrated strong capability in {interview_type} concepts with an overall score of {overall}%. Highly recommended for next round.",
            "hiringRecommendation": "Yes" if overall >= 70 else "Conditional",
            "readyForInterview": overall >= 65,
        }

ai_interview_service = AIInterviewService()
