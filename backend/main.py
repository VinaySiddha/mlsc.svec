import os
from dotenv import load_dotenv
import sys

# Load env variables from parent directory
load_dotenv(dotenv_path=os.path.join(os.path.dirname(os.path.dirname(__file__)), ".env"))
import uuid
import json
import logging
from typing import Dict, Any, Optional, List
from pydantic import BaseModel
from fastapi import FastAPI, BackgroundTasks, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
import litellm

# Force standard output to UTF-8 to prevent Windows CP1252 charmap encoding errors
try:
    sys.stdout.reconfigure(encoding='utf-8')
    sys.stderr.reconfigure(encoding='utf-8')
except AttributeError:
    pass

from crew import generate_roadmap_crew

# Setup logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(title="MLSC Road Map & Quiz Generator API")

# Add CORS middleware to allow Next.js frontend to talk to FastAPI
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Adjust in production to match Next.js domain
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Directory to save completed roadmap jobs
JOBS_DIR = os.path.join(os.path.dirname(__file__), "jobs")
os.makedirs(JOBS_DIR, exist_ok=True)

class RoadmapRequest(BaseModel):
    topic: str
    timeframe: str
    hf_token: Optional[str] = None

class JobStatus(BaseModel):
    id: str
    status: str
    topic: str
    timeframe: str
    error: Optional[str] = None
    result: Optional[Dict[str, Any]] = None

# In-memory job status cache for fast retrieval (complements file storage)
jobs_db: Dict[str, Dict[str, Any]] = {}

