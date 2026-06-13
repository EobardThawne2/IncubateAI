import os
from crewai import Agent, Task, Crew
from crewai.tools import BaseTool
from duckduckgo_search import DDGS
from schemas import OrchestratorPlan, CopyAssets, BusinessEngineResponse

# Monkey-patch to fix Groq cache_breakpoint error in older CrewAI versions
import crewai.llms.cache as _crewai_cache
_crewai_cache.mark_cache_breakpoint = lambda msg: msg


class DuckDuckGoSearchTool(BaseTool):
    name: str = "DuckDuckGo Web Search"
    description: str = "Search the web for real-time market trends and competitor analysis."
    
    def _run(self, query: str) -> str:
        try:
            results = DDGS().text(query, max_results=5)
            return "\n\n".join([f"Title: {r['title']}\nSnippet: {r['body']}\nURL: {r['href']}" for r in results])
        except Exception as e:
            return f"Search failed: {str(e)}"

def run_business_engine(intent: str) -> BusinessEngineResponse:
    groq_api_key = os.environ.get("GROQ_API_KEY")
    if not groq_api_key or groq_api_key == "your_api_key_here":
        raise ValueError("GROQ_API_KEY is missing or invalid. Please update the .env file.")

    llm_70b = "groq/llama-3.3-70b-versatile"
    llm_8b = "groq/llama-3.1-8b-instant"

    # 1. Orchestrator
    orchestrator = Agent(
        role="Chief Strategy Officer",
        goal="Analyze the user's business intent and create a clear, actionable mission plan for the team.",
        backstory="You are a seasoned startup founder capable of breaking down vague ideas into precise tasks.",
        llm=llm_70b,
        verbose=True
    )

    orchestrator_task = Task(
        description=f"Analyze this business idea: '{intent}'. Determine the niche, audience, and instructions for research, content, and development.",
        expected_output="A structured JSON plan matching the OrchestratorPlan schema.",
        agent=orchestrator,
        output_pydantic=OrchestratorPlan
    )

    # 2. Researcher
    researcher = Agent(
        role="Market Research Analyst",
        goal="Gather live data on market trends, competitors, and target audience needs.",
        backstory="You are a meticulous researcher who relies on live web search to find data. You provide well-formatted markdown reports.",
        tools=[DuckDuckGoSearchTool()],
        llm=llm_70b,
        verbose=True
    )

    research_task = Task(
        description="Using the Orchestrator's plan, execute live web searches to gather market trends and competitor data. Summarize findings.",
        expected_output="A comprehensive Markdown dossier of market research, formatted with headings and bullet points.",
        agent=researcher
    )

    # 3. Content Writer
    content_writer = Agent(
        role="Brand Copywriter",
        goal="Draft compelling brand assets including name, tagline, emails, and social posts based on the research.",
        backstory="You are a world-class copywriter skilled at converting market research into high-converting copy.",
        llm=llm_70b,
        verbose=True
    )

    content_task = Task(
        description="Using the Orchestrator's plan and the Research dossier, draft the brand name, tagline, welcome email, and 3 social posts.",
        expected_output="A structured JSON response containing the marketing copy.",
        agent=content_writer,
        output_pydantic=CopyAssets
    )

    # 4. Developer
    developer = Agent(
        role="Frontend Engineer",
        goal="Develop a visually stunning, responsive landing page using HTML and Tailwind CSS.",
        backstory="You are a 10x developer who builds premium, high-converting landing pages. You write the complete, raw HTML string. Do not use markdown code blocks.",
        llm=llm_70b,
        verbose=True
    )

    development_task = Task(
        description="""Based on the Orchestrator's plan, the Research, and the Copywriter's assets, generate a complete, responsive HTML landing page for the business using Tailwind CSS via CDN. 
CRITICAL REQUIREMENTS:
1. YOU MUST INCLUDE `<script src="https://cdn.tailwindcss.com"></script>` in the `<head>`.
2. YOU MUST INCLUDE a modern Google Font like Inter or Outfit in the `<head>` and apply it to the body.
3. Design a beautiful, premium, dark-mode-first landing page with appropriate typography hierarchy (e.g., text-5xl for hero headings, text-xl for subheadings, text-base for body text). Do NOT make everything massive. Use whitespace, padding, and flexbox/grid for proper layouts.
4. Use sleek UI elements: glassmorphism, gradients (e.g., bg-gradient-to-r from-emerald-400 to-cyan-500), rounded corners, and hover effects.
5. The landing page MUST be a full website with the following structure:
   - A modern Navbar with the Brand Name (from Copywriter).
   - A stunning Hero Section with the Tagline (from Copywriter) as the main headline, a supporting paragraph, and a primary "Subscribe" call-to-action button.
   - A Features Section with a CSS Grid layout highlighting 3-4 key benefits from the Market Research.
   - A clean Footer with social links.
6. Output ONLY the raw HTML string, starting with '<!DOCTYPE html>'. Remove any ```html wrappers.""",
        expected_output="Raw HTML string for the full landing page.",
        agent=developer
    )

    # Assemble the Crew
    crew = Crew(
        agents=[orchestrator, researcher, content_writer, developer],
        tasks=[orchestrator_task, research_task, content_task, development_task],
        verbose=True
    )

    # Execute
    crew.kickoff()
    
    # Extract HTML, making sure we strip out markdown code block formatting if the LLM hallucinated it
    raw_html = development_task.output.raw
    if raw_html.startswith("```html"):
        raw_html = raw_html[7:]
    if raw_html.endswith("```"):
        raw_html = raw_html[:-3]
    
    return BusinessEngineResponse(
        status="success",
        business_goal=intent,
        research_markdown=research_task.output.raw,
        copy_assets=content_task.output.pydantic,
        landing_page_html=raw_html.strip()
    )
