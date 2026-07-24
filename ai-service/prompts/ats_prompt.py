def get_ats_analysis_prompt(resume_text: str, job_description: str = None) -> str:
    jd_context = f"\nTarget Job Description:\n{job_description}" if job_description else ""
    
    return f"""
You are an expert AI ATS (Applicant Tracking System) Analyzer and Senior Executive Technical Recruiter.
Analyze the following resume text thoroughly and output ONLY a valid JSON object matching the required structure exactly. Do not include markdown codeblocks, commentary, or text outside the JSON.

Resume Content:
{resume_text}
{jd_context}

Return JSON with exact keys:
{{
  "overallAtsScore": <number between 0 and 100>,
  "skillMatch": {{
    "technicalSkills": [<extracted technical skills>],
    "softSkills": [<extracted soft skills>],
    "missingSkills": [<important missing skills for ATS>]
  }},
  "keywordAnalysis": {{
    "matchedKeywords": [<keywords found>],
    "missingKeywords": [<recommended keywords to add>]
  }},
  "strengths": [<3-5 key strengths>],
  "weaknesses": [<2-4 weaknesses or gaps>],
  "grammarReview": "<grammar and phrasing analysis>",
  "formattingSuggestions": [<2-4 formatting improvements>],
  "projectReview": "<feedback on project highlights>",
  "experienceReview": "<feedback on work experience impact>",
  "educationReview": "<feedback on education & academic relevance>",
  "certificationReview": "<feedback on certifications>",
  "resumeSummary": "<concise professional summary of candidate>",
  "improvementSuggestions": [<actionable suggestions>],
  "recruiterImpression": "<first impression from a top recruiter>",
  "top5Improvements": [<5 highest-priority changes to increase interview call chances>]
}}
"""
