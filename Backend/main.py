from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from sentiment import get_sentiment
from safety import check_red_flags
import uvicorn
import asyncio
from typing import List
from utils.logger import log_conversation
import httpx
from Therapist_Agent import get_llm_response


''' we specify 'Backend' because of how Python's module system works when running a package from outside its directory: Python needs to know the full path to find the modules, even if they're in the same folder
It's like telling someone "look in the Backend folder for these files" rather than just assuming they'll find them'''



app = FastAPI() # You're saying: "Start a web server that knows how to handle HTTP requests (like /chat) and run my custom code for those request"
origins= [
    "http://localhost:3000"
]
app.add_middleware(CORSMiddleware,
                   allow_origins=origins,
                   allow_credentials = True,
                   allow_methods=["*"],
                   allow_headers=["*"])
#CORSmiddleware Blocks unauthorised requests for instanced when someone is tryna hack u

class UserInput(BaseModel): #Pydantic defined like this, this is a class that defines the structure of the incoming request.
    message: str

""'''# --- Ollama LLM call logic ---
async def get_llm_response(message, user_id):
    """
    Calls the Ollama LLM API to generate a response for the given message.
    Args:
        message (str): The user's message.
        user_id (str): The user's unique identifier (can be used for context/history if needed).
    Returns:
        str: The AI's text response.
    """
    # Optionally, you can load conversation history here for context
    prompt = message  # For now, just use the message. You can add history if desired.
    async with httpx.AsyncClient() as client:
        response = await client.post(
            "http://localhost:11434/api/generate",  # Update if your Ollama endpoint is different
            json={"model": "your-model-name", "prompt": prompt}
        )
        data = response.json()
        return data["response"]  # Adjust this key if your Ollama API returns a different structure'''""

#"/chat" whatever is in the quotation marks is an arbitrary name decided by the programmer
@app.post("/chat") #If a question is POSTed to the /chat endpoint which is the URL to fastAPI, the function below will be called
#This /chat is not triggered by what the user inputs rather it is activated when the local server is deployed
async def chat_with_therapist(input: UserInput, request: Request): #This function runs when someone hits the /chat endpoint. input is automatically parsed and validated from the incoming request.
    sentiment = get_sentiment(input.message) #This is a function that gets the sentiment of the message
    red_flag = check_red_flags(input.message) #This is a function that checks for red flags in the message
    user_ip = request.client.host #users address

    # sentiment is a variable that stores the sentiment of the message which refers to the tone of the users
    if red_flag:
        response = "It sounds like you're going through something very difficult. You're not alone. Please consider speaking to a real professional or calling a helpline."
        log_conversation(user_id=user_ip, message=input.message, response=response)
        return {
            "sentiment": sentiment,
            "response": response
        }

    reply = await get_llm_response(input.message, user_id=user_ip)
    log_conversation(user_id=user_ip, message=input.message, response=reply)
    return {
        "sentiment": sentiment,
        "response": reply
    } 
'''So basically, everything under the function 'chat_with_therapist' will finally be sent to the /chat endpoint which is the FastAPI url'''

""" 
KEY WORDS:

await is a keyword used in asynchronous programming in Python. It's used to pause the execution of an async function until an awaited task completes. In this case, it's waiting for get_llm_response() to finish processing.

Pydantic is a powerful Python library that leverages type hints to help you easily validate and serialize your data schemas. This makes your code more robust, readable, concise, and easier to debug."""

if __name__ == "__main__": #Checks if the current script is being run directly as the main program.
    uvicorn.run(app,host="0.0.0.0", port=8000)
    print("\n=== Welcome to EmpathAI ===")
    print("I'm your AI therapist, ready to listen and support you.")
    print("Type 'quit' to end the conversation.")
    print("===========================\n")

    # Use a default user ID for command-line interface
    CLI_USER_ID = "cli_user" 
    '''Added a constant CLI_USER_ID = "cli_user" to use as a default user ID for the command-line interface'''

    '''chat_with_therapist is an async function (it uses await), but we're not awaiting it in our main loop. We need to make the main loop async as well.'''
    async def main():
        while True:
            user_input = input("You: ").strip()
            if user_input.lower() == 'quit':
                print("\nThank you for talking with me. Take care!")
                break
                
            response = await chat_with_therapist(
                UserInput(message=user_input),
                Request(scope={"type": "http", "client": ("127.0.0.1", 0)})
            )
            print(f"\nTherapist: {response['response']}\n")
            
            # Log the conversation with the CLI user ID
            log_conversation(user_id=CLI_USER_ID, message=user_input, response=response['response'])
    
    asyncio.run(main())

    '''KEY WORDS:
    What is an async function?
    An async function is one that can be "paused" while waiting for something to complete
    In our case, chat_with_therapist is async because it needs to wait for the LLM (AI) to generate a response
    This waiting could take several seconds

    Asyncio is a Python library used to write concurrent code using the async/await syntax. It is primarily used for I/O-bound tasks, such as web development or fetching data from APIs
    
    
    '''

