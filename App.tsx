import React from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import Sidebar from './components/layout/Sidebar';
import DashboardPage from './components/dashboard/DashboardPage';
import CollaborationPage from './components/collaboration/CollaborationPage';
import StudentObservatoryPage from './components/observatory/StudentObservatoryPage';
import InstructionalDesignLabPage from './components/lab/InstructionalDesignLabPage';
import EvaluationOptimizationPage from './components/evaluation/EvaluationOptimizationPage';

const App: React.FC = () => {
  return (
    <HashRouter>
      <div className="flex h-screen bg-brand-light-accent text-gray-800 dark:bg-brand-dark dark:text-gray-200">
        <Sidebar />
        <main className="flex-1 overflow-y-auto p-8">
          <Routes>
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/lab" element={<InstructionalDesignLabPage />} />
            <Route path="/observatory" element={<StudentObservatoryPage />} />
            <Route path="/evaluation" element={<EvaluationOptimizationPage />} />
            <Route path="/collaboration" element={<CollaborationPage />} />
          </Routes>
        </main>
      </div>
    </HashRouter>
  );
};

export default App;