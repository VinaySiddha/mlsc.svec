# MLSC Roadmap Generator Backend

This is the Python backend service powering the trackable AI Roadmap Generator using **CrewAI** and multiple open-source **Hugging Face** models.

## Structure Overview
* **`crew.py`**: Defines the three specialized agents (Syllabus Planner, Subject Detailer, and Synthesizer) and their tasks.
* **`main.py`**: Runs a FastAPI server with endpoints for asynchronous job dispatch and polling status.
* **`requirements.txt`**: Standard dependencies list.

---

## How to Run the Backend

### Prerequisites
- Python 3.10 to 3.13
- Package manager: `uv` (recommended) or `pip`

### Step 1: Set up the environment variables
The backend loads API keys from the parent folder's `.env` file (`D:\mlsc.svec\mlscsvec\mlsc.svec\.env`).
To use Hugging Face models, add your Hugging Face API token (`HF_TOKEN`) inside the `.env` file:
```env
HF_TOKEN="your_hugging_face_token"
```
*Note: If `HF_TOKEN` is missing or invalid, the backend automatically falls back to utilizing the Google Gemini API key (`GEMINI_API_KEY` or `GOOGLE_API_KEY`) already configured in your `.env` so that generation never fails.*

### Step 2: Create a virtual environment and install packages
Run these commands from the `backend/` directory:

Using `uv` (Fastest):
```bash
# Create the virtual environment
uv venv .venv

# Activate the environment (Windows)
.venv\Scripts\activate

# Install dependencies
uv pip install -r requirements.txt
```

Using standard `pip`:
```bash
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
```

### Step 3: Start the server
With the virtual environment activated, run:
```bash
uvicorn main:app --host 127.0.0.1 --port 8000 --reload
```

---

## API Documentation
Once running, you can access the Interactive Swagger documentation at:
* **Interactive Docs**: [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs)
* **OpenAPI Spec**: [http://127.0.0.1:8000/openapi.json](http://127.0.0.1:8000/openapi.json)

### Main Endpoints
1. **Trigger Roadmap (Asynchronous)**:
   - **Endpoint**: `POST /api/generate-roadmap`
   - **Body**:
     ```json
     {
       "topic": "JavaScript",
       "timeframe": "24 hours",
       "hf_token": null
     }
     ```
   - **Response**: `{"job_id": "<uuid>", "status": "pending"}`

2. **Check Status / Poll**:
   - **Endpoint**: `GET /api/roadmap-status/<job_id>`
   - **Response**: Returns the status (`pending`, `running`, `completed`, `failed`) and the resulting JSON if completed.
