import { GoogleGenAI, Type } from "@google/genai";
import { AgentName, LessonPlan, EvaluableAsset, AssetContent, Student } from '../types';
import { AGENT_SYSTEM_INSTRUCTIONS, MOCK_LESSON_PLAN } from '../constants';

// Initialize the GoogleGenAI client instance.
// This is done once and reused across all service functions.
let ai: GoogleGenAI | null = null;
try {
  // The API key is sourced exclusively from environment variables,
  // which is a security best practice for production environments.
  ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
} catch (error) {
  // If the client fails to initialize (e.g., missing API key),
  // log a detailed error to the console to aid in debugging.
  console.error(
    "Failed to initialize GoogleGenAI. Ensure the API_KEY environment variable is set.",
    error
  );
}

/**
 * A generic function to get a text-based response from a specified AI agent.
 * It constructs a prompt, includes the agent-specific system instruction,
 * and handles the API call and error states.
 * @param prompt The user's input text.
 * @param agent The name of the agent to handle the request.
 * @returns A promise that resolves to the agent's string response.
 */
export const getAgentResponse = async (prompt: string, agent: AgentName): Promise<string> => {
  // Fail early if the GenAI client isn't available.
  if (!ai) {
    throw new Error("GoogleGenAI client is not initialized. Please configure your API key.");
  }

  let fullPrompt = prompt;

  // This is a special workflow for the Analyst agent. When tasked with reviewing feedback,
  // it doesn't use the user's prompt directly. Instead, it retrieves stored feedback data
  // from localStorage and constructs a new, more detailed prompt for meta-analysis.
  if (agent === AgentName.Analyst && prompt.toLowerCase().includes('review agent feedback')) {
    let feedbackData = '[]';
    try {
        // Retrieve feedback that has been logged by the ChatInterface component.
        feedbackData = localStorage.getItem('agentFeedback') || '[]';
    } catch (e) {
        console.error("Could not access localStorage:", e);
        return "I was unable to access the feedback logs due to a browser security setting. Please ensure localStorage is enabled.";
    }
    
    // Handle the case where there's no feedback to analyze, providing a helpful message.
    if (JSON.parse(feedbackData).length === 0) {
      return "I have reviewed the feedback logs, but there is no feedback currently recorded. Please continue to rate my colleagues' responses to help me improve their performance.";
    }
    
    // Construct a meta-prompt that gives the AI context and the data to analyze.
    fullPrompt = `
      As the Analyst agent, you must review the following agent performance feedback data, which has been collected from the user via a 'thumbs up'/'thumbs down' system.
      Your task is to identify patterns in the feedback (e.g., an agent being unclear, responses being too long/short, incorrect information) and suggest specific, actionable improvements to the system instructions for the respective agents.
      Frame your response as a report to the professor. Be concise and structured.

      --- FEEDBACK DATA (JSON) ---
      ${feedbackData}
      --- END OF FEEDBACK DATA ---

      Please begin your analysis now.
    `;
  }

  // Retrieve the predefined system instruction for the selected agent.
  // This guides the AI's persona, tone, and response structure.
  const systemInstruction = AGENT_SYSTEM_INSTRUCTIONS[agent];

  try {
    // Make the API call to the Gemini model.
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: fullPrompt,
      config: {
        // System instructions are a powerful way to steer the model's behavior
        // without having to include the instructions in every single prompt.
        systemInstruction: systemInstruction,
      },
    });
    return response.text;
  } catch (error) {
    console.error("Error fetching response from Gemini API:", error);
    // Provide more specific, user-friendly error messages for common issues.
    if (error instanceof Error && error.message.includes('API key not valid')) {
        throw new Error("The configured API key is invalid. Please check your environment configuration.");
    }
    throw new Error("An error occurred while communicating with the AI agent. Please try again later.");
  }
};

// Defines the expected JSON structure for a lesson plan.
// This schema is passed to the Gemini API to force it to return valid, structured JSON.
const lessonPlanSchema = {
    type: Type.OBJECT,
    properties: {
      title: { type: Type.STRING, description: "The title of the lesson, which should include the main topic." },
      learningObjectives: { type: Type.ARRAY, items: { type: Type.STRING }, description: "A list of what students will be able to do after the lesson." },
      difficulty: { type: Type.STRING, enum: ['Beginner', 'Intermediate', 'Advanced'] },
      lessonStructure: {
        type: Type.ARRAY,
        description: "An array of objects, each representing a section of the lesson.",
        items: {
          type: Type.OBJECT,
          properties: {
            sectionTitle: { type: Type.STRING },
            content: { type: Type.STRING, description: "Detailed explanation for this section." },
            estimatedTime: { type: Type.STRING, description: "e.g., '15 minutes'" }
          },
          required: ["sectionTitle", "content", "estimatedTime"]
        }
      },
      examples: {
        type: Type.ARRAY,
        description: "An array of objects, each providing a practical example.",
        items: {
          type: Type.OBJECT,
          properties: {
            exampleTitle: { type: Type.STRING },
            description: { type: Type.STRING },
            code: { type: Type.STRING, description: "An optional code block, if applicable." }
          },
          required: ["exampleTitle", "description"]
        }
      },
      assessmentQuestions: {
        type: Type.ARRAY,
        description: "An array of questions to test student understanding.",
        items: {
          type: Type.OBJECT,
          properties: {
            question: { type: Type.STRING },
            type: { type: Type.STRING, enum: ['Multiple Choice', 'Short Answer', 'Coding Problem'] },
            options: { type: Type.ARRAY, items: { type: Type.STRING }, description: "A list of options for Multiple Choice questions." },
            answer: { type: Type.STRING, description: "The correct answer to the question." }
          },
          required: ["question", "type", "answer"]
        }
      }
    },
    required: ["title", "learningObjectives", "difficulty", "lessonStructure", "examples", "assessmentQuestions"]
};

