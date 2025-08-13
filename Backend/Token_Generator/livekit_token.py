import os
from livekit.api import AccessToken, VideoGrant  
from dotenv import load_dotenv
from datetime import timedelta

load_dotenv()

api_key = os.getenv("LIVEKIT_API_KEY")
api_secret = os.getenv("LIVEKIT_API_SECRET")

#Have to call os.getenv() to get the API key and secret from the .env file

async def generate_token(user_id: str, room_id: str) -> str:
    
    print(f"Generating token for user: {user_id}, room: {room_id}")
    print(f"API Key: {api_key[:10]}..." if api_key else "API Key: None")
    print(f"API Secret: {api_secret[:10]}..." if api_secret else "API Secret: None")
    
    try: 
        token = AccessToken(api_key, api_secret) # AccessToken is a class that gens an access token for a user in the room. This token is how LiveKit knows who the user is and what they’re allowed to do.
        token.identity = user_id
        grants = api.VideoGrants( # provides permission for token to be given
                    room_join=True,
                    room=room_id,
                    can_publish=True,      # Allow publishing
                    can_subscribe=True,    # Allow receiving
                    # Don't specify can_publish_sources - let client decide what to publish
                )
        token.ttl = timedelta(hours=1) 
        '''ttl means time to live (i.e., how long the token is valid). Here, the token will expire after 1 hour from creation.

    '''
        return token.to_jwt() # Converts token into a JWT string. (Json web token)
    except Exception as e:
        print(f"Error generating token: {e}")
        raise e  # ✅ Let FastAPI handle the error properly
    
