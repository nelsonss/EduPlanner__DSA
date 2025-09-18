import React, { useState, useEffect } from 'react';
import { Student, StudentActivity } from '../../types';
import Card from '../common/Card';
import { BookOpen, Code, CheckSquare, Activity } from 'lucide-react';

interface LiveActivityFeedProps {
  students: Student[];
}

interface FeedItem extends StudentActivity {
    studentName: string;
}

const activityIcons: Record<StudentActivity['type'], React.ElementType> = {
    quiz: CheckSquare,
    lesson: BookOpen,
    assignment: Code,
    visualization: Code,
};

const LiveActivityFeed: React.FC<LiveActivityFeedProps> = ({ students }) => {
    const [feed, setFeed] = useState<FeedItem[]>([]);

    useEffect(() => {
        // Create an initial pool of all activities from all students
        const allActivities: FeedItem[] = students.flatMap(student => 
            (student.activities || []).map(activity => ({
                ...activity,
                studentName: student.name,
            }))
        );
        allActivities.sort(() => 0.5 - Math.random()); // Shuffle for variety

        let activityIndex = 0;

        // Set up an interval to add a new activity every few seconds
        const interval = setInterval(() => {
            if (allActivities.length > 0) {
                const nextActivity = allActivities[activityIndex % allActivities.length];
                activityIndex++;

                setFeed(prevFeed => [
                    { ...nextActivity, timestamp: 'Just now' },
                    ...prevFeed
                ].slice(0, 20)); // Keep the feed to a reasonable length
            }
        }, 4000); // Add a new activity every 4 seconds

        return () => clearInterval(interval);
    }, [students]);

    return (
        <Card className="h-full flex flex-col">
            <h2 className="text-xl font-semibold text-brand-dark dark:text-brand-light mb-4 flex items-center flex-shrink-0">
                <Activity className="w-6 h-6 mr-3 text-brand-secondary" />
                Live Activity Feed
            </h2>
            <div className="flex-grow overflow-y-auto space-y-4 pr-2">
                {feed.length === 0 && (
                    <div className="text-center text-gray-500 dark:text-gray-400 pt-10">
                        <p>Waiting for student activity...</p>
                    </div>
                )}
                {feed.map((item, index) => {
                    const Icon = activityIcons[item.type] || BookOpen;
                    return (
                        <div key={`${item.id}-${index}`} className="flex items-start animate-fade-in">
                            <Icon className="w-5 h-5 mr-3 mt-1 text-gray-400 flex-shrink-0" />
                            <div>
                                <p className="text-sm text-gray-800 dark:text-gray-200">
                                    <span className="font-bold">{item.studentName}</span> {item.description.toLowerCase()}
                                </p>
                                <p className="text-xs text-gray-500 dark:text-gray-400">{item.timestamp}</p>
                            </div>
                        </div>
                    );
                })}
            </div>
             <style>{`
                @keyframes fade-in {
                    from { opacity: 0; transform: translateY(-10px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                .animate-fade-in {
                    animation: fade-in 0.5s ease-out forwards;
                }
            `}</style>
        </Card>
    );
};

export default LiveActivityFeed;