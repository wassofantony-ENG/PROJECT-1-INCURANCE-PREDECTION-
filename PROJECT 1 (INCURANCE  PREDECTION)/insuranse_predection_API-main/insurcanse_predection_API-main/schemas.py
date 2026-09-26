from pydantic import BaseModel
from typing import Optional , List , Union
from db.client import Predictions

class ModelInputs(BaseModel):
    age: int
    gender: int
    bmi: float
    bloodpressure: int
    diabetic: int
    children: int
    smoker: int
    region: int


class UserData(BaseModel):
    username: str
    email: str
    password: str

class ModInfo(BaseModel):
    username: Optional[str] = None
    email: Optional[str] = None
    password: Optional[str] = None


class LoginForm(BaseModel):
    email: str
    password: str

class UserResponse(BaseModel):
    id: int
    username: str
    email: str

    class Config:
        from_attributes = True

class PredictionCreate(BaseModel):
    user_id: int
    email: str
    customers_name: str
    age: int
    gender: int
    bmi: float 
    bloodpressure: int
    diabetic: int
    children: int
    smoker: int
    region: int
    AI_Prediction: Optional[int] = None
    isDone: bool = False
    final_cost: Optional[int] = None


class PredictionUpdate(BaseModel):
    email: Optional[str] = None
    customers_name: Optional[str] = None
    age: Optional[int] = None
    gender: Optional[int] = None
    bmi: Optional[int] = None
    bloodpressure: Optional[int] = None
    diabetic: Optional[int] = None
    children: Optional[int] = None
    smoker: Optional[int] = None
    region: Optional[int] = None
    AI_Prediction: Optional[int] = None
    isDone: Optional[bool] = None
    final_cost: Optional[int] = None


class PredictionResponse(BaseModel):
    id: int
    user_id: int
    email: str
    customers_name: str
    age: int
    gender: int
    bmi: float 
    bloodpressure: int
    diabetic: int
    children: int
    smoker: int
    region: int
    AI_Prediction: Optional[int]
    isDone: bool
    final_cost: Optional[int]

    class Config:
        from_attributes = True


class CostByAgeGroup(BaseModel):
    group: str
    avg_cost: float
    count: int

class CostByRegion(BaseModel):
    region: int
    avg_cost: float
    count: int

class SmokerBreakdown(BaseModel):
    label: str
    count: int
    avg_cost: float

class GenderBreakdown(BaseModel):
    label: str
    count: int
    avg_cost: float

class DiabeticBreakdown(BaseModel):
    label: str
    count: int
    avg_cost: float

class ChildrenBreakdown(BaseModel):
    children: Union[int, str]
    count: int
    avg_cost: float

class BmiDistribution(BaseModel):
    range: str
    count: int
    avg_cost: float

class PredictionVsActual(BaseModel):
    predicted: float
    actual: float

class BloodPressureRisk(BaseModel):
    range: str
    count: int
    avg_cost: float

class ChartsResponse(BaseModel):
    costByAgeGroup: List[CostByAgeGroup]
    costByRegion: List[CostByRegion]
    smokerBreakdown: List[SmokerBreakdown]
    genderBreakdown: List[GenderBreakdown]
    diabeticBreakdown: List[DiabeticBreakdown]
    childrenBreakdown: List[ChildrenBreakdown]
    bmiDistribution: List[BmiDistribution]
    predictionVsActual: List[PredictionVsActual]
    bloodPressureRisk: List[BloodPressureRisk]

class Analysis_response(BaseModel):
    avg_cost:float
    avg_age:int
    avg_AI_pred:float
    clients_num:int
    final_value_set:int

class Analysis_requset(BaseModel):
    data: List[PredictionCreate]
