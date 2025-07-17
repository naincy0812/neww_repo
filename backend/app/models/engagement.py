from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime
from bson import ObjectId
from beanie import Document
 
class MSABasodel):
    reference: Opti
    
    endDate: Optional[datetime] = None
    documents: Optional[List[str]] = None
 
class SOW(BaseModel):
    reference: Optional[str] = None
    value: Optional[float] = None
    startDate: Optional[datetime] = None
    endDate: Optional[datetime] = None
    documents: Optional[List[str]] = None
 
class AIInsights(BaseModel):
    sentiment_score: Optional[float]
    key_topics: Optional[List[str]]
    risk_factors: Optional[List[str]]
 
class EngagementBase(BaseModel):
    customerId: str = Field(..., alias="customerId")
    name: str
    type: Optional[str] = Field(default="Other")
    typeColorClass: Optional[str] = Field(default="default-type-color")
    status: Optional[str] = Field(default="active")
    ryg_status: Optional[str] = Field(default="Green")
    msa: Optional[MSA] = Field(None, alias="msa")
    sow: Optional[SOW] = Field(None, alias="sow")
    description: Optional[str] = None
 
class EngagementCreate(EngagementBase):
    pass
 
class EngagementUpdate(BaseModel):
    customerId: Optional[str] = Field(None, alias="customerId")
    name: Optional[str] = None
    type: ] = None
    status: Optional[str] = None
    ryg_status: Optional[str] = None
    msa: Optional[MSA] = Field(None, alias="msa")
    sow: Optional[SOW] = Field(None, alias="sow")
    description: Optional[str] = None
 
class EngagementOut(EngagementBase):
    id: str = Field(..., alias="_id")
    createdAt: Optional[datetime]
    updatedAt: Optional[datetime]

class EngagementIias="customerId")
    name: str
    type: Optional[str] = None
    typeColorClass: Optional[str] = None
    status: Optional[str] = None
    ryg_status: Optional[str] = None
    msa: Optional[dict] = Field(None, alias="msa")
    sow: Optional[dict] = Field(None, alias="sow")
    description: Optional[str] = None
    createdAt: Optional[datetime]
    updatedAt: Optional[datetime]
    lastAiAnalysis: Optional[datetime]
    aiInsights: Optional[dict]
 
    class Config:
        json_encoders = {ObjectId: str}
        allow_population_by_field_name = True

# Alias for backward compatibility
class EngagementModel(EngagementInDB):
    """Alias for EngagementInDB for backward compatibility."""
    pass