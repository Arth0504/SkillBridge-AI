def get_video_question_prompt(
    interview_type: str,
    candidate_skills: list = None,
    job_description: str = None,
    custom_questions: list = None,
    previous_questions: list = None
) -> str:
    skills_str = ", ".join(candidate_skills) if candidate_skills else "Software Engineering and Architecture"
    custom_str = "\n".join([f"- Custom Question: {q}" for q in (custom_questions or [])])
    prev_str = "\n".join([f"- [Already Asked] Q{idx+1}: {q.get('questionText')}" for idx, q in enumerate(previous_questions or [])])
    jd_str = f"\nTarget Job Context: {job_description}" if job_description else ""

    return f"""
You are an Executive Talent Acquisition Lead constructing an asynchronous video interview question set (HireVue style).
Generate a compelling, unique video interview question for a {interview_type} candidate.

Candidate Core Skills: {skills_str}
{jd_str}
{custom_str if custom_str else ""}

SESSION ALREADY ASKED QUESTIONS (STRICTLY DO NOT REPEAT ANY):
{prev_str if prev_str else "None yet"}

CRITICAL RULES:
1. DUPLICATE PREVENTION: Never ask any question identical or similar to those listed under ALREADY ASKED QUESTIONS.
2. TOPIC DIVERSITY: Rotate across technical depth, system architecture, team collaboration, and problem-solving framework.

Output ONLY a raw valid JSON object. Do NOT wrap in markdown code blocks.

Return JSON with exact keys:
{{
  "questionText": "<the unique video interview question statement>",
  "category": "<HR | Technical | Behavioral | Managerial | Custom>",
  "timeLimitSeconds": <recommended response time limit in seconds, e.g. 120>,
  "expectedKeyPoints": [<3-5 key points candidate should address in their video response>],
  "evaluationCriteria": "<guidance for video response evaluation>"
}}
"""


def get_video_analysis_prompt(
    question_text: str,
    transcript_text: str,
    video_metadata: dict = None
) -> str:
    meta_str = f"Video Duration: {video_metadata.get('durationSeconds', 60)}s, Resolution: {video_metadata.get('resolution', '720p')}" if video_metadata else ""

    return f"""
You are an AI Video Interview Assessor analyzing a candidate's video interview response and transcript.
Evaluate the candidate's spoken response across all core communication, technical, and presentation metrics (0-100 score each).

Question Asked:
{question_text}

Candidate Response Transcript:
{transcript_text}
{meta_str}

Output ONLY a raw valid JSON object. Do NOT wrap in markdown code blocks.

Return JSON with exact keys:
{{
  "communication": <number 0-100>,
  "confidence": <number 0-100>,
  "grammar": <number 0-100>,
  "professionalism": <number 0-100>,
  "completeness": <number 0-100>,
  "technicalAccuracy": <number 0-100>,
  "bodyLanguageScore": <number 0-100, default 85 for future visual plugin pipeline>,
  "eyeContactScore": <number 0-100, default 85 for future visual plugin pipeline>,
  "overallResponseScore": <calculated average score 0-100>,
  "feedbackText": "<constructive executive feedback on speech delivery, content depth, and presentation>",
  "keyTakeaways": [<3-5 summary takeaways>]
}}
"""


def get_final_video_report_prompt(
    title: str,
    questions_and_responses: list
) -> str:
    summary_str = ""
    for idx, qr in enumerate(questions_and_responses, 1):
        summary_str += f"\nQ{idx}: {qr.get('questionText')}\nTranscript: {qr.get('transcriptText')}\nScore: {qr.get('evaluation', {}).get('overallResponseScore', 0)}\nFeedback: {qr.get('evaluation', {}).get('feedbackText')}\n"

    return f"""
You are a Senior Executive Talent Evaluator compiling the final AI Video Interview Report for a completed asynchronous video interview ({title}).

Interview Summary History:
{summary_str}

Output ONLY a raw valid JSON object. Do NOT wrap in markdown code blocks.

Return JSON with exact keys:
{{
  "overallScore": <number 0-100>,
  "communicationScore": <number 0-100>,
  "confidenceScore": <number 0-100>,
  "professionalismScore": <number 0-100>,
  "technicalScore": <number 0-100>,
  "bodyLanguageScore": <number 0-100>,
  "eyeContactScore": <number 0-100>,
  "strengths": [<3-5 candidate key visual and verbal strengths>],
  "weaknesses": [<2-4 improvement areas>],
  "topImprovements": [<5 priority actionable recommendations for future video interviews>],
  "recruiterSummary": "<detailed executive summary for hiring committee>",
  "hiringRecommendation": "<Strong Yes | Yes | Conditional | No>",
  "readyForHire": <boolean true or false>
}}
"""
