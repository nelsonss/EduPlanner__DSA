
import React from 'react';
import Card from '../common/Card';
import { EvaluableAsset, AssetContent } from '../../types';
import { Target, Wand2, Loader2, Columns, Save, CheckCircle, X, Check } from 'lucide-react';
import Markdown from 'react-markdown';

interface EvaluationDisplayProps {
    view: 'welcome' | 'evaluating' | 'evaluation_result' | 'optimizing' | 'comparison';
    asset: EvaluableAsset | null;
    evaluationReport: string | null;
    optimizedContent: AssetContent | null;
    onOptimize: () => void;
    reportSource: 'new' | 'saved' | null;
    onSaveReport: () => void;
    onSaveChanges: () => void;
    onDiscardChanges: () => void;
}

const LoadingView: React.FC<{ message: string }> = ({ message }) => (
    <div className="flex flex-col items-center justify-center h-full text-center">
        <Loader2 className="w-12 h-12 text-brand-primary animate-spin mb-4" />
        <h3 className="text-xl font-semibold text-brand-dark dark:text-brand-light">{message}</h3>
        <p className="text-gray-500 dark:text-gray-400">This may take a moment.</p>
    </div>
);

const Question: React.FC<{ question: EvaluableAsset['content']['questions'][0], number: number }> = ({ question, number }) => (
    <div className="p-3 bg-brand-light dark:bg-brand-dark-accent rounded-md text-left">
        <p className="font-semibold text-gray-800 dark:text-gray-100">{number}. {question.text}</p>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Type: {question.type}</p>
        {question.options && (
            <ul className="list-disc list-inside text-sm text-gray-600 dark:text-gray-300 space-y-1 pl-4 mt-2">
                {question.options.map((opt, j) => <li key={j}>{opt}</li>)}
            </ul>
        )}
    </div>
);

// New component for comparing individual questions
const QuestionComparison: React.FC<{ 
    originalQ: EvaluableAsset['content']['questions'][0] | undefined;
    newQ: EvaluableAsset['content']['questions'][0] | undefined;
    number: number; 
}> = ({ originalQ, newQ, number }) => {
    // Case 1: Question Added
    if (!originalQ && newQ) {
        return (
            <div className="p-4 rounded-lg bg-green-50 dark:bg-green-900/20 border-l-4 border-green-500">
                <h4 className="font-bold text-green-800 dark:text-green-300 mb-2">Question {number} (Added)</h4>
                <Question question={newQ} number={number} />
            </div>
        );
    }
    
    // Case 2: Question Removed
    if (originalQ && !newQ) {
        return (
            <div className="p-4 rounded-lg bg-red-50 dark:bg-red-900/20 border-l-4 border-red-500">
                <h4 className="font-bold text-red-800 dark:text-red-300 mb-2">Question {number} (Removed)</h4>
                <Question question={originalQ} number={number} />
            </div>
        );
    }

    if (originalQ && newQ) {
        // Using JSON.stringify for a deep comparison of the question object
        const isModified = JSON.stringify(originalQ) !== JSON.stringify(newQ);

        // Case 3: Question Unchanged
        if (!isModified) {
            return (
                <div className="p-4 rounded-lg bg-gray-50 dark:bg-gray-800/30 border-l-4 border-gray-400">
                    <h4 className="font-bold text-gray-800 dark:text-gray-300 mb-2">Question {number} (Unchanged)</h4>
                    <Question question={originalQ} number={number} />
                </div>
            );
        }

        // Case 4: Question Modified
        return (
            <div className="p-4 rounded-lg bg-yellow-50 dark:bg-yellow-900/20 border-l-4 border-yellow-500">
                <h4 className="font-bold text-yellow-800 dark:text-yellow-300 mb-2">Question {number} (Modified)</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                    <div>
                        <h5 className="text-sm font-semibold text-center text-red-600 dark:text-red-400 mb-1">Before</h5>
                        <div className="opacity-80">
                            <Question question={originalQ} number={number} />
                        </div>
                    </div>
                    <div>
                        <h5 className="text-sm font-semibold text-center text-green-600 dark:text-green-400 mb-1">After</h5>
                        <Question question={newQ} number={number} />
                    </div>
                </div>
            </div>
        );
    }

    return null;
};


