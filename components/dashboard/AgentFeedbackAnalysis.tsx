import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import Card from '../common/Card';
import { AgentName } from '../../types';
import { ThumbsUp, MessageSquare, Percent } from 'lucide-react';

interface FeedbackData {
  agentName: AgentName;
  feedback: 'up' | 'down';
}

interface ProcessedFeedback {
  name: AgentName;
  up: number;
  down: number;
}

const AgentFeedbackAnalysis: React.FC = () => {
  const [feedbackData, setFeedbackData] = useState<ProcessedFeedback[]>([]);

  useEffect(() => {
    try {
      const rawData = localStorage.getItem('agentFeedback');
      if (rawData) {
        const parsedData: FeedbackData[] = JSON.parse(rawData);
        
        const counts = {
          [AgentName.Analyst]: { up: 0, down: 0 },
          [AgentName.Evaluator]: { up: 0, down: 0 },
          [AgentName.Optimizer]: { up: 0, down: 0 },
        };

        parsedData.forEach(item => {
          if (counts[item.agentName]) {
            counts[item.agentName][item.feedback]++;
          }
        });

        const processed = Object.entries(counts).map(([name, data]) => ({
          name: name as AgentName,
          up: data.up,
          down: data.down,
        }));

        setFeedbackData(processed);
      }
    } catch (e) {
      console.error("Failed to parse feedback data from localStorage:", e);
    }
  }, []);

  const SummaryCard: React.FC<{ data: ProcessedFeedback }> = ({ data }) => {
    const total = data.up + data.down;
    const satisfaction = total > 0 ? Math.round((data.up / total) * 100) : 0;
    const satisfactionColor = satisfaction >= 75 ? 'text-green-500' : satisfaction >= 50 ? 'text-yellow-500' : 'text-red-500';

    return (
        <div className="flex flex-col p-4 bg-brand-light dark:bg-brand-dark rounded-lg shadow-inner">
            <h4 className="font-bold text-brand-dark dark:text-brand-light">{data.name}</h4>
             <div className="flex items-center mt-2 text-sm text-gray-600 dark:text-gray-300">
                <MessageSquare className="w-4 h-4 mr-2" />
                <span>{total} ratings</span>
            </div>
            <div className={`flex items-center mt-1 text-sm font-semibold ${satisfactionColor}`}>
                <Percent className="w-4 h-4 mr-2" />
                <span>{satisfaction}% satisfaction</span>
            </div>
        </div>
    );
  };

  if (feedbackData.every(d => d.up === 0 && d.down === 0)) {
    return (
      <Card>
        <h2 className="text-xl font-semibold text-brand-dark dark:text-brand-light flex items-center mb-4">
          <ThumbsUp className="w-6 h-6 mr-3 text-brand-primary" />
          Agent Performance Feedback
        </h2>
        <div className="text-center py-8">
            <p className="text-gray-500 dark:text-gray-400">No feedback data recorded yet.</p>
            <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">Please rate agent responses in the AI Workshop to see performance trends.</p>
        </div>
      </Card>
    );
  }

  return (
    <Card>
      <h2 className="text-xl font-semibold text-brand-dark dark:text-brand-light flex items-center mb-4">
        <ThumbsUp className="w-6 h-6 mr-3 text-brand-primary" />
        Agent Performance Feedback
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="w-full h-[300px]">
            <ResponsiveContainer>
                <BarChart data={feedbackData} layout="vertical" margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                <XAxis type="number" tick={{ fill: '#6b7280', fontSize: 12 }} />
                <YAxis type="category" dataKey="name" tick={{ fill: '#6b7280', fontSize: 12 }} width={80} />
                <Tooltip
                    contentStyle={{
                    backgroundColor: 'rgba(255, 255, 255, 0.9)',
                    border: '1px solid #d1d5db',
                    borderRadius: '0.5rem',
                    }}
                />
                <Legend iconSize={10} wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
                <Bar dataKey="up" name="Thumbs Up" stackId="a" fill="#48bb78" />
                <Bar dataKey="down" name="Thumbs Down" stackId="a" fill="#f56565" />
                </BarChart>
            </ResponsiveContainer>
        </div>
        <div className="space-y-4 bg-brand-light-accent dark:bg-brand-dark-accent p-4 rounded-lg">
             {feedbackData.map(data => <SummaryCard key={data.name} data={data} />)}
        </div>
      </div>
    </Card>
  );
};

export default AgentFeedbackAnalysis;
