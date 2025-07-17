from pydantic import BaseModel, Field, EmailStr, HttpUrl
from typing import Optional, List
from datetime import datetime
from beanie import Document
from enum import Enum


# ----------- Enums -----------
class CustomerStatus(str, Enum):
    active = "active"
    inactive = "inactive"


# ----------- Sub-Schemas -----------
class Location(BaseModel):
    address: Optional[str] = None
    city: Optional[str] = None
    state: Optional[str] = None
    zipCode: Optional[str] = None
    country: Optional[str] = None  # NEW


class ContactInfo(BaseModel):
    phone: Optional[str] = None
    email: Optional[EmailStr] = None
    website: Optional[HttpUrl] = None  # Validates as proper URL


# ----------- Main Document Model -----------
class Customer(Document):
    name: str
    industry: Optional[str] = Field(default="Other")
    industryColorClass: Optional[str] = Field(default="default-color-class")
    engagements: Optional[int] = 0
    engagementIds: List[str] = Field(default_factory=list)
    location: Optional[Location] = None
    contactInfo: Optional[ContactInfo] = None
    logo: Optional[str] = None
    status: CustomerStatus = Field(default=CustomerStatus.active)
    description: Optional[str] = None
    createdAt: datetime = Field(default_factory=datetime.utcnow)
    updatedAt: Optional[datetime] = Field(default_factory=datetime.utcnow)

    class Settings:
        name = "customers"
        indexes = ["name", "status", "industry"]
        use_state_management = True

# ----------- Create Schema -----------
class CustomerCreate(BaseModel):
    name: str
    industry: Optional[str] = None
    industryColorClass: Optional[str] = None
    engagements: Optional[int] = 0
    engagementIds: Optional[List[str]] = None
    location: Optional[Location] = None
    contactInfo: Optional[ContactInfo] = None
    logo: Optional[str] = None
    status: CustomerStatus = Field(default=CustomerStatus.active)
    description: Optional[str] = None


# ----------- Update Schema -----------
class CustomerUpdate(BaseModel):
    name: Optional[str] = None
    industry: Optional[str] = None
    industryColorClass: Optional[str] = None
    engagements: Optional[int] = None
    engagementIds: Optional[List[str]] = None
    location: Optional[Location] = None
    contactInfo: Optional[ContactInfo] = None
    logo: Optional[str] = None
    status: Optional[CustomerStatus] = None
    description: Optional[str] = None
