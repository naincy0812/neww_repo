import datetime
from typing import List, Dict
from app.services.document_processor import DocumentProcessor

class EngagementAnalyzer:
    def __init__(self):
        self.processor = DocumentProcessor()

    def compute_ryg_status(self, engagement_id: str) -> str:
        # Simulated engagement text
        text = self.get_all_engagement_text(engagement_id)

        sentiment_result = self.processor.analyze_sentiment(text)
        action_items = self.processor.extract_action_items(text)
        action_item_health = self.assess_action_items_health([
            {"description": item["action"], "due_date": item.get("due_date")}
            for item in action_items
        ])

        sentiment = sentiment_result.get("sentiment", "").lower()
        if "negative" in sentiment or action_item_health["status"] == "at risk":
            return "red"
        elif "neutral" in sentiment:
            return "yellow"
        else:
            return "green"

    def analyze_email_sentiment(self, emails: List[str]) -> dict:
        combined_text = "\n".join(emails)
        return self.processor.analyze_sentiment(combined_text)

    def assess_action_items_health(self, action_items: List[dict]) -> dict:
        today = datetime.date.today()
        overdue = [item for item in action_items if item.get("due_date") and item["due_date"] < today]
        return {
            "total": len(action_items),
            "overdue": len(overdue),
            "status": "healthy" if not overdue else "at risk"
        }

    def get_all_engagement_text(self, engagement_id: str) -> str:
        # Placeholder: You can replace this with database/file system fetching
        documents = ["project_plan.pdf", "meeting_notes.docx"]
        emails = [
            "Customer is concerned about the delivery timeline.",
            "They are satisfied with the recent progress."
        ]
        processor = DocumentProcessor()
        doc_texts = [processor.extract_text(doc) for doc in documents]
        email_text = "\n".join(emails)
        return "\n".join(doc_texts + [email_text])
