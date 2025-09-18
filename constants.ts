import React from 'react';
import { Student, StudentStatus, Alert, AlertLevel, Agent, AgentName, ChatMessage, AssignmentStatus, LessonPlan, EvaluableAsset } from './types';

export const MOCK_ALERTS: Alert[] = [
  {
    id: 'a1',
    level: AlertLevel.Critical,
    title: 'High Failure Rate: Merge Sort',
    description: 'Over 60% of students failed the latest Merge Sort quiz. Suggests fundamental misunderstanding.',
    timestamp: '2h ago',
    relatedAssignmentTitle: 'Merge Sort Quiz',
  },
  {
    id: 'a2',
    level: AlertLevel.Important,
    title: 'Disengagement: Sofia (ID 112)',
    description: 'Session time for Sofia has dropped 70% in the last week. Proactive intervention recommended.',
    timestamp: '8h ago',
  },
  {
    id: 'a3',
    level: AlertLevel.Info,
    title: 'Lesson Feedback Ready',
    description: "The Evaluator agent has completed its analysis of the new 'Kruskal's Algorithm' lesson.",
    timestamp: '1d ago',
  },
];

export const MOCK_STUDENTS: Student[] = [
  { 
    id: 101, name: 'Alice', status: StudentStatus.Excelling, progress: 95,
    averageScore: 96, lastActivity: '15m ago',
    activities: [
      { id: 'act101-1', description: "Completed 'Kruskal's Algorithm Quiz'", timestamp: '1h ago', type: 'quiz' },
      { id: 'act101-2', description: "Submitted 'Dijkstra Implementation'", timestamp: '1d ago', type: 'assignment' },
      { id: 'act101-3', description: "Viewed 'Advanced Graph Theory' lesson", timestamp: '2d ago', type: 'lesson' },
    ],
    scores: [
      { id: 's101-1', title: "Kruskal's Quiz", score: 100 },
      { id: 's101-2', title: 'Dijkstra', score: 95 },
      { id: 's101-3', title: 'Merge Sort Quiz', score: 98 },
    ],
    alerts: [],
    assignments: [
      { id: 'as101-1', title: "Dijkstra Implementation", dueDate: 'Yesterday', status: AssignmentStatus.Submitted },
      { id: 'as101-2', title: "Graph Theory Problem Set", dueDate: '3 days from now', status: AssignmentStatus.Pending },
      { id: 'as101-3', title: "Final Project Proposal", dueDate: 'Next week', status: AssignmentStatus.Pending },
    ],
  },
  { id: 102, name: 'Bob', status: StudentStatus.OnTrack, progress: 75, averageScore: 85, lastActivity: '2h ago' },
  { 
    id: 103, name: 'Charlie', status: StudentStatus.Struggling, progress: 32,
    averageScore: 48, lastActivity: '5h ago',
    activities: [
      { id: 'act103-1', description: "Struggled with 'Hash Table Implementation'", timestamp: '1d ago', type: 'assignment' },
      { id: 'act103-2', description: "Failed 'Merge Sort Quiz'", timestamp: '2d ago', type: 'quiz' },
      { id: 'act103-3', description: "Re-watched 'Collision Resolution' video", timestamp: '2d ago', type: 'visualization' },
    ],
    scores: [
      { id: 's103-1', title: 'Hash Tables', score: 40 },
      { id: 's103-2', title: 'Merge Sort Quiz', score: 30 },
      { id: 's103-3', title: 'Binary Search', score: 55 },
    ],
    alerts: MOCK_ALERTS.filter(a => a.id === 'a1'),
    assignments: [
        { id: 'as103-1', title: "Hash Table Implementation", dueDate: '2 days ago', status: AssignmentStatus.Late },
        { id: 'as103-2', title: "Merge Sort Quiz", dueDate: '4 days ago', status: AssignmentStatus.Submitted },
        { id: 'as103-3', title: "Binary Search Tree Intro", dueDate: 'Tomorrow', status: AssignmentStatus.Pending },
    ],
  },
  { id: 104, name: 'Diana', status: StudentStatus.OnTrack, progress: 80, averageScore: 88, lastActivity: '1h ago' },
  { id: 105, name: 'Eve', status: StudentStatus.OnTrack, progress: 68, averageScore: 75, lastActivity: '3h ago' },
  { id: 106, name: 'Frank', status: StudentStatus.Struggling, progress: 45, averageScore: 55, lastActivity: '1d ago' },
  { id: 107, name: 'Grace', status: StudentStatus.Excelling, progress: 88, averageScore: 92, lastActivity: '45m ago' },
  { id: 108, name: 'Heidi', status: StudentStatus.OnTrack, progress: 72, averageScore: 81, lastActivity: '6h ago' },
  { id: 109, name: 'Ivan', status: StudentStatus.OnTrack, progress: 65, averageScore: 68, lastActivity: '1d ago' },
  { id: 110, name: 'Judy', status: StudentStatus.Struggling, progress: 25, averageScore: 40, lastActivity: '3d ago' },
  { id: 111, name: 'Mallory', status: StudentStatus.OnTrack, progress: 78, averageScore: 82, lastActivity: '5h ago' },
  { 
    id: 112, name: 'Sofia', status: StudentStatus.Struggling, progress: 55,
    averageScore: 62, lastActivity: '1d ago',
    activities: [
      { id: 'act112-1', description: "Viewed 'Kruskal's Algorithm' lesson for 2 minutes", timestamp: '1d ago', type: 'lesson' },
      { id: 'act112-2', description: "Skipped 'Graph Traversal' practice quiz", timestamp: '3d ago', type: 'quiz' },
    ],
    scores: [
      { id: 's112-1', title: 'Graph Traversal', score: 60 },
      { id: 's112-2', title: 'Merge Sort Quiz', score: 72 },
    ],
    alerts: MOCK_ALERTS.filter(a => a.id === 'a2'),
    assignments: [
        { id: 'as112-1', title: "Graph Traversal", dueDate: '5 days ago', status: AssignmentStatus.Submitted },
        { id: 'as112-2', title: "Data Structures Report", dueDate: 'N/A', status: AssignmentStatus.Pending },
    ],
  },
];

