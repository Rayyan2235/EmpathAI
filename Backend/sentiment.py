from textblob import TextBlob



def get_sentiment(message:str) -> str:
    polarity = TextBlob(message).sentiment.polarity #This is a function that returns the polarity of the message.

    if polarity > 0:
        return "positive"
    elif polarity < 0:
        return "negative"
    else:
        return "neutral"

