from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any
from datetime import datetime
from bson import ObjectId
from beanie import Document

classExtrated(BaseModel):
    text_content: Optional[str]
    action_items: Optional[List[Dict[str, Any]]]
    sentiment: Optional[str]
    key_metrics: Optional[Dict[str, Any]]

class DocumentBaseseModel):
    # Pydantic v2 config
    model_config = {
        "populate_by_name": True,
        "arbitrary_types_allowed": True,
        "json_encoders": {ObjectId: str},
    }
    engagementId: ObjectId = Field(..., alias="engagementId")
    filename: str
    originalName: str
    fileType: str
    mimeType: str
    size: int
    filePath: str
    uploadedBy: str
    uploadedAt: Optional[datetime] = None
    processedAt: Optional[datetime] = None
    aiExtracted: Optional[AIExtracted] = None

class DocumentCreate(DocumentBase):
    pass

class DocumentUpdate(DocumentBase):
    pass

class DocumentInDB(Document, DocumentBase):
    id: Optional[ObjectId] = Field(default_factory=ObjectId, alias="_id")

    model_config = {
        "populate_by_name": True,
        "arbitrary_types_allowed": True,
        "json_encoders": {ObjectId: str},
    }

# Alias for backward compatibility
class DocumentModel(DocumentInDB):
    """Alias for DocumentInDB for backward compatibility."""
    pass


