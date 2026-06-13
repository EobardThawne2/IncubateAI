# Product Requirements Document (PRD)

**Product Name:** Multi-Agent Business Orchestrator

**Document Owner:** Sumeer Khattar

**Status:** MVP Proposed

---

## 1. App Overview

The Multi-Agent Business Orchestrator is a web-based platform designed to automate the initial heavy lifting of launching a new business or project. By providing a single natural language prompt outlining a business intent, the system triggers a coordinated cascade of AI agents. These agents autonomously conduct market research, draft marketing copy, and generate functional landing page code, returning a comprehensive, ready-to-deploy business asset package in minutes.

## 2. Problem Statement

Creators, researchers, and indie hackers suffer from extreme context-switching and workflow fragmentation. Validating a business idea currently requires toggling between search engines, document editors, AI chat interfaces, and code editors. This friction breaks creative flow, delays time-to-market, and increases the activation energy required to turn a raw idea into a tangible asset.

## 3. Target Users

* **Indie Hackers & Solopreneurs:** Need to validate ideas rapidly without spending hours on boilerplate copy or basic UI setup.
* **Content Creators & Newsletter Operators:** Require instant market research and drafted assets to launch new content verticals.
* **Startup Founders:** Want to spin up quick landing pages for A/B testing value propositions before committing engineering resources.

## 4. Core Features

* **Single-Prompt Input Console:** A minimalist text area for users to submit unstructured business ideas.
* **Agent Status Tracker:** A real-time UI component showing which agent (Orchestrator, Research, Content, Developer) is currently active to prevent perceived timeout during the 30-90 second generation window.
* **Orchestration Engine:** A backend routing system that parses the prompt and delegates highly specific, constrained JSON tasks to downstream agents.
* **Live Web Search Integration:** A capability for the Research Agent to bypass static training data and pull real-time industry trends.
* **Asset Sandbox & Preview:** A dashboard featuring distinct tabs for the generated Research Report, Marketing Copy, and an isolated `<iframe>` to safely render and interact with the generated HTML/Tailwind landing page.

## 5. User Stories

| As a... | I want to... | So that I can... |
| --- | --- | --- |
| **Creator** | Submit a single sentence about my idea | Trigger a complete business sprint without manual intervention. |
| **User** | See exactly which agent is working | Understand the system status while waiting for the lengthy generation process. |
| **Founder** | Read structured market trends and competitor data | Validate my idea against current market realities before building. |
| **Marketer** | Receive a cohesive name, tagline, and welcome email | Skip the "blank page" phase of brand creation. |
| **Developer** | See a fully rendered, responsive HTML preview | Immediately copy-paste the code to launch my landing page. |

## 6. MVP Scope (Version 1)

The V1 MVP will focus strictly on stateless execution to guarantee speed and reliability for demonstration purposes.

* **Frontend:** Next.js (App Router), Tailwind CSS, stateless data fetching.
* **Backend:** FastAPI (Python), CrewAI orchestration.
* **Intelligence:** Groq API load-balancing (`llama-3.3-70b` for orchestration/code, `llama-4-scout` for research, `llama-3.1-8b` for fast copy).
* **Storage:** None. State lives entirely in the React frontend during the session. Refreshing the browser resets the dashboard.

## 7. Success Metrics

| Metric | Target / Definition |
| --- | --- |
| **Time to Completion** | End-to-end generation under 90 seconds. |
| **JSON Parse Success Rate** | >95% of backend responses map correctly to frontend tabs without errors. |
| **Code Render Rate** | >90% of generated landing pages render in the iframe without visual breakage. |
| **Task Completion** | System successfully executes all 4 agent steps sequentially without hanging. |

## 8. Out of Scope for Version 1 (Features to Avoid)

* **User Authentication & Accounts:** Adds unnecessary onboarding friction for a proof-of-concept.
* **Database Integration (History/Saved Projects):** Slows down development and introduces deployment complexities.
* **Custom Domain Publishing:** Users will copy the code to host elsewhere; V1 will not act as a website builder platform (like Webflow).
* **Agentic Loops/Self-Correction:** Agents will pass the baton sequentially (linear DAG). Complex cyclical loops risk endless token consumption and timeouts.
* **Image Generation:** V1 focuses strictly on text and UI code layout to control scope and latency.