import os
from dotenv import load_dotenv

load_dotenv()

class Settings:
    SERVICE_NAME: str = "SkillBridge AI Service"
    PORT: int = int(os.getenv("AI_SERVICE_PORT", "8000"))
    ENV: str = os.getenv("ENV", "development")
    GEMINI_API_KEY: str = os.getenv("GEMINI_API_KEY", "")
    SHARED_SECRET_KEY: str = os.getenv("AI_SHARED_SECRET", "skillbridge_secret_ai_key_2026")
    MAX_FILE_SIZE_MB: int = 5
    UPLOAD_DIR: str = os.path.abspath(os.path.join(os.path.dirname(__file__), "uploads"))

settings = Settings()

os.makedirs(settings.UPLOAD_DIR, exist_ok=True)
