import os
from livekit import AccessToken
from dotenv import load_dotenv
from datetime import timedelta

load_dotenv()

api_key = os.getenv("LIVEKIT_API_KEY")
api_secret = os.getenv("LIVEKIT_API_SECRET")


async def geneerate_token(user_id, room_id):
    token = AccessToken(api_key, api_secret, user_id = user_id)
    token.add_grant({
        "roomJoin": True,
        "room": room
    })
    token.ttl = timedelta(hours=1)
    return token.to_jwt()
   
