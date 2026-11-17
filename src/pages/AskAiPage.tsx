import { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  AlertTriangle,
  BookOpen,
  ExternalLink,
  FileText,
  Lightbulb,
  ListChecks,
  Send,
  Trash2,
} from "lucide-react";
import { useStudy } from "../context/StudyContext";
import { simulateGroundedAnswer } from "../data/sampleData";
import { askSyllabusAi } from "../services/apiClient";
import type { ChatMessage } from "../types/study";

const SUGGESTED_QUESTIONS = [
  "Explain this topic in simple words.",
  "What are the important points in Unit 2?",
  "Summarize this chapter.",
  "Give me an example.",
];

export function AskAiPage() {
  const {
    documents,
    subjects,
    chatHistory,
    appendChatMessage,
    clearChatHistory,
    aiStatus,
    openCitationPreview,
  } = useStudy();
  const location = useLocation();
  const navigate = useNavigate();
  const routeState = (location.state as { prefill?: string; subject?: string } | null) || null;

  const [subjectFilter, setSubjectFilter] = useState<string>(
    routeState?.subject || "all"
  );
  const [questionInput, setQuestionInput] = useState<string>(
    routeState?.prefill || ""
  );
  const [loading, setLoading] = useState(false);
  const [errorBanner, setErrorBanner] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (routeState?.subject) setSubjectFilter(routeState.subject);
    if (routeState?.prefill) setQuestionInput(routeState.prefill);
  }, [routeState?.subject, routeState?.prefill]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatHistory.length, loading]);

  const sendQuestion = async (rawQuestion: string) => {
    const trimmed = rawQuestion.trim();
    if (!trimmed || loading) return;

    setErrorBanner(null);
    setQuestionInput("");

    const userMsg: ChatMessage = {
      id: `msg-user-${Date.now()}`,
      role: "user",
      content: trimmed,
      timestamp: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
      subjectFilter,
    };
    appendChatMessage(userMsg);
    setLoading(true);

    try {
      if (aiStatus === "live") {
        const aiRes = await askSyllabusAi({
          question: trimmed,
          documents,
          subjectFilter,
        });
        appendChatMessage({
          id: `msg-ai-${Date.now()}`,
          role: "assistant",
          content: aiRes.answer,
          timestamp: new Date().toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          }),
          insufficientEvidence: aiRes.insufficientEvidence,
          keyPoints: aiRes.keyPoints,
          simpleExplanation: aiRes.simpleExplanation,
          citations: aiRes.citations,
          mode: "live-ai",
        });
      } else {
        // Explicit offline demo simulation — never disguised as live AI
        await new Promise((r) => setTimeout(r, 350));
        const simRes = simulateGroundedAnswer(
          trimmed,
          documents,
          subjectFilter
        );
        appendChatMessage({
          id: `msg-sim-${Date.now()}`,
          role: "assistant",
          content: simRes.answer,
          timestamp: new Date().toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          }),
          insufficientEvidence: simRes.insufficientEvidence,
          keyPoints: simRes.keyPoints,
          simpleExplanation: simRes.simpleExplanation,
          citations: simRes.citations,
          mode: "demo-simulated",
        });
      }
    } catch (err) {
      setErrorBanner(
        err instanceof Error
          ? err.message
          : "Unable to complete grounded Q&A request."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendQuestion(questionInput);
  };

  const scopedDocCount =
    subjectFilter === "all"
      ? documents.length
      : documents.filter((d) => d.subject === subjectFilter).length;

  return (
    <div className="flex flex-col gap-6">
      {/* Header & Controls */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl sm:text-3xl font-bold tracking-tight text-[#172554]">
            Ask AI
          </h1>
          <p className="mt-1 text-sm text-slate-600">
            Ask questions grounded strictly in your uploaded course documents with
            exact page-number citations.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <select
            value={subjectFilter}
            onChange={(e) => setSubjectFilter(e.target.value)}
            aria-label="Filter AI knowledge scope by subject"
            className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-[#172554] focus:border-[#2563EB] focus:outline-none"
          >
            <option value="all">All Subjects ({documents.length} docs)</option>
            {subjects.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>

          {chatHistory.length > 0 && (
            <button
              type="button"
              onClick={clearChatHistory}
              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-600 hover:bg-slate-50 transition-colors whitespace-nowrap"
            >
              <Trash2 className="h-3.5 w-3.5" />
              Clear Chat
            </button>
          )}
        </div>
      </div>

      {/* Mode Transparency Notice */}
      <div className="rounded-xl border border-slate-200 bg-white px-4 py-3 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-600">
        <div>
          <span className="font-semibold text-[#172554]">
            {aiStatus === "live"
              ? "Syllabus-Grounded Gemini AI"
              : "Demo Simulation Mode (AI Offline)"}
          </span>
          <span aria-hidden="true"> · </span>
          <span>
            Searching {scopedDocCount} document{scopedDocCount === 1 ? "" : "s"}{" "}
            only — unverified claims are blocked.
          </span>
        </div>
        <button
          type="button"
          onClick={() => navigate("/library")}
          className="font-medium text-[#2563EB] hover:underline whitespace-nowrap"
        >
          Manage Sources →
        </button>
      </div>

      {/* Chat Viewport */}
      <div className="rounded-xl border border-slate-200 bg-white flex flex-col min-h-[500px]">
        <div className="flex-1 p-5 sm:p-6 space-y-6 overflow-y-auto max-h-[62vh]">
          {chatHistory.length === 0 ? (
            <div className="py-10 text-center max-w-xl mx-auto space-y-5">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-[#DBEAFE] text-[#2563EB]">
                <BookOpen className="h-6 w-6" />
              </div>
              <div>
                <h2 className="font-display text-lg font-semibold text-[#172554]">
                  Ask anything from your course notes
                </h2>
                <p className="mt-1 text-sm text-slate-500">
                  Every answer includes key takeaways, a simple explanation, and
                  clickable page citations. If your notes lack coverage, AI Study
                  Buddy will tell you honestly.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-left">
                {SUGGESTED_QUESTIONS.map((q) => (
                  <button
                    key={q}
                    type="button"
                    onClick={() => sendQuestion(q)}
                    className="rounded-lg border border-slate-200 bg-[#F8FAFC] px-3.5 py-2.5 text-xs font-medium text-[#172554] hover:border-[#2563EB] hover:bg-[#DBEAFE]/30 transition-colors"
                  >
                    {q}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            chatHistory.map((msg) => (
              <div
                key={msg.id}
                className={`flex ${
                  msg.role === "user" ? "justify-end" : "justify-start"
                }`}
              >
                {msg.role === "user" ? (
                  <div className="max-w-2xl rounded-xl bg-[#172554] px-4 py-3 text-white">
                    <p className="text-sm leading-relaxed">{msg.content}</p>
                    <p className="mt-1.5 text-[11px] text-blue-200/80 tabular-nums">
                      {msg.timestamp}
                      {msg.subjectFilter && msg.subjectFilter !== "all"
                        ? ` · ${msg.subjectFilter}`
                        : ""}
                    </p>
                  </div>
                ) : msg.insufficientEvidence ? (
                  <div className="w-full max-w-3xl rounded-xl border border-amber-200 bg-amber-50/70 p-5 space-y-2">
                    <div className="flex items-center gap-2 text-xs font-semibold text-amber-800">
                      <AlertTriangle className="h-4 w-4 text-[#F59E0B]" />
                      <span>No Verified Source Match</span>
                      <span aria-hidden="true">·</span>
                      <span className="font-normal text-amber-700">
                        {msg.mode === "live-ai"
                          ? "Syllabus AI"
                          : "Demo Simulation"}
                      </span>
                    </div>
                    <p className="text-sm font-medium text-[#0F172A]">
                      {msg.content}
                    </p>
                    {msg.simpleExplanation && (
                      <p className="text-xs text-slate-600">
                        {msg.simpleExplanation}
                      </p>
                    )}
                  </div>
                ) : (
                  <div className="w-full max-w-3xl rounded-xl border border-slate-200 bg-[#F8FAFC] p-5 space-y-4">
                    <div className="flex items-center justify-between text-xs text-slate-500">
                      <span className="font-semibold text-[#172554]">
                        AI Study Buddy ·{" "}
                        {msg.mode === "live-ai"
                          ? "Grounded in Your Notes"
                          : "Demo Simulation"}
                      </span>
                      <span className="tabular-nums">{msg.timestamp}</span>
                    </div>

                    {/* Section 1: Answer */}
                    <div className="space-y-1.5">
                      <h3 className="text-xs font-semibold text-[#2563EB]">
                        Answer
                      </h3>
                      <p className="text-[15px] leading-relaxed text-[#0F172A]">
                        {msg.content}
                      </p>
                    </div>

                    {/* Section 2: Key Points */}
                    {msg.keyPoints && msg.keyPoints.length > 0 && (
                      <div className="space-y-2 pt-3 border-t border-slate-200">
                        <h3 className="flex items-center gap-1.5 text-xs font-semibold text-[#172554]">
                          <ListChecks className="h-3.5 w-3.5 text-[#2563EB]" />
                          Key Points
                        </h3>
                        <ul className="space-y-1.5 text-sm text-slate-700 list-disc pl-5">
                          {msg.keyPoints.map((pt, idx) => (
                            <li key={idx} className="leading-relaxed">
                              {pt}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Section 3: Simple Explanation */}
                    {msg.simpleExplanation && (
                      <div className="rounded-lg bg-[#DBEAFE]/45 px-4 py-3 space-y-1">
                        <h3 className="flex items-center gap-1.5 text-xs font-semibold text-[#172554]">
                          <Lightbulb className="h-3.5 w-3.5 text-[#2563EB]" />
                          Simple Explanation
                        </h3>
                        <p className="text-sm text-slate-800 leading-relaxed">
                          {msg.simpleExplanation}
                        </p>
                      </div>
                    )}

                    {/* Section 4 & 5: Source Documents & Page Citations (Clickable Cards) */}
                    {msg.citations && msg.citations.length > 0 && (
                      <div className="space-y-2 pt-2">
                        <h3 className="text-xs font-semibold text-slate-600">
                          Source Citations (click to inspect page)
                        </h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                          {msg.citations.map((cit, i) => (
                            <button
                              key={`${cit.docId}-${cit.pageNumber}-${i}`}
                              type="button"
                              onClick={() =>
                                openCitationPreview({
                                  docId: cit.docId,
                                  pageNumber: cit.pageNumber,
                                  highlightExcerpt: cit.excerpt,
                                })
                              }
                              className="group rounded-lg border border-slate-200 bg-white p-3 text-left hover:border-[#2563EB] hover:shadow-sm transition-all"
                            >
                              <div className="flex items-center justify-between gap-2">
                                <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#172554] truncate">
                                  <FileText className="h-3.5 w-3.5 text-[#2563EB] shrink-0" />
                                  <span className="truncate">
                                    {cit.docTitle}
                                  </span>
                                </span>
                                <span className="inline-flex items-center gap-1 font-mono text-[11px] font-medium text-[#2563EB] shrink-0 tabular-nums">
                                  p. {cit.pageNumber}
                                  <ExternalLink className="h-3 w-3 opacity-70 group-hover:opacity-100" />
                                </span>
                              </div>
                              <p className="mt-1.5 text-xs text-slate-500 line-clamp-2">
                                “{cit.excerpt}”
                              </p>
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))
          )}

          {loading && (
            <div className="flex justify-start">
              <div className="rounded-xl border border-slate-200 bg-[#F8FAFC] px-4 py-3 text-xs text-slate-600">
                Retrieving relevant pages and verifying citations...
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        {/* Suggested Prompts Strip + Input Form */}
        <div className="border-t border-slate-200 p-4 sm:p-5 bg-[#F8FAFC] rounded-b-xl space-y-3">
          {errorBanner && (
            <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">
              {errorBanner}
            </div>
          )}

          <div className="flex flex-wrap items-center gap-2">
            {SUGGESTED_QUESTIONS.map((q) => (
              <button
                key={q}
                type="button"
                onClick={() => sendQuestion(q)}
                disabled={loading}
                className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-700 hover:border-[#2563EB] hover:text-[#172554] transition-colors whitespace-nowrap"
              >
                {q}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3">
            <textarea
              rows={2}
              value={questionInput}
              onChange={(e) => setQuestionInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  sendQuestion(questionInput);
                }
              }}
              placeholder="Ask a question about your uploaded notes (e.g., How does Scaled Dot-Product Attention prevent vanishing softmax gradients?)..."
              className="flex-1 resize-none rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-[#0F172A] placeholder:text-slate-400 focus:border-[#2563EB] focus:outline-none"
            />
            <button
              type="submit"
              disabled={loading || !questionInput.trim()}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#2563EB] px-5 py-3 text-sm font-medium text-white hover:bg-[#1D4ED8] disabled:opacity-50 transition-colors whitespace-nowrap shrink-0"
            >
              <Send className="h-4 w-4" />
              Send
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
