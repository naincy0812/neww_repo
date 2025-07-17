from motor.motor_asyncio import AsyncIOMotorClient
from beanie import init_beanie
from app.models.user import User
from app.models.customer import Customer
from app.models.engagement import EngagementInDB as Engagement
from app.models.document import DocumentInDB as Document
from app.config import settings
from typing import Optional

client: Optional[AsyncIOMotorClient] = None
db = None

async def init_db():
    global client, db
    client = AsyncIOMotorClient(settings.MONGODB_URL)
    # Always connect to the explicit database name from Settings to avoid inconsistencies
    db = client[settings.DB_NAME]
    await init_beanie(
        database=db,
        document_models=[
            User,
            Customer,
            Engagement,
            Document,
        ]
    )
    print(f"Connected to MongoDB database: {db.name}")