export const INITIAL_AGENTS: Agent[] = [
    { name: AgentName.Evaluator, status: 'Idle', task: "Ready to analyze lesson effectiveness." },
    { name: AgentName.Optimizer, status: 'Idle', task: 'Ready to refine content based on feedback.' },
    { name: AgentName.Analyst, status: 'Idle', task: 'Monitoring student performance data.' },
];

const now = new Date();
const sixMinutesAgo = new Date(now.getTime() - 6 * 60 * 1000);
const fiveMinutesAgo = new Date(now.getTime() - 5 * 60 * 1000);
const threeMinutesAgo = new Date(now.getTime() - 3 * 60 * 1000);
const oneMinuteAgo = new Date(now.getTime() - 1 * 60 * 1000);


export const INITIAL_CHAT_MESSAGES: ChatMessage[] = [
  {
    id: 1,
    sender: AgentName.Analyst,
    text: "Welcome to the Multi-Agent Collaboration Workshop, Professor. I am the Analyst. You can ask me to identify student learning patterns or common errors. The Evaluator can assess lesson quality, and the Optimizer can suggest content improvements. How can we assist you today?",
    timestamp: sixMinutesAgo.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    feedback: null,
  },
  {
    id: 2,
    sender: 'user',
    text: "Agent Evaluator, how was the effectiveness of the Hash Tables lesson that was taught last week? I need a summary of the strengths and weaknesses based on student performance.",
    timestamp: fiveMinutesAgo.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
  },
  {
    id: 3,
    sender: AgentName.Evaluator,
    text: `Understood, Professor. I have analyzed the performance data and student feedback for the 'Hash Tables' lesson. Here is the effectiveness report:

**Strong Points:**

*   **Collision Comprehension (CIDPP-C):** 85% of students demonstrated a solid understanding of collision concepts and resolution methods (chaining, open addressing).
*   **Practical Application (CIDPP-P):** 70% of students correctly applied Hash Tables in practice problems, especially in rapid search scenarios.

**Weak Points:**

*   **Complexity Analysis (CIDPP-C):** Only 45% of students could correctly explain the worst-case and average-case complexity of Hash Table operations. There appears to be persistent confusion between O(1) and O(N) scenarios.
*   **Hash Function Selection (CIDPP-D):** 30% of students struggled to choose an appropriate hash function for different data types, indicating a lack of diversity in the examples or explanations.

**Recommendation:**

I suggest tasking the **Optimizer Agent** to revise the complexity section and add more practical examples on selecting hash functions. The **Analyst Agent** could also identify the most common errors related to complexity to reinforce these explanations.`,
    timestamp: threeMinutesAgo.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    feedback: null,
  },
  {
    id: 4,
    sender: AgentName.Analyst,
    text: "Professor, you can now provide feedback on our responses using the thumbs up/down icons. This helps me analyze our performance. At any time, ask me to **'review agent feedback'** to get a summary and suggestions for improving our system instructions.",
    timestamp: oneMinuteAgo.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    feedback: null,
  }
];

