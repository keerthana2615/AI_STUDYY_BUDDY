import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  DEFAULT_PROFILE,
  DEFAULT_SUBJECTS,
  SAMPLE_DOCUMENTS,
  SAMPLE_QUIZ_RESULTS,
  SAMPLE_STUDY_GOALS,
  SAMPLE_TOPICS,
} from "../data/sampleData";
import { checkAiHealth } from "../services/apiClient";
import type {
  ChatMessage,
  CitationPreviewTarget,
  ExamConfig,
  QuizResult,
  StudentProfile,
  StudyDocument,
  StudyGoal,
  StudyPlanTask,
  SyllabusTopic,
} from "../types/study";
import { extractDocumentPages, formatFileSize } from "../utils/pdfExtractor";
import {
  computeTopicMetrics,
  generateWeeklyStudyPlan,
  type ComputedTopicMetric,
} from "../utils/studyMath";

const STORAGE_KEY = "ai_study_buddy_state_v1";

function getDefaultExamDate(): string {
  const d = new Date();
  d.setDate(d.getDate() + 14);
  return d.toISOString().split("T")[0];
}

interface PersistedState {
  includeSampleData: boolean;
  userDocuments: StudyDocument[];
  userTopics: SyllabusTopic[];
  chatHistory: ChatMessage[];
  userQuizResults: QuizResult[];
  studyGoals: StudyGoal[];
  examConfig: ExamConfig;
  studyPlanTasks: StudyPlanTask[];
  profile: StudentProfile;
  weeklyStudyHours: number;
}

interface StudyContextValue {
  includeSampleData: boolean;
  setIncludeSampleData: (val: boolean) => void;
  aiStatus: "checking" | "live" | "offline";
  documents: StudyDocument[];
  topics: SyllabusTopic[];
  subjects: string[];
  topicMetrics: ComputedTopicMetric[];
  chatHistory: ChatMessage[];
  quizResults: QuizResult[];
  studyGoals: StudyGoal[];
  examConfig: ExamConfig;
  studyPlanTasks: StudyPlanTask[];
  profile: StudentProfile;
  weeklyStudyHours: number;
  citationPreview: CitationPreviewTarget | null;
  openCitationPreview: (target: CitationPreviewTarget) => void;
  closeCitationPreview: () => void;
  uploadDocument: (file: File, subject: string) => Promise<StudyDocument>;
  deleteDocument: (id: string) => void;
  clearUserDocuments: () => void;
  addTopic: (name: string, subject: string, unit: string, examWeight: number) => void;
  addBulkTopics: (rawLines: string, subject: string) => number;
  deleteTopic: (id: string) => void;
  appendChatMessage: (msg: ChatMessage) => void;
  clearChatHistory: () => void;
  recordQuizResult: (result: Omit<QuizResult, "id" | "completedAt" | "origin">) => void;
  toggleStudyGoal: (id: string) => void;
  addStudyGoal: (title: string, subject: string, estimatedMinutes: number) => void;
  deleteStudyGoal: (id: string) => void;
  updateExamConfig: (config: Partial<ExamConfig>) => void;
  togglePlanTask: (id: string) => void;
  regenerateStudyPlan: () => void;
  updateProfile: (updates: Partial<StudentProfile>) => void;
  resetDemoState: () => void;
}

const StudyContext = createContext<StudyContextValue | null>(null);