# Standard fallback quiz questions in case LLM is offline or rate-limited
FALLBACK_QUIZZES = {
    "javascript": [
        {
            "question": "What is the output of 'typeof null' in JavaScript?",
            "options": ["'null'", "'object'", "'undefined'", "'value'"],
            "answer": "'object'",
            "explanation": "In JavaScript, typeof null is an historical bug that returns 'object'. It has been preserved for backward compatibility."
        },
        {
            "question": "Which of the following is true about closures in JavaScript?",
            "options": [
                "They are only created when functions are nested.",
                "They preserve outer function scope variables even after outer function execution terminates.",
                "They consume zero memory at runtime.",
                "They cannot modify outer scope variables."
            ],
            "answer": "They preserve outer function scope variables even after outer function execution terminates.",
            "explanation": "A closure is the combination of a function bundled together with references to its surrounding state (the lexical environment). This lets nested functions retain scope context."
        },
        {
            "question": "What is the main purpose of the JavaScript Event Loop?",
            "options": [
                "To execute all synchronous code repeatedly.",
                "To handle database queries in the browser.",
                "To monitor the call stack and callback queue, pushing tasks to the stack when it is empty.",
                "To speed up CSS animations."
            ],
            "answer": "To monitor the call stack and callback queue, pushing tasks to the stack when it is empty.",
            "explanation": "The event loop pushes tasks from the callback queue onto the call stack once the call stack becomes empty, coordinating asynchronous execution in single-threaded JS."
        },
        {
            "question": "What does 'Promise.all()' do if one of the promises rejects?",
            "options": [
                "It waits for other promises to resolve and ignores the rejected one.",
                "It immediately rejects with the error of the rejected promise.",
                "It retries the rejected promise twice.",
                "It returns undefined."
            ],
            "answer": "It immediately rejects with the error of the rejected promise.",
            "explanation": "Promise.all has fail-fast behavior: if any promise in the array rejects, the returned promise immediately rejects with that error, discarding others."
        },
        {
            "question": "What is the difference between '==' and '===' in JavaScript?",
            "options": [
                "'==' checks value only with type coercion, while '===' checks both value and type without coercion.",
                "'===' checks value only, while '==' checks type only.",
                "There is no difference; they are aliases.",
                "'===' is deprecated and should not be used."
            ],
            "answer": "'==' checks value only with type coercion, while '===' checks both value and type without coercion.",
            "explanation": "'===' (strict equality) performs no type coercion and returns false if operands are of different types, whereas '==' coerces them to a common type."
        }
    ],
    "python": [
        {
            "question": "What is the output of 'type([]) is list' in Python?",
            "options": ["True", "False", "Error", "None"],
            "answer": "True",
            "explanation": "The expression [] creates a list object, and its type is the built-in 'list' class, making the identity comparison True."
        },
        {
            "question": "How do you add an element to a Python set?",
            "options": ["set.append()", "set.add()", "set.insert()", "set.push()"],
            "answer": "set.add()",
            "explanation": "In Python, sets are unordered collection structures and use the '.add()' method to append single elements."
        },
        {
            "question": "What does a generator do in Python?",
            "options": [
                "It compiles Python code to binary.",
                "It returns a single completed list of numbers.",
                "It yields values lazily on demand using the 'yield' keyword, conserving memory.",
                "It speeds up file compression."
            ],
            "answer": "It yields values lazily on demand using the 'yield' keyword, conserving memory.",
            "explanation": "Generators allow lazy iterator execution. By using yield instead of return, they maintain local state between calls and avoid storing the entire array in memory."
        },
        {
            "question": "In Python, what is the 'GIL'?",
            "options": [
                "Global Interface Library",
                "Global Interpreter Lock",
                "General Indexing Layout",
                "Google Image Linker"
            ],
            "answer": "Global Interpreter Lock",
            "explanation": "The GIL (Global Interpreter Lock) is a mutex in CPython that prevents multiple native threads from executing Python bytecodes at once, limiting pure multithreading benefits."
        },
        {
            "question": "What is the output of dict.get('missing_key', 'default') if the key is not in the dictionary?",
            "options": ["None", "KeyError exception", "'default'", "False"],
            "answer": "'default'",
            "explanation": "The dict.get() method retrieves a key's value, and if it's missing, returns the second argument (the default fallback) rather than throwing a KeyError."
        }
    ],
    "system_design": [
        {
            "question": "What does 'Horizontal Scaling' mean?",
            "options": [
                "Upgrading CPU and RAM specs on a single server node.",
                "Adding more server nodes to the pool to distribute loads.",
                "Re-indexing the SQL tables.",
                "Running multiple threads in a single process."
            ],
            "answer": "Adding more server nodes to the pool to distribute loads.",
            "explanation": "Horizontal scaling (scaling out) involves adding more instances or nodes to the system pool, whereas vertical scaling (scaling up) means upgrading resources on a single node."
        },
        {
            "question": "What is the main purpose of a Load Balancer?",
            "options": [
                "To encrypt all database traffic.",
                "To distribute incoming network requests across multiple healthy backend servers.",
                "To store files in a cache.",
                "To compile server logs."
            ],
            "answer": "To distribute incoming network requests across multiple healthy backend servers.",
            "explanation": "Load balancers distribute user traffic evenly among a farm of backend servers, preventing any single server from becoming a bottleneck and improving reliability."
        },
        {
            "question": "In distributed databases, what does the CAP theorem state?",
            "options": [
                "A system can only guarantee Consistency, Availability, and Partition tolerance simultaneously.",
                "A system can guarantee at most two out of Consistency, Availability, and Partition tolerance at any time.",
                "Caching is always faster than memory access.",
                "Concurrency yields immediate ACID profiles."
            ],
            "answer": "A system can guarantee at most two out of Consistency, Availability, and Partition tolerance at any time.",
            "explanation": "The CAP Theorem states that a distributed data store can simultaneously provide at most two out of three guarantees: Consistency (C), Availability (A), and Partition tolerance (P)."
        },
        {
            "question": "What is the role of a CDN (Content Delivery Network)?",
            "options": [
                "To manage primary database transactions.",
                "To compile javascript bundles.",
                "To cache static assets geographically closer to users to reduce latency.",
                "To register DNS domains."
            ],
            "answer": "To cache static assets geographically closer to users to reduce latency.",
            "explanation": "CDNs use a network of edge proxy servers spread worldwide to cache and deliver static content (like CSS, images, JS) closer to users, improving loading speeds."
        },
        {
            "question": "Which index is optimized for high-write key-value store layouts like Cassandra or RocksDB?",
            "options": ["B+ Tree", "LSM Tree (Log-Structured Merge-Tree)", "Binary Search Tree", "Hash Table"],
            "answer": "LSM Tree (Log-Structured Merge-Tree)",
            "explanation": "LSM Trees write data sequentially to logs and immutable memory structures before flushing, which speeds up write speeds compared to in-place updates of B+ Trees."
        }
    ]
}

