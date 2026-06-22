from pydantic_settings import BaseSettings, SettingsConfigDict
from pydantic import field_validator

class Settings(BaseSettings): # Standard convention is plural
    APP_NAME: str = "DigiPanch Backend"
    APP_VERSION: str = "1.0.0"
    ENVIRONMENT: str = "development"

    DATABASE_URL: str
    REDIS_URL: str

    CLERK_SECRET_KEY: str
    CLERK_JWT_ISSUER: str
    GEMINI_API_KEY: str
    DEEPSEEK_API_KEY: str = ""

    IMAGEKIT_PUBLIC_KEY: str
    IMAGEKIT_PRIVATE_KEY: str
    IMAGEKIT_URL_ENDPOINT: str

    RAZORPAY_KEY_ID: str
    RAZORPAY_KEY_SECRET: str

    @field_validator(
        "GEMINI_API_KEY", "DEEPSEEK_API_KEY",
        "CLERK_SECRET_KEY", "IMAGEKIT_PRIVATE_KEY",
        "RAZORPAY_KEY_SECRET",
        mode="before"
    )
    @classmethod
    def strip_whitespace(cls, v):
        return v.strip() if isinstance(v, str) else v

    model_config = SettingsConfigDict(
        env_file=".env",
        extra="ignore"
    )

setting = Settings()