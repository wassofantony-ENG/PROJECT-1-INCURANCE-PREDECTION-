import fastapi
from fastapi.middleware.cors import CORSMiddleware
from routes import predictions , users , clients
from db.database import  engine
from db import client

app = fastapi.FastAPI()

# client.Base.metadata.drop_all(bind=engine)
client.Base.metadata.create_all(bind=engine)


app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],      # Allows all origins
    allow_credentials=True,   # Optional: Allows cookies/auth headers
    allow_methods=["*"],      # Allows all methods (GET, POST, etc.)
    allow_headers=["*"],      # Allows all headers
)

@app.get("/")
def read_root():
    return {"message": "Welcome to the Insurance prediction API!"}

app.include_router(predictions.router)

app.include_router(users.router)

app.include_router(clients.router)


