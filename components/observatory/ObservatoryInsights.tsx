import React, { useState } from 'react';
import Card from '../common/Card';
import { Student } from '../../types';
import { getObservatoryInsights } from '../../services/geminiService';
import { Microscope, Loader2, AlertTriangle, Lightbulb } from 'lucide-react';
import Markdown from 'react-markdown';

interface ObservatoryInsightsProps {
    students: Student[];
}

const ObservatoryInsights: React.FC<ObservatoryInsightsProps> = ({ students }) => {
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [insights, setInsights] = useState<string | null>(null);

    const handleGenerateInsights = async () => {
        setIsLoading(true);
        setError(null);
        setInsights(null);

        try {
            const result = await getObservatoryInsights(students);
            setInsights(result);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An unknown error occurred.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Card>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                <h2 className="text-xl font-semibold text-brand-dark dark:text-brand-light flex items-center mb-3 sm:mb-0">
                    <Microscope className="w-6 h-6 mr-3 text-brand-primary" />
                    AI-Powered Observatory Insights
                </h2>
                <button
                    onClick={handleGenerateInsights}
                    disabled={isLoading}
                    className="flex items-center justify-center px-4 py-2 bg-brand-primary text-white font-semibold rounded-lg hover:bg-blue-600 disabled:bg-gray-400 transition-colors"
                >
                    {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Generate Insights'}
                </button>
            </div>
            <div className="mt-4 p-4 bg-brand-light-accent dark:bg-brand-dark rounded-lg min-h-[100px] flex items-center justify-center">
                {isLoading && (
                    <div className="text-center text-gray-600 dark:text-gray-400">
                        <Loader2 className="w-8 h-8 mx-auto animate-spin text-brand-primary mb-2" />
                        <p className="font-semibold">Analyst is scanning class-wide data...</p>
                    </div>
                )}
                {error && (
                    <div className="text-center text-red-700">
                        <AlertTriangle className="w-8 h-8 mx-auto text-brand-danger mb-2" />
                        <p className="font-semibold">Analysis Failed</p>
                        <p className="text-sm">{error}</p>
                    </div>
                )}
                {insights && (
                    <div className="prose prose-sm max-w-none w-full dark:prose-invert">
                        <Markdown>{insights}</Markdown>
                    </div>
                )}
                {!isLoading && !error && !insights && (
                    <div className="text-center text-gray-500 dark:text-gray-400">
                         <Lightbulb className="w-8 h-8 mx-auto mb-2" />
                         <p className="font-semibold">Ready for Analysis</p>
                         <p className="text-sm">Click "Generate Insights" for the Analyst's report on class trends.</p>
                    </div>
                )}
            </div>
        </Card>
    );
};

export default ObservatoryInsights;