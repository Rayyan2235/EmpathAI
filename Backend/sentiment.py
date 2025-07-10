from textblob import TextBlob
from transformers import pipeline # A hugging face transformer lib

sentiment_pipeline = pipeline("sentiment-analysis") #Initializing the Sentimenet analysis NLP

def get_sentiment(message:str) -> str:
    result = sentiment_pipeline(message)[0] # storing the sentiment of the 'message' and ensuring that it takes the 1st and only string
    #Example output :{'label': 'POSITIVE', 'score': 0.9998}
    label = result['label']  # 'POSITIVE' or 'NEGATIVE' ! 'label' is key name comes from how Hugging Face structures its output from the above
    return label.lower()




'''def get_sentiment(message:str) -> str:
    polarity = TextBlob(message).sentiment.polarity #This is a function that returns the polarity of the message.

    if polarity > 0:
        return "positive"
    elif polarity < 0:
        return "negative"
    else:
        return "neutral"

'''