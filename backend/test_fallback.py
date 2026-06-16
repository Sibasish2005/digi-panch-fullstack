import asyncio
import logging
from app.integrations.gemini import generate_chat_response
from app.integrations.deepseek import generate_deepseek_response

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class MockMessage:
    def __init__(self, role, message):
        self.role = role
        self.message = message

async def test():
    history = [
        MockMessage("user", "Hello, who are you and what model is generating this response?")
    ]
    
    context_text = "USER PROFILE: Name is Test User."
    
    try:
        print("\n--- 1. Testing Gemini (We will intentionally force it to fail) ---")
        # We simulate failure by forcing the API key to be invalid just for this test
        from app.core.config import setting
        original_key = setting.GEMINI_API_KEY
        setting.GEMINI_API_KEY = "INVALID_KEY_TO_FORCE_ERROR"
        
        try:
            # We bypass retries for faster test by calling it
            reply = await generate_chat_response(history, context_text)
            print("Gemini Reply:", reply)
        except Exception as e:
            print(f"Gemini failed as expected: {e}")
            raise e
            
    except Exception as gemini_err:
        print("\n--- 2. Falling back to DeepSeek ---")
        try:
            reply = await generate_deepseek_response(history, context_text)
            print("\nSUCCESS! DeepSeek Reply:")
            print(reply)
        except Exception as ds_err:
            print("\nDeepSeek also failed:", ds_err)

if __name__ == "__main__":
    asyncio.run(test())
