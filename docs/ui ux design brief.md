# UI/UX Design Specification Brief

**Project:** Multi-Agent Business Orchestrator

**Project Owner:** Sumeer Khattar

**Target Audience:** Indie Hackers, Founders, Developers

**Design Persona:** "Developer-Chic" — High-signal, low-noise, incredibly fast.

This document serves as the exact visual and interaction blueprint for any AI coding agent (like v0, Cursor, or Lovable) building the Next.js frontend.

---

## 1. Design Philosophy & Visual References

The orchestrator must feel like a premium, high-performance developer tool, not a consumer social app. It should evoke the feeling of a command center.

* **Vibe:** Professional, heavily constrained, fast, and data-dense.
* **Visual References:**
* **Linear.app:** For the dark-mode color depth, typography scale, and subtle border highlights.
* **Vercel Dashboard:** For the clean tab switching, input field styling, and perfect split-pane layouts.
* **Stripe:** For the micro-interactions and button loading states.


* **Theme:** Strict Dark Mode default. No light mode toggle for V1 to ensure design consistency and speed of execution.

---

## 2. Color Palette (Tailwind Tokens)

Rely on the Tailwind CSS `zinc` palette to achieve a sophisticated, slightly cool dark mode. Avoid pure black (`#000000`).

| Element | Hex Code | Tailwind Class | Purpose |
| --- | --- | --- | --- |
| **App Background** | `#09090b` | `bg-zinc-950` | Global application background. |
| **Panel / Card Bg** | `#18181b` | `bg-zinc-900` | Sidebar, input areas, split-pane backgrounds. |
| **Borders** | `#27272a` | `border-zinc-800` | Subtle dividers, card outlines, input borders. |
| **Primary Text** | `#fafafa` | `text-zinc-50` | Headings, user inputs, active tab text. |
| **Muted Text** | `#a1a1aa` | `text-zinc-400` | Subtitles, placeholders, inactive tabs. |
| **Primary Accent** | `#ffffff` | `bg-white text-black` | Primary Call-to-Action buttons (high contrast). |
| **Processing State** | `#3b82f6` | `text-blue-500` | Active loading spinners, active step icons. |
| **Success State** | `#10b981` | `text-emerald-500` | Completed step checkmarks. |
| **Error State** | `#ef4444` | `text-red-500` | Rate limit warnings, failed agent tasks. |

---

## 3. Typography System

Typography must bridge the gap between editorial readability (for the generated copy) and technical precision (for code and status).

* **Primary Font (UI & Content):** `Inter` or `Geist Sans`. Used for all headings, buttons, and paragraph text.
* **Monospace Font (Code & Badges):** `JetBrains Mono`, `Fira Code`, or `Geist Mono`. Used for the raw HTML viewer, JSON outputs, and small status badges.

**Scale & Weights:**

* **App Title:** `text-sm font-medium tracking-wide` (Understated, not massive).
* **Hero Heading:** `text-3xl font-semibold tracking-tight`.
* **Body Text:** `text-sm leading-relaxed text-zinc-300`.
* **Button Text:** `text-sm font-medium`.

---

## 4. Component Styling & Geometry

Instruct the AI builder to use `shadcn/ui` with the following global overrides:

* **Borders & Radius:** Use `rounded-lg` (8px) for major panels and `rounded-md` (6px) for buttons and inputs. Keep borders strictly to `border-[1px]`.
* **Shadows:** Replace heavy drop shadows with subtle inner borders and soft glows. Use `shadow-sm` or `shadow-md` but tint the shadow to `rgba(0,0,0,0.5)`.
* **Input Fields:** The main prompt textarea must have `bg-zinc-900 border-zinc-800 focus:border-zinc-600 focus:ring-0`. Remove default browser outlines.
* **Buttons:**
* *Primary:* `bg-white text-zinc-950 hover:bg-zinc-200 transition-colors`.
* *Secondary/Utility:* `bg-zinc-900 border border-zinc-800 text-zinc-300 hover:bg-zinc-800`.


* **Tabs:** Underline style, not pill style. Active tab gets a `border-b-2 border-white text-white`. Inactive tabs are `text-zinc-500 hover:text-zinc-300`.

---

## 5. Layout Direction & Dashboard Structure

### The Shell

* **Sidebar:** Fixed width `w-64`, borders on the right (`border-r border-zinc-800`).
* **Header:** Height `h-14`, borders on the bottom. Flex container with `justify-between items-center`.
* **Main Canvas:** Fills remaining viewport (`h-[calc(100vh-3.5rem)]`). Uses `overflow-hidden` to prevent whole-page scrolling, pushing scroll behavior to specific internal panels.

### The Split-Pane Workspace (Success State)

* Must utilize a CSS Grid or Flex row setup: `grid grid-cols-12 gap-0 h-full`.
* **Left Column (Data/Text):** `col-span-5 border-r border-zinc-800 p-6 overflow-y-auto`.
* **Right Column (Visual/Iframe):** `col-span-7 bg-zinc-950 p-6 flex flex-col`.
* *Note for AI Builder:* The Iframe should be wrapped in a styling container that looks like a browser window (a "mock browser" wrapper with three dots in the top left) to visually separate the generated website from the orchestrator UI.

---

## 6. UX Principles & Micro-Interactions

* **The Waiting Problem:** Multi-agent systems are slow. The UI *must* distract the user. During the "Processing State," the UI must animate the progression of steps. Use a pulsing opacity on the active agent row (`animate-pulse`) and slide in a green checkmark when a step resolves.
* **Skeletons over Spinners:** When the workspace loads, if text is parsing, use subtle skeleton loaders (`bg-zinc-800 animate-pulse rounded`) rather than generic circular spinners.
* **One-Click Copy:** Every generated asset (markdown, email, code) must have a `<Copy>` button positioned absolute top-right of its container. On click, the icon should instantly change to a checkmark for 2 seconds.

---

## 7. Mobile & Responsive Behavior

While this is primarily a desktop tool, the layout must degrade gracefully:

| Viewport | Layout Adjustments |
| --- | --- |
| **Desktop (`lg` 1024px+)** | Sidebar visible. Split-pane is 5-col / 7-col horizontally. |
| **Tablet (`md` 768px+)** | Sidebar hidden behind a hamburger menu. Split-pane shifts to a 50/50 horizontal split. |
| **Mobile (`sm` <768px)** | Complete vertical stacking. The split-pane breaks into a single column (`flex-col`). The Iframe preview drops below the text assets. Text scales down to `text-xs` for code blocks to prevent horizontal scrolling breakage. |