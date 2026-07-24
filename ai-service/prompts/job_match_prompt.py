def get_job_match_prompt(resume_text: str, job_description: str) -> str:
    return f"""
You are an AI Job Matching Specialist and ATS Algorithm Expert.
Compare the Candidate Resume against the Job Description and determine compatibility, keyword alignment, missing skills, and application recommendation.
Return ONLY a raw valid JSON object. No markdown wrapping.

Candidate Resume:
{resume_text}

Job Description:
{job_description}

Return JSON with exact keys:
{{
  "matchScore": <number between 0 and 100>,
  "missingKeywords": [<important job keywords not present in resume>],
  "missingSkills": [<required skills missing in resume>],
  "keywordDensity": {{
    "jobTitleMatch": <boolean>,
    "skillOverlapPercentage": <number>
  }},
  "atsCompatibility": "<High | Medium | Low>",
  "recommendation": "<Yes | No>",
  "explanation": "<detailed summary explaining why the candidate should or should not apply and what to optimize>"
}}
"""
