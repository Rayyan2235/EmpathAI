from fastapi import FastAPI, Query
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from Token_Generator import generate_token # CUZ of the init func we dont have to do a .livekit_token..

app = FastAPI()

# Below allows comms b/w frontend and backend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# GET endpoint that matches what the frontend is calling
#We use get endpoint becausee we are trying to retrieve the token from backend
@app.get("/get-livekit-token")
async def get_livekit_token(
    identity: str = Query(..., description="User identity"),
    room: str = Query(..., description="Room name")
):
    try:
        token = await generate_token(identity, room)
        return {"token": token}
    except Exception as e:
        return {"error": str(e)}

# Optional: Keep the POST endpoint for backward compatibility
class TokenRequest(BaseModel):
    user_id: str
    room_id: str



'''
@app.post("/get_token")
async def get_token_post(request: TokenRequest):
    try:
        token = await generate_token(request.user_id, request.room_id)
        return {"token": token}
    except Exception as e:
        return {"error": str(e)}
'''