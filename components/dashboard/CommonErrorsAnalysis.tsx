
import React, { useState } from 'react';
import Card from '../common/Card';
import { MOCK_ASSIGNMENT_TOPICS } from '../../constants';
import { getAgentResponse } from '../../services/geminiService';
import { AgentName } from '../../types';
import { BarChartHorizontal, Loader2, AlertTriangle, Lightbulb } from 'lucide-react';
import Markdown from 'react-markdown';

const CommonErrorsAnalysis: React.FC = () => {
    const [selectedTopic, setSelectedTopic] = useState<string>(MOCK_ASSIGNMENT_TOPICS[0]);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [analysisResult, setAnalysisResult] = useState<string | null>(null);

    const handleAnalysis = async () => {
        setIsLoading(true);
        setError(null);
        setAnalysisResult(null);

        const prompt = `As the Analyst agent, please provide a summary of the most common student errors and misconceptions for the topic: "${selectedTopic}". Base your analysis on recent assignment submissions. Structure your response with clear headings for each misconception and provide brief, anonymized code snippets or logical examples of the errors.`;

        try {
            const result = await getAgentResponse(prompt, AgentName.Analyst);
            setAnalysisResult(result);
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred.';
            setError(errorMessage);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Card>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4">
                <h2 className="text-xl font-semibold text-brand-dark dark:text-brand-light flex items-center mb-2 sm:mb-0">
                    <BarChartHorizontal className="w-6 h-6 mr-3 text-brand-primary" />
                    Common Misconceptions Analysis
                </h2>
                <div className="flex items-center gap-2">
                    <select
                        value={selectedTopic}
                        onChange={(e) => setSelectedTopic(e.target.value)}
                        className="w-full sm:w-auto p-2 border rounded-lg focus:ring-2 focus:ring-brand-primary focus:outline-none bg-white dark:bg-brand-dark dark:border-gray-600 dark:text-brand-light"
                        aria-label="Select a topic for analysis"
                    >
                        {MOCK_ASSIGNMENT_TOPICS.map(topic => (
                            <option key={topic} value={topic}>{topic}</option>
                        ))}
                    </select>
                    <button
                        onClick={handleAnalysis}
                        disabled={isLoading}
                        className="flex items-center justify-center px-4 py-2 bg-brand-primary text-white font-semibold rounded-lg hover:bg-blue-600 disabled:bg-gray-400 transition-colors"
                    >
                        {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Analyze'}
                    </button>
                </div>
            </div>

            <div className="mt-4 p-4 bg-brand-light-accent dark:bg-brand-dark rounded-lg min-h-[200px] flex items-center justify-center">
                {isLoading && (
                    <div className="text-center text-gray-600 dark:text-gray-400">
                        <Loader2 className="w-8 h-8 mx-auto animate-spin text-brand-primary mb-2" />
                        <p className="font-semibold">Analyst agent is processing data...</p>
                        <p className="text-sm">This may take a moment.</p>
                    </div>
                )}
                {error && (
                    <div className="text-center text-red-700">
                        <AlertTriangle className="w-8 h-8 mx-auto text-brand-danger mb-2" />
                        <p className="font-semibold">Analysis Failed</p>
                        <p className="text-sm">{error}</p>
                    </div>
                )}
                {analysisResult && (
                    <div className="prose prose-sm max-w-none w-full dark:prose-invert">
                        <Markdown>{analysisResult}</Markdown>
                    </div>
                )}
                {!isLoading && !error && !analysisResult && (
                    <div className="text-center text-gray-500 dark:text-gray-400">
                         <Lightbulb className="w-8 h-8 mx-auto mb-2" />
                         <p className="font-semibold">Ready for Analysis</p>
                         <p className="text-sm">Select a topic and click "Analyze" to see common student errors.</p>
                    </div>
                )}
            </div>
        </Card>
    );
};

export default CommonErrorsAnalysis;