function loadInitialState(): PersistedState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as Partial<PersistedState>;
      return {
        includeSampleData: parsed.includeSampleData ?? true,
        userDocuments: Array.isArray(parsed.userDocuments)
          ? parsed.userDocuments
          : [],
        userTopics: Array.isArray(parsed.userTopics) ? parsed.userTopics : [],
        chatHistory: Array.isArray(parsed.chatHistory) ? parsed.chatHistory : [],
        userQuizResults: Array.isArray(parsed.userQuizResults)
          ? parsed.userQuizResults
          : [],
        studyGoals: Array.isArray(parsed.studyGoals)
          ? parsed.studyGoals
          : SAMPLE_STUDY_GOALS,
        examConfig: parsed.examConfig ?? {
          examDate: getDefaultExamDate(),
          hoursPerDay: 3,
        },
        studyPlanTasks: Array.isArray(parsed.studyPlanTasks)
          ? parsed.studyPlanTasks
          : [],
        profile: { ...DEFAULT_PROFILE, ...(parsed.profile ?? {}) },
        weeklyStudyHours: parsed.weeklyStudyHours ?? 14.5,
      };
    }
  } catch {
    // Ignore storage read errors
  }
  return {
    includeSampleData: true,
    userDocuments: [],
    userTopics: [],
    chatHistory: [],
    userQuizResults: [],
    studyGoals: SAMPLE_STUDY_GOALS,
    examConfig: {
      examDate: getDefaultExamDate(),
      hoursPerDay: 3,
    },
    studyPlanTasks: [],
    profile: DEFAULT_PROFILE,
    weeklyStudyHours: 14.5,
  };
}

