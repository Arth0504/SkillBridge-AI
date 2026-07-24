def get_coding_question_prompt(
    language: str,
    difficulty: str,
    question_type: str = "Coding Challenge",
    previous_questions: list = None,
    job_description: str = None
) -> str:
    prev_str = "\n".join([f"- Q: {q.get('questionText')}" for q in (previous_questions or [])])
    jd_str = f"\nTarget Job Context: {job_description}" if job_description else ""

    return f"""
You are a Principal Software Engineer and Technical Assessment Specialist.
Generate a high-quality {question_type} coding problem in {language} at {difficulty} difficulty.
{jd_str}

Previous Questions Asked:
{prev_str if prev_str else "None"}

Requirements for Question Type:
- MCQ: Provide 4 options (A, B, C, D) and specify the question.
- Output Prediction: Provide a code snippet and ask for the exact output or behavior.
- Debugging: Provide buggy code snippet in {language} and ask the candidate to fix it.
- Coding Challenge: Provide problem description, constraints, input/output examples, and a starter template function in {language}.

Output ONLY a raw valid JSON object. Do NOT wrap in markdown code blocks.

Return JSON with exact keys:
{{
  "questionText": "<the problem statement or question text>",
  "questionType": "<MCQ | Output Prediction | Debugging | Coding Challenge>",
  "language": "{language}",
  "difficulty": "{difficulty}",
  "options": [<list of 4 string options if MCQ, empty list if not MCQ>],
  "initialCode": "<starter code template or buggy snippet, empty string if MCQ>",
  "expectedKeyPoints": [<3-5 key points an ideal solution must satisfy>]
}}
"""


def get_code_evaluation_prompt(
    question_text: str,
    language: str,
    submitted_answer: str,
    expected_points: list = None
) -> str:
    points_str = ", ".join(expected_points) if expected_points else "Correctness, time complexity, and edge case handling"

    return f"""
You are an expert Automated Code Reviewer and Algorithmic Assessor.
Evaluate the submitted solution or answer for the following {language} problem:

Problem Statement:
{question_text}

Submitted Answer / Code:
{submitted_answer}

Expected Solution Criteria:
{points_str}

Analyze correctness, time complexity (e.g. O(N), O(N log N)), space complexity (e.g. O(1), O(N)), code quality, best practices, and readability. Score each metric 0-100.

Output ONLY a raw valid JSON object. Do NOT wrap in markdown code blocks.

Return JSON with exact keys:
{{
  "correctness": <number 0-100>,
  "timeComplexity": "<e.g. O(N) or O(N log N)>",
  "spaceComplexity": "<e.g. O(1) or O(N)>",
  "codeQuality": <number 0-100>,
  "bestPractices": <number 0-100>,
  "readability": <number 0-100>,
  "score": <calculated average score 0-100>,
  "feedbackText": "<detailed line-by-line code review feedback>",
  "improvementSuggestions": [<3-5 specific recommendations to improve code efficiency or style>]
}}
"""


def get_final_coding_report_prompt(
    language: str,
    difficulty: str,
    questions_and_submissions: list
) -> str:
    q_summary = ""
    for idx, qs in enumerate(questions_and_submissions, 1):
        q_summary += f"\nQ{idx} ({qs.get('questionType')}): {qs.get('questionText')}\nSubmitted: {qs.get('submittedAnswer')}\nScore: {qs.get('evaluation', {}).get('score', 0)}\nFeedback: {qs.get('evaluation', {}).get('feedbackText')}\n"

    return f"""
You are a Lead Software Architect compiling the final AI Coding Assessment report for a candidate who completed a {difficulty} level assessment in {language}.

Questions & Submissions History:
{q_summary}

Output ONLY a raw valid JSON object. Do NOT wrap in markdown code blocks.

Return JSON with exact keys:
{{
  "overallScore": <number 0-100>,
  "codeQualityScore": <number 0-100>,
  "correctnessScore": <number 0-100>,
  "strengths": [<3-5 candidate key coding strengths>],
  "weaknesses": [<2-4 candidate improvement areas>],
  "topImprovements": [<5 priority actionable code/skill recommendations>],
  "summary": "<concise executive summary of candidate coding proficiency>"
}}
"""
