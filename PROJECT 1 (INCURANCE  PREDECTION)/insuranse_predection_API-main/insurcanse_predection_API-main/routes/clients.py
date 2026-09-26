from fastapi import APIRouter, status, HTTPException, Depends
from schemas import PredictionCreate, PredictionUpdate, PredictionResponse
from services.db_anotation import db_dependency
from services.auth import get_current_user
from db import client
from typing import List

router = APIRouter(
    prefix="/clients",
    tags=["clients"]
)


@router.post("/", response_model=PredictionResponse, status_code=status.HTTP_201_CREATED)
def create_prediction(prediction: PredictionCreate, db: db_dependency, current_user: client.Users = Depends(get_current_user)):
    if not (prediction.user_id == current_user.id):
        raise HTTPException(
            status_code=status.HTTP_405_METHOD_NOT_ALLOWED,
            detail='user dont match the current user'
        )
    db_prediction = client.Predictions(**prediction.dict())
    db.add(db_prediction)
    db.commit()
    db.refresh(db_prediction)
    return db_prediction


@router.get("/", response_model=List[PredictionResponse])
def get_all_predictions(db: db_dependency, skip: int = 0, limit: int = 100, current_user: client.Users = Depends(get_current_user)):
    return db.query(client.Predictions).filter(client.Predictions.user_id == current_user.id).offset(skip).limit(limit).all()


@router.get("/{prediction_id}", response_model=PredictionResponse)
def get_prediction(prediction_id: int, db: db_dependency, current_user: client.Users = Depends(get_current_user)):
    prediction = db.query(client.Predictions).filter(client.Predictions.id == prediction_id).first()
    if not prediction:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Prediction not found"
        )
    return prediction


@router.put("/{prediction_id}", response_model=PredictionResponse)
def update_prediction(prediction_id: int, prediction: PredictionUpdate, db: db_dependency, current_user: client.Users = Depends(get_current_user)):
    db_prediction = db.query(client.Predictions).filter(client.Predictions.id == prediction_id, client.Predictions.user_id == current_user.id).first()
    if not db_prediction:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Prediction not found"
        )
    
    update_data = prediction.dict(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_prediction, key, value)
    
    db.commit()
    db.refresh(db_prediction)
    return db_prediction


@router.delete("/{prediction_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_prediction(prediction_id: int, db: db_dependency ,  current_user: client.Users = Depends(get_current_user)):
    db_prediction = db.query(client.Predictions).filter(client.Predictions.id == prediction_id, client.Predictions.user_id == current_user.id).first()
    if not db_prediction:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Prediction not found"
        )
    
    db.delete(db_prediction)
    db.commit()

@router.put('/Done/{prediction_id}' , status_code=status.HTTP_204_NO_CONTENT)
def setDone(prediction_id:int,final_cost : float , db:db_dependency,current_user: client.Users = Depends(get_current_user)):
    db_prediction = db.query(client.Predictions).filter(client.Predictions.id == prediction_id , client.Predictions.user_id == current_user.id).first()

    if not db_prediction:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail='Prediction not found'
        )
    if db_prediction.isDone:  # type: ignore[attr-defined]
        raise HTTPException(
            status_code= status.HTTP_406_NOT_ACCEPTABLE,
            detail='final price already set'
        )


    setattr(db_prediction, 'final_cost', final_cost)
    setattr(db_prediction, 'isDone', True)
    db.commit()
    
    return {'message': 'status changed'}
