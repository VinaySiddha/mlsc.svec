import os
import httpx
from dotenv import load_dotenv

load_dotenv(dotenv_path=os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), ".env"))
api_key = os.environ.get("GEMINI_API_KEY") or os.environ.get("GOOGLE_API_KEY")

print("API Key loaded:", api_key[:10] + "..." if api_key else "None")

models = ["gemini-2.5-flash", "gemini-2.0-flash", "gemini-flash-latest"]
for model in models:
    url = f"https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent?key={api_key}"
    body = {
        "contents": [{"parts": [{"text": "say hello"}]}]
    }
    try:
        r = httpx.post(url, json=body, headers={"Content-Type": "application/json"})
        print(f"Model: {model} -> Status: {r.status_code}")
        if r.status_code == 200:
            print("Response:", r.json()["candidates"][0]["content"]["parts"][0]["text"])
            break
        else:
            print("Error body:", r.json())
    except Exception as e:
        print(f"Model {model} failed: {e}")


