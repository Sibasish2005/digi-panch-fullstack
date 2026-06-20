import requests

response = requests.get(
    "http://localhost:8000/api/v1/test/test-500",
    headers={
        "Origin": "http://localhost:3000"
    }
)
print("Status Code:", response.status_code)
print("Headers:", response.headers)
print("Content:", response.text)
