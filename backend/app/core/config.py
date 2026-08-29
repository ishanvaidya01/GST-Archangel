from pydantic_settings import BaseSettings, SettingsConfigDict
from pydantic import model_validator
from typing_extensions import Self

class Settings(BaseSettings):
    DATABASE_URL: str
    REDIS_URL: str
    JWT_SECRET: str
    ENV: str = "development"
    MATCH_CONFIDENCE_THRESHOLD: int = 80
    DEMO_MODE: bool = False

    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")
    
    @model_validator(mode='after')
    def validate_production_jwt(self) -> Self:
        if self.ENV == "production" and (not self.JWT_SECRET or self.JWT_SECRET == "your-super-secret-jwt-key"):
            raise ValueError("In production, JWT_SECRET must be set to a secure value.")
        return self

settings = Settings()
