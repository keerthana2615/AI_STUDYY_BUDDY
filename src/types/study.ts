export type DataOrigin = "sample" | "user";

export interface DocumentPage {
  pageNumber: number;
  text: string;
}

export interface StudyDocument {
  id: string;
  title: string;
  fileName: string;
  subject: string;
  uploadDate: string;
  pageCount: number;
  status: "Processed" | "Processing" | "Failed";
  fileSizeLabel: string;
  origin: DataOrigin;
  pages: DocumentPage[];
}

export interface SyllabusTopic {
  id: string;
  name: string;
  subject: string;
  unit: string;
  examWeight: number; // 0.1 to 1.0
  sampleMastery: number; // 0 to 100 (baseline sample figure)
  origin: DataOrigin;
}

export interface Citation {
  docId: string;
  docTitle: string;
  pageNumber: number;
  excerpt: string;
}

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: string;
  subjectFilter?: string;
  insufficientEvidence?: boolean;
  keyPoints?: string[];
  simpleExplanation?: string;
  citations?: Citation[];
  mode?: "live-ai" | "demo-simulated";
}

export interface QuizQuestion {
  id: string;
  subject: string;
  topic: string;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
  sourceDocId: string;
  sourceDocTitle: string;
  sourcePage: number;
  sourcePassage: string;
}

export interface QuizResult {
  id: string;
  subject: string;
  topic: string;
  score: number;
  total: number;
  percentage: number;
  completedAt: string;
  origin: DataOrigin;
  mode: "live-ai" | "demo-simulated";
}

export interface StudyGoal {
  id: string;
  title: string;
  subject: string;
  estimatedMinutes: number;
  completed: boolean;
  origin: DataOrigin;
}

export interface StudyPlanTask {
  id: string;
  dayLabel: string; // e.g., "Mon", "Tue"
  dateLabel: string;
  topicId: string;
  topicName: string;
  subject: string;
  focusType: "Concept Review" | "Practice Quiz" | "Active Recall";
  durationHours: number;
  priorityScore: number;
  completed: boolean;
}

export interface ExamConfig {
  examDate: string; // YYYY-MM-DD
  hoursPerDay: number;
}

export interface StudentProfile {
  name: string;
  email: string;
  program: string;
  semester: string;
  preferredSubjects: string[];
  dailyReminderTime: string;
  groundedStrictMode: boolean;
  localOnlyStorage: boolean;
}

export interface CitationPreviewTarget {
  docId: string;
  pageNumber: number;
  highlightExcerpt?: string;
}
