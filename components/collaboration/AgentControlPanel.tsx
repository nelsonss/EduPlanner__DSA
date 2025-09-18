import React from 'react';
import Card from '../common/Card';
import { Agent, AgentName } from '../../types';
import { BrainCircuit, Sliders, BarChartHorizontal } from 'lucide-react';

interface AgentControlPanelProps {
  agents: Agent[];
}

const agentConfig: Record<AgentName, { icon: React.ElementType, color: string, description: string }> = {
    [AgentName.Evaluator]: { icon: BrainCircuit, color: 'text-blue-500', description: 'Analyzes lesson quality and instructional design.' },
    [AgentName.Optimizer]: { icon: Sliders, color: 'text-green-500', description: 'Refines content for clarity and engagement.' },
    [AgentName.Analyst]: { icon: BarChartHorizontal, color: 'text-purple-500', description: 'Identifies student trends and error patterns.' },
};

const AgentControlPanel: React.FC<AgentControlPanelProps> = ({ agents }) => {
  return (
    <Card className="h-full">
      <h2 className="text-xl font-semibold text-brand-dark dark:text-brand-light mb-4">Agent Status</h2>
      <div className="space-y-4">
        {agents.map((agent) => {
          const config = agentConfig[agent.name];
          const isProcessing = agent.status === 'Processing';
          const statusColor = isProcessing ? 'text-orange-500' : 'text-gray-500 dark:text-gray-400';
          
          const containerClasses = `flex p-3 rounded-lg transition-all duration-300 ease-in-out ${
            isProcessing 
              ? 'bg-brand-light-accent dark:bg-brand-dark ring-2 ring-brand-primary shadow-md' 
              : ''
          }`;

          return (
            <div key={agent.name} className={containerClasses}>
              <config.icon className={`w-10 h-10 mr-4 flex-shrink-0 ${config.color} ${isProcessing ? 'animate-pulse' : ''}`} />
              <div>
                <h3 className="font-bold text-lg text-brand-dark dark:text-brand-light">{agent.name}</h3>
                <p className="text-sm text-gray-600 dark:text-gray-300 mb-1">{config.description}</p>
                <p className={`text-sm font-semibold ${statusColor}`}>Status: {agent.status}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Task: {agent.task}</p>
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
};

export default AgentControlPanel;
