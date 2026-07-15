from slowapi import Limiter
from slowapi.util import get_remote_address

# Define the limiter here with a default limit of 60 requests per minute for the entire application
limiter = Limiter(key_func=get_remote_address, default_limits=["60/minute"])