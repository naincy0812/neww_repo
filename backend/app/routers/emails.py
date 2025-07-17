from fastapi import APIRouter, Depends, HTTPException
from typing import List
from app.models.email import EmailBase
from app.dependencies import get_db
from bson import ObjectId
from datetime import datetime

router = APIRouter(prefix="/api/emails", tags=["emails"])

@router.get("", response_model=List[EmailBase])
async def list_emails(db=Depends(get_db)):
    return await db.emails.find().to_list(100)

@router.get("/{id}", response_model=EmailBase)
async def get_email(id: str, db=Depends(get_db)):
    email = await db.emails.find_one({"_id": ObjectId(id)})
    if not email:
        raise HTTPException(status_code=404, detail="Email not found")
    return email

@router.post("", response_model=EmailBase)
async def create_email(email: EmailBase, db=Depends(get_db)):
    data = email.dict(by_alias=True)
    data["receivedAt"] = datetime.utcnow()
    result = await db.emails.insert_one(data)
    data["_id"] = str(result.inserted_id)
    return data
