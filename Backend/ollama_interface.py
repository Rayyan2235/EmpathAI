import ollama
import httpx


OLLAMA_MODEL = "llama3"


async def get_llm_response(user_input:str) -> str:
    prompt = f"""
    You are an empathetic AI therapist. Respond with kindness and emotional intelligence. 
    You are given a message from a user.
    You need to respond to the user's message in a way that is helpful and supportive.
    You need to be empathetic and understanding.
    You need to be non-judgmental and non-directive.
    Users message: {user_input}
    Your response:
    """
    payload = {
        "model": OLLAMA_MODEL,
        "prompt": prompt,
        "stream": False
    }
    '''This creates an asynchronous HTTP client using the httpx library.'''
    async with httpx.AsyncClient() as client: #This creates an asynchronous HTTP client using the httpx library. This allows you to make HTTP calls without blocking your server (FastAPI can handle multiple users at once).
        response = await client.post("http://localhost:11434/api/generate", json=payload) #This sends a POST request to the ollama server with the payload containing the model and prompt. Which will return a response from the ollama server.
        result = response.json() #This parses the response as JSON and extracts the "response" field from it.
        return result.get("response", "I'm here for you.") #This returns the "response" field from the JSON response. If the "response" field is not found, it returns "I'm here for you."


'''Key Words:
await: This is a keyword used in asynchronous programming in Python. It's used to pause the execution of an async function until an awaited task completes. In this case, it's waiting for get_llm_response() to finish processing.
async with: This statement ensures the client is properly closed after use This is the modern way to make HTTP requests in Python

'async with' statement ensures the client is properly closed after use This is the modern way to make HTTP requests in Python
'''




