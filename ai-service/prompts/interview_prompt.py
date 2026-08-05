def get_interview_question_prompt(
    interview_type: str,
    difficulty: str,
    candidate_skills: list,
    previous_questions: list = None,
    previous_score: int = None,
    job_description: str = None,
    experience_level: str = "Senior"
) -> str:
    skills_str = ", ".join(candidate_skills) if candidate_skills else "Software Engineering and Architecture"
    prev_q_str = "\n".join([f"- [Already Asked] Q{idx+1}: {q.get('questionText')} (Topic: {q.get('topic', 'General')}, Score: {q.get('score', 'N/A')})" for idx, q in enumerate(previous_questions or [])])
    jd_str = f"\nJob Context: {job_description}" if job_description else ""

    adaptive_note = ""
    if previous_score is not None:
        if previous_score >= 80:
            adaptive_note = "\nNOTE: Candidate scored high on previous question. Increase question difficulty, probe deeper into trade-offs, edge cases, or system scaling."
        elif previous_score < 50:
            adaptive_note = "\nNOTE: Candidate struggled previously. Ask a foundational or clarifying conceptual question to assess core baseline understanding."

    return f"""
You are a Senior Principal Engineer and Hiring Manager conducting an enterprise technical interview (Google/Microsoft/Amazon style).
Generate the next single interview question for the candidate based on target seniority, skills, and session history.

Candidate Core Skills: {skills_str}
Target Interview Type: {interview_type}
Question Difficulty Rating: {difficulty} (Easy | Medium | Advanced | Scenario Based | System Design)
Target Seniority Level: {experience_level}
{jd_str}

SESSION QUESTION HISTORY (DO NOT REPEAT ANY OF THESE):
{prev_q_str if prev_q_str else "No questions asked yet"}
{adaptive_note}

CRITICAL RULES:
1. STRICT DUPLICATE PREVENTION: You MUST NOT repeat any question or ask a question with similar phrasing/topic to those listed in SESSION QUESTION HISTORY.
2. TOPIC ROTATION & BLUEPRINT: Rotate to a different technical domain or subtopic (e.g. React Hooks, Redux, Node Event Loop, MongoDB Indexing, System Design, REST Security, Behavioral) than the previous question.
3. ADAPTIVE PROGRESSION: Progress difficulty naturally (Easy -> Medium -> Advanced -> Scenario -> System Design).
4. CONTEXTUAL FOLLOW-UP: If the candidate answered a previous topic, ask a context-aware follow-up (e.g., debugging methods, performance impact, alternative choices) instead of a generic prompt.

Output ONLY a raw valid JSON object. Do NOT wrap in markdown code blocks.

Return JSON with exact keys:
{{
  "questionText": "<the unique interview question statement>",
  "topic": "<e.g. React State Management | Node Async | System Architecture | HR>",
  "subTopic": "<specific subtopic>",
  "category": "<Technical | Coding | Behavioral | Situational | HR>",
  "difficulty": "<Easy | Medium | Advanced | Scenario Based | System Design>",
  "expectedKeyPoints": [<3-5 key points an ideal answer must cover>],
  "interviewerContext": "<guidance to interviewer on what technical aspects to evaluate>"
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