def run_crew_job(job_id: str, topic: str, timeframe: str, hf_token: Optional[str]):
    """Background worker function that runs the CrewAI task."""
    try:
        logger.info(f"Starting Crew job {job_id} for topic: {topic}, timeframe: {timeframe}")
        jobs_db[job_id]["status"] = "running"
        
        # Execute crew
        raw_result = generate_roadmap_crew(topic, timeframe, hf_token)
        
        # Parse result as JSON
        # Sometimes LLMs wrap it in ```json ... ``` or add leading/trailing text.
        # Let's clean it up to ensure it is valid JSON.
        cleaned_result = raw_result.strip()
        if cleaned_result.startswith("```json"):
            cleaned_result = cleaned_result[7:]
        if cleaned_result.endswith("```"):
            cleaned_result = cleaned_result[:-3]
        cleaned_result = cleaned_result.strip()
        
        try:
            roadmap_json = json.loads(cleaned_result)
        except json.JSONDecodeError as je:
            logger.error(f"Failed to parse raw output as JSON: {je}. Raw: {raw_result}")
            # Try parsing by finding the first '{' and last '}'
            start_idx = cleaned_result.find("{")
            end_idx = cleaned_result.rfind("}")
            if start_idx != -1 and end_idx != -1:
                try:
                    roadmap_json = json.loads(cleaned_result[start_idx:end_idx+1])
                except Exception:
                    raise ValueError("Output could not be formatted into valid JSON. Please try again.")
            else:
                raise ValueError("Output does not contain a valid JSON object.")

        # Save results
        job_data = {
            "id": job_id,
            "status": "completed",
            "topic": topic,
            "timeframe": timeframe,
            "result": roadmap_json,
            "error": None
        }
        
        # Write to memory db and to file
        jobs_db[job_id] = job_data
        with open(os.path.join(JOBS_DIR, f"{job_id}.json"), "w") as f:
            json.dump(job_data, f, indent=2)
            
        logger.info(f"Completed Crew job {job_id}")
        
    except Exception as e:
        logger.exception(f"Error in Crew job {job_id}")
        job_data = {
            "id": job_id,
            "status": "failed",
            "topic": topic,
            "timeframe": timeframe,
            "result": None,
            "error": str(e)
        }
        jobs_db[job_id] = job_data
        with open(os.path.join(JOBS_DIR, f"{job_id}.json"), "w") as f:
            json.dump(job_data, f, indent=2)

@app.post("/api/generate-roadmap", status_code=status.HTTP_202_ACCEPTED)
async def generate_roadmap(request: RoadmapRequest, background_tasks: BackgroundTasks):
    """Triggers the roadmap generation and returns a job ID."""
    if not request.topic or not request.timeframe:
        raise HTTPException(status_code=400, detail="Topic and timeframe are required.")
        
    job_id = str(uuid.uuid4())
    
    # Initialize job state
    jobs_db[job_id] = {
        "id": job_id,
        "status": "pending",
        "topic": request.topic,
        "timeframe": request.timeframe,
        "result": None,
        "error": None
    }
    
    # Run in background
    background_tasks.add_task(
        run_crew_job, 
        job_id, 
        request.topic, 
        request.timeframe, 
        request.hf_token
    )
    
    return {"job_id": job_id, "status": "pending"}

