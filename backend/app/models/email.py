from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime
from bson import ObjectId

class Sentiment(BaseModel):
    score: Optional[float]
    classification: Optional[str]
    confidence: Optional[float]

class EmailBase(BaseModel):
    engagementId: str = Field(..., alias="engagementId")
    subject: str
    sender: str
    recipients: List[str]
    content: str
    receivedAt: Optional[datetime]
    source: Optional[str]
    processedAt: Optional[datetime]
    sentiment: Optional[Sentiment]
    extractedActionItems: Optional[List[str]]
    threadId: Optional[str]

class EmailCreate(EmailBase):
    pass

class EmailUpdate(EmailBase):
    pass

class EmailInDB(EmailBase):
    id: Optional[str] = Field(alias="_id")

    class Config:
        allow_population_by_field_name = True
        arbitrary_types_allowed = True
        json_encoders = {ObjectId: str}
