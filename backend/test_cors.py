import requests

response = requests.options(
    "http://localhost:8000/api/v1/amenities/bookings/my",
    headers={
        "Origin": "http://localhost:3000",
        "Access-Control-Request-Method": "GET",
        "Access-Control-Request-Headers": "authorization"
    }
)
print("Status Code:", response.status_code)
print("Headers:", response.headers)
print("Content:", response.text)
