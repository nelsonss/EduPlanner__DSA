import React, { useState } from 'react';
import { Student, AgentName } from '../../types';
import { X, Loader2, AlertTriangle, Lightbulb, BarChartHorizontal } from 'lucide-react';
import { getAgentResponse } from '../../services/geminiService';
import Markdown from 'react-markdown';

interface RemedialWorkModalProps {
    student: Student;
    onClose: () => void;
}

const RemedialWorkModal: React.FC<RemedialWorkModalProps> = ({ student, onClose }) => {
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [suggestions, setSuggestions] = useState<string | null>(null);

    const handleGenerate = async () => {
        setIsLoading(true);
        setError(null);
        setSuggestions(null);

        const scoresSummary = student.scores?.map(s => `- ${s.title}: ${s.score}%`).join('\n') || 'No scores available.';
        const assignmentsSummary = student.assignments?.map(a => `- ${a.title} (Status: ${a.status}, Due: ${a.dueDate})`).join('\n') || 'No assignments on record.';

        const prompt = `As the Analyst agent, your task is to recommend suitable remedial assignments for student '${student.name}'.
Analyze their performance data below, focusing on low scores and late submissions, to identify areas of weakness.
Based on this analysis, suggest 2-3 specific assignment topics that would directly address these weaknesses.
For each recommendation, provide:
1. A clear, descriptive title for the assignment.
2. A brief rationale explaining which weakness it targets and why it's beneficial.

--- STUDENT PERFORMANCE DATA ---
Name: ${student.name}
Status: ${student.status}

Assignment Scores:
${scoresSummary}

Assignment History:
${assignmentsSummary}
--- END OF DATA ---

Begin your recommendations now.`;

        try {
            const result = await getAgentResponse(prompt, AgentName.Analyst);
            setSuggestions(result);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An unknown error occurred.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleAssign = () => {
        // In a real application, this would trigger a backend process.
        // For this demo, we'll just show an alert and close the modal.
        alert(`Remedial work based on AI recommendations has been assigned to ${student.name}.`);
        onClose();
    };


    return (
        <div 
            className="fixed inset-0 bg-black bg-opacity-75 z-[60] flex justify-center items-center p-4"
            onClick={onClose}
            role="dialog"
            aria-modal="true"
            aria-labelledby="remedial-work-title"
        >
            <div 
                className="bg-white dark:bg-brand-dark-accent rounded-lg shadow-xl w-full max-w-2xl flex flex-col animate-fade-in-up"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <header className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
                    <h2 id="remedial-work-title" className="text-xl font-bold text-brand-dark dark:text-brand-light">
                        AI Assignment Recommendations for <span className="text-brand-primary">{student.name}</span>
                    </h2>
                    <button onClick={onClose} className="p-2 rounded-full text-gray-500 hover:bg-gray-200 dark:text-gray-400 dark:hover:bg-gray-600">
                        <X className="w-6 h-6" />
                    </button>
                </header>

                {/* Body */}
                <div className="p-6 space-y-4">
                     <p className="text-sm text-gray-700 dark:text-gray-300">
                        The <span className="font-bold text-purple-500">Analyst Agent</span> will analyze {student.name}'s performance data to identify weaknesses and recommend targeted remedial assignments.
                    </p>
                    
                    <button
                        onClick={handleGenerate}
                        disabled={isLoading}
                        className="w-full flex items-center justify-center px-4 py-2 bg-brand-secondary text-white font-semibold rounded-lg hover:bg-teal-600 disabled:bg-gray-400 transition-colors"
                    >
                        {isLoading ? <Loader2 className="w-5 h-5 mr-2 animate-spin" /> : <BarChartHorizontal className="w-5 h-5 mr-2" />}
                        {isLoading ? 'Analyst is Working...' : 'Generate Recommendations'}
                    </button>

                    <div className="mt-4 p-4 bg-brand-light-accent dark:bg-brand-dark rounded-lg min-h-[250px] flex items-center justify-center">
                        {isLoading && (
                            <div className="text-center text-gray-600 dark:text-gray-400">
                                <Loader2 className="w-8 h-8 mx-auto animate-spin text-brand-primary mb-2" />
                                <p className="font-semibold">Analyzing student data...</p>
                            </div>
                        )}
                        {error && (
                            <div className="text-center text-red-700">
                                <AlertTriangle className="w-8 h-8 mx-auto text-brand-danger mb-2" />
                                <p className="font-semibold">Generation Failed</p>
                                <p className="text-sm">{error}</p>
                            </div>
                        )}
                        {suggestions && (
                            <div className="prose prose-sm max-w-none w-full h-64 overflow-y-auto dark:prose-invert">
                                <Markdown>{suggestions}</Markdown>
                            </div>
                        )}
                        {!isLoading && !error && !suggestions && (
                            <div className="text-center text-gray-500 dark:text-gray-400">
                                <Lightbulb className="w-8 h-8 mx-auto mb-2" />
                                <p className="font-semibold">Ready to Generate</p>
                                <p className="text-sm">Assignment recommendations will appear here.</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Footer */}
                <footer className="flex justify-end space-x-3 p-4 bg-gray-50 dark:bg-gray-900 rounded-b-lg">
                    <button onClick={onClose} className="px-4 py-2 text-sm font-semibold text-gray-700 bg-white border rounded-lg hover:bg-gray-100 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200 dark:hover:bg-gray-600">
                        Cancel
                    </button>
                    <button
                        onClick={handleAssign}
                        disabled={!suggestions || isLoading}
                        className="px-4 py-2 text-sm font-semibold text-white bg-brand-primary rounded-lg hover:bg-blue-600 disabled:bg-gray-400 disabled:cursor-not-allowed"
                    >
                        Assign Work
                    </button>
                </footer>
            </div>
        </div>
    );
};

export default RemedialWorkModal;
