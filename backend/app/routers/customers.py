from fastapi import APIRouter, HTTPException
from typing import List, Optional
from app.models.customer import Customer, CustomerCreate, CustomerUpdate, CustomerStatus
from beanie import PydanticObjectId

router = APIRouter(prefix="/api/customers", tags=["customers"])

@router.get("", response_model=List[Customer])
async def list_customers():
    return await Customer.find_all().to_list()

@router.post("", response_model=Customer)
async def create_customer(customer_data: CustomerCreate):
    new_customer = Customer(**customer_data.dict(exclude_none=True))
    await new_customer.insert()
    return new_customer

@router.get("/search", response_model=List[Customer])
async def search_customers(
    query: Optional[str] = None,
    name: Optional[str] = None,
    phone: Optional[str] = None,
    address: Optional[str] = None,
    city: Optional[str] = None,
    state: Optional[str] = None,
    country: Optional[str] = None,
    status: Optional[CustomerStatus] = None,
    industry: Optional[str] = None,
    industryColorClass: Optional[str] = None,
    engagements: Optional[int] = None,
):
    """Flexible customer search supporting multiple optional filters. If no filters
    are provided, all customers will be returned.
    """

    search_filter: dict = {}

    # Location filters
    location_filters = []
    if city:
        location_filters.append({"location.city": {"$regex": city, "$options": "i"}})
    if state:
        location_filters.append({"location.state": {"$regex": state, "$options": "i"}})
    if country:
        location_filters.append({"location.country": {"$regex": country, "$options": "i"}})
    if location_filters:
        search_filter["$and"] = location_filters

    # Status filter
    if status:
        search_filter["status"] = status

    # Industry filter
    if industry:
        search_filter["industry"] = industry

    # Generic query search across multiple fields
    if query:
        regex = {"$regex": query, "$options": "i"}
        search_filter["$or"] = [
            {"name": regex},
            {"contactInfo.phone": regex},
            {"contactInfo.email": regex},
            {"contactInfo.website": regex},
            {"location.address": regex},
            {"description": regex}
        ]

    # Additional filters
    if name:
        search_filter["name"] = {"$regex": name, "$options": "i"}
    if phone:
        search_filter["contactInfo.phone"] = {"$regex": phone, "$options": "i"}
    if address:
        search_filter["location.address"] = {"$regex": address, "$options": "i"}
    if industryColorClass:
        search_filter["industryColorClass"] = industryColorClass
    if engagements is not None:
        try:
            search_filter["engagements"] = int(engagements)
        except (TypeError, ValueError):
            pass  # ignore invalid engagement values

    return await Customer.find(search_filter).to_list()

@router.get("/autocomplete/names", response_model=List[str])
async def autocomplete_names(prefix: str):
    if not prefix:
        raise HTTPException(status_code=400, detail="Prefix required")

    regex = {"$regex": f"^{prefix}", "$options": "i"}
    # Beanie distinct aggregation to fetch unique names only
    names_cursor = Customer.find({"name": regex}).project({"name": 1})
    names = [c.name async for c in names_cursor]
    # remove duplicates while preserving order
    seen = set()
    unique_names: List[str] = []
    for n in names:
        if n not in seen:
            seen.add(n)
            unique_names.append(n)
    return unique_names

@router.get("/{id}", response_model=Customer)
async def get_customer(id: PydanticObjectId):
    customer = await Customer.get(id)
    if not customer:
        raise HTTPException(status_code=404, detail="Customer not found")
    return customer

@router.put("/{id}", response_model=Customer)
async def update_customer(id: PydanticObjectId, customer_update: CustomerUpdate):
    customer = await Customer.get(id)
    if not customer:
        raise HTTPException(status_code=404, detail="Customer not found")
    update_data = customer_update.dict(exclude_unset=True)
    await customer.set(update_data)
    return customer

@router.delete("/{id}")
async def delete_customer(id: PydanticObjectId):
    customer = await Customer.get(id)
    if not customer:
        raise HTTPException(status_code=404, detail="Customer not found")
    await customer.delete()
    return {"message": "Customer deleted successfully"}
