from fastapi import FastAPI, status, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from app.routers import auth, customers, engagements, documents, action_items, dashboard, search, emails
from app.database import init_db
from beanie import PydanticObjectId
from motor.motor_asyncio import AsyncIOMotorClient
from app.config import settings

app = FastAPI()

t:
    return {"message": "Welcome to AppHelix Dashboard API!"}

# Initialize Beanie on startup
@app.on_event("startup")
async def startup_db_client():
    await init_db()

@app.get("/health")
async def health_check():
    try:
        # Create a temporary client to ping the database
        client = AsyncIOMotorClient(settings.MONGODB_URL)
        await client.admin.command("ping")
        return {"status": "ok", "mongo": "connected"}
    except Exception as e:
        return JSONResponse(status_code=status.HTTP_503_SERVICE_UNAVAILABLE, content={"status": "error", "mongo": str(e)})

origins = [
    "http://localhost:3000",
    "http://127.0.0.1:3000"
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(customers.router)
app.include_router(engagements.router)
app.include_router(documents.router)
app.include_router(action_items.router)
app.include_router(dashboard.router)
app.include_router(search.router)
app.include_router(emails.router)

