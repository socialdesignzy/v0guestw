# Rooms Management Endpoints
# This file contains all room-related API endpoints

from fastapi import HTTPException, Depends
from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime, timezone
import uuid

class Room(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    contractor_id: str
    name: str
    key_number: Optional[str] = None
    max_occupants: Optional[int] = None
    member_count: int = 0
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class RoomCreate(BaseModel):
    name: str
    key_number: Optional[str] = None
    max_occupants: Optional[int] = None

class RoomUpdate(BaseModel):
    name: Optional[str] = None
    key_number: Optional[str] = None
    max_occupants: Optional[int] = None
