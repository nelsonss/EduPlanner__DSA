
# EduPlanner DSA: System Architecture

## 1. Overview

EduPlanner DSA is a client-side Single-Page Application (SPA) built with **React and TypeScript**. It provides a suite of AI-powered tools for educators by integrating with the **Google Gemini API**.

The core architectural principle is a modular, domain-driven component structure with a centralized service layer (`geminiService.ts`) that abstracts all interactions with the AI. This creates a clean separation of concerns between UI rendering, state management, and external API communication.

## 2. Technology Stack

- **Frontend Framework:** [React 19](https://react.dev/) with TypeScript for type safety and modern features.
- **AI Integration:** [`@google/genai`](https://github.com/google/generative-ai-js) SDK for all communication with the Gemini family of models.
- **Routing:** [`react-router-dom`](https://reactrouter.com/) using `HashRouter` for robust client-side routing in various deployment environments.
- **Styling:** [Tailwind CSS](https://tailwindcss.com/) for a utility-first, responsive, and highly customizable design system. Dark mode is supported.
- **Charting & Visualization:** [Recharts](https://recharts.org/) for creating interactive and responsive charts in the Dashboard and Observatory.
- **Icons:** [Lucide React](https://lucide.dev/) for a clean and comprehensive set of SVG icons.
- **Markdown Rendering:** [`react-markdown`](https://github.com/remarkjs/react-markdown) to safely render AI-generated responses that include markdown formatting.

## 3. Project Structure

The project follows a feature-based directory structure to promote scalability and maintainability.

```
/
├── public/
├── src/
│   ├── components/
│   │   ├── common/         # Reusable, generic components (Card, Icon)
│   │   ├── collaboration/  # AI Workshop feature
│   │   ├── dashboard/      # Main Dashboard feature
│   │   ├── evaluation/     # Evaluation & Optimization feature
│   │   ├── lab/            # Instructional Design Lab feature
│   │   ├── layout/         # Structural components (Sidebar, ThemeToggle)
│   │   └── observatory/    # Student Observatory feature
│   │
│   ├── services/
│   │   └── geminiService.ts # Centralized module for all Gemini API calls
│   │
│   ├── App.tsx             # Main component with routing definitions
│   ├── constants.ts        # Mock data, initial states, system instructions
│   ├── index.tsx           # Application entry point
│   └── types.ts            # Centralized TypeScript types and interfaces
│
└── index.html              # Main HTML file with import maps
```

## 4. Data Flow and State Management

### State Management
The application currently relies on **component-level state** using React Hooks (`useState`, `useEffect`, `useMemo`). There is no global state management library (like Redux or Zustand), as the application's complexity is managed through a combination of prop drilling in localized feature domains and router-based state for cross-domain communication.

### Data Persistence
To simulate a backend and persist user changes across sessions, `localStorage` is used strategically:

- `localStorage.setItem('evaluableAssets', ...)`: Stores the master list of quizzes and assignments, allowing user-driven modifications (e.g., after an AI optimization) to persist.
- `localStorage.setItem('evaluationReport-{id}', ...)`: Caches AI-generated evaluation reports to prevent redundant API calls for the same asset.
- `localStorage.setItem('agentFeedback', ...)`: Logs user feedback (thumbs up/down) on agent responses. This data is later read by the Analyst agent to perform meta-analysis.
- `localStorage.setItem('theme', ...)`: Remembers the user's preferred color scheme (light/dark).

### Cross-Component Communication
For passing complex data between different pages (features), the application uses `react-router`'s `location.state`.
- **Example:** The `InstructionalDesignLabPage` sends a full `LessonPlan` object to the `CollaborationPage` for evaluation via `navigate('/collaboration', { state: { lessonPlanForReview: plan } })`. The `CollaborationPage` then consumes this state to trigger an automated evaluation flow.

## 5. AI Integration (`services/geminiService.ts`)

This service is the single point of contact with the Google GenAI API.

### Initialization
A single `GoogleGenAI` client is initialized using an API key sourced exclusively from the environment variable `process.env.API_KEY`. This is a production-ready approach that avoids hardcoding credentials.

### System Instructions
Each AI agent (`Analyst`, `Evaluator`, `Optimizer`) has a predefined system instruction stored in `constants.ts`. This is a critical design choice that allows us to configure the agent's persona, role, and output format without cluttering every prompt. The `getAgentResponse` function dynamically includes the appropriate instruction in its API call.

### Structured JSON Output (A Key Architectural Decision)
For features that require reliable, machine-readable data (e.g., generating a lesson plan, optimizing a quiz), we leverage Gemini's JSON mode. This is a crucial decision for application stability.
- **How it's done:**
  1. The `responseMimeType` is set to `"application/json"`.
  2. A `responseSchema` is defined using `Type` enums from `@google/genai`. This schema is sent with the request.
- **Benefit:** This forces the Gemini API to return a JSON object that conforms to our predefined TypeScript interfaces (`LessonPlan`, `AssetContent`). It dramatically reduces the risk of parsing errors and eliminates the need for fragile string manipulation on the frontend.

### Meta-Analysis Workflow
The `getAgentResponse` function contains special logic for the Analyst's "review agent feedback" task. Instead of sending the user's prompt directly, it:
1. Reads the feedback log from `localStorage`.
2. Constructs a new, detailed meta-prompt containing the raw feedback data.
3. Sends this new prompt to the Analyst agent, instructing it to analyze the performance of its peers.

## 6. The "Teacher in the Loop" - Technical Implementation

The architecture is explicitly designed to enforce the "Teacher in the Loop" philosophy.

- **User-Initiated Actions:** No AI-driven action occurs without explicit user consent. The AI generates reports, suggestions, or new content, but the user must always click a button like "Save Optimized Version," "Save Report," or "Assign Work" to commit any changes.
- **Clear Separation of Views:** In the Evaluation Center, the original asset, the AI evaluation, and the AI-optimized version are shown in distinct, clearly labeled views (`evaluation_result`, `comparison`). The user can compare the "before" and "after" before making a decision.
- **Direct Manipulation:** Features like the "Professor's Notes" textarea in the `LessonPlanDisplay` allow educators to directly override or supplement AI-generated content, ensuring their final touch is preserved.

## 7. Future Considerations

- **Backend Database:** For a multi-user, production environment, `localStorage` would be replaced with a proper backend service and database (e.g., Firebase, Supabase) to store user data, lesson plans, and assets.
- **Authentication:** A user authentication system would be required to manage accounts for different professors.
- **Global State Management:** If the application's complexity grows with more cross-component state dependencies, introducing a lightweight global state manager like [Zustand](https://github.com/pmndrs/zustand) would be a logical next step.
