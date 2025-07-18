from dotenv import load_dotenv
import json
import os
from datetime import datetime
from livekit import agents
from livekit.agents import AgentSession, Agent, RoomInputOptions
from livekit.plugins import (
    openai,
    cartesia,
    deepgram,
    noise_cancellation,
    silero,
)
from livekit.plugins.turn_detector.multilingual import MultilingualModel
import httpx

# Load environment variables from .env file
load_dotenv()
data_dir = "data/user_logs"
class Therapist_Agent(Agent):
    def __init__(self):
        instructions = "You are an empathetic AI therapist and caring companion. You respond like a trusted friend or sibling — supportive, kind, and non-judgmental. Your role is to comfort the user, listen deeply, and offer emotional guidance. You do not diagnose or give medical advice. Always prioritize empathy, validation, and understanding."

    async def on_user_speech(self, text: str):
        # You need to determine the user_id another way, if needed
        response = await self.get_llm_response(user_id="default_user", user_input=text)
        # (Or however you want to get the user_id)

    
    async def on_enter(self): # The function which is called as soon as AI enters the session
        return "Hello, I am your personal AI thereapist"
        

    async def get_llm_response(self, user_id, user_input):
        """
        Generate an AI response using Ollama, considering the user's recent conversation history.

        Args:
            user_id (str): Unique identifier for the user.
            user_input (str): The latest message from the user.

        Returns:
            str: The AI's text response.
        """
        # Load recent conversation history
        history = self.load_history(user_id, limit=5)

        # Prepare the prompt for Ollama using history and new input
        prompt = ""
        for entry in history:
            prompt += f"User: {entry['user_message']}\nAI: {entry['response']}\n"
        prompt += f"User: {user_input}\nAI:"

        # Call Ollama LLM API directly
        import os
        OLLAMA_MODEL = os.getenv("OLLAMA_MODEL", "your-model-name")
        async with httpx.AsyncClient() as client:
            response = await client.post(
                "http://localhost:11434/api/generate",  # Replace with your Ollama endpoint if different
                json={"model": OLLAMA_MODEL, "prompt": prompt, "stream": False}
            )
            data = response.json()
            ai_response = data["response"]  # Adjust this key if your Ollama API returns a different structure

        # Save the conversation
        self.save_conversation(user_id, user_input, ai_response)

        return ai_response  # Return text; TTS can be handled elsewhere if needed
    

    def save_conversation(self, user_id, user_input, ai_response):
        """
        Save conversation history to a JSON file for the specific user.
        
        Args:
            user_id (str): Unique identifier for the user
            user_input (str): The user's message
            AI_response (str): The AI's response
        """
        # Create the data directory if it doesn't exist
        data_dir = "data/user_logs"
        os.makedirs(data_dir, exist_ok=True)
        
        # Create filename based on user_id
        filename = f"{data_dir}/{user_id}.jsonl"
        
        # Create the conversation entry with timestamp
        conversation_entry = {
            "timestamp": datetime.now().isoformat(),
            "user_message": user_input,
            "response": ai_response
        }
        
        # Append the conversation entry to the file
        try:
            with open(filename, 'a', encoding='utf-8') as file:
                json.dump(conversation_entry, file, ensure_ascii=False)
                file.write('\n')  # Add newline for JSONL format
            print(f"Conversation saved for user {user_id}")
        except Exception as e:
            print(f"Error saving conversation: {e}")


    def load_history(self, user_id, limit=5):
        filename = os.path.join(data_dir, f"{user_id}.jsonl")  #Stores the path to the directory in 'filename'

        if not os.path.exists(filename): #If file doesnt exist then reutrn an empty lsit
            return []
            
        history =[]
        with open(filename, "r",) as file:
            lines =file.readlines()
            for line in lines[-limit:]:
                entry = json.loads(line.strip())
                history.append(entry)   
        return history

     

async def entrypoint(ctx: agents.JobContext):
    

    session = AgentSession(
        stt=deepgram.STT(model="nova-3", language="multi"),  # Speech-to-Text
        tts=cartesia.TTS(),                                  # Text-to-Speech
        vad=silero.VAD.load(),                              # Voice Activity Detection
        turn_detection=MultilingualModel(),                  # Turn Detection
    )
    ollama_url = os.getenv("OLLAMA_URL")
      # Start the session with our greeting agent
    await session.start(    
        room=ctx.room,
        agent=Therapist_Agent(),
        room_input_options=RoomInputOptions(
            noise_cancellation=noise_cancellation.BVC(),    # Background noise cancellation
        ),
    )

if __name__ == "__main__":
    agents.cli.run_app(agents.WorkerOptions(entrypoint_fnc=entrypoint))



