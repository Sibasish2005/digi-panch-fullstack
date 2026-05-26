from slowapi import Limiter
from slowapi.util import get_remote_address

# Define the limiter here so it can be imported by main.py AND your routers
limiter = Limiter(key_func=get_remote_address)