/**
 * Generates a new lesson plan using the Optimizer agent.
 * This function utilizes Gemini's JSON mode to ensure the output is a valid, parseable object.
 * @param topic The subject of the lesson.
 * @param objectives The learning goals for the lesson.
 * @param difficulty The target difficulty level.
 * @returns A promise that resolves to a structured LessonPlan object.
 */
export const generateLessonPlan = async (topic: string, objectives: string, difficulty: string): Promise<LessonPlan> => {
    if (!ai) {
      throw new Error("GoogleGenAI client is not initialized.");
    }
   
    // The prompt provides the AI with the raw inputs and instructs it to adhere to the JSON schema.
    const prompt = `Generate a detailed lesson plan for a Data Structures and Algorithms course.
    Topic: ${topic}
    Learning Objectives: ${objectives}
    Difficulty: ${difficulty}
    
    Your output MUST be a JSON object that strictly follows the provided schema. Do not include any text, markdown, or code block fences outside of the JSON object itself.`;
  
    try {
      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
        config: {
          systemInstruction: AGENT_SYSTEM_INSTRUCTIONS[AgentName.Optimizer],
          // This forces the model to output a JSON string.
          responseMimeType: "application/json",
          // This ensures the output conforms to our predefined structure.
          responseSchema: lessonPlanSchema,
        },
      });
      
      const jsonText = response.text.trim();
      const partialPlan = JSON.parse(jsonText) as Omit<LessonPlan, 'id' | 'professorNotes'>;
      
      // Augment the AI-generated data with application-specific fields (like a unique ID).
      return {
          ...partialPlan,
          id: `lp-${Date.now()}`,
          professorNotes: '',
      };
  
    } catch (error) {
      console.error("Error generating lesson plan from Gemini API:", error);
      // This error often occurs if the AI fails to produce valid JSON despite the constraints.
      throw new Error("Failed to generate lesson plan. The AI agent may have returned an invalid format.");
    }
  };

/**
 * Refines an existing lesson plan based on professor or evaluator feedback.
 * It sends the original lesson plan and the feedback to the Optimizer agent.
 * @param lessonPlan The original LessonPlan object.
 * @param feedback Text-based feedback for improvement.
 * @returns A promise resolving to a new, refined LessonPlan object.
 */
export const refineLessonPlan = async (lessonPlan: LessonPlan, feedback: string): Promise<LessonPlan> => {
    if (!ai) {
      throw new Error("GoogleGenAI client is not initialized.");
    }

    // The prompt includes both the original data and the feedback, giving the AI full context
    // to make intelligent revisions.
    const prompt = `Based on the provided evaluator feedback, generate an improved version of the original lesson plan.
    Your output MUST be a JSON object that strictly follows the provided schema and incorporates the suggested changes. Do not include any text, markdown, or code block fences outside of the JSON object itself.

    --- ORIGINAL LESSON PLAN (JSON) ---
    ${JSON.stringify(lessonPlan, null, 2)}

    --- EVALUATOR FEEDBACK ---
    ${feedback}
    `;
  
    try {
      // Like generation, refinement uses JSON mode to ensure a structured response.
      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
        config: {
          systemInstruction: AGENT_SYSTEM_INSTRUCTIONS[AgentName.Optimizer],
          responseMimeType: "application/json",
          responseSchema: lessonPlanSchema,
        },
      });
      
      const jsonText = response.text.trim();
      const partialPlan = JSON.parse(jsonText) as Omit<LessonPlan, 'id' | 'professorNotes'>;
      
      // Preserve critical metadata from the original plan, like its ID, to maintain continuity.
      return {
          ...partialPlan,
          id: lessonPlan.id,
          professorNotes: lessonPlan.professorNotes, 
      };
  
    } catch (error) {
      console.error("Error refining lesson plan from Gemini API:", error);
      throw new Error("Failed to refine lesson plan. The AI agent may have returned an invalid format.");
    }
};

/**
 * Sends an instructional asset (like a quiz or assignment) to the Evaluator agent for analysis.
 * @param asset The EvaluableAsset to be analyzed.
 * @returns A promise that resolves to a string containing the AI's feedback.
 */
