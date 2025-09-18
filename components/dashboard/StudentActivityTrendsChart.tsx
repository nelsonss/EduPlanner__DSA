
import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import Card from '../common/Card';
import { MOCK_ACTIVITY_TRENDS_DATA } from '../../constants';

const StudentActivityTrendsChart: React.FC = () => {
  return (
    <Card>
      <h2 className="text-xl font-semibold text-brand-dark dark:text-brand-light mb-4">Student Activity Trends (Last 7 Days)</h2>
      <div className="w-full h-[300px]">
        <ResponsiveContainer>
          <LineChart
            data={MOCK_ACTIVITY_TRENDS_DATA}
            margin={{ top: 5, right: 20, left: -10, bottom: 5 }}
            aria-label="A line chart showing student activity trends over the last 7 days."
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
            <XAxis dataKey="day" tick={{ fill: '#6b7280', fontSize: 12 }} />
            <YAxis tick={{ fill: '#6b7280', fontSize: 12 }} />
            <Tooltip
              contentStyle={{
                backgroundColor: 'rgba(255, 255, 255, 0.9)',
                border: '1px solid #d1d5db',
                borderRadius: '0.5rem',
              }}
            />
            <Legend iconSize={12} wrapperStyle={{ fontSize: '14px', paddingTop: '20px' }} />
            <Line
              type="monotone"
              dataKey="lessons"
              name="Lessons Completed"
              stroke="#4299e1"
              strokeWidth={2}
              dot={{ r: 4 }}
              activeDot={{ r: 6 }}
            />
            <Line
              type="monotone"
              dataKey="quizzes"
              name="Quizzes Attempted"
              stroke="#4fd1c5"
              strokeWidth={2}
              dot={{ r: 4 }}
              activeDot={{ r: 6 }}
            />
            <Line
              type="monotone"
              dataKey="assignments"
              name="Assignments Submitted"
              stroke="#48bb78"
              strokeWidth={2}
              dot={{ r: 4 }}
              activeDot={{ r: 6 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
};

export default StudentActivityTrendsChart;