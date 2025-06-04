import ollama
import httpx
from utils.logger import get_conversation_history, format_conversation_history

OLLAMA_MODEL = "llama3"


async def get_llm_response(user_input: str, user_id: str = None) -> str:
    # Get conversation history if user_id is provided
    history = []
    if user_id:
        history = get_conversation_history(user_id)
    
    # Format the conversation history
    history_text = format_conversation_history(history) if history else ""
    
    prompt = f"""
    You are an empathetic AI therapist. Respond with kindness and emotional intelligence.
    
    Previous conversation:
    {history_text}
    
    Current user message: {user_input}
    
    Respond to the user's message in a way that is helpful and supportive.
    Be empathetic and understanding.
    Be non-judgmental and non-directive.
    If there's relevant context from the previous conversation, use it to provide more personalized support.
    
    Your response:
    """
    
    payload = {
        "model": OLLAMA_MODEL,
        "prompt": prompt,
        "stream": False
    }
    '''This creates an asynchronous HTTP client using the httpx library.'''
    '''
    async with httpx.AsyncClient() as client: #This creates an asynchronous HTTP client using the httpx library. This allows you to make HTTP calls without blocking your server (FastAPI can handle multiple users at once).
        response = await client.post("http://localhost:11434/api/generate", json=payload) #This sends a POST request to the ollama server with the payload containing the model and prompt. Which will return a response from the ollama server.
        result = response.json() #This parses the response as JSON and extracts the "response" field from it.
        return result.get("response", "I'm here for you.") #This returns the "response" field from the JSON response. If the "response" field is not found, it returns "I'm here for you."
'''
    
    try:
        # Increased timeout to 60 seconds and added connection timeout
        async with httpx.AsyncClient(timeout=60.0, limits=httpx.Limits(max_keepalive_connections=5, max_connections=10)) as client:
            response = await client.post("http://localhost:11434/api/generate", json=payload)
            result = response.json()
            return result.get("response", "I'm here for you.")
    except httpx.ConnectError:
        return "I'm having trouble connecting to my brain right now. Please make sure Ollama is running on your system."
    except httpx.ReadTimeout:
        return "I'm taking longer than expected to process your message. This might be because the model is still loading or the server is busy. Please try again in a few moments."
    except Exception as e:
        return f"I encountered an error: {str(e)}"


'''Key Words:
await: This is a keyword used in asynchronous programming in Python. It's used to pause the execution of an async function until an awaited task completes. In this case, it's waiting for get_llm_response() to finish processing.
async with: This statement ensures the client is properly closed after use This is the modern way to make HTTP requests in Python

'async with' statement ensures the client is properly closed after use This is the modern way to make HTTP requests in Python
'''




