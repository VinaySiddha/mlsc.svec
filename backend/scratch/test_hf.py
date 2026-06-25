import os
import json
import litellm
from dotenv import load_dotenv

# Load env from root
load_dotenv(dotenv_path=os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), ".env"))
hf_token = os.environ.get("HF_TOKEN")

print("HF Token loaded:", hf_token[:10] + "..." if hf_token else "None")

prompt = """
Generate exactly 5 random, high-quality multiple choice questions (MCQs) for the technical topic: 'javascript'.
Make the questions challenging, relevant for standard coding interviews, and unique.

You MUST return ONLY a raw JSON array string with no markdown formatting. Do not wrap the JSON in ```json or ``` tags.
Ensure it matches this schema exactly:
[
  {
    "question": "What is the output of X in Y conditions?",
    "options": ["Option A", "Option B", "Option C", "Option D"],
    "answer": "Option A",
    "explanation": "Provide a brief 1-2 sentence explanation of why Option A is correct."
  }
]
"""

models = [
    "huggingface/Qwen/Qwen2.5-72B-Instruct",
    "huggingface/meta-llama/Meta-Llama-3-8B-Instruct",
    "huggingface/Qwen/Qwen2.5-Coder-7B-Instruct"
]

for model in models:
    try:
        print(f"Testing model: {model}")
        response = litellm.completion(
            model=model,
            messages=[{"role": "user", "content": prompt}],
            api_key=hf_token,
            temperature=0.8
        )
        content = response.choices[0].message.content.strip()
        print(f"Success! Content length: {len(content)}")
        print("Content preview:")
        print(content[:500])
        
        # Verify JSON
        if content.startswith("```json"):
            content = content[7:]
        if content.endswith("```"):
            content = content[:-3]
        content = content.strip()
        
        data = json.loads(content)
        print("JSON parsed successfully! Total questions:", len(data))
        break
    except Exception as e:
        print(f"Failed model {model}: {e}")
