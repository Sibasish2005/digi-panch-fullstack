import razorpay
from app.core.config import setting

# Initialize Razorpay Client using environment variables
razorpay_client = razorpay.Client(auth=(setting.RAZORPAY_KEY_ID, setting.RAZORPAY_KEY_SECRET))

def create_razorpay_order(amount_in_rupees: float, currency: str = "INR", receipt: str = None) -> dict:
    # Razorpay expects amount in paise (smallest currency unit)
    amount_in_paise = int(amount_in_rupees * 100)
    data = {
        "amount": amount_in_paise,
        "currency": currency,
        "receipt": receipt,
        "payment_capture": 1 # Auto capture
    }
    return razorpay_client.order.create(data=data)

def verify_razorpay_signature(order_id: str, payment_id: str, signature: str) -> bool:
    try:
        razorpay_client.utility.verify_payment_signature({
            'razorpay_order_id': order_id,
            'razorpay_payment_id': payment_id,
            'razorpay_signature': signature
        })
        return True
    except razorpay.errors.SignatureVerificationError:
        return False
    except Exception:
        return False