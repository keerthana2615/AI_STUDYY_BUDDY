import { useEffect, useMemo, useState } from "react";
import { useLocation } from "react-router-dom";
import {
  ArrowRight,
  CheckCircle2,
  ClipboardCheck,
  ExternalLink,
  FileText,
  RotateCcw,
  XCircle,
} from "lucide-react";
import { useStudy } from "../context/StudyContext";
import { simulateQuizFromDocs } from "../data/sampleData";
import { generateSyllabusQuiz } from "../services/apiClient";
import type { QuizQuestion } from "../types/study";

export function QuizPracticePage() {
  const {
    documents,
    topics,
    subjects,
    aiStatus,
    recordQuizResult,
    openCitationPreview,
  } = useStudy();
  const location = useLocation();
  const routeState =
    (location.state as { subject?: string; topic?: string } | null) || null;

  const [selectedSubject, setSelectedSubject] = useState<string>(
    routeState?.subject || subjects[0] || "CS301 · Machine Learning"
  );
  const availableTopics = useMemo(() => {
    return topics.filter((t) => t.subject === selectedSubject);
  }, [topics, selectedSubject]);

  const [selectedTopic, setSelectedTopic] = useState<string>(
    routeState?.topic || availableTopics[0]?.name || "all"
  );
  const [numQuestions, setNumQuestions] = useState<number>(5);

  useEffect(() => {
    if (routeState?.subject) {
      setSelectedSubject(routeState.subject);
    }
    if (routeState?.topic) {
      setSelectedTopic(routeState.topic);
    }
  }, [routeState?.subject, routeState?.topic]);

  useEffect(() => {
    if (
      selectedTopic !== "all" &&
      availableTopics.length > 0 &&
      !availableTopics.some((t) => t.name === selectedTopic)
    ) {
      setSelectedTopic(availableTopics[0].name);
    } else if (availableTopics.length === 0) {
      setSelectedTopic("all");
    }
  }, [selectedSubject, availableTopics, selectedTopic]);

  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [quizMode, setQuizMode] = useState<"live-ai" | "demo-simulated">(
    "live-ai"
  );
  const [generating, setGenerating] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Active quiz state
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [correctCount, setCorrectCount] = useState(0);
  const [finished, setFinished] = useState(false);

  const startQuiz = async () => {
    if (documents.length === 0) {
      setErrorMsg(
        "Please upload at least one course document in My Library before generating a quiz."
      );
      return;
    }

    setErrorMsg(null);
    setGenerating(true);
    setFinished(false);
    setCurrentIndex(0);
    setSelectedOption(null);
    setSubmitted(false);
    setCorrectCount(0);

    const topicLabel =
      selectedTopic === "all" ? `${selectedSubject} Overview` : selectedTopic;

    try {
      if (aiStatus === "live") {
        const res = await generateSyllabusQuiz({
          subject: selectedSubject,
          topic: topicLabel,
          numQuestions,
          documents,
        });
        setQuestions(res.questions);
        setQuizMode("live-ai");
      } else {
        await new Promise((r) => setTimeout(r, 350));
        const sim = simulateQuizFromDocs(
          selectedSubject,
          selectedTopic,
          numQuestions,
          documents
        );
        setQuestions(sim);
        setQuizMode("demo-simulated");
      }
    } catch (err) {
      setErrorMsg(
        err instanceof Error
          ? err.message
          : "Could not generate quiz from your notes."
      );
    } finally {
      setGenerating(false);
    }
  };

  const handleSubmitAnswer = () => {
    if (selectedOption === null || submitted) return;
    const currentQ = questions[currentIndex];
    const isRight = selectedOption === currentQ.correctIndex;
    const updatedCorrect = isRight ? correctCount + 1 : correctCount;
    setCorrectCount(updatedCorrect);
    setSubmitted(true);

    // If this was the final question, keep track; recording happens when user clicks Finish
  };

  const handleNextQuestion = () => {
    if (currentIndex + 1 < questions.length) {
      setCurrentIndex((i) => i + 1);
      setSelectedOption(null);
      setSubmitted(false);
    } else {
      const pct = Math.round((correctCount / questions.length) * 100);
      recordQuizResult({
        subject: selectedSubject,
        topic:
          selectedTopic === "all"
            ? questions[0]?.topic || "General"
            : selectedTopic,
        score: correctCount,
        total: questions.length,
        percentage: pct,
        mode: quizMode,
      });
      setFinished(true);
    }
  };

  const handleRetryQuiz = () => {
    setCurrentIndex(0);
    setSelectedOption(null);
    setSubmitted(false);
    setCorrectCount(0);
    setFinished(false);
  };

  const currentQuestion = questions[currentIndex];
  const scorePct =
    questions.length > 0
      ? Math.round((correctCount / questions.length) * 100)
      : 0;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-2xl sm:text-3xl font-bold tracking-tight text-[#172554]">
          Quiz Practice
        </h1>
        <p className="mt-1 text-sm text-slate-600">
          Generate topic-tagged MCQ quizzes directly from your uploaded lecture
          notes and automatically update your mastery score.
        </p>
      </div>

      {/* Quiz Builder Controls */}
      <section className="rounded-xl border border-slate-200 bg-white p-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
          <div>
            <label
              htmlFor="quiz-subject"
              className="block text-xs font-medium text-slate-600 mb-1.5"
            >
              Subject
            </label>
            <select
              id="quiz-subject"
              value={selectedSubject}
              onChange={(e) => setSelectedSubject(e.target.value)}
              className="w-full rounded-lg border border-slate-200 bg-[#F8FAFC] px-3 py-2.5 text-sm text-[#0F172A] focus:border-[#2563EB] focus:bg-white focus:outline-none"
            >
              {subjects.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label
              htmlFor="quiz-topic"
              className="block text-xs font-medium text-slate-600 mb-1.5"
            >
              Syllabus Topic
            </label>
            <select
              id="quiz-topic"
              value={selectedTopic}
              onChange={(e) => setSelectedTopic(e.target.value)}
              className="w-full rounded-lg border border-slate-200 bg-[#F8FAFC] px-3 py-2.5 text-sm text-[#0F172A] focus:border-[#2563EB] focus:bg-white focus:outline-none"
            >
              {availableTopics.map((t) => (
                <option key={t.id} value={t.name}>
                  {t.name}
                </option>
              ))}
              <option value="all">All Topics in Subject</option>
            </select>
          </div>

          <div>
            <label
              htmlFor="quiz-count"
              className="block text-xs font-medium text-slate-600 mb-1.5"
            >
              Number of Questions
            </label>
            <select
              id="quiz-count"
              value={numQuestions}
              onChange={(e) => setNumQuestions(Number(e.target.value))}
              className="w-full rounded-lg border border-slate-200 bg-[#F8FAFC] px-3 py-2.5 text-sm font-mono text-[#0F172A] focus:border-[#2563EB] focus:bg-white focus:outline-none"
            >
              <option value={3}>3 Questions</option>
              <option value={5}>5 Questions</option>
              <option value={8}>8 Questions</option>
            </select>
          </div>

          <div>
            <button
              type="button"
              onClick={startQuiz}
              disabled={generating}
              className="w-full inline-flex items-center justify-center gap-2 rounded-lg bg-[#2563EB] px-4 py-2.5 text-sm font-medium text-white hover:bg-[#1D4ED8] disabled:opacity-60 transition-colors whitespace-nowrap"
            >
              <ClipboardCheck className="h-4 w-4" />
              {generating ? "Generating Quiz..." : "Generate Quiz"}
            </button>
          </div>
        </div>

        <p className="mt-3 text-xs text-slate-500">
          {aiStatus === "live"
            ? "Live Syllabus AI active · Questions and source passages will be derived from your active notes."
            : "Demo Simulation Mode (AI Offline) · Questions are drawn from clearly labelled sample quiz banks."}
        </p>

        {errorMsg && (
          <p className="mt-3 text-xs font-medium text-red-600">{errorMsg}</p>
        )}
      </section>

      {/* Active Quiz Card or Results Card */}
      {questions.length === 0 && !generating ? (
        <div className="rounded-xl border border-slate-200 bg-white p-10 text-center max-w-2xl mx-auto">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-[#DBEAFE] text-[#2563EB]">
            <ClipboardCheck className="h-6 w-6" />
          </div>
          <h2 className="mt-4 font-display text-lg font-semibold text-[#172554]">
            Ready to test your understanding
          </h2>
          <p className="mt-1.5 text-sm text-slate-500">
            Choose a subject and syllabus topic above, then click{" "}
            <strong className="font-medium text-[#172554]">Generate Quiz</strong>{" "}
            to start an adaptive MCQ session.
          </p>
        </div>
      ) : finished ? (
        <section className="rounded-xl border border-slate-200 bg-white p-8 max-w-2xl mx-auto text-center space-y-5">
          <div>
            <p className="text-xs font-medium text-slate-500">
              {selectedSubject} ·{" "}
              {quizMode === "live-ai"
                ? "Syllabus AI Quiz"
                : "Demo Simulated Quiz"}
            </p>
            <h2 className="mt-2 font-display text-2xl font-bold text-[#172554]">
              Quiz Completed
            </h2>
          </div>

          <div className="py-4">
            <p className="font-display text-5xl font-bold text-[#2563EB] tabular-nums">
              {scorePct}%
            </p>
            <p className="mt-2 text-sm text-slate-600 tabular-nums">
              You answered {correctCount} out of {questions.length} questions
              correctly.
            </p>
          </div>

          <p className="text-xs text-slate-500">
            Your score has been recorded and your topic mastery has been updated
            across My Progress and Study Planner.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <button
              type="button"
              onClick={handleRetryQuiz}
              className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-[#172554] hover:bg-slate-50 transition-colors whitespace-nowrap"
            >
              <RotateCcw className="h-4 w-4" />
              Retry Quiz
            </button>
            <button
              type="button"
              onClick={startQuiz}
              className="inline-flex items-center gap-2 rounded-lg bg-[#2563EB] px-4 py-2.5 text-sm font-medium text-white hover:bg-[#1D4ED8] transition-colors whitespace-nowrap"
            >
              Generate Fresh Questions
            </button>
          </div>
        </section>
      ) : currentQuestion ? (
        <section className="rounded-xl border border-slate-200 bg-white p-6 sm:p-8 max-w-3xl mx-auto space-y-6">
          {/* Question Header Metadata */}
          <div className="flex flex-wrap items-center justify-between gap-2 pb-4 border-b border-slate-100">
            <div className="text-xs text-slate-500">
              <span className="font-semibold text-[#2563EB]">
                Topic: {currentQuestion.topic}
              </span>
              <span aria-hidden="true"> · </span>
              <span>{currentQuestion.subject}</span>
            </div>
            <div className="font-mono text-xs font-medium text-slate-600 tabular-nums">
              Question {currentIndex + 1} of {questions.length}
            </div>
          </div>

          {/* Progress Bar */}
          <div className="h-1.5 w-full rounded-full bg-slate-100 overflow-hidden">
            <div
              className="h-full rounded-full bg-[#2563EB] transition-all"
              style={{
                width: `${((currentIndex + 1) / questions.length) * 100}%`,
              }}
            />
          </div>

          {/* Question Prompt */}
          <h2 className="font-display text-lg sm:text-xl font-semibold text-[#172554] leading-snug">
            {currentQuestion.question}
          </h2>

          {/* Four Options */}
          <div className="space-y-2.5">
            {currentQuestion.options.map((opt, idx) => {
              const isSelected = selectedOption === idx;
              const isCorrectOption = idx === currentQuestion.correctIndex;

              let borderClass =
                "border-slate-200 bg-white hover:border-[#2563EB]/60";
              if (submitted) {
                if (isCorrectOption) {
                  borderClass = "border-[#16A34A] bg-green-50/70";
                } else if (isSelected && !isCorrectOption) {
                  borderClass = "border-red-500 bg-red-50/70";
                } else {
                  borderClass = "border-slate-200 bg-slate-50/60 opacity-75";
                }
              } else if (isSelected) {
                borderClass = "border-[#2563EB] bg-[#DBEAFE]/35";
              }

              return (
                <button
                  key={idx}
                  type="button"
                  disabled={submitted}
                  onClick={() => setSelectedOption(idx)}
                  className={`w-full flex items-start gap-3.5 rounded-xl border p-4 text-left transition-colors ${borderClass}`}
                >
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md border border-slate-300 bg-white font-mono text-xs font-semibold text-[#172554]">
                    {String.fromCharCode(65 + idx)}
                  </span>
                  <span className="flex-1 text-sm text-[#0F172A] leading-relaxed">
                    {opt}
                  </span>
                  {submitted && isCorrectOption && (
                    <CheckCircle2 className="h-5 w-5 text-[#16A34A] shrink-0" />
                  )}
                  {submitted && isSelected && !isCorrectOption && (
                    <XCircle className="h-5 w-5 text-red-600 shrink-0" />
                  )}
                </button>
              );
            })}
          </div>

          {/* Feedback, Explanation, and Source Passage */}
          {submitted && (
            <div className="rounded-xl border border-slate-200 bg-[#F8FAFC] p-5 space-y-3">
              <div className="flex items-center gap-2 text-sm font-semibold">
                {selectedOption === currentQuestion.correctIndex ? (
                  <>
                    <CheckCircle2 className="h-4 w-4 text-[#16A34A]" />
                    <span className="text-[#16A34A]">
                      Correct Answer
                    </span>
                  </>
                ) : (
                  <>
                    <XCircle className="h-4 w-4 text-red-600" />
                    <span className="text-red-700">
                      Incorrect — Correct option is{" "}
                      {String.fromCharCode(65 + currentQuestion.correctIndex)}
                    </span>
                  </>
                )}
              </div>

              <p className="text-sm text-slate-700 leading-relaxed">
                {currentQuestion.explanation}
              </p>

              <button
                type="button"
                onClick={() =>
                  openCitationPreview({
                    docId: currentQuestion.sourceDocId,
                    pageNumber: currentQuestion.sourcePage,
                    highlightExcerpt: currentQuestion.sourcePassage,
                  })
                }
                className="w-full rounded-lg border border-slate-200 bg-white p-3.5 text-left hover:border-[#2563EB] transition-colors"
              >
                <div className="flex items-center justify-between gap-2 text-xs font-semibold text-[#172554]">
                  <span className="inline-flex items-center gap-1.5 truncate">
                    <FileText className="h-3.5 w-3.5 text-[#2563EB] shrink-0" />
                    Source Passage · {currentQuestion.sourceDocTitle}
                  </span>
                  <span className="inline-flex items-center gap-1 font-mono text-[#2563EB] shrink-0 tabular-nums">
                    p. {currentQuestion.sourcePage}
                    <ExternalLink className="h-3 w-3" />
                  </span>
                </div>
                <p className="mt-1.5 text-xs text-slate-600 leading-relaxed">
                  “{currentQuestion.sourcePassage}”
                </p>
              </button>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-2">
            {!submitted ? (
              <button
                type="button"
                disabled={selectedOption === null}
                onClick={handleSubmitAnswer}
                className="inline-flex items-center gap-2 rounded-lg bg-[#2563EB] px-5 py-2.5 text-sm font-medium text-white hover:bg-[#1D4ED8] disabled:opacity-50 transition-colors whitespace-nowrap"
              >
                Submit Answer
              </button>
            ) : (
              <button
                type="button"
                onClick={handleNextQuestion}
                className="inline-flex items-center gap-2 rounded-lg bg-[#172554] px-5 py-2.5 text-sm font-medium text-white hover:bg-[#1E3A8A] transition-colors whitespace-nowrap"
              >
                {currentIndex + 1 < questions.length
                  ? "Next Question"
                  : "View Final Score"}
                <ArrowRight className="h-4 w-4" />
              </button>
            )}
          </div>
        </section>
      ) : null}
    </div>
  );
}