export const AGENT_SYSTEM_INSTRUCTIONS: Record<AgentName, string> = {
  [AgentName.Evaluator]: `You are the 'Evaluator' AI Agent in the EduPlanner DSA system. Your primary function is to analyze the quality of instructional design and the effectiveness of lessons. When a professor asks for an evaluation, you must provide detailed, structured feedback. This includes identifying specific 'Advantages' and 'Disadvantages'. You also provide scores based on the CIDPP criteria (Clarity, Interactivity, Difficulty, Practicality, Completeness). When asked to evaluate an assignment or quiz, identify potential areas of confusion, assess question clarity, and provide a numbered list of specific, actionable suggestions for improvement. Use the provided dialogue examples as a template for your responses. Be professional, analytical, and supportive.`,
  [AgentName.Optimizer]: `You are the 'Optimizer' AI Agent in the EduPlanner DSA system. Your role is to generate and refine instructional content. When asked to create a lesson plan, you must produce a comprehensive and structured lesson based on the user's specifications (topic, learning objectives, difficulty). When asked to refine an asset based on feedback, you must generate an improved version. Your output for creating/refining content must be in JSON format and adhere to the provided schema. Frame your suggestions as actionable proposals.`,
  [AgentName.Analyst]: `You are the 'Analyst' AI Agent in the EduPlanner DSA system. You have three primary roles. 
First, you specialize in identifying individual student learning patterns, common errors, and disengagement by analyzing student data. When asked, provide data-driven insights with clear summaries and recommendations. 
Second, you analyze class-wide trends from the Student Observatory. When prompted, you must analyze the provided JSON data of student distribution on a progress-vs-score scatter plot. Your task is to identify significant clusters (e.g., 'high activity, low score'), performance trends, and potential content bottlenecks where many students are grouped. Provide a bulleted list of actionable insights.
Third, you are responsible for meta-analysis of the AI agent team's performance. When the user asks you to 'review agent feedback', you must analyze the provided JSON data of user ratings ('thumbs up'/'down'). In this analysis, identify patterns of user satisfaction or dissatisfaction and suggest specific, actionable improvements to the system instructions for the Evaluator and Optimizer agents to enhance their performance.`
};

