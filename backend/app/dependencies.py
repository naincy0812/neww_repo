from fastapi import Depends
from app.config import settings
from motor.motor_asyncio import AsyncIOMotorClient

def get_db():
    client = AsyncIOMotorClient(settings.MONGODB_URL)
    return client[settings.DB_NAME]

def get_settings():
    return settings
