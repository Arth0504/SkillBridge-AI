import os
import re
from typing import Dict, Any, List

def extract_text_from_pdf(file_path: str) -> str:
    extracted_text = ""
    # Try pdfplumber first
    try:
        import pdfplumber
        with pdfplumber.open(file_path) as pdf:
            for page in pdf.pages:
                text = page.extract_text()
                if text:
                    extracted_text += text + "\n"
    except Exception as e:
        print(f"pdfplumber failed: {e}, falling back to PyPDF2")

    if not extracted_text.trim():
        try:
            import PyPDF2
            with open(file_path, "rb") as f:
                reader = PyPDF2.PdfReader(f)
                for page in reader.pages:
                    text = page.extract_text()
                    if text:
                        extracted_text += text + "\n"
        except Exception as e:
            print(f"PyPDF2 failed: {e}")

    return extracted_text.strip()

def extract_text_from_docx(file_path: str) -> str:
    try:
        import docx
        doc = docx.Document(file_path)
        full_text = []
        for para in doc.paragraphs:
            if para.text:
                full_text.append(para.text)
        return "\n".join(full_text).strip()
    except Exception as e:
        print(f"python-docx failed: {e}")
        return ""

def parse_extracted_sections(text: str) -> Dict[str, Any]:
    email_pattern = r'[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+'
    phone_pattern = r'(\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}'

    emails = re.findall(email_pattern, text)
    phones = re.findall(phone_pattern, text)

    email = emails[0] if emails else ""
    phone = phones[0] if isinstance(phones[0], str) else (phones[0][0] if phones else "")

    lines = [line.strip() for line in text.split("\n") if line.strip()]
    name = lines[0] if lines else ""

    # Common tech skills dictionary for regex matching
    common_skills = [
        "python", "javascript", "typescript", "node.js", "react", "mongodb",
        "express", "aws", "docker", "kubernetes", "sql", "git", "html", "css",
        "java", "c++", "go", "fastapi", "rest api", "graphql", "tailwind"
    ]
    found_skills = [s.title() for s in common_skills if re.search(r'\b' + re.escape(s) + r'\b', text, re.IGNORECASE)]

    return {
        "text": text,
        "name": name,
        "email": email,
        "phone": phone,
        "skills": list(set(found_skills)),
        "education": [line for line in lines if any(k in line.lower() for k in ["bachelor", "master", "university", "degree", "bs", "ms"])],
        "experience": [line for line in lines if any(k in line.lower() for k in ["engineer", "developer", "manager", "intern", "experience", "worked"])],
        "projects": [line for line in lines if any(k in line.lower() for k in ["project", "developed", "built", "implemented"])],
        "summary": lines[1] if len(lines) > 1 else "",
    }
