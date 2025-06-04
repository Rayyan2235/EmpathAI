import os
import json
from datetime import datetime
from typing import List, Dict

LOG_DIR = "data/user_logs"

def log_conversation(user_id:str, message: str, response: str):
      # Ensure the log directory exists
    os.makedirs(LOG_DIR, exist_ok=True) #makedirs creates directories recursively
    ''' this line creates a directory in the location of LOG_DIR and checks if the file alr exists then python wont throw an error'''
    
    # Format filename based on user ID
    filename = os.path.join(LOG_DIR, f"{user_id}.jsonl")  # JSON Lines format


    log_entry = {
        "timestamp": datetime.utcnow().isoformat(),
        "user_message": message,
        "response": response,
    }
    # The Key can be any string but the value is the important bit which must be correct

    
    # Append the entry to the file
    with open(filename, "a", encoding="utf-8") as f:
        f.write(json.dumps(log_entry) + "\n")

def get_conversation_history(user_id: str, limit: int = 5) -> List[Dict]:
    """Retrieve the most recent conversation history for a user."""
    filename = os.path.join(LOG_DIR, f"{user_id}.jsonl")
    
    if not os.path.exists(filename):
        return []
    
    history = []
    with open(filename, "r", encoding="utf-8") as f: # "r" means open file in read mode and 'utf-8' ensures proper handling of special characters
        # Read all lines and parse JSON
        lines = f.readlines() # read all lines from the file 
        for line in lines[-limit:]:  # Get the last 'limit' conversations. '-limit' gets the last limit number of lines so if limit = 5, it gets the last 5 conversations
            try:
                entry = json.loads(line.strip()) 
                history.append(entry)
            except json.JSONDecodeError:
                continue
    
    return history

def format_conversation_history(history: List[Dict]) -> str:
    """Format conversation history into a string for the LLM prompt."""
    formatted = []
    for entry in history:
        formatted.append(f"User: {entry['user_message']}")
        formatted.append(f"Therapist: {entry['response']}")
    return "\n".join(formatted)

'''KEY WORDS:
lines[-limit:] is a slice operation that gets the last limit number of lines

line.strip() removes any whitespace or newline characters

json.loads() converts the JSON string into a Python dictionary



'''


''' NOTES:

The reason why the 'get_conversation_history' is converted to a 'List[Dict]' is because its very readable and easily accessible as well as to modify data 


'''