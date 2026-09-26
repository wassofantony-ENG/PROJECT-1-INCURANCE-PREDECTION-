from sqlalchemy import Boolean, Column, Integer, String , ForeignKey 
from db.database import Base

class Users(Base):
    __tablename__ = 'users'
    id = Column(Integer, primary_key=True, index=True , autoincrement=True)
    username = Column(String, unique=True, index=True)
    email = Column(String, unique=True, index=True)
    password = Column(String)

class Predictions(Base):
    __tablename__ = 'predictions'

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey('users.id'))
    email = Column(String)
    customers_name = Column(String)
    age = Column(Integer)
    gender = Column(Integer)
    bmi = Column(Integer)
    bloodpressure = Column(Integer)
    diabetic = Column(Integer)
    children = Column(Integer)
    smoker = Column(Integer)
    region = Column(Integer)
    AI_Prediction = Column(Integer)
    isDone = Column(Boolean)
    final_cost = Column(Integer)

