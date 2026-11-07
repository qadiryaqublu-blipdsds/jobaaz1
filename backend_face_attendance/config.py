import os
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    APP_NAME: str = "Jobia Biometric Face Attendance API"
    ENVIRONMENT: str = os.getenv("ENVIRONMENT", "production")
    DEBUG: bool = os.getenv("DEBUG", "False").lower() == "true"
    
    # PostgreSQL Connection
    DATABASE_URL: str = os.getenv(
        "DATABASE_URL", 
        "postgresql://jobia_user:secure_face_pass_2025@localhost:5432/jobia_attendance"
    )
    
    # Security & Cryptography (AES-256 GCM)
    # Master key for biometric embedding encryption (32 bytes base64 or hex)
    AES_MASTER_KEY_HEX: str = os.getenv(
        "AES_MASTER_KEY_HEX", 
        "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855"
    )
    JWT_SECRET_KEY: str = os.getenv("JWT_SECRET_KEY", "super_secret_jwt_face_attendance_key_2025")
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_HOURS: int = 12
    
    # Attendance & Biometric Thresholds
    SIMILARITY_THRESHOLD_VERIFIED: float = 0.72  # 72%+ cosine similarity verified
    SIMILARITY_THRESHOLD_SUSPICIOUS: float = 0.65  # 65-72% flagged as suspicious
    DUPLICATE_INTERVAL_MINUTES: int = 2
    GEOFENCE_DEFAULT_RADIUS_METERS: int = 200
    OFFLINE_RETENTION_MAX_HOURS: int = 24
    
    # Audit thumbnail retention days (AR Personal Data Law)
    AUDIT_THUMBNAIL_RETENTION_DAYS: int = 30

    class Config:
        env_file = ".env"

settings = Settings()
