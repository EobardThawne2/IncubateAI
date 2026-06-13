from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from pydantic import BaseModel, Field
from typing import List, Optional
import os
from agent_engine import run_business_engine

app = FastAPI(title="Multi-Agent Business Orchestrator API")

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/health")
async def health_check():
    return {"status": "ok"}

# Mount static files
templates_dir = os.path.join(os.path.dirname(__file__), "templates")
if os.path.exists(templates_dir):
    app.mount("/static", StaticFiles(directory=templates_dir), name="static")

    @app.get("/")
    async def serve_index():
        return FileResponse(os.path.join(templates_dir, "index.html"))
    
    @app.get("/app")
    async def serve_app():
        return FileResponse(os.path.join(templates_dir, "app.html"))
    
    @app.get("/privacy")
    async def serve_privacy():
        return FileResponse(os.path.join(templates_dir, "privacy.html"))
        
    @app.get("/terms")
    async def serve_terms():
        return FileResponse(os.path.join(templates_dir, "terms.html"))
    
    @app.get("/{filename}")
    async def serve_files(filename: str):
        file_path = os.path.join(templates_dir, filename)
        if os.path.exists(file_path):
            return FileResponse(file_path)
        return {"error": "File not found"}

# --- Pydantic Schemas ---
class GenerationRequest(BaseModel):
    intent: str = Field(..., min_length=15, max_length=1000, description="The raw, natural language business idea from the user.")

class OrchestratorPlan(BaseModel):
    business_niche: str = Field(description="The specific market sector identified from the prompt")
    target_audience: str = Field(description="The primary user demographic")
    research_mission: str = Field(description="Specific instructions for the Research Agent")
    content_mission: str = Field(description="Specific instructions for the Content Agent")
    development_mission: str = Field(description="Specific instructions for the Development Agent")

class CopyAssets(BaseModel):
    title: str = Field(description="A 2-4 word catchy brand name")
    tagline: str = Field(description="A one-sentence value proposition")
    welcome_email: str = Field(description="A 300-word welcome email formatted in Markdown")
    social_posts: List[str] = Field(description="An array of 3 distinct social media posts teasing the launch", min_length=3, max_length=3)

class BusinessEngineResponse(BaseModel):
    status: str = Field(default="success")
    business_goal: str = Field(description="An echo of the user's original intent")
    research_markdown: str = Field(description="Raw markdown text of the market research dossier")
    copy_assets: CopyAssets = Field(description="The structured dictionary of marketing copy")
    landing_page_html: str = Field(description="The raw HTML and Tailwind CSS string for the iframe")

class ErrorResponse(BaseModel):
    status: str = Field(default="error")
    error_code: int = Field(description="HTTP status code corresponding to the failure")
    message: str = Field(description="A human-readable error message for the UI alert modal")
    failed_agent: Optional[str] = Field(default=None, description="If the pipeline crashed mid-execution, which agent failed?")

# --- API Endpoints ---
@app.post("/api/generate-business", response_model=BusinessEngineResponse)
def generate_business(req: GenerationRequest):
    try:
        # Run the CrewAI Multi-Agent pipeline
        response = run_business_engine(req.intent)
        return response
    except Exception as e:
        return ErrorResponse(
            status="error",
            error_code=500,
            message=str(e)
        )
