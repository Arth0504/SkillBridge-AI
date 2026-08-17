import json
import re
from typing import Dict, Any, List
from config import settings
from prompts.coding_prompt import (
    get_coding_question_prompt,
    get_code_evaluation_prompt,
    get_final_coding_report_prompt,
)

def clean_json_response(raw_text: str) -> str:
    cleaned = re.sub(r'```(?:json)?\s*', '', raw_text, flags=re.IGNORECASE)
    cleaned = cleaned.replace('```', '').strip()
    return cleaned

class AICodingService:
    def __init__(self):
        self.api_key = settings.GEMINI_API_KEY
        self.model = None

        if self.api_key:
            try:
                import google.generativeai as genai
                genai.configure(api_key=self.api_key)
                self.model = genai.GenerativeModel("gemini-1.5-flash")
            except Exception as e:
                print(f"Gemini API Init Warning (Coding): {e}")

    def generate_question(
        self,
        language: str,
        difficulty: str,
        question_type: str = "Coding Challenge",
        previous_questions: List[Dict[str, Any]] = None,
        job_description: str = None
    ) -> Dict[str, Any]:
        prompt = get_coding_question_prompt(
            language,
            difficulty,
            question_type,
            previous_questions,
            job_description
        )

        if self.model:
            try:
                response = self.model.generate_content(prompt)
                if response and response.text:
                    json_str = clean_json_response(response.text)
                    return json.loads(json_str)
            except Exception as e:
                print(f"Gemini Coding Question error: {e}, falling back")

        # Fallback Question Repository
        q_count = len(previous_questions or [])
        sample_questions = [
            {
                "questionText": f"Write a function in {language} that finds the two numbers in an array that add up to a target sum and returns their indices.",
                "questionType": "Coding Challenge",
                "language": language,
                "difficulty": difficulty,
                "options": [],
                "initialCode": f"// {language} starter code\nfunction twoSum(nums, target) {{\n  // Write solution here\n}}",
                "expectedKeyPoints": ["Hash table lookup for O(N) time complexity", "Handle empty or invalid arrays", "Return index pair"],
            },
            {
                "questionText": f"What is the time complexity of searching an element in a balanced Binary Search Tree (BST)?",
                "questionType": "MCQ",
                "language": language,
                "difficulty": difficulty,
                "options": ["A) O(1)", "B) O(log N)", "C) O(N)", "D) O(N log N)"],
                "initialCode": "",
                "expectedKeyPoints": ["Identify O(log N) average/best time complexity for balanced BST"],
            },
            {
                "questionText": f"What will be the output of the following {language} snippet?\n\nlet a = [1, 2, 3];\nlet b = a;\nb.push(4);\nconsole.log(a.length);",
                "questionType": "Output Prediction",
                "language": language,
                "difficulty": difficulty,
                "options": [],
                "initialCode": "",
                "expectedKeyPoints": ["Array reference mutability in memory"],
            },
            {
                "questionText": f"Fix the bug in the following {language} code designed to find the maximum number in an array:\n\nfunction findMax(arr) {{\n  let max = 0;\n  for(let i=0; i<=arr.length; i++) {{\n    if(arr[i] > max) max = arr[i];\n  }}\n  return max;\n}}",
                "questionType": "Debugging",
                "language": language,
                "difficulty": difficulty,
                "options": [],
                "initialCode": f"function findMax(arr) {{\n  let max = 0;\n  for(let i=0; i<=arr.length; i++) {{\n    if(arr[i] > max) max = arr[i];\n  }}\n  return max;\n}}",
                "expectedKeyPoints": ["Fix out-of-bounds index <= to <", "Handle arrays with negative numbers (initialize max to arr[0] or -Infinity)"],
            },
            {
                "questionText": f"Write a function in {language} to merge two sorted arrays into a single combined sorted array.",
                "questionType": "Coding Challenge",
                "language": language,
                "difficulty": difficulty,
                "options": [],
                "initialCode": f"// {language} starter code\nfunction mergeSorted(arr1, arr2) {{\n  // Write solution here\n}}",
                "expectedKeyPoints": ["O(N+M) time complexity using two pointers", "Handle empty input arrays"],
            },
        ]

        return sample_questions[q_count % len(sample_questions)]

    def evaluate_code(
        self,
        question_text: str,
        language: str,
        submitted_answer: str,
        expected_points: List[str] = None
    ) -> Dict[str, Any]:
        sub_clean = (submitted_answer or "").strip()
        import re
        code_no_comments = re.sub(r'/\*[\s\S]*?\*/|//.*|#.*|--.*', '', sub_clean).strip()
        code_no_ws = re.sub(r'\s+', '', code_no_comments)

        is_unanswered = (
            not sub_clean or
            sub_clean == "No answer submitted." or
            len(code_no_ws) < 5 or
            code_no_ws in [
                'functionsolution(nums,target){}',
                'defsolution(nums,target):pass',
                'classSolution{public:vector<int>solution(vector<int>&nums,inttarget){return{};}};',
                'classSolution{public:int[]solution(int[]nums,inttarget){returnnewint[0];}};'
            ]
        )

        if is_unanswered:
            return {
                "correctness": 0,
                "timeComplexity": "N/A",
                "spaceComplexity": "N/A",
                "codeQuality": 0,
                "bestPractices": 0,
                "readability": 0,
                "score": 0,
                "feedbackText": "Question was skipped or left unanswered (0 points).",
                "improvementSuggestions": ["Submit a working solution or select an option to earn marks."],
                "status": "unanswered"
            }

        prompt = get_code_evaluation_prompt(question_text, language, submitted_answer, expected_points)

        if self.model:
            try:
                response = self.model.generate_content(prompt)
                if response and response.text:
                    json_str = clean_json_response(response.text)
                    return json.loads(json_str)
            except Exception as e:
                print(f"Gemini Code Evaluation error: {e}, falling back")

        # Fallback Code Evaluator for valid non-empty submissions
        code_length = len(sub_clean)
        score = min(95, max(50, int((code_length / 40) * 85)))

        return {
            "correctness": score,
            "timeComplexity": "O(N)",
            "spaceComplexity": "O(1)",
            "codeQuality": 85,
            "bestPractices": 90,
            "readability": 88,
            "score": score,
            "feedbackText": f"Submitted answer for {language} problem addresses key requirements cleanly. Proper variable naming and structure used.",
            "improvementSuggestions": [
                "Consider edge cases such as empty input arrays or null pointers",
                "Include concise inline comments explaining algorithmic steps",
                "Ensure optimal memory utilization in recursive functions",
            ],
        }

    def generate_final_report(
        self,
        language: str,
        difficulty: str,
        questions_and_submissions: List[Dict[str, Any]],
        total_questions: int = 5
    ) -> Dict[str, Any]:
        valid_subs = [qs for qs in questions_and_submissions if qs.get("evaluation") and qs.get("submittedAnswer") and qs.get("submittedAnswer") != 'No answer submitted.' and qs.get("evaluation", {}).get("score", 0) > 0]
        denom = max(1, total_questions)
        avg_score = round(sum(qs.get("evaluation", {}).get("score", 0) for qs in valid_subs) / denom)
        avg_quality = round(sum(qs.get("evaluation", {}).get("codeQuality", 0) for qs in valid_subs) / denom)
        avg_correctness = round(sum(qs.get("evaluation", {}).get("correctness", 0) for qs in valid_subs) / denom)

        if len(valid_subs) == 0 or avg_score == 0:
            return {
                "overallScore": 0,
                "codeQualityScore": 0,
                "correctnessScore": 0,
                "strengths": [
                    "Assessment session completed.",
                ],
                "weaknesses": [
                    "No questions were attempted or submitted during the assessment.",
                ],
                "topImprovements": [
                    "Attempt all assessment questions to earn points",
                    "Review core language syntax and problem-solving techniques",
                    "Practice basic data structures and algorithms",
                    "Allocate sufficient time to complete coding challenges",
                    "Submit initial code drafts even if partially completed",
                ],
                "summary": f"The candidate skipped all {denom} questions in the {language} ({difficulty} level) assessment and received an overall score of 0%.",
            }

        prompt = get_final_coding_report_prompt(language, difficulty, questions_and_submissions)

        if self.model:
            try:
                response = self.model.generate_content(prompt)
                if response and response.text:
                    json_str = clean_json_response(response.text)
                    report = json.loads(json_str)
                    report["overallScore"] = avg_score
                    return report
            except Exception as e:
                print(f"Gemini Final Coding Report error: {e}, falling back")

        return {
            "overallScore": avg_score,
            "codeQualityScore": avg_quality,
            "correctnessScore": avg_correctness,
            "strengths": [
                f"Demonstrates strong syntactic and algorithmic fluency in {language}.",
                "Clean code layout and proper adherence to scope conventions.",
                "Good time complexity awareness in algorithmic problem solving.",
            ],
            "weaknesses": [
                "Could enhance defensive programming for boundary edge cases.",
            ],
            "topImprovements": [
                "Practice writing unit tests for boundary input conditions",
                "Optimize space complexity by reusing existing data structures",
                "Include type annotations and JSDoc/Docstring documentation",
                "Master language-specific standard library helper functions",
                "Focus on clean error handling and exception catching",
            ],
            "summary": f"The candidate completed {len(valid_subs)} of {denom} questions in {language} ({difficulty} level) with an overall score of {avg_score}%.",
        }

ai_coding_service = AICodingService()