@app.get("/api/roadmap-status/{job_id}", response_model=JobStatus)
async def get_roadmap_status(job_id: str):
    """Retrieves the current status of a roadmap generation job."""
    # Check memory cache first
    if job_id in jobs_db:
        return jobs_db[job_id]
        
    # Check file storage
    job_file_path = os.path.join(JOBS_DIR, f"{job_id}.json")
    if os.path.exists(job_file_path):
        try:
            with open(job_file_path, "r") as f:
                job_data = json.load(f)
                jobs_db[job_id] = job_data  # cache it
                return job_data
        except Exception as e:
            logger.error(f"Error reading job file: {e}")
            raise HTTPException(status_code=500, detail="Error reading job data.")
            
    raise HTTPException(status_code=404, detail="Job not found.")

@app.get("/api/generate-quiz")
async def generate_quiz(topic: str = "javascript"):
    """Generates a 5-question multiple choice quiz on the topic using Hugging Face models or Gemini."""
    topic_lower = topic.lower().strip()
    
    hf_token = os.environ.get("HF_TOKEN") or os.environ.get("HUGGINGFACE_API_KEY")
    g_key = os.environ.get("GEMINI_API_KEY") or os.environ.get("GOOGLE_API_KEY")
    
    prompt = f"""
    Generate exactly 5 random, high-quality multiple choice questions (MCQs) for the technical topic: '{topic}'.
    Make the questions challenging, relevant for standard coding interviews, and unique.
    
    You MUST return ONLY a raw JSON array string with no markdown formatting. Do not wrap the JSON in ```json or ``` tags.
    Ensure it matches this schema exactly:
    [
      {{
        "question": "What is the output of X in Y conditions?",
        "options": ["Option A", "Option B", "Option C", "Option D"],
        "answer": "Option A", // This MUST exactly match one of the string items in options
        "explanation": "Provide a brief 1-2 sentence explanation of why Option A is correct."
      }}
    ]
    """
    
    # List of attempts to try (model_name, api_key, is_gemini)
    attempts = []
    if hf_token:
        attempts.append(("huggingface/Qwen/Qwen2.5-72B-Instruct", hf_token, False))
        attempts.append(("huggingface/meta-llama/Meta-Llama-3-8B-Instruct", hf_token, False))
    if g_key:
        attempts.append(("gemini/gemini-2.5-flash", g_key, True))
        
    for model, key, is_gemini in attempts:
        try:
            logger.info(f"Generating dynamic quiz for topic: {topic} using model: {model}")
            
            response = litellm.completion(
                model=model,
                messages=[{"role": "user", "content": prompt}],
                api_key=key,
                temperature=0.8
            )
            
            content = response.choices[0].message.content.strip()
            
            # Strip potential markdown fences
            if content.startswith("```json"):
                content = content[7:]
            if content.endswith("```"):
                content = content[:-3]
            content = content.strip()
            
            questions = json.loads(content)
            
            # Perform schema verification
            if not isinstance(questions, list) or len(questions) == 0:
                raise ValueError("Parsed content is not a list or empty.")
                
            for q in questions:
                if not all(k in q for k in ("question", "options", "answer", "explanation")):
                    raise ValueError("Missing keys in parsed question structure.")
                if len(q["options"]) != 4:
                    raise ValueError("Options list does not contain exactly 4 items.")
                if q["answer"] not in q["options"]:
                    raise ValueError("Correct answer does not match any of the provided options.")
                    
            logger.info(f"Successfully generated dynamic quiz with model {model}!")
            return {"topic": topic, "questions": questions}
            
        except Exception as e:
            logger.warning(f"Failed to generate quiz using model {model}: {e}")
            continue
            
    # All LLM attempts failed. Return static fallback.
    logger.warning("All quiz generation LLM attempts failed. Executing static fallback...")
    for key in FALLBACK_QUIZZES:
        if key in topic_lower:
            return {"topic": topic, "questions": FALLBACK_QUIZZES[key]}
    return {"topic": topic, "questions": FALLBACK_QUIZZES["javascript"]}


@app.get("/api/health")
async def health_check():
    """Health check endpoint."""
    return {"status": "healthy"}
