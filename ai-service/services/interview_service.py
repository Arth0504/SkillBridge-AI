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

# Master Question Bank covering multi-domain tech blueprint & difficulty progression
EXTENSIVE_QUESTION_BANK = [
    {
        "topic": "React State Management",
        "questionText": "Can you explain how you handle complex state management in React applications, comparing local component state, Context API, Redux Toolkit, and React Query/Zustand?",
        "category": "Technical",
        "difficulty": "Medium",
        "expectedKeyPoints": ["Context API render propagation", "Redux immutable state updates", "Server state vs Client state", "React Query caching and stale-while-revalidate"],
        "interviewerContext": "Assess candidate's state architecture choices and understanding of re-rendering overhead."
    },
    {
        "topic": "React Hooks & Performance",
        "questionText": "How do useMemo, useCallback, and React.memo prevent unnecessary re-renders in large React component trees, and when might overusing them hurt performance?",
        "category": "Technical",
        "difficulty": "Advanced",
        "expectedKeyPoints": ["Referential equality checks", "Cost of memoization vs simple re-render", "Shallow prop comparisons", "Dependency array pitfalls"],
        "interviewerContext": "Look for deep knowledge of React fiber reconciliation and hook memory overhead."
    },
    {
        "topic": "JavaScript Event Loop & Async",
        "questionText": "Walk me through how the JavaScript V8 event loop handles call stack, microtask queue (Promises), and macrotask queue (setTimeout/setInterval).",
        "category": "Technical",
        "difficulty": "Medium",
        "expectedKeyPoints": ["Single-threaded execution", "Microtask queue priority over macrotasks", "Promise.then vs setTimeout execution order", "Event loop tick cycle"],
        "interviewerContext": "Verify foundational JavaScript execution engine understanding."
    },
    {
        "topic": "Node.js Concurrency",
        "questionText": "How does Node.js achieve high concurrency despite being single-threaded, and how would you diagnose and resolve CPU-bound event loop starvation?",
        "category": "Technical",
        "difficulty": "Advanced",
        "expectedKeyPoints": ["libuv asynchronous I/O thread pool", "worker_threads for CPU tasks", "Clustering module", "Profiling event loop delay"],
        "interviewerContext": "Check backend architecture scalability and thread management experience."
    },
    {
        "topic": "Express API & Middleware",
        "questionText": "How do you structure secure Express.js middleware chains for JWT authentication, rate limiting, error handling, and request validation?",
        "category": "Technical",
        "difficulty": "Medium",
        "expectedKeyPoints": ["Express next() control flow", "Global error handling middleware signature", "Rate limiting with Redis", "Bearer token validation"],
        "interviewerContext": "Look for backend security hygiene and clean middleware abstractions."
    },
    {
        "topic": "MongoDB Indexing & Queries",
        "questionText": "Explain the ESR (Equality, Sort, Range) rule in MongoDB compound indexing and how you analyze query performance using explain('executionStats').",
        "category": "Technical",
        "difficulty": "Advanced",
        "expectedKeyPoints": ["Index field order matching ESR", "IXSCAN vs COLLSCAN", "Covered queries", "Memory limits on sorting"],
        "interviewerContext": "Evaluate database performance tuning and execution plan analysis."
    },
    {
        "topic": "REST API & Security",
        "questionText": "What strategies do you implement to secure REST API endpoints against CORS misconfigurations, CSRF, XSS, and SQL/NoSQL injection attacks?",
        "category": "Technical",
        "difficulty": "Advanced",
        "expectedKeyPoints": ["HttpOnly SameSite cookies", "Content Security Policy (CSP) headers", "Input sanitization and parameterized queries", "CORS origin whitelisting"],
        "interviewerContext": "Assess web application security defense-in-depth knowledge."
    },
    {
        "topic": "System Design & Microservices",
        "questionText": "How would you design a real-time notification system handling millions of concurrent users with web sockets and message queues?",
        "category": "System Design",
        "difficulty": "Scenario Based",
        "expectedKeyPoints": ["Socket.IO / WebSockets with Redis Pub/Sub", "Kafka/RabbitMQ queue ingestion", "Horizontal gateway scaling", "Connection heartbeat monitoring"],
        "interviewerContext": "Check system design principles, horizontal scaling, and fault tolerance."
    },
    {
        "topic": "Behavioral & Problem Solving",
        "questionText": "Describe a situation where a critical production feature broke under peak user traffic. How did you debug, hotfix, and prevent future recurrences?",
        "category": "Behavioral",
        "difficulty": "Scenario Based",
        "expectedKeyPoints": ["Incident triage & log analysis", "Rollback vs hotfix strategy", "Blameless post-mortem", "Regression test automation"],
        "interviewerContext": "Check candidate calm under pressure, incident handling, and engineering maturity."
    },
    {
        "topic": "Project Deep Dive",
        "questionText": "Tell me about the most technically ambitious project you built recently. What was the core architectural challenge and what trade-offs did you make?",
        "category": "Technical",
        "difficulty": "Scenario Based",
        "expectedKeyPoints": ["Clear system overview", "Explicit architectural trade-offs", "Quantifiable impact/metrics", "Lessons learned"],
        "interviewerContext": "Evaluate overall engineering capability and technical communication."
    }
]

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

    def _is_duplicate_question(self, new_question_text: str, previous_questions: List[Dict[str, Any]]) -> bool:
        if not previous_questions:
            return False
        new_norm = re.sub(r'[^a-zA-Z0-9\s]', '', new_question_text.lower()).strip()
        for prev in previous_questions:
            prev_text = prev.get("questionText", "")
            prev_norm = re.sub(r'[^a-zA-Z0-9\s]', '', prev_text.lower()).strip()
            if not prev_norm or not new_norm:
                continue
            if new_norm in prev_norm or prev_norm in new_norm:
                return True
        return False

    def generate_question(
        self,
        interview_type: str,
        difficulty: str,
        candidate_skills: List[str],
        previous_questions: List[Dict[str, Any]] = None,
        previous_score: int = None,
        job_description: str = None,
        experience_level: str = "Senior"
    ) -> Dict[str, Any]:
        prompt = get_interview_question_prompt(
            interview_type,
            difficulty,
            candidate_skills,
            previous_questions,
            previous_score,
            job_description,
            experience_level
        )

        if self.model:
            try:
                response = self.model.generate_content(prompt)
                if response and response.text:
                    json_str = clean_json_response(response.text)
                    q_data = json.loads(json_str)
                    if q_data and q_data.get("questionText"):
                        if not self._is_duplicate_question(q_data["questionText"], previous_questions):
                            return q_data
            except Exception as e:
                print(f"Gemini Question Generation error: {e}, using dynamic question pool")

        # Dynamic Question Pool Selection (Guarantees zero duplicates)
        for item in EXTENSIVE_QUESTION_BANK:
            if not self._is_duplicate_question(item["questionText"], previous_questions):
                return item

        # Fallback if all bank items used
        q_idx = len(previous_questions or [])
        return {
            "questionText": f"Question {q_idx + 1}: How do you approach continuous learning, automated testing, and software quality assurance when delivering production software?",
            "topic": "Software Engineering Best Practices",
            "category": "Behavioral",
            "difficulty": difficulty,
            "expectedKeyPoints": ["Unit and integration testing", "CI/CD automation", "Code reviews", "Refactoring strategies"],
            "interviewerContext": "Evaluate candidate engineering habits and automated testing mindset."
        }

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
                print(f"Gemini Evaluation error: {e}, falling back")

        # Fallback Evaluation Engine
        ans_len = len(candidate_answer.strip().split())
        tech_score = 85 if ans_len >= 30 else 65 if ans_len >= 10 else 45
        comm_score = 88 if ans_len >= 25 else 70

        return {
            "technicalAccuracy": tech_score,
            "communication": comm_score,
            "confidence": 85,
            "grammar": 90,
            "completeness": tech_score,
            "professionalism": 90,
            "averageScore": Math.round((tech_score + comm_score + 85 + 90) / 4) if 'Math' in globals() else int((tech_score + comm_score + 85 + 90) / 4),
            "feedbackText": "Good response. Consider elaborating more on specific performance metrics, architectural trade-offs, and testing strategies.",
            "followUpRequired": False,
            "suggestedDifficultyAdjustment": "Maintain"
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
                print(f"Gemini Report error: {e}, falling back")

        # Fallback Report
        evals = [qa.get("evaluation", {}) for qa in questions_and_answers if qa.get("evaluation")]
        avg_overall = int(sum([e.get("averageScore", 75) for e in evals]) / len(evals)) if evals else 78

        return {
            "overallScore": avg_overall,
            "technicalScore": avg_overall,
            "communicationScore": min(100, avg_overall + 5),
            "problemSolvingScore": avg_overall,
            "hiringRecommendation": "Strong Hire" if avg_overall >= 80 else "Hire" if avg_overall >= 65 else "Needs Improvement",
            "keyStrengths": ["Clear technical communication", "Structured problem-solving framework"],
            "areasForImprovement": ["Elaborate deeper on system edge cases"],
            "executiveSummary": f"Candidate demonstrated solid technical proficiency and clear communication during the {interview_type} mock interview."
        }

interview_service = AIInterviewService()
ai_interview_service = interview_service