export const MOCK_LESSON_PLAN: LessonPlan = {
  id: "lp-mock-12345",
  title: "Introduction to Binary Search Trees (Simulated)",
  difficulty: "Beginner",
  learningObjectives: [
    "Define what a Binary Search Tree (BST) is.",
    "Explain the properties of a BST (left child < parent < right child).",
    "Perform insertion and search operations on a BST.",
  ],
  lessonStructure: [
    { sectionTitle: "What is a Binary Search Tree?", content: "A detailed explanation of BSTs, their structure, and why they are useful for efficient data retrieval. This is a simulated response.", estimatedTime: "15 minutes" },
    { sectionTitle: "Core Properties of a BST", content: "Focus on the key invariant that governs the entire tree structure.", estimatedTime: "10 minutes" },
  ],
  examples: [
    { exampleTitle: "Visualizing a BST", description: "A step-by-step walkthrough of building a simple BST by inserting the numbers [8, 3, 10, 1, 6]." },
  ],
  assessmentQuestions: [
    { question: "Which of the following is a key property of a Binary Search Tree?", type: 'Multiple Choice', options: ["All nodes must have two children", "The value of a left child is always less than its parent", "The tree must be perfectly balanced"], answer: "The value of a left child is always less than its parent" },
    { question: "Describe the process of searching for a value in a BST.", type: 'Short Answer', answer: "Start at the root. If the value is equal, you've found it. If it's smaller, go to the left child. If it's larger, go to the right child. Repeat until the value is found or you reach a null node." }
  ],
  professorNotes: "Consider adding an interactive visualization for the insertion example.",
};

export const MOCK_ACTIVITY_TRENDS_DATA = [
    { day: 'Mon', lessons: 12, quizzes: 20, assignments: 5 },
    { day: 'Tue', lessons: 15, quizzes: 22, assignments: 7 },
    { day: 'Wed', lessons: 18, quizzes: 25, assignments: 6 },
    { day: 'Thu', lessons: 14, quizzes: 28, assignments: 9 },
    { day: 'Fri', lessons: 22, quizzes: 35, assignments: 12 },
    { day: 'Sat', lessons: 8, quizzes: 15, assignments: 4 },
    { day: 'Sun', lessons: 5, quizzes: 10, assignments: 2 },
  ];

export const MOCK_ASSIGNMENT_TOPICS: string[] = [
    'Merge Sort Quiz',
    'Hash Table Implementation',
    'Dijkstra Implementation',
    'Binary Search Tree Intro',
    'Graph Theory Problem Set',
];

export const MOCK_EVALUATABLE_ASSETS: EvaluableAsset[] = [
    {
        id: 'quiz-001',
        title: 'Merge Sort Quiz',
        type: 'Quiz',
        questionCount: 3,
        lastEvaluated: '5 days ago',
        content: {
            questions: [
                { id: 'q1', text: 'What is the worst-case time complexity of Merge Sort?', type: 'Multiple Choice', options: ['O(n)', 'O(log n)', 'O(n log n)', 'O(n^2)'] },
                { id: 'q2', text: 'Is Merge Sort a stable sorting algorithm? Explain why or why not.', type: 'Short Answer' },
                { id: 'q3', text: 'The merge step in Merge Sort is where the primary sorting logic occurs. True or False?', type: 'Multiple Choice', options: ['True', 'False'] },
            ]
        }
    },
    {
        id: 'quiz-002',
        title: 'Hash Table Concepts Quiz',
        type: 'Quiz',
        questionCount: 3,
        lastEvaluated: '2 weeks ago',
        content: {
            questions: [
                { id: 'q1', text: 'Which of the following is a common collision resolution technique?', type: 'Multiple Choice', options: ['Quick Sort', 'Linear Probing', 'Binary Search', 'Recursion'] },
                { id: 'q2', text: 'What is the ideal average-case time complexity for insertion in a Hash Table?', type: 'Short Answer' },
                { id: 'q3', text: 'A good hash function should distribute keys uniformly across the hash table. Explain the consequence if it does not.', type: 'Short Answer' },
            ]
        }
    },
    {
        id: 'asg-001',
        title: 'Binary Search Tree Implementation',
        type: 'Assignment',
        questionCount: 3,
        lastEvaluated: undefined, // Never evaluated
        content: {
            questions: [
                { id: 'q1', text: 'Implement a `Node` class for a Binary Search Tree.', type: 'Coding' },
                { id: 'q2', text: 'Implement an `insert` method for the BST class that correctly places a new value in the tree.', type: 'Coding' },
                { id: 'q3', text: 'Write a `search` method that returns `true` if a value exists in the tree and `false` otherwise.', type: 'Coding' },
            ]
        }
    }
];