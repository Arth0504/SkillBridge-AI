def get_resume_review_prompt(resume_text: str) -> str:
    return f"""
You are an Executive Career Coach and Technical Resume Reviewer.
Analyze the following resume and extract core structured candidate data (name, email, phone, skills, education, experience, projects, certificates, summary).
Return ONLY a raw valid JSON object.

Resume Text:
{resume_text}

Return JSON with exact keys:
{{
  "name": "<candidate name>",
  "email": "<candidate email>",
  "phone": "<candidate phone>",
  "skills": [<list of key skills>],
  "education": [<education entries>],
  "experience": [<experience entries>],
  "projects": [<project entries>],
  "certificates": [<certification entries>],
  "summary": "<candidate professional summary>"
}}
"""
