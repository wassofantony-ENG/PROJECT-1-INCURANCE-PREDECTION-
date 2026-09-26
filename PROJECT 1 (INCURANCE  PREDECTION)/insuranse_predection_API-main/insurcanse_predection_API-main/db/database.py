from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.ext.declarative import declarative_base

from dotenv import load_dotenv
import os

load_dotenv()

DB_URl = os.getenv("DB_URL")
if not DB_URl:
    raise ValueError('db_url not vaild')
engine = create_engine(DB_URl)

session = sessionmaker(autoflush=False , bind=engine )

Base = declarative_base()