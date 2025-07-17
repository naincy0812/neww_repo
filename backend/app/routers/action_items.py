from fastapi import APIRouter, Depends, HTTPException, status
from typing import List
from app.models.action_item import ActionItemCreate, ActionItemUpdate, ActionItemInDB
from app.dependencies import get_db
from bson import ObjectId
from datetime import datetime

router = APIRouter(prefix="/api", tags=["action_items"])

@router.get("/engagements/{id}/action-items", response_model=List[ActionItemInDB])
async def list_action_items(id: str, db=Depends(get_db)):
    items = await db.action_items.find({"engagementId": id}).to_list(100)
    return items

@router.post("/engagements/{id}/action-items", response_model=ActionItemInDB)
async def create_action_item(id: str, item: ActionItemCreate, db=Depends(get_db)):
    data = item.dict(by_alias=True)
    data["engagementId"] = id
    data["createdAt"] = datetime.utcnow()
    data["updatedAt"] = datetime.utcnow()
    result = await db.action_items.insert_one(data)
    data["_id"] = str(result.inserted_id)
    return data

@router.put("/action-items/{id}", response_model=ActionItemInDB)
async def update_action_item(id: str, item: ActionItemUpdate, db=Depends(get_db)):
    data = item.dict(by_alias=True, exclude_unset=True)
    data["updatedAt"] = datetime.utcnow()
    result = await db.action_items.find_one_and_update(
        {"_id": ObjectId(id)}, {"$set": data}, return_document=True
    )
    if not result:
        raise HTTPException(status_code=404, detail="Action item not found")
    return result

@router.delete("/action-items/{id}")
async def delete_action_item(id: str, db=Depends(get_db)):
    result = await db.action_items.delete_one({"_id": ObjectId(id)})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Action item not found")
    return {"msg": "Deleted"}

@router.post("/action-items/external", response_model=ActionItemInDB)
async def create_external_action_item(item: ActionItemCreate, db=Depends(get_db)):
    data = item.dict(by_alias=True)
    data["source"] = "external_system"
    data["createdAt"] = datetime.utcnow()
    data["updatedAt"] = datetime.utcnow()
    result = await db.action_items.insert_one(data)
    data["_id"] = str(result.inserted_id)
    return data

@router.post("/action-items/extract-from-email", response_model=List[ActionItemInDB])
async def extract_action_items_from_email(email_id: str, db=Depends(get_db)):
    # Placeholder: AI extraction logic should go here
    # For now, just return an empty list
    return []
