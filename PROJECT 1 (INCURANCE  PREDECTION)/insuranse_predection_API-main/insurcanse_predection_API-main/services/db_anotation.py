import fastapi
from typing import Annotated
from db.database import session
from fastapi import Depends
from sqlalchemy.orm import Session

def get_db():
    db = session()
    try:
        yield db
    finally:
        db.close()

db_dependency = Annotated[Session,Depends(get_db)] # do some research  about it 