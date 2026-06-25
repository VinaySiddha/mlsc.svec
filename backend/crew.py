import os
import sys
import json
import logging
from typing import Dict, Any, Optional
from crewai import Agent, Task, Crew, Process, LLM
from dotenv import load_dotenv

# Reconfigure stdout/stderr to use UTF-8. This prevents CP1252/charmap errors on Windows when printing emojis.
try:
    sys.stdout.reconfigure(encoding='utf-8')
    sys.stderr.reconfigure(encoding='utf-8')
except AttributeError:
    # Fallback for environments where stdout cannot be reconfigured
    pass

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Load env variables from parent directory
load_dotenv(dotenv_path=os.path.join(os.path.dirname(os.path.dirname(__file__)), ".env"))

def get_llm(model_name: str, hf_token: Optional[str] = None, gemini_api_key: Optional[str] = None, force_gemini: bool = False) -> LLM:
    """
    Get configured LLM. If force_gemini is True, use Gemini.
    Otherwise, if HF token is available, configure HF Serverless.
    If that fails or is missing, fall back to Gemini.
    """
    g_key = gemini_api_key or os.environ.get("GEMINI_API_KEY") or os.environ.get("GOOGLE_API_KEY")
    
    if force_gemini:
        if g_key:
            logger.info("Forced fallback. Using Gemini API.")
            return LLM(model="gemini/gemini-2.5-flash", api_key=g_key, temperature=0.7, use_native=False)
        raise ValueError("Gemini API key is required but missing from environment.")

    token = hf_token or os.environ.get("HF_TOKEN") or os.environ.get("HUGGINGFACE_API_KEY")
    
    if model_name.startswith("huggingface/") and token:
        logger.info(f"Configuring Hugging Face LLM: {model_name}")
        return LLM(
            model=model_name,
            api_key=token,
            temperature=0.7,
            max_tokens=4096
        )
    
    # Fallback to Gemini if no token
    if g_key:
        logger.info(f"Hugging Face token not provided. Falling back to Gemini for: {model_name}")
        return LLM(model="gemini/gemini-2.5-flash", api_key=g_key, temperature=0.7, use_native=False)
    
    # Absolute fallback (public HF models without key, likely to rate limit)
    logger.warning("No keys found. Attempting unauthenticated Hugging Face call.")
    return LLM(model=model_name, temperature=0.7)