export const evaluateAsset = async (asset: EvaluableAsset): Promise<string> => {
    if (!ai) {
        throw new Error("GoogleGenAI client is not initialized.");
    }
   
    // The prompt is structured to guide the Evaluator agent's analysis process.
    const prompt = `As the Evaluator agent, please perform a comprehensive analysis of the following ${asset.type}, titled "${asset.title}".
    Your task is to identify potential areas of confusion for students, assess the clarity of the questions, and provide a numbered list of specific, actionable suggestions for improvement.

    --- ${asset.type.toUpperCase()} CONTENT (JSON) ---
    ${JSON.stringify(asset.content, null, 2)}
    `;

    try {
        // This is a standard text generation call, as the feedback is expected to be prose.
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
                systemInstruction: AGENT_SYSTEM_INSTRUCTIONS[AgentName.Evaluator],
            },
        });
        return response.text;
    } catch (error) {
        console.error("Error evaluating asset from Gemini API:", error);
        throw new Error("Failed to get evaluation from the AI agent.");
    }
};

// Defines the schema for the content of an evaluable asset (e.g., a list of questions).
// Used by the Optimizer to ensure its refined output is structured correctly.
const assetContentSchema = {
    type: Type.OBJECT,
    properties: {
        questions: {
            type: Type.ARRAY,
            description: "An array of question objects.",
            items: {
                type: Type.OBJECT,
                properties: {
                    id: { type: Type.STRING },
                    text: { type: Type.STRING, description: "The revised question text." },
                    type: { type: Type.STRING, enum: ['Multiple Choice', 'Short Answer', 'Coding'] },
                    options: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Optional list of choices for multiple choice." },
                    answer: { type: Type.STRING, description: "Optional correct answer." },
                },
                required: ["id", "text", "type"]
            }
        }
    },
    required: ["questions"]
};

/**
 * Optimizes an asset's content based on feedback.
 * @param asset The original asset.
 * @param feedback The evaluation report to guide the optimization.
 * @returns A promise resolving to the new, AI-generated AssetContent.
 */
export const optimizeAsset = async (asset: EvaluableAsset, feedback: string): Promise<AssetContent> => {
    if (!ai) {
        throw new Error("GoogleGenAI client is not initialized.");
    }

    // The prompt provides the original content and the feedback for context.
    const prompt = `As the Optimizer agent, your task is to refine the provided ${asset.type} based on the evaluator's feedback.
    Generate an improved version of the content. Your output MUST be a JSON object that strictly follows the provided schema, representing the new, optimized version. Do not include any text, markdown, or code block fences outside of the JSON object itself.

    --- ORIGINAL ${asset.type.toUpperCase()} (JSON) ---
    ${JSON.stringify(asset.content, null, 2)}

    --- EVALUATOR FEEDBACK ---
    ${feedback}
    `;

    try {
        // Use JSON mode to get structured data back.
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
                systemInstruction: AGENT_SYSTEM_INSTRUCTIONS[AgentName.Optimizer],
                responseMimeType: "application/json",
                responseSchema: assetContentSchema,
            },
        });
        const jsonText = response.text.trim();
        return JSON.parse(jsonText) as AssetContent;
    } catch (error) {
        console.error("Error optimizing asset from Gemini API:", error);
        throw new Error("Failed to generate optimized content. The AI agent may have returned an invalid format.");
    }
};

/**
 * Generates high-level insights about the entire class's performance.
 * @param students An array of student data.
 * @returns A promise resolving to a string with the Analyst agent's insights.
 */
export const getObservatoryInsights = async (students: Student[]): Promise<string> => {
    if (!ai) {
      throw new Error("GoogleGenAI client is not initialized.");
    }
  
    // To keep the prompt efficient, we only send a summary of the student data,
    // not the entire student object.
    const studentDataSummary = students.map(s => ({
        id: s.id,
        status: s.status,
        progress: s.progress,
        averageScore: s.averageScore
    }));
  
    // The prompt clearly defines the Analyst's task: find clusters, trends, and actionable insights.
    const prompt = `As the Analyst agent for the Student Observatory, your task is to analyze the following class-wide student performance data, which represents a snapshot of a progress-vs-score scatter plot. Identify and report on significant patterns, clusters, and outliers. Provide a bulleted list of 2-3 key, actionable insights for the professor.

--- CLASS DATA (JSON) ---
${JSON.stringify(studentDataSummary, null, 2)}
--- END OF DATA ---

Your analysis should focus on:
1.  **Student Clusters:** Are there noticeable groups of students (e.g., high progress but low scores)?
2.  **Performance Trends:** What does the overall distribution suggest about the class's health?
3.  **Actionable Insights:** What are the most important takeaways for the professor?

Begin your analysis now.`;
  
    try {
      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
        config: {
          systemInstruction: AGENT_SYSTEM_INSTRUCTIONS[AgentName.Analyst],
        },
      });
      return response.text;
    } catch (error) {
      console.error("Error fetching observatory insights from Gemini API:", error);
      throw new Error("An error occurred while communicating with the AI agent.");
    }
};
