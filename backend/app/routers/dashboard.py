from fastapi import APIRouter
from typing import List, Dict

router = APIRouter(prefix="/api/dashboard", tags=["dashboard"])

@router.get("/kpis")
def get_kpis() -> Dict:
    # Placeholder: Return dashboard KPI metrics
    return {
        "total_customers": 42,
        "active_engagements": 12,
        "overdue_action_items": 5,
        "documents_processed_this_month": 20
    }

@router.get("/recent-activity")
def get_recent_activity() -> List[Dict]:
    # Placeholder: Return recent activity feed
    return [
        {"type": "upload", "desc": "Document uploaded", "timestamp": "2025-05-27T12:00:00"},
        {"type": "status_change", "desc": "Engagement status changed", "timestamp": "2025-05-27T11:00:00"}
    ]

@router.get("/at-risk-engagements")
def get_at_risk_engagements() -> List[Dict]:
    # Placeholder: Return list of red status engagements
    return [
        {"engagement_id": "abc123", "name": "Project X", "risk_factors": ["Delayed delivery"]}
    ]

@router.get("/status-distribution")
def get_status_distribution() -> Dict:
    # Placeholder: Return R/Y/G pie chart data
    return {
        "red": 2,
        "yellow": 4,
        "green": 6
    }