def run_crew_with_llms(topic: str, timeframe: str, hf_token: Optional[str] = None, force_gemini: bool = False) -> str:
    """Runs the crew with the specified configuration (Hugging Face or Gemini)."""
    # Optimized Hugging Face models (7B and 8B parameters are highly available and fast on HF Serverless)
    planner_model = "huggingface/meta-llama/Meta-Llama-3-8B-Instruct"
    detailer_model = "huggingface/Qwen/Qwen2.5-Coder-7B-Instruct"  # Changed from 32B to 7B to avoid timeouts
    synthesizer_model = "huggingface/meta-llama/Meta-Llama-3-8B-Instruct"  # Changed from Qwen 72B to Llama 8B

    planner_llm = get_llm(planner_model, hf_token, force_gemini=force_gemini)
    detailer_llm = get_llm(detailer_model, hf_token, force_gemini=force_gemini)
    synthesizer_llm = get_llm(synthesizer_model, hf_token, force_gemini=force_gemini)

    # 1. Agents Definition
    syllabus_planner = Agent(
        role="Expert Syllabus and Interview Roadmap Planner",
        goal="Deconstruct the interview topic and time limit into a structured, milestone-based syllabus optimized for rapid learning.",
        backstory=(
            "You are an expert interviewer and curriculum designer. You know exactly what concepts "
            "are crucial for different tech stacks and how to break them down into hourly or daily milestones "
            "depending on the preparation window. You prioritize high-impact topics that are frequently asked."
        ),
        verbose=True,
        allow_delegation=False,
        llm=planner_llm
    )

    topic_detailer = Agent(
        role="Senior Technical Educator and Subject Matter Expert",
        goal="Provide rich context, technical explanations, coding challenges/snippets, and key interview questions for each syllabus topic.",
        backstory=(
            "You are a senior software engineer who loves teaching. You write concise, high-impact notes "
            "and code examples that help candidates master complex concepts instantly. You focus on code implementation "
            "and real-world edge cases that interviewers love to test."
        ),
        verbose=True,
        allow_delegation=False,
        llm=detailer_llm
    )

    roadmap_synthesizer = Agent(
        role="Roadmap Architect and JSON Formatter",
        goal="Synthesize the syllabus and topic details into a clean, complete, and strictly structured JSON object representing the entire roadmap.",
        backstory=(
            "You are a precise data architect. You take detailed educational content and structure it into a "
            "perfect JSON document matching the requested schema. You never omit details or include markdown wrapper text "
            "in your final JSON output. You make sure the JSON structure is perfectly valid and ready for frontend parsing."
        ),
        verbose=True,
        allow_delegation=False,
        llm=synthesizer_llm
    )

    # 2. Tasks Definition
    create_syllabus_task = Task(
        description=(
            "Based on the target topic: '{topic}' and preparation window: '{timeframe}', create a structured "
            "milestone-based syllabus. Break down the timeframe into 3-5 distinct milestones (e.g., hours or days). "
            "For each milestone, list 2-4 critical sub-topics that the candidate MUST prepare. Explain why each "
            "milestone is structured this way."
        ),
        expected_output="A detailed markdown syllabus outlining milestones, subtopics, and duration allocation.",
        agent=syllabus_planner
    )

    generate_details_task = Task(
        description=(
            "For each milestone and sub-topic defined in the syllabus, generate:\n"
            "1. A detailed technical explanation (2-3 paragraphs) focusing on core concepts.\n"
            "2. A real-world code snippet demonstrating the concept (keep it clean and copy-pasteable).\n"
            "3. 2-3 common interview questions with brief, high-impact answers.\n"
            "4. Suggested high-quality documentation links or reference resources."
        ),
        expected_output="Fleshed-out educational content for every single topic in the syllabus.",
        agent=topic_detailer
    )

    synthesize_roadmap_task = Task(
        description=(
            "Synthesize the syllabus and the detailed technical content into a single, cohesive JSON object. "
            "The JSON MUST strictly follow this schema:\n\n"
            "{{\n"
            "  \"title\": \"Name of the Roadmap (e.g., 24-Hour JavaScript Interview Preparation)\",\n"
            "  \"description\": \"Brief strategy overview of how to tackle this timeframe\",\n"
            "  \"timeframe\": \"{timeframe}\",\n"
            "  \"milestones\": [\n"
            "    {{\n"
            "      \"id\": \"m1\",\n"
            "      \"title\": \"Milestone Title (e.g., Hour 0-4: JavaScript Core Foundations)\",\n"
            "      \"description\": \"Brief overview of what to achieve in this milestone\",\n"
            "      \"topics\": [\n"
            "        {{\n"
            "          \"id\": \"t1_1\",\n"
            "          \"title\": \"Topic Title (e.g., Closures and Lexical Scope)\",\n"
            "          \"description\": \"Detailed explanation, core concepts, and interview prep context. This should be a robust paragraph or two containing everything they need to know to speak intelligently about it.\",\n"
            "          \"codeSnippet\": \"Provide a clean, copy-pasteable code snippet showing this in action, or empty string if it is purely conceptual\",\n"
            "          \"commonQuestions\": [\n"
            "            {{\n"
            "              \"question\": \"What is a closure?\",\n"
            "              \"answer\": \"A closure is the combination of a function bundled together with references to its surrounding state...\"\n"
            "            }}\n"
            "          ],\n"
            "          \"resources\": [\n"
            "            {{\n"
            "              \"name\": \"MDN Web Docs - Closures\",\n"
            "              \"url\": \"https://developer.mozilla.org/en-US/docs/Web/JavaScript/Closures\"\n"
            "            }}\n"
            "          ],\n"
            "          \"status\": \"pending\"\n"
            "        }}\n"
            "      ]\n"
            "    }}\n"
            "  ]\n"
            "}}\n\n"
            "Ensure that every topic mentioned in the syllabus is fully detailed in the JSON. "
            "Make sure the JSON is perfectly valid. Do not wrap the JSON in ```json markdown formatting. Output ONLY the raw JSON string starting with '{{' and ending with '}}'."
        ),
        expected_output="A single raw JSON string matching the specified schema.",
        agent=roadmap_synthesizer
    )

    # 3. Crew Definition
    crew = Crew(
        agents=[syllabus_planner, topic_detailer, roadmap_synthesizer],
        tasks=[create_syllabus_task, generate_details_task, synthesize_roadmap_task],
        process=Process.sequential,
        verbose=True
    )

    inputs = {
        "topic": topic,
        "timeframe": timeframe
    }
    
    result = crew.kickoff(inputs=inputs)
    return str(result)

def generate_roadmap_crew(topic: str, timeframe: str, hf_token: Optional[str] = None) -> str:
    """
    Executes a CrewAI crew. Tries Hugging Face models first, and automatically
    falls back to Gemini if Hugging Face rate limits or errors out.
    """
    try:
        # Check if HF Token is configured
        has_token = hf_token or os.environ.get("HF_TOKEN") or os.environ.get("HUGGINGFACE_API_KEY")
        if not has_token:
            logger.info("No Hugging Face token found. Directing execution to Gemini fallback...")
            return run_crew_with_llms(topic, timeframe, force_gemini=True)
            
        logger.info("Triggering roadmap crew using Hugging Face Serverless models...")
        return run_crew_with_llms(topic, timeframe, hf_token=hf_token, force_gemini=False)
    except Exception as e:
        logger.warning(f"Crew execution failed on Hugging Face models: {e}. Executing immediate fallback to Gemini API...")
        try:
            return run_crew_with_llms(topic, timeframe, force_gemini=True)
        except Exception as fallback_error:
            logger.exception("Both Hugging Face and Gemini models failed to run.")
            raise RuntimeError(f"Roadmap generator crew failed completely: {fallback_error}")
