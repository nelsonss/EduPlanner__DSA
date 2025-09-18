import React, { useState } from 'react';
import { Student, StudentStatus, AlertLevel, AssignmentStatus, AgentName } from '../../types';
import { X, TrendingUp, BarChart2, CheckCircle, Clock, BookOpen, Code, FileText, AlertTriangle, Bell, Info, Calendar, Bot, Loader2, Lightbulb } from 'lucide-react';
import RemedialWorkModal from './RemedialWorkModal';
import { getAgentResponse } from '../../services/geminiService';
import Markdown from 'react-markdown';

interface StudentDetailModalProps {
  student: Student;
  onClose: () => void;
}

// Configuration objects for dynamic styling based on data enums.
// This approach keeps styling logic separate from the component structure.
const statusConfig: Record<StudentStatus, { bg: string; text: string; border: string; }> = {
  [StudentStatus.Excelling]: { bg: 'bg-green-100', text: 'text-green-800', border: 'border-green-400' },
  [StudentStatus.OnTrack]: { bg: 'bg-yellow-100', text: 'text-yellow-800', border: 'border-yellow-400' },
  [StudentStatus.Struggling]: { bg: 'bg-red-100', text: 'text-red-800', border: 'border-red-400' },
};

const activityIcons: Record<string, React.ElementType> = {
  quiz: CheckCircle,
  lesson: BookOpen,
  assignment: FileText,
  visualization: Code,
};

const alertConfig: Record<AlertLevel, { icon: React.ElementType, color: string }> = {
    [AlertLevel.Critical]: { icon: AlertTriangle, color: 'text-brand-danger' },
    [AlertLevel.Important]: { icon: Bell, color: 'text-orange-500' },
    [AlertLevel.Info]: { icon: Info, color: 'text-brand-primary' },
};

const assignmentStatusConfig: Record<AssignmentStatus, { bg: string; text: string; }> = {
  [AssignmentStatus.Submitted]: { bg: 'bg-green-100', text: 'text-green-800' },
  [AssignmentStatus.Late]: { bg: 'bg-red-100', text: 'text-red-800' },
  [AssignmentStatus.Pending]: { bg: 'bg-yellow-100', text: 'text-yellow-800' },
};

// A reusable component for displaying a key metric in the overview section.
const OverviewMetric: React.FC<{ icon: React.ElementType, label: string, value: string | number | undefined, color: string }> = ({ icon: Icon, label, value, color }) => (
    <div className="flex items-center p-3 bg-brand-light-accent dark:bg-brand-dark-accent rounded-lg">
        <Icon className={`w-6 h-6 mr-3 ${color}`} />
        <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">{label}</p>
            <p className="text-lg font-bold text-brand-dark dark:text-brand-light">{value || 'N/A'}</p>
        </div>
    </div>
);


