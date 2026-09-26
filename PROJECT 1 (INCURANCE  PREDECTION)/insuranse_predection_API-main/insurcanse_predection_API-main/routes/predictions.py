from fastapi import APIRouter
from schemas import ModelInputs
from services.predict import get_prediction , compare_models


router = APIRouter(
    prefix = '',
    tags=['predections']
)

@router.post("/predict")
def predict(data: ModelInputs):
    return {"prediction": get_prediction(data)}

@router.post('/compare')
def compare(data: ModelInputs):
    return compare_models(data)