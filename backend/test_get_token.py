import requests

response = requests.get(
    "http://localhost:8000/api/v1/amenities/bookings/my",
    headers={
        "Origin": "http://localhost:3000",
        "Authorization": "Bearer fake_token_here"
    }
)
print("Status Code:", response.status_code)
print("Headers:", response.headers)
print("Content:", response.text)
