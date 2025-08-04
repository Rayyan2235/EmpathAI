from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel



app = FastAPI()

#Below allows comms b/w frontend and backend
app.add.middleware(
    CORSMiddleware,
    allow_origins=["*"]

)
#Basemodel allows to validate and structure incoming datafrom the frontend
class TokenRequest(BaseModel): # So this basically valdiates by telling fastAPI "I expect a POST request with JSON that looks like:"
    user_id = str
    room_id = str

@app.post("/get_token") #This is an endpoint that acts like a door to the backend from the frontend
async def get_token(TokenRequest: TokenRequest):
    token = generate_token(TokenRequest.user_id, TokenRequest.room_id)
    return {"token": token}
