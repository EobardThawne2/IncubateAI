Because we made the strategic decision to run Version 1 as a entirely **stateless** application, we are bypassing traditional relational database schemas (like PostgreSQL tables or Prisma models).

Instead, the "schema" for this architecture refers strictly to the **Data Exchange Contracts** (Pydantic models in FastAPI). These models serve two critical purposes:

1. They dictate exactly what Next.js sends and receives.
2. They force the LLMs (via Groq) to return strictly formatted JSON instead of conversational text.

Here is the complete backend schema blueprint utilizing Python's `pydantic`.

---

## 1. Client-to-Server: Request Schema

This is the single payload Next.js sends to the FastAPI backend to kick off the multi-agent cascade.

```python
from pydantic import BaseModel, Field

class GenerationRequest(BaseModel):
    intent: str = Field(
        ..., 
        min_length=15, 
        max_length=1000,
        description="The raw, natural language business idea from the user."
    )

```

---

## 2. Internal LLM Execution Schemas (The Agent Constraints)

When working with CrewAI and LLMs, you cannot rely on prompt instructions alone to get perfectly formatted data. You must pass these schemas to the agents to enforce strict structured outputs.

### 2A. Orchestrator Output Schema

The Orchestrator Agent parses the `GenerationRequest` and outputs this schema to delegate tasks to the subordinate agents.

```python
class OrchestratorPlan(BaseModel):
    business_niche: str = Field(description="The specific market sector identified from the prompt")
    target_audience: str = Field(description="The primary user demographic")
    research_mission: str = Field(description="Specific instructions for the Research Agent")
    content_mission: str = Field(description="Specific instructions for the Content Agent")
    development_mission: str = Field(description="Specific instructions for the Development Agent")

```

### 2B. Content Agent Output Schema

While the Research and Development agents will output raw strings (Markdown and HTML respectively), the Content Agent must return distinct assets so the Next.js frontend can place them in separate UI cards.

```python
from typing import List

class CopyAssets(BaseModel):
    title: str = Field(description="A 2-4 word catchy brand name")
    tagline: str = Field(description="A one-sentence value proposition")
    welcome_email: str = Field(description="A 300-word welcome email formatted in Markdown")
    social_posts: List[str] = Field(
        description="An array of 3 distinct social media posts teasing the launch",
        min_items=3,
        max_items=3
    )

```

---

## 3. Server-to-Client: Final Response Schema

Once all agents complete their execution, FastAPI aggregates the data and validates it against this final response schema before transmitting it back to Next.js.

```python
class BusinessEngineResponse(BaseModel):
    status: str = Field(default="success")
    business_goal: str = Field(description="An echo of the user's original intent")
    research_markdown: str = Field(description="Raw markdown text of the market research dossier")
    copy_assets: CopyAssets = Field(description="The structured dictionary of marketing copy")
    landing_page_html: str = Field(description="The raw HTML and Tailwind CSS string for the iframe")

```

---

## 4. Error Handling Schema

If an agent hallucinates, Groq hits a rate limit, or the prompt is invalid, FastAPI must return a predictable error schema so the Next.js frontend can trigger the red alert modal without crashing.

```python
class ErrorResponse(BaseModel):
    status: str = Field(default="error")
    error_code: int = Field(description="HTTP status code corresponding to the failure")
    message: str = Field(description="A human-readable error message for the UI alert modal")
    failed_agent: str | None = Field(
        default=None, 
        description="If the pipeline crashed mid-execution, which agent failed?"
    )

```

## Why this structure wins the Promptathon:

By heavily typing your backend with Pydantic, you eliminate 90% of the bugs associated with AI apps (specifically, LLMs returning broken JSON). CrewAI can natively ingest Pydantic models to force the Groq models to adhere perfectly to your `CopyAssets` and `OrchestratorPlan` structures.