import type { Citation, QuizQuestion, StudyDocument } from "../types/study";

export interface HealthResponse {
  ok: boolean;
  aiConfigured: boolean;
  mode: "gemini-grounded" | "offline-demo";
}

export interface AskAiResponse {
  insufficientEvidence: boolean;
  answer: string;
  keyPoints: string[];
  simpleExplanation: string;
  citations: Citation[];
  groundedMode: "live-ai";
}

export interface GenerateQuizResponse {
  questions: QuizQuestion[];
  groundedMode: "live-ai";
}

export async function checkAiHealth(): Promise<HealthResponse> {
  try {
    const res = await fetch("/api/health");
    if (!res.ok) {
      return { ok: false, aiConfigured: false, mode: "offline-demo" };
    }
    return (await res.json()) as HealthResponse;
  } catch {
    return { ok: false, aiConfigured: false, mode: "offline-demo" };
  }
}

export async function askSyllabusAi(params: {
  question: string;
  documents: StudyDocument[];
  subjectFilter: string;
}): Promise<AskAiResponse> {
  const payload = {
    question: params.question,
    subjectFilter: params.subjectFilter,
    documents: params.documents.map((doc) => ({
      id: doc.id,
      title: doc.title,
      subject: doc.subject,
      pages: doc.pages,
    })),
  };

  const res = await fetch("/api/ask", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const errBody = await res.json().catch(() => ({}));
    throw new Error(errBody.error || "Failed to query syllabus AI.");
  }

  return (await res.json()) as AskAiResponse;
}

export async function generateSyllabusQuiz(params: {
  subject: string;
  topic: string;
  numQuestions: number;
  documents: StudyDocument[];
}): Promise<GenerateQuizResponse> {
  const payload = {
    subject: params.subject,
    topic: params.topic,
    numQuestions: params.numQuestions,
    documents: params.documents.map((doc) => ({
      id: doc.id,
      title: doc.title,
      subject: doc.subject,
      pages: doc.pages,
    })),
  };

  const res = await fetch("/api/quiz/generate", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const errBody = await res.json().catch(() => ({}));
    throw new Error(errBody.error || "Failed to generate syllabus quiz.");
  }

  return (await res.json()) as GenerateQuizResponse;
}
