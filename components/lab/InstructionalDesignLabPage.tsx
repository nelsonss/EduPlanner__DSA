

import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Card from '../common/Card';
import { LessonPlan } from '../../types';
import { generateLessonPlan, refineLessonPlan } from '../../services/geminiService';
import { Lightbulb, BookCopy, BarChart, FileText, Bot, Loader2, AlertTriangle } from 'lucide-react';
import LessonPlanDisplay from './LessonPlanDisplay';

const InstructionalDesignLabPage: React.FC = () => {
    // State for the lesson plan generation form fields.
    const [topic, setTopic] = useState('Binary Search Trees');
    const [objectives, setObjectives] = useState('Understand the properties of a BST.\nBe able to perform insertion and search operations.');
    const [difficulty, setDifficulty] = useState<'Beginner' | 'Intermediate' | 'Advanced'>('Beginner');
    
    // State to manage the asynchronous API call status.
    const [isLoading, setIsLoading] = useState(false);
    // Separate loading state for the refinement action to provide more specific UI feedback.
    const [isRefining, setIsRefining] = useState(false);
    // State to hold any errors from the API calls.
    const [error, setError] = useState<string | null>(null);
    // State to store the successfully generated or refined lesson plan object.
    const [generatedPlan, setGeneratedPlan] = useState<LessonPlan | null>(null);

    const navigate = useNavigate();
    const location = useLocation();

    /**
     * This effect is responsible for receiving a refined lesson plan from the
     * AI Collaboration Workshop page. When the user navigates here from there,
     * the refined plan is passed via `location.state`.
     */
    useEffect(() => {
        // Check if a refined lesson plan exists in the navigation state.
        const refinedPlan = location.state?.refinedLessonPlan as LessonPlan | undefined;
        if (refinedPlan) {
            // Before displaying the plan, check localStorage for any previously saved notes
            // to ensure professor's modifications are not lost.
            try {
                const savedNotes = localStorage.getItem(`lessonPlanNotes-${refinedPlan.id}`);
                if (savedNotes) {
                    refinedPlan.professorNotes = savedNotes;
                }
            } catch (e) {
                console.error("Could not access localStorage to load notes.", e);
            }
            // Update the component's state to display the new plan.
            setGeneratedPlan(refinedPlan);
            // Crucially, clear the location state to prevent this effect from running again
            // on a page refresh or subsequent navigation actions.
            navigate(location.pathname, { replace: true, state: {} });
        }
    }, [location.state, navigate]);

    /**
     * Callback function passed to the LessonPlanDisplay component.
     * It updates the state of the currently displayed lesson plan and persists
     * the notes to localStorage, scoped to the specific lesson plan's ID.
     * @param planId The ID of the lesson plan being edited.
     * @param notes The latest notes from the textarea.
     */
    const handleSaveNotes = (planId: string, notes: string) => {
        if (!generatedPlan || generatedPlan.id !== planId) return;

        // Update the plan in the component's state.
        const updatedPlan = { ...generatedPlan, professorNotes: notes };
        setGeneratedPlan(updatedPlan);

        // Persist the notes to browser storage.
        try {
            localStorage.setItem(`lessonPlanNotes-${planId}`, notes);
        } catch (e) {
            console.error("Could not save notes to localStorage.", e);
        }
    };

    /**
     * Handles the form submission to generate a new lesson plan.
     * Manages the async flow: sets loading state, calls the AI service,
     * and handles success or error responses.
     */
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        // 1. Set initial state for the API call.
        setIsLoading(true);
        setError(null);
        setGeneratedPlan(null); // Clear any previously generated plan.

        try {
            // 2. Call the service function to generate the lesson plan.
            const plan = await generateLessonPlan(topic, objectives, difficulty);
            setGeneratedPlan(plan); // 3. On success, update state with the new plan.
        } catch (err) {
            // 4. On failure, capture and display the error message.
            setError(err instanceof Error ? err.message : 'An unknown error occurred.');
        } finally {
            // 5. Reset the loading state regardless of the outcome.
            setIsLoading(false);
        }
    };
    
    /**
     * Handles the refinement of an existing lesson plan based on user feedback.
     * @param planToRefine The current lesson plan object.
     * @param feedback The user's instructions for refinement.
     */
    const handleRefinePlan = async (planToRefine: LessonPlan, feedback: string) => {
        setIsRefining(true);
        setError(null);
        try {
            // Call the refinement service function.
            const refinedPlan = await refineLessonPlan(planToRefine, feedback);
            // Display the newly refined plan.
            setGeneratedPlan(refinedPlan);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An unknown error occurred during refinement.');
        } finally {
            setIsRefining(false);
        }
    };

    /**
     * Navigates the user to the AI Collaboration Workshop page, passing the current
     * lesson plan in the route's state so it can be automatically evaluated.
     * @param plan The lesson plan to be sent for review.
     */
    const handleSendToEvaluator = (plan: LessonPlan) => {
        navigate('/collaboration', { state: { lessonPlanForReview: plan } });
    };

    return (
        <div className="space-y-8">
            <h1 className="text-3xl font-bold text-brand-dark dark:text-brand-light">Instructional Design Lab</h1>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column: Generator Form */}
                <div className="lg:col-span-1">
                    <Card>
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="flex items-center">
                                <Bot className="w-8 h-8 text-brand-primary mr-3"/>
                                <h2 className="text-xl font-semibold text-brand-dark dark:text-brand-light">Lesson Plan Generator</h2>
                            </div>
                            
                            <div>
                                <label htmlFor="topic" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Topic</label>
                                <div className="flex items-center border rounded-lg p-2 dark:border-gray-600">
                                    <Lightbulb className="w-5 h-5 text-gray-400 mr-2"/>
                                    <input type="text" id="topic" value={topic} onChange={e => setTopic(e.target.value)} className="w-full focus:outline-none bg-transparent dark:text-white" placeholder="e.g., Hash Tables"/>
                                </div>
                            </div>
                            
                            <div>
                                <label htmlFor="objectives" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Learning Objectives</label>
                                <div className="flex items-start border rounded-lg p-2 dark:border-gray-600">
                                    <BookCopy className="w-5 h-5 text-gray-400 mr-2 mt-1"/>
                                    <textarea id="objectives" value={objectives} onChange={e => setObjectives(e.target.value)} rows={4} className="w-full focus:outline-none resize-none bg-transparent dark:text-white" placeholder="- Define hash functions..."></textarea>
                                </div>
                            </div>
                            
                            <div>
                                <label htmlFor="difficulty" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Difficulty Level</label>
                                <div className="flex items-center border rounded-lg p-2 dark:border-gray-600">
                                    <BarChart className="w-5 h-5 text-gray-400 mr-2"/>
                                    <select id="difficulty" value={difficulty} onChange={e => setDifficulty(e.target.value as any)} className="w-full focus:outline-none bg-transparent dark:text-white dark:[color-scheme:dark]">
                                        <option>Beginner</option>
                                        <option>Intermediate</option>
                                        <option>Advanced</option>
                                    </select>
                                </div>
                            </div>
                            
                            <button type="submit" disabled={isLoading || isRefining} className="w-full flex justify-center items-center bg-brand-primary text-white p-3 rounded-lg hover:bg-blue-600 disabled:bg-gray-400 transition-colors">
                                {isLoading ? <><Loader2 className="w-5 h-5 mr-2 animate-spin"/> Generating...</> : <><FileText className="w-5 h-5 mr-2"/> Generate Lesson Plan</>}
                            </button>
                        </form>
                    </Card>
                </div>
                
                {/* Right Column: Display Area */}
                <div className="lg:col-span-2">
                    {/* Conditional rendering based on the current state (loading, error, success, or initial) */}
                    {isLoading && (
                        <Card className="flex flex-col items-center justify-center h-full">
                            <Loader2 className="w-12 h-12 text-brand-primary animate-spin mb-4"/>
                            <h3 className="text-xl font-semibold text-brand-dark dark:text-brand-light">The Optimizer agent is drafting your lesson...</h3>
                            <p className="text-gray-500 dark:text-gray-400">This may take a moment.</p>
                        </Card>
                    )}
                    {error && (
                         <Card className="flex flex-col items-center justify-center h-full bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-500/50 border">
                            <AlertTriangle className="w-12 h-12 text-brand-danger mb-4"/>
                            <h3 className="text-xl font-semibold text-red-800 dark:text-red-300">An Error Occurred</h3>
                            <p className="text-red-600 dark:text-red-400 text-center">{error}</p>
                        </Card>
                    )}
                    {generatedPlan && (
                        // If a plan exists, render the display component and pass callbacks.
                        <LessonPlanDisplay 
                            plan={generatedPlan} 
                            onSendToEvaluator={handleSendToEvaluator} 
                            onSaveNotes={handleSaveNotes}
                            onRefine={handleRefinePlan}
                            isRefining={isRefining}
                        />
                    )}
                    {/* Initial welcome screen */}
                    {!isLoading && !error && !generatedPlan && (
                         <Card className="flex flex-col items-center justify-center h-full">
                            <FileText className="w-12 h-12 text-gray-300 dark:text-gray-600 mb-4"/>
                            <h3 className="text-xl font-semibold text-gray-500 dark:text-gray-400">Your Generated Lesson Plan Will Appear Here</h3>
                            <p className="text-gray-400 dark:text-gray-500">Fill out the form and click 'Generate' to begin.</p>
                        </Card>
                    )}
                </div>
            </div>
        </div>
    );
};

export default InstructionalDesignLabPage;
