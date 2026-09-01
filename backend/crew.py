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
    pass

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Load env variables from parent directory
load_dotenv(dotenv_path=os.path.join(os.path.dirname(os.path.dirname(__file__)), ".env"))

def get_llm(gemini_api_key: Optional[str] = None) -> LLM:
    """Get configured Gemini LLM for CrewAI agents."""
    g_key = gemini_api_key or os.environ.get("GEMINI_API_KEY") or os.environ.get("GOOGLE_API_KEY")
    if g_key:
        logger.info("Configuring Gemini LLM for Roadmap Crew.")
        return LLM(model="gemini/gemini-2.0-flash", api_key=g_key, temperature=0.7, use_native=False)
    raise ValueError("Gemini API key is required but missing from environment (GEMINI_API_KEY or GOOGLE_API_KEY).")

def run_crew(topic: str, timeframe: str) -> str:
    """Runs the crew with Gemini LLMs."""
    llm = get_llm()

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
        llm=llm
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
        llm=llm
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
        llm=llm
    )

    # 2. Tasks Definition
    create_syllabus_task = Task(
        description=(
            f"Based on the target topic: '{topic}' and preparation window: '{timeframe}', create a structured "
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
            "{\n"
            f"  \"title\": \"Name of the Roadmap (e.g., {timeframe} {topic} Interview Preparation)\",\n"
            "  \"description\": \"Brief strategy overview of how to tackle this timeframe\",\n"
            f"  \"timeframe\": \"{timeframe}\",\n"
            "  \"milestones\": [\n"
            "    {\n"
            "      \"id\": \"m1\",\n"
            "      \"title\": \"Milestone Title (e.g., Milestone 1: Core Foundations)\",\n"
            "      \"description\": \"Brief overview of what to achieve in this milestone\",\n"
            "      \"topics\": [\n"
            "        {\n"
            "          \"id\": \"t1_1\",\n"
            "          \"title\": \"Topic Title\",\n"
            "          \"description\": \"Detailed explanation, core concepts, and interview prep context.\",\n"
            "          \"codeSnippet\": \"Clean code snippet showing this in action, or empty string if conceptual\",\n"
            "          \"commonQuestions\": [\n"
            "            {\n"
            "              \"question\": \"Question text\",\n"
            "              \"answer\": \"Answer text\"\n"
            "            }\n"
            "          ],\n"
            "          \"resources\": [\n"
            "            {\n"
            "              \"name\": \"Documentation Resource Name\",\n"
            "              \"url\": \"https://example.com\"\n"
            "            }\n"
            "          ],\n"
            "          \"status\": \"pending\"\n"
            "        }\n"
            "      ]\n"
            "    }\n"
            "  ]\n"
            "}\n\n"
            "Ensure that every topic mentioned in the syllabus is fully detailed in the JSON. "
            "Make sure the JSON is perfectly valid. Do not wrap the JSON in ```json markdown formatting. Output ONLY the raw JSON string starting with '{' and ending with '}'."
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

def generate_roadmap_crew(topic: str, timeframe: str) -> str:
    """Executes a CrewAI crew using Google Gemini LLM."""
    try:
        logger.info(f"Triggering roadmap crew for topic '{topic}' using Gemini...")
        return run_crew(topic, timeframe)
    except Exception as e:
        logger.exception(f"Roadmap generator crew execution failed: {e}")
        raise RuntimeError(f"Roadmap generator crew failed: {e}")
