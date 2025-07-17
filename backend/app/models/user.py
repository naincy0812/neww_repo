from pydantic import Field, EmailStr, BaseModel
from typing import Optional, List
from datetime import datetime
from beanie import Document

class User(Document):
    # Azure AD user attributes
    azure_id: str  # Unique Azure AD identifier
    username: str  # Usually the UPN or email in Azure AD
    email: EmailStr
    full_name: Optional[str] = None
    roles: List[str] = Field(default_factory=list)  # Roles from Azure AD claims
    is_active: bool = True
    # Timestamps
    createdAt: datetime = Field(default_factory=datetime.utcnow)
    updatedAt: Optional[datetime] = None
    last_login: Optional[datetime] = None
    
    class Settings:
        name = "users"
        indexes = [
            "azure_id",
            "username",
            "email", 
            "roles"
        ]
        use_state_management = True

# No UserCreate or UserUpdate classes needed as users are managed by Azure AD
