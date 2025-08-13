# Detection package for EmpathAI Backend
# Contains safety filtering and sentiment analysis functions

from .safety import check_red_flags
from .sentiment import get_sentiment

__all__ = ['check_red_flags', 'get_sentiment'] # Defines what gets imported 
