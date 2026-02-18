import os
import google.generativeai as genai
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

api_key = os.getenv('GEMINI_API_KEY')
print(f"Loaded API Key: {api_key[:5]}...{api_key[-5:] if api_key else 'None'}")

if not api_key:
    print("Error: GEMINI_API_KEY not found in environment or .env file.")
    exit(1)

genai.configure(api_key=api_key)

try:
    print("Attempting to list models...")
    for m in genai.list_models():
        if 'generateContent' in m.supported_generation_methods:
            print(f"- {m.name}")
    
    print("\nAttempting to generate content with 'models/gemini-flash-latest'...")
    model = genai.GenerativeModel('models/gemini-flash-latest')
    response = model.generate_content("Hello, can you hear me?")
    print(f"\nSuccess! Response: {response.text}")

except Exception as e:
    print(f"\nFAILED. Error details:\n{e}")
