
import React from 'react';
import Card from '../common/Card';
import { Users, BarChart2, CheckCircle, Activity } from 'lucide-react';

interface CourseHealthSummaryProps {
  studentCount: number;
}

const SummaryCard: React.FC<{ icon: React.ElementType, title: string, value: string, color: string }> = ({ icon: Icon, title, value, color }) => (
    <div className="flex items-center p-4 bg-brand-light-accent rounded-lg dark:bg-brand-dark">
        <div className={`p-3 rounded-full mr-4 ${color}`}>
            <Icon className="w-6 h-6 text-white" />
        </div>
        <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">{title}</p>
            <p className="text-2xl font-bold text-brand-dark dark:text-brand-light">{value}</p>
        </div>
    </div>
);


const CourseHealthSummary: React.FC<CourseHealthSummaryProps> = ({ studentCount }) => {
  return (
    <Card>
        <h2 className="text-xl font-semibold text-brand-dark dark:text-brand-light mb-4">Course Overview</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <SummaryCard icon={Users} title="Active Students" value={String(studentCount)} color="bg-blue-500"/>
            <SummaryCard icon={BarChart2} title="Avg. Progress" value="72%" color="bg-green-500"/>
            <SummaryCard icon={CheckCircle} title="Course Health" value="Good" color="bg-teal-500"/>
            <SummaryCard icon={Activity} title="Engagement" value="High" color="bg-purple-500"/>
        </div>
    </Card>
  );
};

export default CourseHealthSummary;