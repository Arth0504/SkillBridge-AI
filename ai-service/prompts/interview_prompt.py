def get_interview_question_prompt(
    interview_type: str,
    difficulty: str,
    candidate_skills: list,
    previous_questions: list = None,
    previous_score: int = None,
    job_description: str = None
) -> str:
    skills_str = ", ".join(candidate_skills) if candidate_skills else "General Software Engineering"
    prev_q_str = "\n".join([f"- Q: {q['questionText']} (Score: {q.get('score', 'N/A')})" for q in (previous_questions or [])])
    jd_str = f"\nJob Context: {job_description}" if job_description else ""

    adaptive_note = ""
    if previous_score is not None:
        if previous_score >= 80:
            adaptive_note = "\nNOTE: The candidate performed very well on the previous question. Increase question difficulty, probe deeper into architectural decisions or edge cases."
        elif previous_score < 50:
            adaptive_note = "\nNOTE: The candidate struggled on the previous question. Ask a clarifying follow-up question or adjust to a foundational concept."

    return f"""
You are a Senior Technical Hiring Manager and Executive Recruiter conducting a live {interview_type} mock interview ({difficulty} level).
Generate the next single interview question for the candidate based on their skills, experience, and previous answers.

Candidate Skills: {skills_str}
Target Interview Type: {interview_type}
Current Target Difficulty: {difficulty}
{jd_str}

Previous Questions Asked:
{prev_q_str if prev_q_str else "None yet"}
{adaptive_note}

Output ONLY a raw valid JSON object. Do NOT wrap in markdown code blocks.

Return JSON with exact keys:
{{
  "questionText": "<the interview question string>",
  "category": "<HR | Technical | Coding | Behavioral | Situational>",
  "difficulty": "<Easy | Medium | Hard>",
  "expectedKeyPoints": [<3-5 key points an ideal answer should cover>],
  "interviewerContext": "<brief advice to interviewer on what to look for>"
}}
"""


def get_answer_evaluation_prompt(
    question_text: str,
    candidate_answer: str,
    expected_points: list = None
) -> str:
    points_str = ", ".join(expected_points) if expected_points else "General technical accuracy and completeness"

    return f"""
You are an expert Interview Assessor evaluating a candidate's answer during a mock interview.
Evaluate the candidate's answer across all 6 core metrics (0-100 score each) and provide constructive feedback.

Question Asked:
{question_text}

Candidate Answer:
{candidate_answer}

Expected Answer Highlights:
{points_str}

Output ONLY a raw valid JSON object. Do NOT wrap in markdown code blocks.

Return JSON with exact keys:
{{
  "technicalAccuracy": <number 0-100>,
  "communication": <number 0-100>,
  "confidence": <number 0-100>,
  "grammar": <number 0-100>,
  "completeness": <number 0-100>,
  "professionalism": <number 0-100>,
  "averageScore": <calculated average 0-100>,
  "feedbackText": "<constructive line-by-line feedback on the answer>",
  "followUpRequired": <boolean>,
  "suggestedDifficultyAdjustment": "<Easier | Maintain | Harder>"
}}
"""


def get_final_interview_report_prompt(
    interview_type: str,
    questions_and_answers: list
) -> str:
    history_str = ""
    for idx, qa in enumerate(questions_and_answers, 1):
        history_str += f"\nQ{idx}: {qa.get('questionText')}\nAnswer: {qa.get('answerText')}\nScores: Technical={qa.get('evaluation', {}).get('technicalAccuracy')}, Comm={qa.get('evaluation', {}).get('communication')}\nFeedback: {qa.get('evaluation', {}).get('feedbackText')}\n"

    return f"""
You are a Vice President of Engineering compiling the final interview feedback report for a completed {interview_type} mock interview.
Analyze all candidate answers and evaluations from the interview session below:

{history_str}

Output ONLY a raw valid JSON object. Do NOT wrap in markdown code blocks.

Return JSON with exact keys:
{{
  "overallScore": <number 0-100>,
  "technicalScore": <number 0-100>,
  "communicationScore": <number 0-100>,
  "confidenceScore": <number 0-100>,
  "grammarScore": <number 0-100>,
  "strengths": [<3-5 candidate key strengths>],
  "weaknesses": [<2-4 candidate improvement areas>],
  "topImprovements": [<5 actionable priority changes>],
  "recruiterFeedback": "<detailed overall recruiter summary>",
  "hiringRecommendation": "<Strong Yes | Yes | Conditional | No>",
  "readyForInterview": <boolean true or false>
}}
"""
