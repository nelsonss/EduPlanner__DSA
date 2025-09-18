import React, { useState } from 'react';
import { MOCK_ALERTS, MOCK_STUDENTS } from '../../constants';
import AlertsPanel from './AlertsPanel';
import CourseHealthSummary from './CourseHealthSummary';
import StudentProgressHeatmap from './StudentProgressHeatmap';
import RealTimeActivityPulse from './RealTimeActivityPulse';
import StudentDetailModal from './StudentDetailModal';
import { Student } from '../../types';
import StudentActivityTrendsChart from './StudentActivityTrendsChart';
import CommonErrorsAnalysis from './CommonErrorsAnalysis';
import AgentFeedbackAnalysis from './AgentFeedbackAnalysis';

const DashboardPage: React.FC = () => {
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold text-brand-dark dark:text-brand-light">Pedagogical Command Center</h1>
      <CourseHealthSummary studentCount={MOCK_STUDENTS.length} />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
            <StudentProgressHeatmap students={MOCK_STUDENTS} onStudentSelect={setSelectedStudent} />
        </div>
        <div className="lg:col-span-1">
            <AlertsPanel alerts={MOCK_ALERTS} />
        </div>
      </div>
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        <StudentActivityTrendsChart />
        <RealTimeActivityPulse />
      </div>

      <CommonErrorsAnalysis />
      
      <AgentFeedbackAnalysis />

       {selectedStudent && (
        <StudentDetailModal 
          student={selectedStudent} 
          onClose={() => setSelectedStudent(null)} 
        />
       )}
    </div>
  );
};

export default DashboardPage;