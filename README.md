# EduPlanner DSA: AI-Powered Instructional Planning

![React](https://img.shields.io/badge/React-19-blue?logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue?logo=typescript)
![Gemini API](https://img.shields.io/badge/Google-Gemini%20API-blueviolet?logo=google)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-CSS-cyan?logo=tailwindcss)

<img width="1024" height="1024" alt="Generated Image September 18, 2025 - 11_40AM" src="https://github.com/user-attachments/assets/7c6bc3c8-cd9f-4ad2-9362-3f07760aaa2e" />

EduPlanner DSA is an intelligent instructional planning and student monitoring system designed for complex subjects like Data Structures and Algorithms. It serves as a pedagogical co-pilot for educators, leveraging a team of specialized AI agents to enhance, not replace, the teaching experience. Our core philosophy is **"Teacher in the Loop,"** ensuring the professor's expertise remains the central authority in the classroom.

## 1. Project Vision: For the Modern Educator

Teaching advanced subjects requires a deep understanding of individual student needs. In a large classroom, it's nearly impossible to track every student's conceptual gaps in real-time. EduPlanner DSA addresses this by providing educators with a powerful suite of tools to enable personalized, data-driven instruction at scale.

The platform uses a specialized triad of AI agents to augment the professor's capabilities:
*   **The Analyst:** A data specialist that identifies student learning patterns, common errors, and disengagement trends, providing actionable insights for early intervention.
*   **The Evaluator:** An objective instructional coach that analyzes teaching materials against established pedagogical frameworks (like CIDPP: Clarity, Interactivity, Difficulty, Practicality, Completeness) to promote reflective practice and quality improvement.
*   **The Optimizer:** An expert content drafter that generates and refines lesson plans, examples, and assessments based on the professor's goals and the Evaluator's feedback, dramatically increasing efficiency.

This system transforms the traditional instructional cycle into a dynamic, responsive loop where professors are empowered to design, assess, and revise their teaching strategies with unprecedented speed and insight.

## 2. Key Features

*   **Pedagogical Command Center:** A central dashboard providing a real-time overview of course health, student progress via a heatmap, and critical, AI-flagged alerts.
*   **Instructional Design Lab:** An AI-powered workspace to generate complete, structured lesson plans from simple prompts and refine them with iterative feedback.
*   **Student Observatory:** A macro-level view of class performance, featuring a scatter plot to identify student clusters and a live activity feed.
*   **Evaluation & Optimization Center:** A dedicated module to submit existing course materials (quizzes, assignments) for AI evaluation, receive structured feedback, and automatically generate improved versions.
*   **Multi-Agent Collaboration Workshop:** A chat-based interface where the professor can directly converse with the AI agent triad, delegate tasks, and receive detailed reports.

## 3. Technology Stack

*   **Frontend:** React 19, TypeScript, React Router, Tailwind CSS
*   **AI Integration:** Google Gemini API via `@google/genai` JS SDK
*   **Data Visualization:** Recharts
*   **Icons:** Lucide React
*   **State Management:** React Hooks (Component-level state)
*   **Persistence:** `localStorage` for persisting assets, reports, and user preferences in the demo.

---

## 4. Getting Started: Local Installation and Execution

Follow these steps to set up and run the EduPlanner DSA project on your local machine.

### Prerequisites

*   **Node.js:** Version 18.x or later.
*   **npm** or **yarn:** A Node.js package manager.
*   **Google Gemini API Key:** You must have a valid API key from [Google AI Studio](https://aistudio.google.com/app/apikey).

### Step 1: Clone the Repository

Clone the project to your local machine using Git:
```bash
git clone https://github.com/your-username/eduplanner-dsa.git
cd eduplanner-dsa
```

### Step 2: Install Dependencies

Install the necessary `npm` packages for the project:
```bash
npm install
```

### Step 3: Configure Environment Variables

For security, the API key is managed through an environment variable file. Create a file named `.env` in the root of the project directory:

```bash
touch .env
```

Open the `.env` file and add your Google Gemini API key:
```
# .env
API_KEY=YOUR_GEMINI_API_KEY_HERE
```
Replace `YOUR_GEMINI_API_KEY_HERE` with your actual key.

### Step 4: Setting Up the Security Proxy (Crucial for Development)

**Why is this necessary?** You should **never** expose your API key directly in a client-side application. The provided code in `services/geminiService.ts` uses `process.env.API_KEY`, which will not work directly in a standard React app build. The standard security practice is to run a simple local server that acts as a proxy. The frontend will send requests to your local server, and the server will securely add your API key and forward the request to the Google Gemini API.

**A. Create the Proxy Server File:**
Create a new file named `server.js` in the root of your project directory. Copy the following code into it:

```javascript
// server.js
import express from 'express';
import { GoogleGenAI } from '@google/genai';
import cors from 'cors';
import 'dotenv/config';

const app = express();
const port = 3001;

// Basic security and setup
app.use(cors()); // Allow requests from your frontend
app.use(express.json());

// Initialize the GenAI client on the server
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

// A single endpoint to handle all AI generation requests
app.post('/api/generate', async (req, res) => {
  if (!process.env.API_KEY) {
    return res.status(500).json({ error: 'API key not configured on the server.' });
  }

  try {
    // The request body from the frontend will contain the model, contents, and config
    const { model, contents, config } = req.body;

    if (!model || !contents) {
      return res.status(400).json({ error: 'Missing required parameters: model and contents.' });
    }
    
    // Call the actual Google GenAI API from the server
    const response = await ai.models.generateContent({
      model,
      contents,
      config,
    });
    
    // Send the response text back to the frontend
    res.json({ text: response.text });

  } catch (error) {
    console.error('Error calling Gemini API:', error);
    res.status(500).json({ error: 'An error occurred while communicating with the AI agent.' });
  }
});

app.listen(port, () => {
  console.log(`✅ Security proxy server running at http://localhost:${port}`);
  console.log('Frontend should send API requests to this server.');
});
```

**B. Install Server Dependencies:**
You'll need `express`, `cors`, and `dotenv` for the proxy server. Run:
```bash
npm install express cors dotenv
```

**C. Modify Frontend Service to Use the Proxy:**
Now, you must update the `services/geminiService.ts` file to call your proxy instead of the Gemini SDK directly. This is a simplified example of how you would adapt `getAgentResponse`.

*This step is for guidance; the current codebase uses the SDK directly. To run with a proxy, you would refactor the service functions to make `fetch` calls like this:*

```typescript
// Example refactor for services/geminiService.ts to use the proxy

export const getAgentResponse = async (prompt: string, agent: AgentName): Promise<string> => {
  // ... (keep the logic for the Analyst feedback prompt) ...

  const systemInstruction = AGENT_SYSTEM_INSTRUCTIONS[agent];

  try {
    const response = await fetch('http://localhost:3001/api/generate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: "gemini-2.5-flash",
        contents: fullPrompt, // The prompt you constructed
        config: {
          systemInstruction: systemInstruction,
        },
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || `Request failed with status ${response.status}`);
    }

    const data = await response.json();
    return data.text;

  } catch (error) {
    console.error("Error fetching response from proxy:", error);
    throw new Error("An error occurred while communicating with the AI agent via the proxy.");
  }
};
```
*Note: You would apply a similar `fetch` pattern to all other functions in `geminiService.ts` that call the AI.*

### Step 5: Run the Application

You need to run **two** processes in separate terminal windows: the security proxy and the React development server.

**Terminal 1: Start the Proxy Server**
```bash
node server.js
```

**Terminal 2: Start the React App**
```bash
npm start 
# Or if you are using a standard React setup, it might be:
# npm run dev
```

Your browser should open to `http://localhost:3000` (or another port specified by your development server), and the application will be running. All AI requests will be securely routed through your local proxy server running on port 3001.

---
This setup ensures you are developing with security best practices from the start. Happy planning!
```
