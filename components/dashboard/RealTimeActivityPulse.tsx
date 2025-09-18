
import React, { useState, useEffect } from 'react';
import Card from '../common/Card';
import { BookOpen, Code, CheckSquare } from 'lucide-react';

const activities = [
  { student: 'Alice', action: 'completed', topic: "Kruskal's Algorithm Quiz", icon: CheckSquare },
  { student: 'Frank', action: 'reviewing', topic: 'Complexity Analysis', icon: BookOpen },
  { student: 'Charlie', action: 'coding', topic: 'Hash Table Implementation', icon: Code },
  { student: 'Grace', action: 'started', topic: 'Dijkstra Visualization', icon: BookOpen },
];

const RealTimeActivityPulse: React.FC = () => {
    const [latestActivity, setLatestActivity] = useState(activities[0]);

    useEffect(() => {
        const interval = setInterval(() => {
            setLatestActivity(prev => {
                const currentIndex = activities.findIndex(a => a.topic === prev.topic);
                const nextIndex = (currentIndex + 1) % activities.length;
                return activities[nextIndex];
            });
        }, 5000);

        return () => clearInterval(interval);
    }, []);


    return (
        <Card>
            <h2 className="text-xl font-semibold text-brand-dark dark:text-brand-light mb-4">Real-Time Activity Pulse</h2>
            <div className="flex items-center p-4 bg-brand-light-accent dark:bg-brand-dark rounded-lg">
                <latestActivity.icon className="w-8 h-8 mr-4 text-brand-primary" />
                <div>
                    <p className="text-gray-800 dark:text-gray-200">
                        <span className="font-bold">{latestActivity.student}</span> is currently {latestActivity.action} the '{latestActivity.topic}' material.
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Just now</p>
                </div>
            </div>
        </Card>
    );
};

export default RealTimeActivityPulse;