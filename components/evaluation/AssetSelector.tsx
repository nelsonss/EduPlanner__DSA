import React from 'react';
import Card from '../common/Card';
import { EvaluableAsset } from '../../types';
import { FileText, BrainCircuit, Loader2, HelpCircle, Calendar } from 'lucide-react';

type AssetFilter = 'All' | 'Quiz' | 'Assignment';

interface AssetSelectorProps {
    assets: EvaluableAsset[];
    selectedAssetId: string | null;
    onSelectAsset: (asset: EvaluableAsset) => void;
    onEvaluate: () => void;
    isEvaluating: boolean;
    filter: AssetFilter;
    onFilterChange: (filter: AssetFilter) => void;
}

const filterOptions: AssetFilter[] = ['All', 'Quiz', 'Assignment'];


const AssetSelector: React.FC<AssetSelectorProps> = ({ assets, selectedAssetId, onSelectAsset, onEvaluate, isEvaluating, filter, onFilterChange }) => {
    const selectedAsset = assets.find(a => a.id === selectedAssetId);

    return (
        <Card className="h-full flex flex-col">
            <h2 className="text-xl font-semibold text-brand-dark dark:text-brand-light mb-4 border-b pb-2 border-gray-200 dark:border-gray-700">
                1. Select an Asset
            </h2>

            <div className="flex items-center gap-2 mb-4">
                {filterOptions.map(option => (
                    <button
                        key={option}
                        onClick={() => onFilterChange(option)}
                        className={`px-3 py-1 text-sm font-semibold rounded-full transition-colors ${
                            filter === option
                            ? 'bg-brand-primary text-white'
                            : 'bg-brand-light-accent text-gray-700 hover:bg-gray-300 dark:bg-brand-dark dark:text-gray-300 dark:hover:bg-gray-600'
                        }`}
                        aria-pressed={filter === option}
                    >
                        {option === 'Quiz' ? 'Quizzes' : option === 'Assignment' ? 'Assignments' : 'All'}
                    </button>
                ))}
            </div>

            <div className="flex-grow overflow-y-auto space-y-2 pr-2">
                {assets.map(asset => {
                    const isSelected = selectedAssetId === asset.id;
                    return (
                        <button
                            key={asset.id}
                            onClick={() => onSelectAsset(asset)}
                            className={`w-full text-left flex items-start p-3 rounded-lg transition-colors ${
                                isSelected 
                                ? 'bg-brand-primary text-white shadow' 
                                : 'hover:bg-brand-light-accent dark:hover:bg-brand-dark'
                            }`}
                        >
                            <FileText className="w-5 h-5 mr-3 mt-1 flex-shrink-0" />
                            <div>
                                <p className="font-semibold">{asset.title}</p>
                                <div className={`flex items-center flex-wrap gap-x-4 gap-y-1 text-xs mt-1 ${isSelected ? 'text-blue-200' : 'text-gray-500 dark:text-gray-400'}`}>
                                    <span className="flex items-center">
                                        <HelpCircle className="w-3.5 h-3.5 mr-1" />
                                        {asset.questionCount} questions
                                    </span>
                                    <span className="flex items-center">
                                        <Calendar className="w-3.5 h-3.5 mr-1" />
                                        Evaluated: {asset.lastEvaluated || 'Never'}
                                    </span>
                                </div>
                            </div>
                        </button>
                    );
                })}
                 {assets.length === 0 && (
                    <div className="text-center py-10 text-gray-500 dark:text-gray-400">
                        <p>No {filter === 'Quiz' ? 'quizzes' : 'assignments'} found.</p>
                    </div>
                )}
            </div>

            {selectedAsset && (
                 <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                     <h3 className="text-lg font-semibold text-brand-dark dark:text-brand-light mb-3">2. Request Evaluation</h3>
                     <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
                         Ask the <span className="font-bold text-blue-500">Evaluator Agent</span> to analyze "{selectedAsset.title}" for clarity, potential confusion, and areas for improvement.
                     </p>
                    <button
                        onClick={onEvaluate}
                        disabled={isEvaluating}
                        className="w-full flex justify-center items-center bg-brand-secondary text-white p-3 rounded-lg hover:bg-teal-600 disabled:bg-gray-400 transition-colors font-semibold"
                    >
                        {isEvaluating 
                            ? <><Loader2 className="w-5 h-5 mr-2 animate-spin" /> Evaluating...</>
                            : <><BrainCircuit className="w-5 h-5 mr-2" /> Start Evaluation</>
                        }
                    </button>
                 </div>
            )}
        </Card>
    );
};

export default AssetSelector;