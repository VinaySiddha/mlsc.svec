# MLSC Roadmap Generator Backend

This is the Python backend service powering the trackable AI Roadmap Generator using **CrewAI** and **Google Gemini** models.

## Structure Overview
* **`crew.py`**: Defines the three specialized agents (Syllabus Planner, Subject Detailer, and Synthesizer) powered by Google Gemini.
* **`main.py`**: Runs a FastAPI server with endpoints for asynchronous job dispatch and polling status.
* **`requirements.txt`**: Standard dependencies list.

---

## How to Run the Backend

### Prerequisites
- Python 3.10 to 3.13
- Package manager: `uv` (recommended) or `pip`

### Step 1: Set up the environment variables
The backend loads API keys from the parent folder's `.env` file. Ensure `GEMINI_API_KEY` or `GOOGLE_API_KEY` is present.

### Step 2: Create a virtual environment and install packages
Run these commands from the `backend/` directory:

Using `uv`:
```bash
uv venv .venv
source .venv/bin/activate # (or .venv\Scripts\activate on Windows)
uv pip install -r requirements.txt
```

Using standard `pip`:
```bash
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
```

### Step 3: Start the server
With the virtual environment activated, run:
```bash
uvicorn main:app --host 127.0.0.1 --port 8001 --reload
```

---

## API Documentation
Once running, you can access the Interactive Swagger documentation at:
* **Interactive Docs**: [http://127.0.0.1:8001/docs](http://127.0.0.1:8001/docs)
* **OpenAPI Spec**: [http://127.0.0.1:8001/openapi.json](http://127.0.0.1:8001/openapi.json)

### Main Endpoints
1. **Trigger Roadmap (Asynchronous)**:
   - **Endpoint**: `POST /api/generate-roadmap`
   - **Body**:
     ```json
     {
       "topic": "JavaScript",
       "timeframe": "24 hours"
     }
     ```
   - **Response**: `{"job_id": "<uuid>", "status": "pending"}`

2. **Check Status / Poll**:
   - **Endpoint**: `GET /api/roadmap-status/<job_id>`
   - **Response**: Returns the status (`pending`, `running`, `completed`, `failed`) and the resulting JSON if completed.
