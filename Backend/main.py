from fastapi import FastAPI
from pydantic import BaseModel
from app.ollama_interface import get_llm_response
from app.sentiment import get_sentiment
from app.safety import check_red_flags



app = FastAPI() # You’re saying: “Start a web server that knows how to handle HTTP requests (like /chat) and run my custom code for those request"
class UserInput(BaseModel): #Pydantic defined like this, this is a class that defines the structure of the incoming request.
    message: str

@app.post("/chat") #If a question is POSTed to the /chat endpoint which is the URL to fastAPI, the function below will be called
async def chat_with_therapist(input: UserInput): #This function runs when someone hits the /chat endpoint. input is automatically parsed and validated from the incoming request.
    sentiment = get_sentiment(input.message) #This is a function that gets the sentiment of the message
    red_flag = check_red_flags(input.message) #This is a function that checks for red flags in the message

    # sentiment is a variable that stores the sentiment of the message which refers to the tone of the users
    if red_flag:
        return {
            "sentiment": sentiment,
            "response": "It sounds like you're going through something very difficult. You're not alone. Please consider speaking to a real professional or calling a helpline."
        }

    reply = await get_llm_response(input.message)
    return {
        "sentiment": sentiment,
        "response": reply
    }

""" await is a keyword used in asynchronous programming in Python. It's used to pause the execution of an async function until an awaited task completes. In this case, it's waiting for get_llm_response() to finish processing.

Pydantic is a powerful Python library that leverages type hints to help you easily validate and serialize your data schemas. This makes your code more robust, readable, concise, and easier to debug."""