const StudentDetailModal: React.FC<StudentDetailModalProps> = ({ student, onClose }) => {
  const studentStatus = statusConfig[student.status];
  const [isRemedialModalOpen, setIsRemedialModalOpen] = useState(false);
  
  // State management for the AI Performance Feedback feature.
  // Tracks loading, success (feedback string), and error states independently.
  const [isFeedbackLoading, setIsFeedbackLoading] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [feedbackError, setFeedbackError] = useState<string | null>(null);

  // State management for the AI Common Misconceptions Analysis feature.
  const [isMisconceptionsLoading, setIsMisconceptionsLoading] = useState(false);
  const [misconceptions, setMisconceptions] = useState<string | null>(null);
  const [misconceptionsError, setMisconceptionsError] = useState<string | null>(null);

  // Pre-process assignment data for easier rendering.
  const upcomingAssignments = student.assignments?.filter(a => a.status === AssignmentStatus.Pending) || [];
  const pastAssignments = student.assignments?.filter(a => a.status !== AssignmentStatus.Pending) || [];

  /**
   * Handles the asynchronous request to generate AI feedback for the student.
   * This function manages the entire lifecycle: setting loading state, constructing
   * a detailed prompt, calling the AI service, and handling the response or error.
   */
  const handleGenerateFeedback = async () => {
    // 1. Set loading state and clear previous results.
    setIsFeedbackLoading(true);
    setFeedback(null);
    setFeedbackError(null);

    // 2. Aggregate and format the student's data into a comprehensive summary.
    // This provides the AI with rich context for its analysis.
    const scoresSummary = student.scores?.map(s => `- ${s.title}: ${s.score}%`).join('\n') || 'No scores available.';
    const activitiesSummary = student.activities?.map(a => `- "${a.description}" (${a.timestamp})`).join('\n') || 'No recent activities recorded.';
    const alertsSummary = student.alerts?.map(a => `- [${a.level}] ${a.title}: ${a.description}`).join('\n') || 'No active alerts.';

    // 3. Construct the prompt with clear instructions and the formatted data.
    const prompt = `As the Analyst agent, analyze the student's performance data (progress, scores, activities, alerts) for the selected student. Provide a concise, constructive feedback summary to the professor with 'Key Observations' and 'Recommendations', highlighting strengths and suggesting areas for improvement.

--- STUDENT DATA ---
Student Name: ${student.name}
Overall Status: ${student.status}
Course Progress: ${student.progress}%
Average Score: ${student.averageScore || 'N/A'}%
Last Activity: ${student.lastActivity || 'N/A'}

Assignment Scores:
${scoresSummary}

Recent Activities:
${activitiesSummary}

Active Alerts:
${alertsSummary}
--- END OF DATA ---

Begin your analysis.`;

    try {
        // 4. Call the AI service with the prompt and the appropriate agent.
        const result = await getAgentResponse(prompt, AgentName.Analyst);
        setFeedback(result); // On success, store the AI's response.
    } catch (err) {
        // 5. On failure, store the error message.
        setFeedbackError(err instanceof Error ? err.message : 'An unknown error occurred.');
    } finally {
        // 6. Reset the loading state regardless of outcome.
        setIsFeedbackLoading(false);
    }
  };

  /**
   * Handles the asynchronous request to analyze the student's common misconceptions.
   * Similar flow to handleGenerateFeedback, but with a different prompt tailored to error analysis.
   */
  const handleAnalyzeMisconceptions = async () => {
    setIsMisconceptionsLoading(true);
    setMisconceptions(null);
    setMisconceptionsError(null);

    // This prompt focuses on performance data that is most indicative of misconceptions (scores, submission status).
    const scoresSummary = student.scores?.map(s => `- ${s.title}: ${s.score}%`).join('\n') || 'No scores available.';
    const pastAssignmentsSummary = pastAssignments.map(a => `- ${a.title} (Status: ${a.status})`).join('\n') || 'No past assignments.';
    
    const prompt = `As the Analyst agent, your task is to identify common errors and misconceptions for student '${student.name}'. Analyze their assignment scores and past assignment statuses. For topics where they scored poorly or submitted late, infer potential misunderstandings. Provide a concise, bulleted list of these misconceptions, with brief examples if possible.

--- STUDENT PERFORMANCE DATA ---
Student Name: ${student.name}

Assignment Scores:
${scoresSummary}

Past Assignments:
${pastAssignmentsSummary}
--- END OF DATA ---

Begin your analysis of common misconceptions.`;

    try {
        const result = await getAgentResponse(prompt, AgentName.Analyst);
        setMisconceptions(result);
    } catch (err) {
        setMisconceptionsError(err instanceof Error ? err.message : 'An unknown error occurred.');
    } finally {
        setIsMisconceptionsLoading(false);
    }
  };

  // A sub-component for rendering a single assignment item, keeping the main return block cleaner.
  const AssignmentItem: React.FC<{ assignment: typeof upcomingAssignments[0] }> = ({ assignment }) => {
      const config = assignmentStatusConfig[assignment.status];
      return (
          <div className="flex items-center justify-between text-sm p-2 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
              <div>
                  <p className="font-medium text-gray-800 dark:text-gray-100">{assignment.title}</p>
                  <div className="flex items-center text-xs text-gray-500 dark:text-gray-400 mt-1">
                      <Calendar className="w-3 h-3 mr-1.5 flex-shrink-0"/>
                      <span>Due: {assignment.dueDate || 'N/A'}</span>
                  </div>
              </div>
              <span className={`px-2 py-1 text-xs font-semibold rounded-full ${config.bg} ${config.text} flex-shrink-0`}>
                  {assignment.status}
              </span>
          </div>
      );
  };

  return (
    <>
        <div 
            className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center p-4"
            onClick={onClose}
            role="dialog"
            aria-modal="true"
            aria-labelledby="student-detail-title"
        >
        <div 
            className="bg-brand-light dark:bg-brand-dark rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col animate-fade-in-up"
            onClick={(e) => e.stopPropagation()} // Prevents clicks inside the modal from closing it.
        >
            {/* Header */}
            <header className="flex items-center justify-between p-4 border-b border-brand-light-accent dark:border-gray-800">
            <div className="flex items-center">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center mr-4 ${studentStatus.bg}`}>
                <span className={`text-2xl font-bold ${studentStatus.text}`}>
                    {student.name.charAt(0)}
                </span>
                </div>
                <div>
                    <h2 id="student-detail-title" className="text-2xl font-bold text-brand-dark dark:text-brand-light">{student.name}</h2>
                    <span className={`px-3 py-1 text-sm font-semibold rounded-full ${studentStatus.bg} ${studentStatus.text}`}>
                        {student.status}
                    </span>
                </div>
            </div>
            <button onClick={onClose} className="p-2 rounded-full text-gray-500 hover:bg-gray-200 hover:text-gray-800 dark:text-gray-400 dark:hover:bg-gray-700 transition-colors">
                <X className="w-6 h-6" />
                <span className="sr-only">Close modal</span>
            </button>
            </header>

            {/* Scrollable Body */}
            <div className="p-6 overflow-y-auto space-y-6">
                {/* Overview Section */}
                <section>
                    <h3 className="text-lg font-semibold text-brand-dark dark:text-brand-light mb-3">Performance Overview</h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <OverviewMetric icon={TrendingUp} label="Overall Progress" value={`${student.progress}%`} color="text-blue-500" />
                        <OverviewMetric icon={BarChart2} label="Average Score" value={student.averageScore ? `${student.averageScore}%` : 'N/A'} color="text-green-500" />
                        <OverviewMetric icon={Clock} label="Last Activity" value={student.lastActivity} color="text-purple-500" />
                        <OverviewMetric icon={Bell} label="Active Alerts" value={student.alerts?.length || 0} color="text-red-500" />
                    </div>
                </section>
                
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Left Column: Recent Activity */}
                    <section>
                        <h3 className="text-lg font-semibold text-brand-dark dark:text-brand-light mb-3">Recent Activity</h3>
                        <div className="space-y-3 bg-white dark:bg-brand-dark-accent p-4 rounded-lg shadow-inner max-h-80 overflow-y-auto">
                            {student.activities && student.activities.length > 0 ? (
                                student.activities.map(activity => {
                                    const Icon = activityIcons[activity.type] || BookOpen;
                                    return (
                                    <div key={activity.id} className="flex items-start text-sm">
                                        <Icon className="w-5 h-5 mr-3 mt-0.5 text-gray-400 flex-shrink-0" />
                                        <div>
                                            <p className="text-gray-800 dark:text-gray-200">{activity.description}</p>
                                            <p className="text-xs text-gray-500 dark:text-gray-400">{activity.timestamp}</p>
                                        </div>
                                    </div>
                                )})
                            ) : (
                                <p className="text-gray-500 dark:text-gray-400 text-center py-4">No recent activity data available.</p>
                            )}
                        </div>
                    </section>

                    {/* Right Column: Various Data Sections */}
                    <div className="space-y-6">
                        <section>
                            <h3 className="text-lg font-semibold text-brand-dark dark:text-brand-light mb-3">Assignment Status</h3>
                            <div className="space-y-3 bg-white dark:bg-brand-dark-accent p-4 rounded-lg shadow-inner max-h-80 overflow-y-auto">
                                {student.assignments && student.assignments.length > 0 ? (
                                    <>
                                        {/* Render upcoming and past assignments in separate, labeled sections */}
                                        {upcomingAssignments.length > 0 && (
                                            <div>
                                                <h4 className="text-sm font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2 px-2">Upcoming</h4>
                                                {upcomingAssignments.map(assignment => <AssignmentItem key={assignment.id} assignment={assignment} />)}
                                            </div>
                                        )}
                                        {pastAssignments.length > 0 && (
                                            <div className={upcomingAssignments.length > 0 ? 'mt-4 pt-4 border-t border-gray-200 dark:border-gray-600' : ''}>
                                                <h4 className="text-sm font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2 px-2">Past</h4>
                                                {pastAssignments.map(assignment => <AssignmentItem key={assignment.id} assignment={assignment} />)}
                                            </div>
                                        )}
                                    </>
                                ) : (
                                    <p className="text-gray-500 dark:text-gray-400 text-center py-4">No assignment data available.</p>
                                )}
                            </div>
                        </section>

                        <section>
                            <h3 className="text-lg font-semibold text-brand-dark dark:text-brand-light mb-3">Assignment Scores</h3>
                            <div className="space-y-2 bg-white dark:bg-brand-dark-accent p-4 rounded-lg shadow-inner">
                                {student.scores && student.scores.length > 0 ? (
                                    student.scores.map(item => (
                                        <div key={item.id} className="text-sm">
                                            <div className="flex justify-between mb-1">
                                                <span className="font-medium text-gray-700 dark:text-gray-300">{item.title}</span>
                                                <span className="font-bold text-brand-primary">{item.score}%</span>
                                            </div>
                                            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
                                                <div className="bg-brand-primary h-2.5 rounded-full" style={{ width: `${item.score}%` }}></div>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <p className="text-gray-500 dark:text-gray-400 text-center py-4">No score data available.</p>
                                )}
                            </div>
                        </section>
                        
                        {/* Common Misconceptions AI Feature */}
                        <section>
                            <h3 className="text-lg font-semibold text-brand-dark dark:text-brand-light mb-3">Common Misconceptions Analysis</h3>
                            <div className="p-4 bg-white dark:bg-brand-dark-accent rounded-lg shadow-inner min-h-[150px] flex flex-col justify-center">
                                {/* Conditional rendering based on the async state */}
                                {isMisconceptionsLoading && (
                                    <div className="flex items-center justify-center text-gray-600 dark:text-gray-400">
                                        <Loader2 className="w-6 h-6 mr-3 animate-spin text-brand-primary" />
                                        <span>Analyst is identifying error patterns...</span>
                                    </div>
                                )}
                                {misconceptionsError && (
                                    <div className="flex items-center text-red-700">
                                        <AlertTriangle className="w-6 h-6 mr-3 flex-shrink-0" />
                                        <div>
                                            <p className="font-semibold">Analysis Failed</p>
                                            <p className="text-sm">{misconceptionsError}</p>
                                        </div>
                                    </div>
                                )}
                                {misconceptions && (
                                    <div className="prose prose-sm max-w-none dark:prose-invert">
                                        <Markdown>{misconceptions}</Markdown>
                                    </div>
                                )}
                                {/* Initial state: Show the "generate" button */}
                                {!isMisconceptionsLoading && !misconceptions && !misconceptionsError && (
                                    <div className="text-center">
                                        <p className="text-gray-500 dark:text-gray-400 mb-3">Identify recurring errors based on performance.</p>
                                        <button 
                                            onClick={handleAnalyzeMisconceptions}
                                            className="flex items-center justify-center mx-auto px-4 py-2 bg-brand-dark-accent text-white font-semibold rounded-lg hover:bg-gray-800 dark:bg-gray-600 dark:hover:bg-gray-500 transition-colors"
                                        >
                                            <Lightbulb className="w-5 h-5 mr-2" />
                                            Analyze Misconceptions
                                        </button>
                                    </div>
                                )}
                            </div>
                        </section>

                        {/* AI Performance Feedback Feature */}
                        <section>
                            <h3 className="text-lg font-semibold text-brand-dark dark:text-brand-light mb-3">AI Performance Feedback</h3>
                             <div className="p-4 bg-white dark:bg-brand-dark-accent rounded-lg shadow-inner min-h-[150px] flex flex-col justify-center">
                                {isFeedbackLoading && (
                                    <div className="flex items-center justify-center text-gray-600 dark:text-gray-400">
                                        <Loader2 className="w-6 h-6 mr-3 animate-spin text-brand-primary" />
                                        <span>Analyst is preparing feedback...</span>
                                    </div>
                                )}
                                {feedbackError && (
                                     <div className="flex items-center text-red-700">
                                        <AlertTriangle className="w-6 h-6 mr-3 flex-shrink-0" />
                                        <div>
                                            <p className="font-semibold">Feedback Failed</p>
                                            <p className="text-sm">{feedbackError}</p>
                                        </div>
                                    </div>
                                )}
                                {feedback && (
                                    <div className="prose prose-sm max-w-none dark:prose-invert">
                                        <Markdown>{feedback}</Markdown>
                                    </div>
                                )}
                                {!isFeedbackLoading && !feedback && !feedbackError && (
                                    <div className="text-center">
                                        <p className="text-gray-500 dark:text-gray-400 mb-3">Get a high-level summary of this student's performance.</p>
                                        <button 
                                            onClick={handleGenerateFeedback}
                                            className="flex items-center justify-center mx-auto px-4 py-2 bg-brand-dark-accent text-white font-semibold rounded-lg hover:bg-gray-800 dark:bg-gray-600 dark:hover:bg-gray-500 transition-colors"
                                        >
                                            <Bot className="w-5 h-5 mr-2" />
                                            Generate Feedback
                                        </button>
                                    </div>
                                )}
                             </div>
                        </section>
                        
                        {/* Active Alerts Section */}
                        {student.alerts && student.alerts.length > 0 && (
                            <section>
                                <h3 className="text-lg font-semibold text-brand-dark dark:text-brand-light mb-3">Active Alerts</h3>
                                <div className="space-y-3">
                                    {student.alerts.map(alert => {
                                        const config = alertConfig[alert.level];
                                        // Find the related score to provide more context for the alert.
                                        const relatedScore = alert.relatedAssignmentTitle
                                            ? student.scores?.find(s => s.title === alert.relatedAssignmentTitle)
                                            : undefined;

                                        return (
                                            <div key={alert.id} className="flex items-start p-3 bg-white dark:bg-brand-dark-accent rounded-lg shadow-inner">
                                                <config.icon className={`w-5 h-5 mr-3 mt-0.5 flex-shrink-0 ${config.color}`} />
                                                <div className="flex-1">
                                                    <p className="font-semibold text-sm text-brand-dark dark:text-gray-100">{alert.title}</p>
                                                    <p className="text-xs text-gray-600 dark:text-gray-300">{alert.description}</p>
                                                    {/* Display the contextual score if available */}
                                                    {relatedScore && (
                                                        <div className="mt-2 pt-2 border-t border-gray-200 dark:border-gray-600">
                                                            <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Context</p>
                                                            <div className="flex justify-between items-center mt-1 text-sm">
                                                                <div className="flex items-center">
                                                                    <FileText className="w-4 h-4 mr-2 text-gray-500 flex-shrink-0" />
                                                                    <span className="font-medium text-gray-800 dark:text-gray-200">{relatedScore.title}</span>
                                                                </div>
                                                                <span className={`font-bold ${relatedScore.score < 50 ? 'text-brand-danger' : 'text-orange-500'}`}>{relatedScore.score}%</span>
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </section>
                        )}
                    </div>
                </div>
            </div>

            {/* Footer with Actions */}
            <footer className="p-4 bg-brand-light-accent dark:bg-gray-900 rounded-b-xl mt-auto">
                <div className="flex justify-end space-x-3">
                    <button 
                        onClick={() => setIsRemedialModalOpen(true)}
                        className="px-4 py-2 text-sm font-semibold text-gray-700 bg-white border rounded-lg hover:bg-gray-100 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200 dark:hover:bg-gray-600">
                        Assign Remedial Work
                    </button>
                    <button className="px-4 py-2 text-sm font-semibold text-white bg-brand-primary rounded-lg hover:bg-blue-600">
                        Message Student
                    </button>
                </div>
            </footer>
        </div>
        {/* CSS for the modal fade-in animation */}
        <style>{`
                @keyframes fade-in-up {
                    0% {
                        opacity: 0;
                        transform: translateY(20px);
                    }
                    100% {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }
                .animate-fade-in-up {
                    animation: fade-in-up 0.3s ease-out forwards;
                }
            `}</style>
        </div>

        {/* The RemedialWorkModal is rendered conditionally when its state is true */}
        {isRemedialModalOpen && (
            <RemedialWorkModal 
                student={student} 
                onClose={() => setIsRemedialModalOpen(false)} 
            />
        )}
    </>
  );
};

export default StudentDetailModal;
