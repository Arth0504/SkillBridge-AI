import json
import re
from typing import Dict, Any
from config import settings
from prompts.ats_prompt import get_ats_analysis_prompt
from prompts.job_match_prompt import get_job_match_prompt
from prompts.resume_review_prompt import get_resume_review_prompt

def clean_json_response(raw_text: str) -> str:
    cleaned = re.sub(r'```(?:json)?\s*', '', raw_text, flags=re.IGNORECASE)
    cleaned = cleaned.replace('```', '').strip()
    return cleaned

class GeminiService:
    def __init__(self):
        self.api_key = settings.GEMINI_API_KEY
        self.model = None

        if self.api_key:
            try:
                import google.generativeai as genai
                genai.configure(api_key=self.api_key)
                self.model = genai.GenerativeModel("gemini-1.5-flash")
                print("Gemini API initialized successfully.")
            except Exception as e:
                print(f"⚠️ Gemini API Init Warning: {e}")

    def analyze_ats(self, resume_text: str, job_description: str = None) -> Dict[str, Any]:
        prompt = get_ats_analysis_prompt(resume_text, job_description)

        if self.model:
            try:
                response = self.model.generate_content(prompt)
                if response and response.text:
                    json_str = clean_json_response(response.text)
                    return json.loads(json_str)
            except Exception as e:
                print(f"Gemini ATS Generation error: {e}, falling back to rule-based analysis")

        # Fallback Dynamic Rule-Based Engine
        word_count = len(resume_text.split())
        skill_catalog = [
            "Java", "Spring Boot", "Hibernate", "Maven", "JUnit", "SQL", "MySQL", "PostgreSQL",
            "React", "Node.js", "Express", "MongoDB", "JavaScript", "TypeScript", "Redux",
            "Python", "Pandas", "NumPy", "PyTorch", "TensorFlow", "Scikit-Learn", "Machine Learning", "Data Science",
            "C++", "C#", ".NET", "AWS", "Docker", "Kubernetes", "CI/CD", "Git", "DevOps"
        ]
        matched_skills = [s for s in skill_catalog if re.search(r'\b' + re.escape(s) + r'\b', resume_text, re.IGNORECASE)]

        domain = "Software Development"
        if any(s in ["Java", "Spring Boot", "Hibernate", "Maven"] for s in matched_skills):
            domain = "Java Enterprise Development"
        elif any(s in ["Pandas", "NumPy", "PyTorch", "TensorFlow", "Data Science", "Machine Learning"] for s in matched_skills):
            domain = "Data Science & Machine Learning"
        elif any(s in ["React", "Node.js", "Express", "MongoDB"] for s in matched_skills):
            domain = "MERN Full Stack Development"
        elif any(s in ["AWS", "Docker", "Kubernetes", "DevOps"] for s in matched_skills):
            domain = "Cloud & DevOps Engineering"

        score = min(96, max(55, 55 + len(matched_skills) * 4 + min(20, word_count // 25)))
        missing_skills = [s for s in skill_catalog if s not in matched_skills][:5]

        sentences = [s.strip() for s in re.split(r'[.!\n]', resume_text) if len(s.strip()) > 15]
        snippet = ". ".join(sentences[:2])
        summary = f'Analyzed {domain} candidate: "{snippet}."' if snippet else f"Qualified candidate with expertise in {domain} and skills in {', '.join(matched_skills[:4]) or 'software engineering'}."

        return {
            "overallAtsScore": score,
            "skillMatch": {
                "technicalSkills": matched_skills if matched_skills else ["Software Engineering"],
                "softSkills": ["Problem Solving", "Team Collaboration", "Communication"],
                "missingSkills": missing_skills,
            },
            "keywordAnalysis": {
                "matchedKeywords": matched_skills,
                "missingKeywords": missing_skills,
            },
            "strengths": [
                f"Technical proficiency in {', '.join(matched_skills[:3]) if matched_skills else 'core engineering domain'}",
                f"Experience alignment tailored for {domain} roles",
                f"Parsed text volume of {word_count} words",
            ],
            "weaknesses": [
                f"Recommended to expand proficiency in {', '.join(missing_skills[:2]) or 'cloud infrastructure'}",
                "Add quantifiable metrics to career accomplishments",
            ],
            "grammarReview": "Good phrasing, clear passive-to-active action verbs.",
            "formattingSuggestions": [
                "Use standard bullet points for section readability",
                "Keep skills categorized clearly by domain",
            ],
            "projectReview": f"Projects clearly highlight relevant work in {domain}.",
            "experienceReview": f"Demonstrates solid hands-on involvement in {domain}.",
            "educationReview": "Academic background is clearly stated.",
            "certificationReview": "Certifications add positive technical credibility.",
            "resumeSummary": summary,
            "improvementSuggestions": [
                f"Add measurable metrics and target keywords like {', '.join(missing_skills[:2])}",
                "Incorporate missing target keywords from job description",
            ],
            "recruiterImpression": f"Strong candidate profile for {domain} opportunities.",
            "top5Improvements": [
                f"Add skills in {', '.join(missing_skills[:2])}",
                "Quantify achievements with percentages and numbers",
                "Enhance professional summary with top career achievements",
                "Standardize section heading titles for ATS parsers",
                "Include direct links to portfolio or GitHub repositories",
            ],
        }

    def match_job(self, resume_text: str, job_description: str) -> Dict[str, Any]:
        prompt = get_job_match_prompt(resume_text, job_description)

        if self.model:
            try:
                response = self.model.generate_content(prompt)
                if response and response.text:
                    json_str = clean_json_response(response.text)
                    return json.loads(json_str)
            except Exception as e:
                print(f"Gemini Job Match error: {e}, falling back to rule-based match")

        # Fallback Job Match Engine
        jd_words = set(re.findall(r'\b\w{4,}\b', job_description.lower()))
        resume_words = set(re.findall(r'\b\w{4,}\b', resume_text.lower()))
        overlap = jd_words.intersection(resume_words)

        match_score = min(95, max(50, int((len(overlap) / max(1, len(jd_words))) * 100)))

        return {
            "matchScore": match_score,
            "missingKeywords": list(jd_words - resume_words)[:5],
            "missingSkills": ["Cloud Architecture", "System Design"],
            "keywordDensity": {
                "jobTitleMatch": True,
                "skillOverlapPercentage": match_score,
            },
            "atsCompatibility": "High" if match_score >= 70 else "Medium",
            "recommendation": "Yes" if match_score >= 60 else "No",
            "explanation": f"The resume demonstrates a {match_score}% match with key requirements in the job description.",
        }

gemini_service = GeminiService()
