import hmac
import hashlib
import time
import uuid
from app.core.config import setting

def generate_imagekit_auth_signature() -> dict:
    """
    Generates the exact authentication parameters required by the 
    ImageKit frontend SDKs to perform direct-to-cloud uploads.
    """
    token = str(uuid.uuid4())
    # Signature expires in 30 minutes
    expire = int(time.time()) + 1800 
    
    # Needs to be added to your settings/env
    private_key = getattr(setting, "IMAGEKIT_PRIVATE_KEY", "your_private_key")
    
    signature = hmac.new(
        key=private_key.encode("utf-8"),
        msg=(token + str(expire)).encode("utf-8"),
        digestmod=hashlib.sha1
    ).hexdigest()
    
    return {
        "token": token,
        "expire": expire,
        "signature": signature
    }