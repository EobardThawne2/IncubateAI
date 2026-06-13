# IncubateAI

IncubateAI is an AI-powered business engine that takes a simple business idea and automatically generates a comprehensive market research dossier, marketing copy, and a fully styled landing page. 

It uses a multi-agent system powered by CrewAI and Groq's high-speed LLMs to research, plan, and execute a business launch strategy.

## Features

- **Automated Market Research:** An autonomous agent browses the web to gather live data on market trends, competitors, and target audiences.
- **Copywriting:** Generates brand names, taglines, welcome emails, and social media posts.
- **Landing Page Generation:** Automatically codes a modern, dark-themed, responsive HTML landing page using Tailwind CSS.
- **FastAPI Backend:** Serves the application UI and handles asynchronous agent execution.
- **Dynamic Frontend:** Clean, modern interface built with HTML, CSS, and vanilla JavaScript.

## Prerequisites

- Python 3.10 or higher
- A Groq API Key

## Installation

1. Clone this repository:
   ```bash
   git clone https://github.com/EobardThawne2/IncubateAI.git
   cd IncubateAI
   ```
2. Create and activate a Python virtual environment:
   ```bash
   python -m venv venv
   # On Windows:
   venv\Scripts\activate
   # On macOS/Linux:
   source venv/bin/activate
   ```
3. Install the required dependencies:
   ```bash
   pip install -r requirements.txt
   ```
4. Copy the `.env.example` file to create your own `.env` file, and add your Groq API key:
   ```bash
   cp .env.example .env
   ```
   Inside `.env`:
   ```
   GROQ_API_KEY=your_groq_api_key_here
   ```

## Usage

1. Start the FastAPI development server:
   ```bash
   uvicorn main:app --reload
   ```
2. Open your web browser and navigate to: `http://127.0.0.1:8000/app`
3. Enter your business idea in the Launchpad input field and click "Generate Business Engine".
4. The system will run the AI crew in the background. Once completed, you will see the generated research, marketing copy, and live landing page preview.

## Architecture

- `main.py`: The FastAPI application entry point. Handles routing and API endpoints.
- `agent_engine.py`: Defines the CrewAI agents, tasks, and the orchestration logic. Interacts with the Groq API.
- `schemas.py`: Pydantic models for structured data validation between agents and the frontend.
- `templates/`: Contains the frontend HTML, CSS, and JS files.
- `docs/`: Contains project documentation and design briefs.

## Deployment Notes

For production deployment, ensure you:
- Use a production ASGI server like Gunicorn with Uvicorn workers.
- Secure your API endpoints, as the generation endpoint is currently open.
- Set up a proper reverse proxy (like Nginx) and HTTPS.
- Use a production-ready cache if needed (instead of relying on local browser storage for history).
- Ensure environment variables are securely injected into your deployment environment.
