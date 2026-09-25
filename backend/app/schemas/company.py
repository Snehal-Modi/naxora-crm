"""Company and Contact DTO schemas."""

import uuid
from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel, ConfigDict, EmailStr


class ContactBase(BaseModel):
    first_name: str
    last_name: Optional[str] = None
    designation: Optional[str] = None
    email: Optional[EmailStr] = None
    phone: Optional[str] = None
    whatsapp_number: Optional[str] = None
    is_primary: bool = False


class ContactCreate(ContactBase):
    company_id: Optional[uuid.UUID] = None


class ContactUpdate(BaseModel):
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    designation: Optional[str] = None
    email: Optional[EmailStr] = None
    phone: Optional[str] = None
    whatsapp_number: Optional[str] = None
    is_primary: Optional[bool] = None


class ContactRead(ContactBase):
    id: uuid.UUID
    company_id: uuid.UUID
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


class CompanyBase(BaseModel):
    name: str
    industry: Optional[str] = None
    website: Optional[str] = None
    email: Optional[EmailStr] = None
    phone: Optional[str] = None
    address: Optional[str] = None
    city: Optional[str] = None
    state: Optional[str] = None
    country: str = "India"
    company_size: Optional[str] = None
    status: str = "prospect"  # prospect, active_client, inactive
    source: str = "manual"
    assigned_staff_id: Optional[uuid.UUID] = None
    notes: Optional[str] = None


class CompanyCreate(CompanyBase):
    pass


class CompanyUpdate(BaseModel):
    name: Optional[str] = None
    industry: Optional[str] = None
    website: Optional[str] = None
    email: Optional[EmailStr] = None
    phone: Optional[str] = None
    address: Optional[str] = None
    city: Optional[str] = None
    state: Optional[str] = None
    country: Optional[str] = None
    company_size: Optional[str] = None
    status: Optional[str] = None
    source: Optional[str] = None
    assigned_staff_id: Optional[uuid.UUID] = None
    notes: Optional[str] = None


class StaffSummary(BaseModel):
    id: uuid.UUID
    first_name: str
    last_name: str
    email: str

    model_config = ConfigDict(from_attributes=True)


class CompanyRead(CompanyBase):
    id: uuid.UUID
    created_at: datetime
    updated_at: datetime
    assigned_staff: Optional[StaffSummary] = None
    contacts: List[ContactRead] = []

    model_config = ConfigDict(from_attributes=True)

