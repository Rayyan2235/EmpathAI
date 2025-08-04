from dotenv import load_dotenv
import os
from livekit import agents
from livekit.agents import AgentSession, Agent, RoomInputOptions
from livekit.plugins import (
    cartesia,
    deepgram,
    noise_cancellation,
    silero,
)
from livekit.plugins.turn_detector.multilingual import MultilingualModel

load_dotenv()
'''This makes the token for the AI agent (therapist) to join th elivekit room'''


class Therapist_Agent(Agent):
    def __init__(self):
        instructions = "You are an empathetic AI therapist and caring companion. You respond like a trusted friend or sibling — supportive, kind, and non-judgmental. Your role is to comfort the user, listen deeply, and offer emotional guidance. You do not diagnose or give medical advice. Always prioritize empathy, validation, and understanding."
        super().__init__(
            instructions=instructions,
            turn_detection=MultilingualModel(),  # Pass your turn detection model here
        )
    # Implement on_user_speech, on_audio, etc. for full voice AI

async def entrypoint(ctx: agents.JobContext):
    session = AgentSession(
        stt=deepgram.STT(model="nova-3", language="multi"),  # Speech-to-Text
        tts=cartesia.TTS(),                                  # Text-to-Speech
        vad=silero.VAD.load(),                              # Voice Activity Detection
        turn_detection=MultilingualModel(),                  # Turn Detection
    )
    # Read LiveKit connection info from environment
    LIVEKIT_URL = os.getenv("LIVEKIT_URL")
    LIVEKIT_ROOM = os.getenv("LIVEKIT_ROOM")
    LIVEKIT_TOKEN = os.getenv("LIVEKIT_TOKEN")

    # If LIVEKIT_TOKEN is not set, generate one for the agent
    if not LIVEKIT_TOKEN:
        import jwt
        import time
        def generate_livekit_token(api_key, api_secret, identity, room):
            now = int(time.time())
            payload = {
                'iss': api_key,
                'sub': identity,
                'iat': now,
                'nbf': now,
                'exp': now + 3600,
                'video': {
                    'room': room,
                    'roomJoin': True,
                    'canPublish': True,
                    'canSubscribe': True,
                }
            }
            return jwt.encode(payload, api_secret, algorithm='HS256')

        api_key = os.getenv("LIVEKIT_API_KEY")
        api_secret = os.getenv("LIVEKIT_API_SECRET")
        agent_identity = "therapist-agent"  # or any unique string
        if api_key and api_secret and LIVEKIT_ROOM:
            LIVEKIT_TOKEN = generate_livekit_token(api_key, api_secret, identity=agent_identity, room=LIVEKIT_ROOM)

    print("[DEBUG] Connecting to LiveKit URL:", LIVEKIT_URL)
    print("[DEBUG] Room:", LIVEKIT_ROOM)
    print("[DEBUG] Token:", LIVEKIT_TOKEN[:10] + "..." if LIVEKIT_TOKEN else None)
      # Start the session with our greeting agent
    await session.start(    
        room=LIVEKIT_ROOM,
        agent=Therapist_Agent(),
        room_input_options=RoomInputOptions(
            noise_cancellation=noise_cancellation.BVC(),    # Background noise cancellation
        ),
        url=LIVEKIT_URL,    # <--- THIS IS IMPORTANT
        token=LIVEKIT_TOKEN,  # <--- This too, if needed
    )

if __name__ == "__main__":
    agents.cli.run_app(agents.WorkerOptions(entrypoint_fnc=entrypoint))



