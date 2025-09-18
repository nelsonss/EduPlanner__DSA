
import React from 'react';
import { Student, StudentStatus } from '../../types';
import Card from '../common/Card';
import { Tooltip } from 'react-tooltip';

interface StudentProgressHeatmapProps {
  students: Student[];
  onStudentSelect: (student: Student) => void;
}

const statusColors: Record<StudentStatus, string> = {
  [StudentStatus.Excelling]: 'bg-brand-success',
  [StudentStatus.OnTrack]: 'bg-brand-warning',
  [StudentStatus.Struggling]: 'bg-brand-danger',
};

const StudentProgressHeatmap: React.FC<StudentProgressHeatmapProps> = ({ students, onStudentSelect }) => {
  return (
    <Card>
      <h2 className="text-xl font-semibold text-brand-dark dark:text-brand-light mb-4">Student Progress Heatmap</h2>
      <div className="grid grid-cols-6 sm:grid-cols-8 md:grid-cols-10 lg:grid-cols-12 gap-3">
        {students.map((student) => (
          <button
            key={student.id}
            onClick={() => onStudentSelect(student)}
            aria-label={`View details for ${student.name}`}
            data-tooltip-id="student-tooltip"
            data-tooltip-content={`${student.name} - ${student.status} (${student.progress}%)`}
            className={`w-10 h-10 rounded-full flex items-center justify-center cursor-pointer transform hover:scale-110 transition-transform ${statusColors[student.status]}`}
          >
            <span className="text-white font-bold text-sm">
              {student.name.charAt(0)}
            </span>
          </button>
        ))}
      </div>
       <Tooltip id="student-tooltip" />
      <div className="flex justify-end space-x-4 mt-4 text-sm text-gray-600 dark:text-gray-400">
        {Object.entries(statusColors).map(([status, color]) => (
          <div key={status} className="flex items-center">
            <span className={`w-3 h-3 rounded-full mr-2 ${color}`}></span>
            <span>{status}</span>
          </div>
        ))}
      </div>
    </Card>
  );
};

export default StudentProgressHeatmap;