from fastapi import APIRouter, Depends, HTTPException
from typing import List
from app.models.engagement import EngagementBase, EngagementOut, EngagementUpdate
from app.dependencies import get_db
from bson import ObjectId
from datetime import datetime

router = APIRouter(prefix="/api/engagements", tags=["engagements"])

from fastapi import Query

import logging

@router.get("", response_model=List[EngagementOut])
async def list_engagements(customerId: str = Query(None), db=Depends(get_db)):
    def fix_id(doc):
        if doc and "_id" in doc and not isinstance(doc["_id"], str):
            doc["_id"] = str(doc["_id"])
        return doc
    db_name = getattr(db, 'name', None)
    collection_name = getattr(getattr(db, 'engagements', None), 'name', None)
    if customerId:
        docs = await db.engagements.find({"customerId": customerId}).to_list(100)
        print(f"DEBUG: DB: {db_name}, Collection: {collection_name}, Query: {{'customerId': {customerId}}}, Found: {len(docs)} docs: {docs}")
    else:
        docs = await db.engagements.find().to_list(100)
        print(f"DEBUG: DB: {db_name}, Collection: {collection_name}, Query: ALL, Found: {len(docs)} docs: {docs}")
    enriched = []
    for doc in docs:
        # ensure _id as str
        doc = fix_id(doc)
        # Ensure timestamps are included and properly formatted
        doc["createdAt"] = doc.get("createdAt")
        doc["updatedAt"] = doc.get("updatedAt")
        
        eng_id_str = doc.get("_id")
        if eng_id_str:
            docs_cursor = await db.documents.find({"engagementId": eng_id_str}).to_list(100)
            msa_docs = [d["filePath"] for d in docs_cursor if d.get("fileType") == "msa"]
            sow_docs = [d["filePath"] for d in docs_cursor if d.get("fileType") == "sow"]
            if msa_docs:
                if not doc.get("msa"):
                    doc["msa"] = {"reference": None, "value": None, "startDate": None, "endDate": None, "documents": msa_docs}
                else:
                    doc["msa"]["documents"] = msa_docs
            if sow_docs:
                if not doc.get("sow"):
                    doc["sow"] = {"reference": None, "value": None, "startDate": None, "endDate": None, "documents": sow_docs}
                else:
                    doc["sow"]["documents"] = sow_docs
        enriched.append(doc)
    return enriched

@router.get("/{id}", response_model=EngagementOut)
async def get_engagement(id: str, db=Depends(get_db)):
    def _fix_ids(doc):
        if not doc:
            return doc
        if '_id' in doc and not isinstance(doc['_id'], str):
            doc['_id'] = str(doc['_id'])
        if 'customerId' in doc and not isinstance(doc['customerId'], str):
            doc['customerId'] = str(doc['customerId'])
        return doc

    engagement = await db.engagements.find_one({'_id': ObjectId(id)})
    if not engagement:
        raise HTTPException(status_code=404, detail="Engagement not found")

    # Ensure IDs are serialisable strings in the engagement document
    engagement = _fix_ids(engagement)

    # Fetch associated customer and fix its _id as well
    customer = await db.customers.find_one({'_id': ObjectId(engagement['customerId'])})
    if not customer:
        raise HTTPException(status_code=404, detail="Customer not found for this engagement")
    customer = _fix_ids(customer)

    # Add customer data to the response
    engagement['customer'] = customer
    return engagement

@router.post("", response_model=EngagementOut, status_code=201)
async def create_engagement(engagement: EngagementBase, db=Depends(get_db)):
    data = engagement.dict(by_alias=True)
    # Ensure customerId is always a string
    if "customerId" in data:
        data["customerId"] = str(data["customerId"])
    data["createdAt"] = datetime.utcnow()
    data["updatedAt"] = datetime.utcnow()
    result = await db.engagements.insert_one(data)
    if result.inserted_id:
        data["_id"] = str(result.inserted_id)
        # Update the related customer document: increment engagement count and add reference
        try:
            update_res = await db.customers.update_one(
                {"_id": ObjectId(data["customerId"])},
                {
                    "$inc": {"engagements": 1},
                    "$addToSet": {"engagementIds": str(result.inserted_id)}
                }
            )
            logging.info("Customer update result: matched=%s, modified=%s", update_res.matched_count, update_res.modified_count)
        except Exception as e:
            # Log but don't fail creation if customer update fails
            import logging
            logging.exception("Failed to update customer with engagement reference: %s", e)
        # Persist MSA / SOW document references into documents collection
        import os, datetime as _dt
        async def _persist_docs(doc_paths, doc_type):
            for p in doc_paths:
                if not p:
                    continue
                doc_record = {
                    "engagementId": str(result.inserted_id),
                    "filename": os.path.basename(p),
                    "originalName": os.path.basename(p),
                    "fileType": doc_type,
                    "mimeType": "",  # not available
                    "size": 0,  # unknown
                    "filePath": p,
                    "uploadedBy": "system",
                    "uploadedAt": _dt.datetime.utcnow(),
                }
                await db.documents.insert_one(doc_record)
        if data.get("msa") and data["msa"].get("documents"):
            await _persist_docs(data["msa"]["documents"], "msa")
        if data.get("sow") and data["sow"].get("documents"):
            await _persist_docs(data["sow"]["documents"], "sow")
        return data
    else:
        raise HTTPException(status_code=500, detail="Failed to create engagement")

@router.put("/{id}", response_model=EngagementOut)
async def update_engagement(id: str, engagement: EngagementUpdate, db=Depends(get_db)):
    data = engagement.dict(by_alias=True, exclude_unset=True)
    data["updatedAt"] = datetime.utcnow()
    result = await db.engagements.find_one_and_update(
        {"_id": ObjectId(id)}, {"$set": data}, return_document=True
    )
    if result and isinstance(result.get("_id"), ObjectId):
        result["_id"] = str(result["_id"])
    if not result:
        raise HTTPException(status_code=404, detail="Engagement not found")
    return result

@router.delete("/{id}")
async def delete_engagement(id: str, db=Depends(get_db)):
    # Fetch engagement first to know associated customer
    engagement_doc = await db.engagements.find_one({"_id": ObjectId(id)})
    result = await db.engagements.delete_one({"_id": ObjectId(id)})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Engagement not found")
    # Update customer document to remove reference and decrement count
    try:
        if engagement_doc:
            update_res = await db.customers.update_one(
                {"_id": ObjectId(engagement_doc.get("customerId"))},
                {
                    "$inc": {"engagements": -1},
                    "$pull": {"engagementIds": str(id)}
                }
            )
            logging.info("Customer update result: matched=%s, modified=%s", update_res.matched_count, update_res.modified_count)
    except Exception as e:
        import logging
        logging.exception("Failed to update customer after engagement deletion: %s", e)
    return {"msg": "Deleted"}

@router.get("/search")
async def search_engagements(q: str, db=Depends(get_db)):
    # Placeholder: Use MongoDB text index for search
    return await db.engagements.find({"$text": {"$search": q}}).to_list(100)
