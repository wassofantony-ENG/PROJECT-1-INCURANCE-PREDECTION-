from fastapi import HTTPException, status, Depends
from fastapi.security import OAuth2PasswordBearer
from jose import JWTError, jwt
from datetime import datetime, timedelta
from db import client
from services.db_anotation import db_dependency
from dotenv import load_dotenv
import os
from typing import Optional, cast
oauth2_scheme = OAuth2PasswordBearer(tokenUrl='users/loginSwagger')

# JWT Configuration - in production, use environment variables
load_dotenv()
secret_key = os.getenv('SECRET_KEY')
if not secret_key:
    raise ValueError("SECRET_KEY environment variable is not set")
SECRET_KEY = secret_key
ALGORITHM = "HS256"

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=30)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

async def get_current_user(db: db_dependency ,token: str = Depends(oauth2_scheme)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        sub = payload.get("sub")
        if sub is None or not isinstance(sub, str):
            raise credentials_exception
        username: str = sub
    except JWTError:
        raise credentials_exception
    user = db.query(client.Users).filter(client.Users.username == username).first()
    if user is None:
        raise credentials_exception
    return user