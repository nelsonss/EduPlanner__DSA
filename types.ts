

export enum StudentStatus {
  Struggling = 'Struggling',
  OnTrack = 'On Track',
  Excelling = 'Excelling',
}

export interface StudentActivity {
  id: string;
  description: string;
  timestamp: string;
  type: 'quiz' | 'lesson' | 'assignment' | 'visualization';
}

export interface AssignmentScore {
  id: string;
  title: string;
  score: number; // as a percentage
}

export enum AssignmentStatus {
  Submitted = 'Submitted',
  Late = 'Late',
  Pending = 'Pending',
}

export interface Assignment {
  id: string;
  title: string;
  dueDate: string;
  status: AssignmentStatus;
}

export interface Student {
  id: number;
  name: string;
  status: StudentStatus;
  progress: number;
  averageScore?: number;
  lastActivity?: string;
  activities?: StudentActivity[];
  scores?: AssignmentScore[];
  alerts?: Alert[];
  assignments?: Assignment[];
}

export enum AlertLevel {
  Critical = 'Critical',
  Important = 'Important',
  Info = 'Info',
}

export interface Alert {
  id: string;
  level: AlertLevel;
  title: string;
  description: string;
  timestamp: string;
  relatedAssignmentTitle?: string;
}

export enum AgentName {
  Evaluator = 'Evaluator',
  Optimizer = 'Optimizer',
  Analyst = 'Analyst',
}

export interface Agent {
  name: AgentName;
  status: 'Idle' | 'Processing' | 'Replying';
  task: string;
}

export interface ChatMessage {
  id: number;
  sender: 'user' | AgentName;
  text: string | React.ReactNode;
  rawText?: string;
  timestamp: string;
  feedback?: 'up' | 'down' | null;
}

export interface LessonPlan {
  id: string;
  title: string;
  learningObjectives: string[];
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  lessonStructure: Array<{
    sectionTitle: string;
    content: string;
    estimatedTime: string; 
  }>;
  examples: Array<{
    exampleTitle: string;
    description: string;
    code?: string;
  }>;
  assessmentQuestions: Array<{
    question: string;
    type: 'Multiple Choice' | 'Short Answer' | 'Coding Problem';
    options?: string[];
    answer: string;
  }>;
  professorNotes?: string;
}

export interface AssetContent {
  questions: Array<{
    id: string;
    text: string;
    type: 'Multiple Choice' | 'Short Answer' | 'Coding';
    options?: string[];
    answer?: string;
  }>;
}

export interface EvaluableAsset {
  id: string;
  title: string;
  type: 'Quiz' | 'Assignment';
  content: AssetContent;
  questionCount: number;
  lastEvaluated?: string;
}