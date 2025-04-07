from pydantic import BaseModel, EmailStr
from typing import List, Optional
from datetime import datetime
from enum import Enum

class TaskStatus(Enum):
    PENDING = 'pending'
    COMPLETED = 'completed'

class TaskBase(BaseModel):
    title: str
    description: Optional[str] = None

class TaskCreate(TaskBase):
    pass

class TaskUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    status: TaskStatus

    class ConfigDict:
        use_enum_values = True

class Task(TaskBase):
    id: int
    created_at: datetime
    completed_at: Optional[datetime] = None
    status: TaskStatus
    owner_id: int

    class ConfigDict:
        from_attributes = True

class UserBase(BaseModel):
    name: str
    email: EmailStr

class UserCreate(UserBase):
    password: str

class User(UserBase):
    id: int
    is_active: bool
    tasks: List[Task] = []

    class ConfigDict:
        form_attributes = True

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class Token(BaseModel):
    access_token: str
    token_type: str