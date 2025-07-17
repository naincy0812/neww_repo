from fastapi import APIRouter, Query
from typing import List, Dict, Optional

router = APIRouter(prefix="/api/search", tags=["search"])

@router.get("")
def global_search(q: str = Query(...), type: Optional[str] = Query("all")) -> List[Dict]:
    # Placeholder: Perform search on customers and/or engagements
    # Would use MongoDB text indexes in production
    if type == "customers":
        return [{"type": "customer", "name": "Acme Corp", "industry": "Tech"}]
    elif type == "engagements":
        return [{"type": "engagement", "name": "Project X", "status": "active"}]
    else:
        return [
            {"type": "customer", "name": "Acme Corp", "industry": "Tech"},
            {"type": "engagement", "name": "Project X", "status": "active"}
        ]
