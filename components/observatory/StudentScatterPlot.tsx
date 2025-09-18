import React from 'react';
import { ScatterChart, Scatter, XAxis, YAxis, ZAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts';
import { Student, StudentStatus } from '../../types';
import Card from '../common/Card';

interface StudentScatterPlotProps {
  students: Student[];
  onStudentSelect: (student: Student) => void;
}

const statusColors: Record<StudentStatus, string> = {
  [StudentStatus.Excelling]: '#48bb78', // brand-success
  [StudentStatus.OnTrack]: '#f6e05e',   // brand-warning
  [StudentStatus.Struggling]: '#f56565',// brand-danger
};

const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white dark:bg-brand-dark-accent p-3 rounded-lg shadow-lg border dark:border-gray-700">
          <p className="font-bold text-brand-dark dark:text-brand-light">{data.name}</p>
          <p className="text-sm text-gray-600 dark:text-gray-300">Progress: {data.progress}%</p>
          <p className="text-sm text-gray-600 dark:text-gray-300">Avg. Score: {data.averageScore || 'N/A'}%</p>
          <p className="text-sm text-gray-600 dark:text-gray-300">Status: {data.status}</p>
        </div>
      );
    }
    return null;
};

const StudentScatterPlot: React.FC<StudentScatterPlotProps> = ({ students, onStudentSelect }) => {
  const chartData = students.map(s => ({ ...s, z: 1 })); // Z-axis for bubble size if needed later

  return (
    <Card>
      <h2 className="text-xl font-semibold text-brand-dark dark:text-brand-light mb-4">Class Performance Distribution</h2>
      <div className="w-full h-[400px]">
        <ResponsiveContainer>
          <ScatterChart
            margin={{ top: 20, right: 20, bottom: 20, left: 20 }}
            aria-label="A scatter plot showing student distribution by progress and average score."
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
            <XAxis 
                type="number" 
                dataKey="progress" 
                name="Progress" 
                unit="%" 
                domain={[0, 100]}
                tick={{ fill: '#6b7280', fontSize: 12 }} 
                label={{ value: 'Course Progress', position: 'insideBottom', offset: -15, fill: '#6b7280' }}
            />
            <YAxis 
                type="number" 
                dataKey="averageScore" 
                name="Score" 
                unit="%" 
                domain={[0, 100]}
                tick={{ fill: '#6b7280', fontSize: 12 }} 
                label={{ value: 'Average Score', angle: -90, position: 'insideLeft', offset: -5, fill: '#6b7280' }}
            />
            <ZAxis type="number" dataKey="z" range={[50, 50]} name="activity" unit=" actions" />
            <Tooltip cursor={{ strokeDasharray: '3 3' }} content={<CustomTooltip />} />
             <Legend
              payload={Object.entries(statusColors).map(([status, color]) => ({
                value: status,
                type: 'circle',
                id: status,
                color: color,
              }))}
              wrapperStyle={{ fontSize: '14px', paddingTop: '20px' }}
            />
            <Scatter name="Students" data={chartData} onClick={(data) => onStudentSelect(data)}>
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={statusColors[entry.status]} cursor="pointer" />
              ))}
            </Scatter>
          </ScatterChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
};

export default StudentScatterPlot;