const EvaluationDisplay: React.FC<EvaluationDisplayProps> = ({ view, asset, evaluationReport, optimizedContent, onOptimize, reportSource, onSaveReport, onSaveChanges, onDiscardChanges }) => {
    
    const renderContent = () => {
        switch (view) {
            case 'evaluating':
                return <LoadingView message="Evaluator agent is analyzing the asset..." />;
            case 'optimizing':
                return <LoadingView message="Optimizer agent is refining the asset..." />;

            case 'evaluation_result':
                return (
                    <div className="h-full flex flex-col">
                        <h2 className="text-xl font-semibold text-brand-dark dark:text-brand-light mb-3 flex-shrink-0">
                            {reportSource === 'saved' ? 'Saved Evaluation Report' : 'Evaluation Report'} for "{asset?.title}"
                        </h2>
                        <div className="flex-grow overflow-y-auto pr-2 bg-brand-light-accent dark:bg-brand-dark p-4 rounded-lg prose prose-sm max-w-none dark:prose-invert">
                            <Markdown>{evaluationReport || ''}</Markdown>
                        </div>

                        <div className="mt-4 space-y-4">
                            {reportSource === 'new' && (
                                <button
                                    onClick={onSaveReport}
                                    className="w-full flex justify-center items-center bg-brand-primary text-white p-2 rounded-lg hover:bg-blue-600 font-semibold transition-colors"
                                >
                                    <Save className="w-5 h-5 mr-2" />
                                    Save Evaluation Report
                                </button>
                            )}
                            {reportSource === 'saved' && (
                                <div className="flex items-center justify-center p-2 rounded-lg bg-green-100 dark:bg-green-900/50 text-green-700 dark:text-green-300">
                                    <CheckCircle className="w-5 h-5 mr-2" />
                                    <span className="font-semibold">Report Saved</span>
                                    {asset?.lastEvaluated && <span className="text-xs ml-2 opacity-80">(on {asset.lastEvaluated})</span>}
                                </div>
                            )}

                            <div className="pt-4 border-t border-gray-200 dark:border-gray-700 flex-shrink-0">
                                <h3 className="text-lg font-semibold text-brand-dark dark:text-brand-light mb-3">3. Optimize Asset</h3>
                                <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
                                    Task the <span className="font-bold text-green-500">Optimizer Agent</span> to automatically generate an improved version based on this feedback.
                                </p>
                                <button
                                    onClick={onOptimize}
                                    className="w-full flex justify-center items-center bg-green-500 text-white p-3 rounded-lg hover:bg-green-600 font-semibold transition-colors"
                                >
                                    <Wand2 className="w-5 h-5 mr-2" />
                                    Optimize with AI
                                </button>
                            </div>
                        </div>
                    </div>
                );

            case 'comparison':
                const originalQuestions = asset?.content.questions || [];
                const newQuestions = optimizedContent?.questions || [];
                
                const allIds = [...new Set([
                    ...originalQuestions.map(q => q.id),
                    ...newQuestions.map(q => q.id)
                ])];
        
                return (
                    <div className="h-full flex flex-col">
                        <h2 className="text-xl font-semibold text-brand-dark dark:text-brand-light mb-3 flex items-center flex-shrink-0">
                           <Columns className="w-6 h-6 mr-3 text-brand-primary"/> Comparison for "{asset?.title}"
                        </h2>
                        <div className="flex-grow overflow-y-auto pr-2 space-y-4">
                            {allIds.map((id, index) => {
                                const originalQ = originalQuestions.find(q => q.id === id);
                                const newQ = newQuestions.find(q => q.id === id);
                                return <QuestionComparison key={id} originalQ={originalQ} newQ={newQ} number={index + 1} />;
                            })}
                        </div>
                        <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700 flex-shrink-0">
                            <h3 className="text-lg font-semibold text-brand-dark dark:text-brand-light mb-2 text-center">Review Complete</h3>
                            <p className="text-sm text-center text-gray-600 dark:text-gray-300 mb-4">
                                Would you like to save the AI-optimized version of this asset?
                            </p>
                            <div className="flex justify-center gap-4">
                                <button
                                    onClick={onDiscardChanges}
                                    className="flex items-center justify-center px-6 py-2 bg-gray-200 text-gray-800 font-semibold rounded-lg hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600 transition-colors"
                                >
                                    <X className="w-5 h-5 mr-2" />
                                    Discard Changes
                                </button>
                                <button
                                    onClick={onSaveChanges}
                                    className="flex items-center justify-center px-6 py-2 bg-green-500 text-white font-semibold rounded-lg hover:bg-green-600 transition-colors"
                                >
                                    <Check className="w-5 h-5 mr-2" />
                                    Save Optimized Version
                                </button>
                            </div>
                        </div>
                    </div>
                );

            case 'welcome':
            default:
                return (
                    <div className="flex flex-col items-center justify-center h-full text-center">
                        <Target className="w-16 h-16 text-gray-300 dark:text-gray-600 mb-4" />
                        <h3 className="text-2xl font-semibold text-gray-600 dark:text-gray-400">Evaluation & Optimization Center</h3>
                        <p className="text-gray-500 dark:text-gray-500 mt-2 max-w-md">
                            Select an asset from the left panel to begin the AI-driven review process.
                        </p>
                    </div>
                );
        }
    };

    return <Card className="h-full">{renderContent()}</Card>;
};

export default EvaluationDisplay;
