This App Flow Document outlines a high-contrast, minimalist dashboard interface designed to run as a single-page application (SPA) with three distinct view states.

Follow this explicit specification to build the Next.js frontend without guessing layout patterns or state behavior.

---

## Global Navigation & Layout Shell

* **Layout Structure:** A fixed-top header with a sidebar navigation menu (collapsible on mobile).
* **Header Elements:** App Title (`Multi-Agent Orchestrator`), a status indicator (`API Connected`), and a link to the GitHub repository.
* **Sidebar Menu Items:**
* `Launchpad` (Active by default)
* `Documentation` (Static page containing the PRD/TRD)


* **Design Tokens:** Background `#09090b` (Zinc 950), Text `#fafafa` (Zinc 50), Borders `#27272a` (Zinc 800), Primary Accent `#3f3f46` (Zinc 700).

---

## State 1: The Launchpad (Empty / Initial State)

This is the initial screen displayed when a user arrives at the platform.

### UI Components & Layout

* **Centered Hero Section:** A clean typographic header reading `"What business are we building today?"` with a muted subtitle reading `"Enter a single high-level prompt to trigger your automated research, content, and engineering squad."`
* **Main Input Console:** A large, multi-line auto-resizing textarea with placeholder text: `"e.g., I want to launch a newsletter about green-energy startups in India."`
* **Action Button:** A large `"Generate Business Engine"` button anchored directly below the textarea on the right side.

### User Actions & Component Behavior

* **Text Field Typing:** As the user types, characters are counted. The button remains disabled until at least 15 characters are entered to prevent accidental empty submissions.
* **Clicking "Generate Business Engine":**
* Validates the text string.
* Triggers an HTTP `POST` fetch request to `/api/generate-business`.
* Immediately updates the global UI state variable `appState` from `'idle'` to `'processing'`, swapping the view layout.



---

## State 2: Active Orchestration (Processing State)

This view replaces the Launchpad while the API request is pending (duration: 30–90 seconds).

### UI Components & Layout

* **Prompt Echo Banner:** Displays a truncated, italicized version of the user's input prompt at the top so they retain context.
* **The Orchestration Tracker:** A vertically stacked list of execution rows representing each agent. Each row contains an icon, an agent name, a real-time status label, and a progress indicator.

### Sequential Interaction Flow

1. **Phase 1: Orchestration Parsing:** Rows 1-4 active.
Row 1 (Orchestrator) shows a spinning loading icon and text: "Parsing intent & delegating missions...". Rows 2, 3, and 4 display a greyed-out "Waiting..." status badge.


2. **Phase 2: Market Analysis:** Row 1 complete, Row 2 active.
Row 1 changes to a green checkmark and "Missions Assigned". Row 2 (Researcher) activates with a loading spinner and text: "Scouting live trends via DuckDuckGo...".


3. **Phase 3: Asset Generation:** Row 2 complete, Row 3 active.
Row 2 turns to a green checkmark. Row 3 (Content Writer) activates with a loading spinner and text: "Drafting copy assets, naming, and taglines...".


4. **Phase 4: Interface Sandbox:** Row 3 complete, Row 4 active.
Row 3 turns to a green checkmark. Row 4 (Developer) activates with a loading spinner and text: "Compiling responsive HTML and Tailwind CSS UI code...".


---

## State 3: Workspace Dashboard (Success State)

Triggered immediately when the API returns an HTTP 200 with the fully compiled JSON payload. The `appState` changes to `'success'`.

### UI Components & Layout

* **Split-Pane Workspace:**
* **Left Column (Width: 40%):** A markdown and text viewer split into interactive tabs.
* **Right Column (Width: 60%):** A dedicated live website interactive preview monitor.


* **The Left Column Tab Matrix:**
* **Tab 1: Research Dossier (Active by default):** Renders the `research_markdown` string using a standard React Markdown library. Code agents must add a floating "Copy Markdown" floating action button.
* **Tab 2: Brand Copy:** Lists separate sub-cards for `Title`, `Tagline`, `Welcome Email Body`, and `Social Threads`, each with an independent "Copy Text" utility button.
* **Tab 3: Raw Source Code:** Displays the raw string contents of `landing_page_html` inside a syntax-highlighted code block component. Includes a "Copy Source Code" button.


* **The Right Column Monitor:**
* Renders an `<iframe>` element.
* **Critical Attribute:** The `srcDoc` attribute of the iframe is directly bound to the `landing_page_html` string variable. This safely renders the functional web asset with working buttons, Tailwind layouts, and responsive constraints inside an isolated viewport.



---

## Exception Handling & Error States

### 1. Network / API Rate Limit Failure

* **Trigger:** The backend returns an HTTP 429 (Rate Limited by Groq) or 500 (Script crashed).
* **Behavior:** The application state transitions to `'error'`. A destructive red alert modal pops up over the orchestration tracker.
* **Modal Text:** `"Engine Overloaded: Free API rate limits were exceeded during multi-agent token exchange."`
* **Primary Action Button:** `"Return to Launchpad"` (Resets the application state to `'idle'` but retains the user's text inside the prompt area so they don't lose their input).

### 2. Browser Interruption / Refresh

* **Trigger:** The user closes or refreshes the page mid-generation.
* **Behavior:** Because the system is stateless, all active processing memory clears. On reload, the user is presented with **State 1 (The Launchpad)** in its pristine empty state.

---

## Next Steps for the Coding Agent

To implement this interface perfectly, follow these step-by-step structural guidelines:

1. Initialize a clean Next.js app with TypeScript and the `/app` directory router.
2. Run `npx shadcn-ui@latest init` selecting the dark theme baseline variables.
3. Build out a single main page component `app/page.tsx` utilizing a React `useState` machine tracking `status: 'idle' | 'processing' | 'success' | 'error'`.
4. Wrap layout blocks tightly inside conditional template renders mapping directly to the states detailed above.