export function StudyProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<PersistedState>(() => loadInitialState());
  const [aiStatus, setAiStatus] = useState<"checking" | "live" | "offline">(
    "checking"
  );
  const [deletedSampleDocIds, setDeletedSampleDocIds] = useState<string[]>([]);
  const [deletedSampleTopicIds, setDeletedSampleTopicIds] = useState<string[]>([]);
  const [citationPreview, setCitationPreview] =
    useState<CitationPreviewTarget | null>(null);

  useEffect(() => {
    let active = true;
    checkAiHealth().then((res) => {
      if (!active) return;
      setAiStatus(res.aiConfigured ? "live" : "offline");
    });
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (!state.profile.localOnlyStorage) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      // Ignore quota errors
    }
  }, [state]);

  const documents = useMemo(() => {
    const sample = state.includeSampleData
      ? SAMPLE_DOCUMENTS.filter((d) => !deletedSampleDocIds.includes(d.id))
      : [];
    return [...state.userDocuments, ...sample];
  }, [state.includeSampleData, state.userDocuments, deletedSampleDocIds]);

  const topics = useMemo(() => {
    const sample = state.includeSampleData
      ? SAMPLE_TOPICS.filter((t) => !deletedSampleTopicIds.includes(t.id))
      : [];
    return [...state.userTopics, ...sample];
  }, [state.includeSampleData, state.userTopics, deletedSampleTopicIds]);

  const quizResults = useMemo(() => {
    const sample = state.includeSampleData ? SAMPLE_QUIZ_RESULTS : [];
    return [...state.userQuizResults, ...sample];
  }, [state.includeSampleData, state.userQuizResults]);

  const studyGoals = useMemo(() => {
    return state.includeSampleData
      ? state.studyGoals
      : state.studyGoals.filter((g) => g.origin === "user");
  }, [state.includeSampleData, state.studyGoals]);

  const subjects = useMemo(() => {
    const set = new Set<string>(DEFAULT_SUBJECTS);
    documents.forEach((d) => set.add(d.subject));
    topics.forEach((t) => set.add(t.subject));
    return Array.from(set);
  }, [documents, topics]);

  const topicMetrics = useMemo(() => {
    return computeTopicMetrics(
      topics,
      quizResults,
      state.examConfig,
      state.includeSampleData
    );
  }, [topics, quizResults, state.examConfig, state.includeSampleData]);

  // Initialize study plan tasks once if empty
  useEffect(() => {
    if (state.studyPlanTasks.length === 0 && topicMetrics.length > 0) {
      const initialPlan = generateWeeklyStudyPlan(
        topicMetrics,
        state.examConfig.hoursPerDay
      );
      setState((prev) => ({ ...prev, studyPlanTasks: initialPlan }));
    }
  }, [state.studyPlanTasks.length, topicMetrics, state.examConfig.hoursPerDay]);

  const setIncludeSampleData = useCallback((val: boolean) => {
    setState((prev) => ({ ...prev, includeSampleData: val }));
  }, []);

  const uploadDocument = useCallback(
    async (file: File, subject: string): Promise<StudyDocument> => {
      const extracted = await extractDocumentPages(file);
      const cleanTitle = file.name.replace(/\.[^/.]+$/, "").replace(/[_-]+/g, " ");
      const newDoc: StudyDocument = {
        id: `user-doc-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        title: cleanTitle || file.name,
        fileName: file.name,
        subject: subject.trim() || "General Course Notes",
        uploadDate: new Date().toISOString().split("T")[0],
        pageCount: extracted.pageCount,
        status: "Processed",
        fileSizeLabel: formatFileSize(file.size),
        origin: "user",
        pages: extracted.pages,
      };
      setState((prev) => ({
        ...prev,
        userDocuments: [newDoc, ...prev.userDocuments],
      }));
      return newDoc;
    },
    []
  );

  const deleteDocument = useCallback((id: string) => {
    if (id.startsWith("sample-")) {
      setDeletedSampleDocIds((prev) => [...prev, id]);
    } else {
      setState((prev) => ({
        ...prev,
        userDocuments: prev.userDocuments.filter((d) => d.id !== id),
      }));
    }
  }, []);

  const clearUserDocuments = useCallback(() => {
    setState((prev) => ({ ...prev, userDocuments: [] }));
  }, []);

  const addTopic = useCallback(
    (name: string, subject: string, unit: string, examWeight: number) => {
      const newTopic: SyllabusTopic = {
        id: `user-topic-${Date.now()}`,
        name: name.trim(),
        subject: subject.trim(),
        unit: unit.trim() || "Unit 1",
        examWeight: Math.max(0.2, Math.min(1, examWeight)),
        sampleMastery: 0,
        origin: "user",
      };
      setState((prev) => ({
        ...prev,
        userTopics: [newTopic, ...prev.userTopics],
      }));
    },
    []
  );

  const addBulkTopics = useCallback((rawLines: string, subject: string) => {
    const lines = rawLines
      .split(/\n|,/)
      .map((l) => l.trim())
      .filter((l) => l.length > 1);
    if (lines.length === 0) return 0;

    const added: SyllabusTopic[] = lines.map((line, idx) => ({
      id: `user-topic-${Date.now()}-${idx}`,
      name: line,
      subject,
      unit: `Unit ${idx + 1}`,
      examWeight: 0.85,
      sampleMastery: 0,
      origin: "user",
    }));

    setState((prev) => ({
      ...prev,
      userTopics: [...added, ...prev.userTopics],
    }));
    return added.length;
  }, []);

  const deleteTopic = useCallback((id: string) => {
    if (id.startsWith("topic-")) {
      setDeletedSampleTopicIds((prev) => [...prev, id]);
    } else {
      setState((prev) => ({
        ...prev,
        userTopics: prev.userTopics.filter((t) => t.id !== id),
      }));
    }
  }, []);

  const appendChatMessage = useCallback((msg: ChatMessage) => {
    setState((prev) => ({
      ...prev,
      chatHistory: [...prev.chatHistory, msg],
    }));
  }, []);

  const clearChatHistory = useCallback(() => {
    setState((prev) => ({ ...prev, chatHistory: [] }));
  }, []);

  const recordQuizResult = useCallback(
    (result: Omit<QuizResult, "id" | "completedAt" | "origin">) => {
      const entry: QuizResult = {
        ...result,
        id: `user-quiz-${Date.now()}`,
        completedAt: new Date().toISOString().split("T")[0],
        origin: "user",
      };
      setState((prev) => ({
        ...prev,
        userQuizResults: [entry, ...prev.userQuizResults],
        weeklyStudyHours: Number((prev.weeklyStudyHours + 0.3).toFixed(1)),
      }));
    },
    []
  );

  const toggleStudyGoal = useCallback((id: string) => {
    setState((prev) => ({
      ...prev,
      studyGoals: prev.studyGoals.map((g) =>
        g.id === id ? { ...g, completed: !g.completed } : g
      ),
    }));
  }, []);

  const addStudyGoal = useCallback(
    (title: string, subject: string, estimatedMinutes: number) => {
      const goal: StudyGoal = {
        id: `user-goal-${Date.now()}`,
        title: title.trim(),
        subject,
        estimatedMinutes,
        completed: false,
        origin: "user",
      };
      setState((prev) => ({
        ...prev,
        studyGoals: [goal, ...prev.studyGoals],
      }));
    },
    []
  );

  const deleteStudyGoal = useCallback((id: string) => {
    setState((prev) => ({
      ...prev,
      studyGoals: prev.studyGoals.filter((g) => g.id !== id),
    }));
  }, []);

  const updateExamConfig = useCallback((config: Partial<ExamConfig>) => {
    setState((prev) => ({
      ...prev,
      examConfig: { ...prev.examConfig, ...config },
    }));
  }, []);

  const togglePlanTask = useCallback((id: string) => {
    setState((prev) => ({
      ...prev,
      studyPlanTasks: prev.studyPlanTasks.map((t) =>
        t.id === id ? { ...t, completed: !t.completed } : t
      ),
    }));
  }, []);

  const regenerateStudyPlan = useCallback(() => {
    setState((prev) => {
      const freshMetrics = computeTopicMetrics(
        topics,
        quizResults,
        prev.examConfig,
        prev.includeSampleData
      );
      const nextPlan = generateWeeklyStudyPlan(
        freshMetrics,
        prev.examConfig.hoursPerDay
      );
      return { ...prev, studyPlanTasks: nextPlan };
    });
  }, [topics, quizResults]);

  const updateProfile = useCallback((updates: Partial<StudentProfile>) => {
    setState((prev) => ({
      ...prev,
      profile: { ...prev.profile, ...updates },
    }));
  }, []);

  const resetDemoState = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY);
    setDeletedSampleDocIds([]);
    setDeletedSampleTopicIds([]);
    setState({
      includeSampleData: true,
      userDocuments: [],
      userTopics: [],
      chatHistory: [],
      userQuizResults: [],
      studyGoals: SAMPLE_STUDY_GOALS,
      examConfig: {
        examDate: getDefaultExamDate(),
        hoursPerDay: 3,
      },
      studyPlanTasks: [],
      profile: DEFAULT_PROFILE,
      weeklyStudyHours: 14.5,
    });
  }, []);

  const openCitationPreview = useCallback((target: CitationPreviewTarget) => {
    setCitationPreview(target);
  }, []);

  const closeCitationPreview = useCallback(() => {
    setCitationPreview(null);
  }, []);

  const value: StudyContextValue = {
    includeSampleData: state.includeSampleData,
    setIncludeSampleData,
    aiStatus,
    documents,
    topics,
    subjects,
    topicMetrics,
    chatHistory: state.chatHistory,
    quizResults,
    studyGoals,
    examConfig: state.examConfig,
    studyPlanTasks: state.studyPlanTasks,
    profile: state.profile,
    weeklyStudyHours: state.weeklyStudyHours,
    citationPreview,
    openCitationPreview,
    closeCitationPreview,
    uploadDocument,
    deleteDocument,
    clearUserDocuments,
    addTopic,
    addBulkTopics,
    deleteTopic,
    appendChatMessage,
    clearChatHistory,
    recordQuizResult,
    toggleStudyGoal,
    addStudyGoal,
    deleteStudyGoal,
    updateExamConfig,
    togglePlanTask,
    regenerateStudyPlan,
    updateProfile,
    resetDemoState,
  };

  return (
    <StudyContext.Provider value={value}>{children}</StudyContext.Provider>
  );
}

export function useStudy() {
  const ctx = useContext(StudyContext);
  if (!ctx) {
    throw new Error("useStudy must be used within StudyProvider");
  }
  return ctx;
}
