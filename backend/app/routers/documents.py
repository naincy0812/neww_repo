from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Query
from fastapi.responses import FileResponse
from typing import List
from app.models.document import DocumentModel
from app.models.engagement import EngagementModel
from app.services.document_processor import DocumentProcessor
from app.services.ai_processor import EngagementAnalyzer
from app.dependencies import get_db, get_settings
from bson import ObjectId
from datetime import datetime
import os

router = APIRouter(prefix="/api/documents", tags=["documents"])
processor = DocumentProcessor()
analyzer = EngagementAnalyzer()

@router.get("", response_model=List[DocumentModel])
async def list_documents(db=Depends(get_db)):
    return await db.documents.find().to_list(100)

@router.get("/{id}", response_model=DocumentModel)
async def get_document(id: str, db=Depends(get_db)):
    doc = await db.documents.find_one({"_id": ObjectId(id)})
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")
    return doc

@router.post("/upload", response_model=DocumentModel)
async def upload_document(
    engagementId: str = Query(...),
    file: UploadFile = File(...),
    fileType: str = Query("other"),
    settings=Depends(get_settings),
    db = Depends(get_db)
):
    upload_dir = settings.UPLOAD_DIR
    os.makedirs(upload_dir, exist_ok=True)
    file_path = os.path.join(upload_dir, file.filename)
    with open(file_path, "wb") as f:
        content = await file.read()
        f.write(content)
    # Create Beanie document instance
    doc = DocumentModel(
        engagementId=ObjectId(engagementId),
        filename=file.filename,
        originalName=file.filename,
        fileType=fileType,
        mimeType=file.content_type,
        size=len(content),
        filePath=file_path,
        uploadedBy="system",
        uploadedAt=datetime.utcnow(),
    )
    await doc.insert()

    # If document is of type msa or sow, embed its path into engagement doc
    if fileType in {"msa", "sow"}:
        default_struct = {
            "reference": None,
            "value": None,
            "startDate": None,
            "endDate": None,
            "documents": []
        }
        # 1) ensure msa/sow object exists and is an object (not null)
        await db.engagements.update_one(
            {
                "_id": ObjectId(engagementId),
                "$or": [
                    {fileType: {"$exists": False}},
                    {fileType: None}
                ]
            },
            {"$set": {fileType: default_struct}}
        )
        # 2) push file path
        await db.engagements.update_one(
            {"_id": ObjectId(engagementId)},
            {"$addToSet": {f"{fileType}.documents": file_path}}
        )

    return doc

@router.get("/engagements/{id}/documents", response_model=List[DocumentModel])
async def list_documents_for_engagement(id: str, db=Depends(get_db)):
    return await db.documents.find({"engagementId": ObjectId(id)}).to_list(100)

@router.get("/{id}/download")
async def download_document(id: str, db=Depends(get_db)):
    doc = await db.documents.find_one({"_id": ObjectId(id)})
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")
    file_path = doc['filePath']
    return FileResponse(file_path, media_type=doc['mimeType'], filename=doc['filename'])

@router.delete("/{id}")
async def delete_document(id: str, db=Depends(get_db)):
    doc = await db.documents.find_one({"_id": ObjectId(id)})
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")
    os.remove(doc['filePath'])
    await db.documents.delete_one({"_id": ObjectId(id)})
    return {"msg": "Deleted"}

@router.post("/{id}/process")
async def process_document(id: str, db=Depends(get_db)):
    doc = await db.documents.find_one({"_id": ObjectId(id)})
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")

    # Step 1: Extract and analyze content
    text = processor.extract_text(doc['filePath'])
    sentiment = processor.analyze_sentiment(text)
    action_items = processor.extract_action_items(text)

    # Step 2: Save AI results in document
    ai_data = {
        "text_content": text,
        "sentiment": sentiment.get("sentiment"),
        "action_items": action_items,
        "key_metrics": {}
    }
    await db.documents.update_one(
        {"_id": ObjectId(id)},
        {"$set": {"aiExtracted": ai_data, "processedAt": datetime.utcnow()}}
    )

    # Step 3: Update engagement with AI insights
    engagement = await db.engagements.find_one({"_id": doc['engagementId']})
    ryg_status = None
    if engagement:
        ryg_status = analyzer.compute_ryg_status(str(engagement['_id']))
        ai_insights = {
            "sentiment_score": sentiment.get("score", 0),
            "key_topics": [],  # Can be filled via GPT if needed
            "risk_factors": []  # Can be filled via GPT if needed
        }
        await db.engagements.update_one(
            {"_id": engagement['_id']},
            {
                "$set": {
                    "ryg_status": ryg_status,
                    "aiInsights": ai_insights,
                    "lastAiAnalysis": datetime.utcnow()
                }
            }
        )

    # Step 4: Return response
    return {
        "msg": "Document processed",
        "sentiment": sentiment,
        "action_items": action_items,
        "ryg_status": ryg_status
    }
