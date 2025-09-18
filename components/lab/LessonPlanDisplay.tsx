

import React, { useState, useEffect } from 'react';
import { LessonPlan } from '../../types';
import Card from '../common/Card';
import { Check, Clock, BookOpen, Code, HelpCircle, Send, Download, Edit, Wand2, Loader2 } from 'lucide-react';
import Markdown from 'react-markdown';

interface LessonPlanDisplayProps {
    plan: LessonPlan;
    onSendToEvaluator: (plan: LessonPlan) => void;
    onSaveNotes: (planId: string, notes: string) => void;
    onRefine: (plan: LessonPlan, feedback: string) => void;
    isRefining: boolean;
}

const SectionCard: React.FC<{ title: string; icon: React.ElementType; children: React.ReactNode }> = ({ title, icon: Icon, children }) => (
    <div className="bg-brand-light-accent dark:bg-brand-dark p-4 rounded-lg">
        <h3 className="flex items-center text-lg font-semibold text-brand-dark dark:text-brand-light mb-3">
            <Icon className="w-5 h-5 mr-3 text-brand-primary"/>
            {title}
        </h3>
        <div className="space-y-4">
            {children}
        </div>
    </div>
);

const LessonPlanDisplay: React.FC<LessonPlanDisplayProps> = ({ plan, onSendToEvaluator, onSaveNotes, onRefine, isRefining }) => {
    const [notes, setNotes] = useState(plan.professorNotes || '');
    const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle');
    const [refinementInput, setRefinementInput] = useState('');
    
    // Update local notes state if the plan prop changes (e.g., a new plan is generated)
    useEffect(() => {
        setNotes(plan.professorNotes || '');
    }, [plan.id, plan.professorNotes]);

    // Debounce saving notes to avoid excessive calls
    useEffect(() => {
        if (saveStatus === 'idle') return;

        const handler = setTimeout(() => {
            onSaveNotes(plan.id, notes);
            setSaveStatus('saved');
            
            // Reset the 'saved' status message after a couple of seconds
            const resetHandler = setTimeout(() => setSaveStatus('idle'), 2000);
            return () => clearTimeout(resetHandler);

        }, 1000); // Save 1 second after user stops typing

        return () => {
            clearTimeout(handler);
        };
    }, [notes, plan.id, onSaveNotes, saveStatus]);


    const handleNotesChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        setSaveStatus('saving');
        setNotes(e.target.value);
    };

    const handleDownloadJson = () => {
        // Sanitize the title to create a valid filename
        const fileName = `lesson-plan-${plan.title.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-')}.json`;
        
        // Convert the lesson plan object (including notes) to a formatted JSON string
        const planToDownload = { ...plan, professorNotes: notes };
        const jsonString = JSON.stringify(planToDownload, null, 2);
        
        // Create a Blob to hold the JSON data
        const blob = new Blob([jsonString], { type: 'application/json' });
        
        // Create a temporary URL for the Blob
        const url = URL.createObjectURL(blob);
        
        // Create a temporary anchor element and trigger the download
        const a = document.createElement('a');
        a.href = url;
        a.download = fileName;
        document.body.appendChild(a);
        a.click();
        
        // Clean up by removing the anchor and revoking the URL
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    return (
        <Card className="space-y-6 relative">
            {isRefining && (
                <div className="absolute inset-0 bg-white/80 dark:bg-brand-dark/80 z-10 flex flex-col items-center justify-center rounded-lg backdrop-blur-sm">
                    <Loader2 className="w-12 h-12 text-brand-primary animate-spin mb-4"/>
                    <h3 className="text-xl font-semibold text-brand-dark dark:text-brand-light">Optimizer is refining your lesson...</h3>
                    <p className="text-gray-500 dark:text-gray-400">This should only take a moment.</p>
                </div>
            )}
             <div className="pb-4 border-b border-gray-200 dark:border-gray-700">
                <span className={`px-3 py-1 text-sm font-semibold rounded-full ${plan.difficulty === 'Beginner' ? 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300' : plan.difficulty === 'Intermediate' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-300' : 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300'}`}>
                    {plan.difficulty}
                </span>
                <h2 className="text-2xl font-bold text-brand-dark dark:text-brand-light mt-2">{plan.title}</h2>
             </div>

            <SectionCard title="Learning Objectives" icon={Check}>
                <ul className="list-disc list-inside text-gray-700 dark:text-gray-300 space-y-1">
                    {plan.learningObjectives.map((obj, i) => <li key={i}>{obj}</li>)}
                </ul>
            </SectionCard>

            <SectionCard title="Professor's Notes" icon={Edit}>
                <div>
                    <textarea
                        value={notes}
                        onChange={handleNotesChange}
                        placeholder="Add your personal notes, reminders, or modifications here..."
                        className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-brand-primary focus:outline-none bg-white dark:bg-brand-dark dark:border-gray-600 dark:text-white dark:placeholder-gray-400"
                        rows={5}
                        aria-label="Professor's Notes"
                    />
                    <div className="text-right text-xs text-gray-500 dark:text-gray-400 h-4 mt-1">
                        {saveStatus === 'saving' && <span className="italic">Saving...</span>}
                        {saveStatus === 'saved' && <span className="font-semibold text-green-600 dark:text-green-400">Notes saved!</span>}
                    </div>
                </div>
            </SectionCard>

            <SectionCard title="Refine with AI" icon={Wand2}>
                <div>
                    <textarea
                        value={refinementInput}
                        onChange={(e) => setRefinementInput(e.target.value)}
                        placeholder="Enter feedback or instructions for the Optimizer agent... e.g., 'Add a section on Big O notation' or 'Make the coding example simpler.'"
                        className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-brand-primary focus:outline-none bg-white dark:bg-brand-dark dark:border-gray-600 dark:text-white dark:placeholder-gray-400"
                        rows={4}
                        aria-label="Refinement Instructions"
                        disabled={isRefining}
                    />
                     <button
                        onClick={() => {
                            onRefine(plan, refinementInput);
                            setRefinementInput(''); // Clear input after submitting
                        }}
                        disabled={isRefining || !refinementInput.trim()}
                        className="w-full mt-3 flex justify-center items-center bg-green-500 text-white p-3 rounded-lg hover:bg-green-600 disabled:bg-gray-400 transition-colors font-semibold"
                    >
                        <Wand2 className="w-5 h-5 mr-2" />
                        Refine Lesson Plan
                    </button>
                </div>
            </SectionCard>

            <SectionCard title="Lesson Structure" icon={BookOpen}>
                {plan.lessonStructure.map((section, i) => (
                    <div key={i} className="bg-white dark:bg-brand-dark-accent p-3 rounded-md shadow-sm">
                        <div className="flex justify-between items-center mb-1">
                           <h4 className="font-semibold text-gray-800 dark:text-gray-100">{section.sectionTitle}</h4>
                           <div className="flex items-center text-xs text-gray-500 bg-gray-100 dark:bg-gray-700 dark:text-gray-300 px-2 py-0.5 rounded-full">
                               <Clock className="w-3 h-3 mr-1"/>
                               <span>{section.estimatedTime}</span>
                           </div>
                        </div>
                        <div className="prose prose-sm max-w-none text-gray-600 dark:prose-invert">
                           <Markdown>{section.content}</Markdown>
                        </div>
                    </div>
                ))}
            </SectionCard>
            
            <SectionCard title="Examples" icon={Code}>
                 {plan.examples.map((example, i) => (
                    <div key={i} className="bg-white dark:bg-brand-dark-accent p-3 rounded-md shadow-sm">
                        <h4 className="font-semibold text-gray-800 dark:text-gray-100 mb-1">{example.exampleTitle}</h4>
                        <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">{example.description}</p>
                        {example.code && (
                             <pre className="bg-brand-dark text-white p-3 rounded-md text-sm overflow-x-auto"><code>{example.code}</code></pre>
                        )}
                    </div>
                ))}
            </SectionCard>

            <SectionCard title="Assessment Questions" icon={HelpCircle}>
                {plan.assessmentQuestions.map((q, i) => (
                    <div key={i} className="bg-white dark:bg-brand-dark-accent p-3 rounded-md shadow-sm">
                        <p className="font-semibold text-gray-800 dark:text-gray-100">{i + 1}. {q.question}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">Type: {q.type}</p>
                        {q.options && (
                            <ul className="list-disc list-inside text-sm text-gray-600 dark:text-gray-300 space-y-1 pl-4">
                                {q.options.map((opt, j) => <li key={j}>{opt}</li>)}
                            </ul>
                        )}
                         <p className="text-sm text-green-700 dark:text-green-400 font-semibold mt-2">Answer: {q.answer}</p>
                    </div>
                ))}
            </SectionCard>

            <div className="pt-6 border-t border-gray-200 dark:border-gray-700 flex flex-col sm:flex-row gap-3">
                <button 
                    onClick={handleDownloadJson}
                    className="w-full flex justify-center items-center bg-brand-dark-accent text-white p-3 rounded-lg hover:bg-gray-700 dark:bg-gray-600 dark:hover:bg-gray-500 transition-colors font-semibold">
                    <Download className="w-5 h-5 mr-2"/>
                    Download as JSON
                </button>
                <button 
                    onClick={() => onSendToEvaluator({ ...plan, professorNotes: notes })}
                    className="w-full flex justify-center items-center bg-brand-secondary text-white p-3 rounded-lg hover:bg-teal-600 transition-colors font-semibold">
                    <Send className="w-5 h-5 mr-2"/>
                    Send to Evaluator for Review
                </button>
            </div>
        </Card>
    );
};

export default LessonPlanDisplay;