import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowRight,
  BookOpen,
  Check,
  ClipboardCheck,
  MessageSquareText,
  Plus,
  Trash2,
} from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { useStudy } from "../context/StudyContext";

export function DashboardPage() {
  const {
    documents,
    topicMetrics,
    chatHistory,
    quizResults,
    weeklyStudyHours,
    studyGoals,
    toggleStudyGoal,
    addStudyGoal,
    deleteStudyGoal,
    subjects,
    includeSampleData,
    openCitationPreview,
  } = useStudy();
  const navigate = useNavigate();

  const [newGoalTitle, setNewGoalTitle] = useState("");
  const [newGoalSubject, setNewGoalSubject] = useState(
    subjects[0] || "CS301 · Machine Learning"
  );

  const userDocCount = documents.filter((d) => d.origin === "user").length;
  const userQuestionsAsked = chatHistory.filter((m) => m.role === "user").length;
  const completedQuizzes = quizResults.length;
  const userQuizzesCount = quizResults.filter((q) => q.origin === "user").length;

  const overallMastery = useMemo(() => {
    if (topicMetrics.length === 0) return 0;
    const sum = topicMetrics.reduce((acc, m) => acc + m.mastery, 0);
    return Math.round(sum / topicMetrics.length);
  }, [topicMetrics]);

  const sortedByMastery = useMemo(() => {
    return [...topicMetrics].sort((a, b) => b.mastery - a.mastery);
  }, [topicMetrics]);

  const strongestTopic = sortedByMastery[0];
  const weakestTopic = sortedByMastery[sortedByMastery.length - 1];

  const chartData = useMemo(() => {
    return topicMetrics.slice(0, 8).map((m) => ({
      name:
        m.topic.name.length > 20
          ? m.topic.name.slice(0, 18) + "…"
          : m.topic.name,
      fullName: m.topic.name,
      mastery: m.mastery,
      subject: m.topic.subject,
    }));
  }, [topicMetrics]);

  const recentSubjects = useMemo(() => {
    const map = new Map<
      string,
      { subject: string; docCount: number; avgMastery: number; latestDocId?: string }
    >();

    subjects.forEach((subj) => {
      const subjDocs = documents.filter((d) => d.subject === subj);
      const subjMetrics = topicMetrics.filter((m) => m.topic.subject === subj);
      const avg =
        subjMetrics.length > 0
          ? Math.round(
              subjMetrics.reduce((a, b) => a + b.mastery, 0) / subjMetrics.length
            )
          : 0;
      if (subjDocs.length > 0 || subjMetrics.length > 0) {
        map.set(subj, {
          subject: subj,
          docCount: subjDocs.length,
          avgMastery: avg,
          latestDocId: subjDocs[0]?.id,
        });
      }
    });

    return Array.from(map.values()).slice(0, 4);
  }, [subjects, documents, topicMetrics]);

  const handleAddGoal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGoalTitle.trim()) return;
    addStudyGoal(newGoalTitle, newGoalSubject, 30);
    setNewGoalTitle("");
  };

  return (
    <div className="space-y-8">
      {/* Header Greeting */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl sm:text-3xl font-bold tracking-tight text-[#172554] text-balance">
            Ready to learn something new today?
          </h1>
          <p className="mt-1.5 text-sm text-slate-600">
            {includeSampleData
              ? "Showing your progress alongside the CS/AIML Sample Course Pack. Upload your own PDFs in My Library anytime."
              : "Viewing your personal uploaded materials and recorded study results."}
          </p>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <button
            type="button"
            onClick={() => navigate("/library")}
            className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-[#172554] hover:bg-slate-50 transition-colors whitespace-nowrap shrink-0"
          >
            <BookOpen className="h-4 w-4 text-[#2563EB]" />
            Upload Notes
          </button>
          <button
            type="button"
            onClick={() => navigate("/ask")}
            className="inline-flex items-center gap-2 rounded-lg bg-[#2563EB] px-4 py-2 text-sm font-medium text-white hover:bg-[#1D4ED8] transition-colors whitespace-nowrap shrink-0"
          >
            <MessageSquareText className="h-4 w-4" />
            Ask Study AI
          </button>
        </div>
      </div>

      {/* Key Metrics Grid */}
      <section
        aria-label="Study overview metrics"
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
      >
        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <p className="text-xs font-medium text-slate-500">
            Total Uploaded Documents
          </p>
          <p className="mt-2 font-display text-3xl font-bold text-[#172554] tabular-nums">
            {documents.length}
          </p>
          <p className="mt-1.5 text-xs text-slate-500 tabular-nums">
            {userDocCount} your uploads · {documents.length - userDocCount} sample
          </p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <p className="text-xs font-medium text-slate-500">Questions Asked</p>
          <p className="mt-2 font-display text-3xl font-bold text-[#172554] tabular-nums">
            {userQuestionsAsked}
          </p>
          <p className="mt-1.5 text-xs text-slate-500">
            Syllabus-grounded Q&A sessions
          </p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <p className="text-xs font-medium text-slate-500">Quizzes Completed</p>
          <p className="mt-2 font-display text-3xl font-bold text-[#172554] tabular-nums">
            {completedQuizzes}
          </p>
          <p className="mt-1.5 text-xs text-slate-500 tabular-nums">
            {userQuizzesCount} real attempts ·{" "}
            {completedQuizzes - userQuizzesCount} sample
          </p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <p className="text-xs font-medium text-slate-500">
            Overall Learning Progress
          </p>
          <p className="mt-2 font-display text-3xl font-bold text-[#2563EB] tabular-nums">
            {overallMastery}%
          </p>
          <p className="mt-1.5 text-xs text-slate-500 tabular-nums">
            {weeklyStudyHours} hrs studied this week
          </p>
        </div>
      </section>

      {/* Topic Insights Strip + Recommended Next Step */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch">
        <div className="rounded-xl border border-slate-200 bg-white p-5 flex flex-col justify-between">
          <div>
            <p className="text-xs font-medium text-slate-500">Strongest Topic</p>
            <h2 className="mt-2 font-display text-lg font-semibold text-[#172554]">
              {strongestTopic ? strongestTopic.topic.name : "No topics tracked yet"}
            </h2>
            {strongestTopic && (
              <p className="mt-1 text-xs text-slate-500">
                {strongestTopic.topic.subject} ·{" "}
                {strongestTopic.masterySource === "user"
                  ? "Real quiz score"
                  : "Sample baseline"}
              </p>
            )}
          </div>
          {strongestTopic && (
            <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between">
              <span className="text-xs font-medium text-[#16A34A]">
                Strong Mastery
              </span>
              <span className="font-mono text-lg font-semibold text-[#16A34A] tabular-nums">
                {strongestTopic.mastery}%
              </span>
            </div>
          )}
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5 flex flex-col justify-between">
          <div>
            <p className="text-xs font-medium text-slate-500">
              Topic That Needs Improvement
            </p>
            <h2 className="mt-2 font-display text-lg font-semibold text-[#172554]">
              {weakestTopic ? weakestTopic.topic.name : "Add syllabus topics"}
            </h2>
            {weakestTopic && (
              <p className="mt-1 text-xs text-slate-500">
                {weakestTopic.topic.subject} · Exam weight{" "}
                {Math.round(weakestTopic.topic.examWeight * 100)}%
              </p>
            )}
          </div>
          {weakestTopic && (
            <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between">
              <span className="text-xs font-medium text-[#F59E0B]">
                Needs Revision
              </span>
              <span className="font-mono text-lg font-semibold text-[#F59E0B] tabular-nums">
                {weakestTopic.mastery}%
              </span>
            </div>
          )}
        </div>

        {/* Recommended Next Step Card */}
        <div className="rounded-xl border border-[#2563EB]/25 bg-[#DBEAFE]/35 p-5 flex flex-col justify-between">
          <div>
            <p className="text-xs font-semibold text-[#2563EB]">
              Recommended Next Step
            </p>
            <h2 className="mt-2 font-display text-lg font-semibold text-[#172554]">
              {weakestTopic
                ? `Revise ${weakestTopic.topic.name}`
                : "Upload your first course PDF"}
            </h2>
            <p className="mt-1.5 text-sm text-slate-700 leading-relaxed">
              {weakestTopic
                ? `At ${weakestTopic.mastery}% mastery with high exam relevance, a targeted 5-question quiz will raise your readiness fastest.`
                : "Add lecture notes in My Library to unlock grounded explanations and topic quizzes."}
            </p>
          </div>
          <div className="mt-4 flex items-center gap-2.5">
            <button
              type="button"
              onClick={() =>
                navigate(weakestTopic ? "/quiz" : "/library", {
                  state: weakestTopic
                    ? {
                        subject: weakestTopic.topic.subject,
                        topic: weakestTopic.topic.name,
                      }
                    : undefined,
                })
              }
              className="inline-flex items-center gap-1.5 rounded-lg bg-[#2563EB] px-3.5 py-2 text-xs font-medium text-white hover:bg-[#1D4ED8] transition-colors whitespace-nowrap shrink-0"
            >
              <ClipboardCheck className="h-3.5 w-3.5" />
              {weakestTopic ? "Start Practice Quiz" : "Go to My Library"}
            </button>
            {weakestTopic && (
              <button
                type="button"
                onClick={() =>
                  navigate("/ask", {
                    state: {
                      prefill: `Explain ${weakestTopic.topic.name} in simple words.`,
                      subject: weakestTopic.topic.subject,
                    },
                  })
                }
                className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-[#172554] hover:bg-slate-50 transition-colors whitespace-nowrap shrink-0"
              >
                Ask AI
                <ArrowRight className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
        </div>
      </section>

      {/* Main Content Row: Learning Progress Chart + Today's Study Goals */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        {/* Topic-Wise Mastery Chart */}
        <div className="lg:col-span-7 rounded-xl border border-slate-200 bg-white p-6 flex flex-col">
          <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
            <div>
              <h2 className="font-display text-lg font-semibold text-[#172554]">
                Your Learning Progress
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Topic-wise mastery percentage across your active syllabus
              </p>
            </div>
            <div className="flex items-center gap-4 text-xs text-slate-500">
              <span className="inline-flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 rounded-sm bg-[#16A34A]" />
                Strong (≥75%)
              </span>
              <span className="inline-flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 rounded-sm bg-[#2563EB]" />
                Moderate
              </span>
              <span className="inline-flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 rounded-sm bg-[#F59E0B]" />
                Needs Focus (&lt;55%)
              </span>
            </div>
          </div>

          {chartData.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center py-12 text-center">
              <p className="text-sm font-medium text-slate-700">
                No syllabus topics available yet
              </p>
              <p className="mt-1 text-xs text-slate-500">
                Add syllabus topics in My Library or enable the Sample Course Pack.
              </p>
            </div>
          ) : (
            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={chartData}
                  layout="vertical"
                  margin={{ top: 4, right: 20, left: 10, bottom: 4 }}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    horizontal={false}
                    stroke="#E2E8F0"
                  />
                  <XAxis
                    type="number"
                    domain={[0, 100]}
                    tick={{ fontSize: 12, fill: "#64748B" }}
                    unit="%"
                  />
                  <YAxis
                    dataKey="name"
                    type="category"
                    width={150}
                    tick={{ fontSize: 12, fill: "#0F172A" }}
                  />
                  <Tooltip
                    formatter={(val) => [`${val ?? 0}%`, "Mastery"]}
                    labelFormatter={(_label, payload) =>
                      payload?.[0]?.payload?.fullName || ""
                    }
                    contentStyle={{
                      borderRadius: "8px",
                      border: "1px solid #E2E8F0",
                      fontSize: "12px",
                    }}
                  />
                  <Bar dataKey="mastery" radius={[0, 6, 6, 0]} barSize={20}>
                    {chartData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={
                          entry.mastery >= 75
                            ? "#16A34A"
                            : entry.mastery >= 55
                            ? "#2563EB"
                            : "#F59E0B"
                        }
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        {/* Today's Study Goals Checklist */}
        <div className="lg:col-span-5 rounded-xl border border-slate-200 bg-white p-6 flex flex-col">
          <div className="flex items-center justify-between gap-2 mb-4">
            <div>
              <h2 className="font-display text-lg font-semibold text-[#172554]">
                Today's Study Goals
              </h2>
              <p className="text-xs text-slate-500 mt-0.5 tabular-nums">
                {studyGoals.filter((g) => g.completed).length} of{" "}
                {studyGoals.length} completed
              </p>
            </div>
          </div>

          <ul className="flex-1 divide-y divide-slate-100">
            {studyGoals.length === 0 ? (
              <li className="py-8 text-center text-sm text-slate-500">
                No study goals yet. Add your first target below.
              </li>
            ) : (
              studyGoals.map((goal) => (
                <li
                  key={goal.id}
                  className="py-3 flex items-start justify-between gap-3"
                >
                  <button
                    type="button"
                    onClick={() => toggleStudyGoal(goal.id)}
                    className="flex items-start gap-3 text-left group flex-1 min-w-0"
                  >
                    <span
                      className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded border transition-colors ${
                        goal.completed
                          ? "border-[#16A34A] bg-[#16A34A] text-white"
                          : "border-slate-300 bg-white group-hover:border-[#2563EB]"
                      }`}
                    >
                      {goal.completed && <Check className="h-3.5 w-3.5" />}
                    </span>
                    <div className="min-w-0">
                      <p
                        className={`text-sm font-medium leading-snug ${
                          goal.completed
                            ? "line-through text-slate-400"
                            : "text-[#0F172A]"
                        }`}
                      >
                        {goal.title}
                      </p>
                      <p className="mt-0.5 text-xs text-slate-500 tabular-nums">
                        {goal.subject} · {goal.estimatedMinutes} min
                        {goal.origin === "sample" ? " · Sample" : ""}
                      </p>
                    </div>
                  </button>
                  <button
                    type="button"
                    onClick={() => deleteStudyGoal(goal.id)}
                    className="rounded p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors shrink-0"
                    aria-label={`Delete goal ${goal.title}`}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </li>
              ))
            )}
          </ul>

          <form
            onSubmit={handleAddGoal}
            className="mt-4 pt-4 border-t border-slate-100 flex flex-col sm:flex-row gap-2"
          >
            <input
              type="text"
              value={newGoalTitle}
              onChange={(e) => setNewGoalTitle(e.target.value)}
              placeholder="Add a study goal for today..."
              className="flex-1 rounded-lg border border-slate-200 bg-[#F8FAFC] px-3 py-2 text-sm text-[#0F172A] placeholder:text-slate-400 focus:border-[#2563EB] focus:bg-white focus:outline-none"
            />
            <select
              value={newGoalSubject}
              onChange={(e) => setNewGoalSubject(e.target.value)}
              aria-label="Goal subject"
              className="rounded-lg border border-slate-200 bg-[#F8FAFC] px-2.5 py-2 text-xs text-slate-700 focus:border-[#2563EB] focus:outline-none"
            >
              {subjects.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
            <button
              type="submit"
              className="inline-flex items-center justify-center gap-1 rounded-lg bg-[#172554] px-3.5 py-2 text-xs font-medium text-white hover:bg-[#1E3A8A] transition-colors whitespace-nowrap shrink-0"
            >
              <Plus className="h-3.5 w-3.5" />
              Add
            </button>
          </form>
        </div>
      </section>

      {/* Continue Learning Section */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="font-display text-lg font-semibold text-[#172554]">
              Continue Learning
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Recently studied subjects and active course materials
            </p>
          </div>
          <button
            type="button"
            onClick={() => navigate("/library")}
            className="text-xs font-medium text-[#2563EB] hover:underline whitespace-nowrap shrink-0"
          >
            View all materials
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {recentSubjects.map((item) => (
            <div
              key={item.subject}
              className="rounded-xl border border-slate-200 bg-white p-5 flex flex-col justify-between hover:border-[#2563EB]/40 transition-colors"
            >
              <div>
                <p className="text-xs text-slate-500 tabular-nums">
                  {item.docCount} document{item.docCount === 1 ? "" : "s"} ·{" "}
                  {item.avgMastery}% mastery
                </p>
                <h3 className="mt-1.5 font-display text-base font-semibold text-[#172554]">
                  {item.subject}
                </h3>
                <div className="mt-3 h-1.5 w-full rounded-full bg-slate-100 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-[#2563EB] transition-all"
                    style={{ width: `${item.avgMastery}%` }}
                  />
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                {item.latestDocId ? (
                  <button
                    type="button"
                    onClick={() =>
                      openCitationPreview({
                        docId: item.latestDocId!,
                        pageNumber: 1,
                      })
                    }
                    className="text-xs font-medium text-slate-600 hover:text-[#172554] whitespace-nowrap"
                  >
                    Open Notes
                  </button>
                ) : (
                  <span className="text-xs text-slate-400">No PDF yet</span>
                )}
                <button
                  type="button"
                  onClick={() =>
                    navigate("/ask", { state: { subject: item.subject } })
                  }
                  className="text-xs font-medium text-[#2563EB] hover:underline whitespace-nowrap"
                >
                  Ask AI →
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
