from pydantic import BaseModel, Field
from typing import List, Optional

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
