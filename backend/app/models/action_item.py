from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime
from bson import ObjectId

class ActionItemBase(BaseModel):
    engagementId: str = Field(..., alias="engagementId")
    description: str
    owner: Optional[str]
    assignedTo: Optional[str]
    dueDate: Optional[datetime]
    priority: Optional[str]
    status: Optional[str] = Field(default="open")
    source: Optional[str]
    sourceDocument: Optional[str] = Field(default=None, alias="sourceDocument")
    relatedEmails: Optional[List[str]] = Field(default_factory=list)

class ActionItemCreate(ActionItemBase):
    pass

class ActionItemUpdate(ActionItemBase):
    pass

class ActionItemInDB(ActionItemBase):
    id: Optional[str] = Field(alias="_id")
    createdAt: Optional[datetime]
    updatedAt: Optional[datetime]
    ageInDays: Optional[int]

    class Config:
        allow_population_by_field_name = True
        arbitrary_types_allowed = True
        json_encoders = {ObjectId: str}
