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
};
