from app.database import db

# List of required collections for the app
REQUIRED_COLLECTIONS = [
    "users",
    "customers",
    "engagements",
    "documents",
    "action_items",
    "emails"
]

async def ensure_collections():
    existing = await db.list_collection_names()
    for coll in REQUIRED_COLLECTIONS:
        if coll not in existing:
            await db.create_collection(coll)

# For manual execution
# Run with: python -m app.init_collections
if __name__ == "__main__":
    import asyncio
    asyncio.run(ensure_collections())
