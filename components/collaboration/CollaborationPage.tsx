import React, { useState } from 'react';
import ChatInterface from './ChatInterface';
import AgentControlPanel from './AgentControlPanel';
import { INITIAL_AGENTS } from '../../constants';
import { Agent } from '../../types';

const CollaborationPage: React.FC = () => {
  const [agents, setAgents] = useState<Agent[]>(INITIAL_AGENTS);

  return (
    <div className="h-full flex flex-col space-y-8">
       <h1 className="text-3xl font-bold text-brand-dark dark:text-brand-light">Multi-Agent Collaboration Workshop</h1>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 flex-1 min-h-0">
        <div className="lg:col-span-2 flex flex-col min-h-0">
          <ChatInterface agents={agents} setAgents={setAgents} />
        </div>
        <div className="lg:col-span-1">
          <AgentControlPanel agents={agents} />
        </div>
      </div>
    </div>
  );
};

export default CollaborationPage;
