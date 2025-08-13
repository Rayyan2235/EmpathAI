"""
EmpathAI Backend Package

This package contains the main backend components for the EmpathAI application:
- FastAPI web server (main.py)
- Therapist Agent for AI conversations (Therapist_Agent.py)
- Detection module for safety and sentiment analysis (detection/)

This file makes the Backend directory a Python package.
"""

# Import main components for easy access
from . import detection
from . import Token_Generator
from . import Therapist_Agent

__version__ = "1.0.0"
__all__ = ['detection', 'Token_Generator', 'Therapist_Agent']