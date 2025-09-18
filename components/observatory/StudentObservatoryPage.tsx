import React, { useState } from 'react';
import { MOCK_STUDENTS } from '../../constants';
import { Student } from '../../types';
import StudentDetailModal from '../dashboard/StudentDetailModal';
import Card from '../common/Card';
import StudentScatterPlot from './StudentScatterPlot';
import LiveActivityFeed from './LiveActivityFeed';
import ObservatoryInsights from './ObservatoryInsights';

const StudentObservatoryPage: React.FC = () => {
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold text-brand-dark dark:text-brand-light">Student Observatory</h1>
      
      <ObservatoryInsights students={MOCK_STUDENTS} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
            <StudentScatterPlot
                students={MOCK_STUDENTS}
                onStudentSelect={setSelectedStudent}
            />
        </div>
        <div className="lg:col-span-1">
            <LiveActivityFeed students={MOCK_STUDENTS} />
        </div>
      </div>

      {selectedStudent && (
        <StudentDetailModal 
          student={selectedStudent} 
          onClose={() => setSelectedStudent(null)} 
        />
      )}
    </div>
  );
};

export default StudentObservatoryPage;