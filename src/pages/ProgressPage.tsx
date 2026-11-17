import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  AlertCircle,
  CheckCircle2,
  ClipboardCheck,
  PenLine,
} from "lucide-react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { useStudy } from "../context/StudyContext";

export function ProgressPage() {
  const {
    topicMetrics,
    quizResults,
    topics,
    subjects,
    recordQuizResult,
    includeSampleData,
  } = useStudy();
  const navigate = useNavigate();

  // Written-answer self-check form to update mastery directly
  const [writtenSubject, setWrittenSubject] = useState(
    subjects[0] || "CS301 · Machine Learning"
  );
  const subjectTopics = useMemo(
    () => topics.filter((t) => t.subject === writtenSubject),
    [topics, writtenSubject]
  );
  const [writtenTopic, setWrittenTopic] = useState(
    subjectTopics[0]?.name || "General"
  );
  const [writtenPrompt, setWrittenPrompt] = useState("");
  const [writtenConfidence, setWrittenConfidence] = useState(80);
  const [writtenSaved, setWrittenSaved] = useState(false);

  const overallMastery = useMemo(() => {
    if (topicMetrics.length === 0) return 0;
    return Math.round(
      topicMetrics.reduce((acc, m) => acc + m.mastery, 0) / topicMetrics.length
    );
  }, [topicMetrics]);

  const totalQuestionsAttempted = useMemo(() => {
    return quizResults.reduce((acc, r) => acc + r.total, 0);
  }, [quizResults]);

  const quizAccuracy = useMemo(() => {
    if (quizResults.length === 0) return 0;
    const totalCorrect = quizResults.reduce((acc, r) => acc + r.score, 0);
    const totalAsked = quizResults.reduce((acc, r) => acc + r.total, 0);
    return totalAsked > 0 ? Math.round((totalCorrect / totalAsked) * 100) : 0;
  }, [quizResults]);

  const strongTopics = useMemo(
    () =>
      topicMetrics
        .filter((m) => m.mastery >= 75)
        .sort((a, b) => b.mastery - a.mastery),
    [topicMetrics]
  );

  const weakTopics = useMemo(
    () =>
      topicMetrics
        .filter((m) => m.mastery < 60)
        .sort((a, b) => a.mastery - b.mastery),
    [topicMetrics]
  );

  const timelineData = useMemo(() => {
    const chronological = [...quizResults].reverse();
    return chronological.map((r, i) => ({
      session: `Attempt ${i + 1}`,
      date: r.completedAt,
      score: r.percentage,
      topic: r.topic,
      origin: r.origin === "user" ? "Your Attempt" : "Sample Data",
    }));
  }, [quizResults]);

  const handleLogWrittenPractice = (e: React.FormEvent) => {
    e.preventDefault();
    if (!writtenPrompt.trim()) return;
    const targetTopic =
      subjectTopics.find((t) => t.name === writtenTopic)?.name ||
      subjectTopics[0]?.name ||
      "General";

    const scoreOutOf10 = Math.round(writtenConfidence / 10);
    recordQuizResult({
      subject: writtenSubject,
      topic: targetTopic,
      score: scoreOutOf10,
      total: 10,
      percentage: writtenConfidence,
      mode: "live-ai",
    });
    setWrittenPrompt("");
    setWrittenSaved(true);
    setTimeout(() => setWrittenSaved(false), 3500);
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-2xl sm:text-3xl font-bold tracking-tight text-[#172554]">
          My Progress
        </h1>
        <p className="mt-1 text-sm text-slate-600">
          Topic-wise mastery analytics, quiz accuracy trends, and revision focus
          indicators.{" "}
          {includeSampleData
            ? "Sample baseline results are clearly labelled alongside your real attempts."
            : "Showing only your recorded quiz and written-answer attempts."}
        </p>
      </div>

      {/* Top KPI Row */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <p className="text-xs font-medium text-slate-500">Overall Mastery</p>
          <p className="mt-2 font-display text-3xl font-bold text-[#2563EB] tabular-nums">
            {overallMastery}%
          </p>
          <p className="mt-1 text-xs text-slate-500">
            Across {topicMetrics.length} syllabus topics
          </p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <p className="text-xs font-medium text-slate-500">Quiz Accuracy</p>
          <p className="mt-2 font-display text-3xl font-bold text-[#16A34A] tabular-nums">
            {quizAccuracy}%
          </p>
          <p className="mt-1 text-xs text-slate-500 tabular-nums">
            Across {quizResults.length} completed assessments
          </p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <p className="text-xs font-medium text-slate-500">
            Questions Attempted
          </p>
          <p className="mt-2 font-display text-3xl font-bold text-[#172554] tabular-nums">
            {totalQuestionsAttempted}
          </p>
          <p className="mt-1 text-xs text-slate-500">
            MCQs & written concept checks
          </p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <p className="text-xs font-medium text-slate-500">
            Topics Needing Revision
          </p>
          <p className="mt-2 font-display text-3xl font-bold text-[#F59E0B] tabular-nums">
            {weakTopics.length}
          </p>
          <p className="mt-1 text-xs text-slate-500">
            Below 60% mastery threshold
          </p>
        </div>
      </section>

      {/* Learning Progress Over Time Chart + Strong vs Weak Topics */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        <div className="lg:col-span-7 rounded-xl border border-slate-200 bg-white p-6 flex flex-col">
          <div className="mb-4">
            <h2 className="font-display text-lg font-semibold text-[#172554]">
              Learning Progress Over Time
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Assessment score trajectory across chronological study sessions
            </p>
          </div>

          {timelineData.length === 0 ? (
            <div className="flex-1 flex items-center justify-center py-12 text-sm text-slate-500">
              Complete a practice quiz to plot your progress curve.
            </div>
          ) : (
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={timelineData}
                  margin={{ top: 10, right: 16, left: 0, bottom: 0 }}
                >
                  <defs>
                    <linearGradient id="scoreFill" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#2563EB" stopOpacity={0.22} />
                      <stop offset="95%" stopColor="#2563EB" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                  <XAxis
                    dataKey="date"
                    tick={{ fontSize: 12, fill: "#64748B" }}
                  />
                  <YAxis
                    domain={[0, 100]}
                    unit="%"
                    tick={{ fontSize: 12, fill: "#64748B" }}
                  />
                  <Tooltip
                    formatter={(val) => [`${val ?? 0}%`, "Score"]}
                    labelFormatter={(_l, p) =>
                      p?.[0]?.payload
                        ? `${p[0].payload.topic} (${p[0].payload.origin})`
                        : ""
                    }
                    contentStyle={{
                      borderRadius: "8px",
                      border: "1px solid #E2E8F0",
                      fontSize: "12px",
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="score"
                    stroke="#2563EB"
                    strokeWidth={2.5}
                    fillOpacity={1}
                    fill="url(#scoreFill)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        {/* Strong & Weak Topics Split */}
        <div className="lg:col-span-5 rounded-xl border border-slate-200 bg-white p-6 space-y-6">
          <div>
            <h2 className="flex items-center gap-2 font-display text-base font-semibold text-[#172554]">
              <CheckCircle2 className="h-4 w-4 text-[#16A34A]" />
              Strong Topics (≥75%)
            </h2>
            {strongTopics.length === 0 ? (
              <p className="mt-2 text-xs text-slate-500">
                Score 75% or higher on a quiz to promote topics here.
              </p>
            ) : (
              <ul className="mt-3 divide-y divide-slate-100">
                {strongTopics.map((m) => (
                  <li
                    key={m.topic.id}
                    className="py-2 flex items-center justify-between gap-2 text-sm"
                  >
                    <span className="font-medium text-[#0F172A] truncate">
                      {m.topic.name}
                    </span>
                    <span className="font-mono text-xs font-semibold text-[#16A34A] tabular-nums shrink-0">
                      {m.mastery}%
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="pt-4 border-t border-slate-100">
            <h2 className="flex items-center gap-2 font-display text-base font-semibold text-[#172554]">
              <AlertCircle className="h-4 w-4 text-[#F59E0B]" />
              Weak Topics Needing Revision (&lt;60%)
            </h2>
            {weakTopics.length === 0 ? (
              <p className="mt-2 text-xs text-slate-500">
                Great work — no topics currently below 60%.
              </p>
            ) : (
              <ul className="mt-3 divide-y divide-slate-100">
                {weakTopics.map((m) => (
                  <li
                    key={m.topic.id}
                    className="py-2.5 flex items-center justify-between gap-3"
                  >
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-[#0F172A] truncate">
                        {m.topic.name}
                      </p>
                      <p className="text-xs text-slate-500 truncate">
                        {m.topic.subject}
                      </p>
                    </div>
                    <div className="flex items-center gap-2.5 shrink-0">
                      <span className="font-mono text-xs font-semibold text-[#F59E0B] tabular-nums">
                        {m.mastery}%
                      </span>
                      <button
                        type="button"
                        onClick={() =>
                          navigate("/quiz", {
                            state: {
                              subject: m.topic.subject,
                              topic: m.topic.name,
                            },
                          })
                        }
                        className="rounded-md border border-slate-200 bg-[#F8FAFC] px-2.5 py-1 text-xs font-medium text-[#2563EB] hover:bg-[#DBEAFE]/50 transition-colors"
                      >
                        Practice
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </section>

      {/* Topic-Wise Progress Bars */}
      <section className="rounded-xl border border-slate-200 bg-white p-6 space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <h2 className="font-display text-lg font-semibold text-[#172554]">
              Topic-Wise Mastery Breakdown
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Mastery automatically recalculates when you finish a quiz or log a
              written self-check.
            </p>
          </div>
        </div>

        <div className="space-y-4">
          {topicMetrics.map((m) => {
            const barColor =
              m.mastery >= 75
                ? "bg-[#16A34A]"
                : m.mastery >= 55
                ? "bg-[#2563EB]"
                : "bg-[#F59E0B]";
            const statusText =
              m.mastery >= 75
                ? "Strong"
                : m.mastery >= 55
                ? "Developing"
                : "Needs Revision";

            return (
              <div key={m.topic.id} className="space-y-1.5">
                <div className="flex flex-wrap items-center justify-between gap-2 text-sm">
                  <div>
                    <span className="font-medium text-[#0F172A]">
                      {m.topic.name}
                    </span>
                    <span className="ml-2 text-xs text-slate-500">
                      {m.topic.subject} ·{" "}
                      {m.masterySource === "user"
                        ? "Your Results"
                        : m.masterySource === "sample"
                        ? "Sample Baseline"
                        : "Untested"}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 text-xs tabular-nums">
                    <span
                      className={
                        m.mastery >= 75
                          ? "font-medium text-[#16A34A]"
                          : m.mastery >= 55
                          ? "font-medium text-[#2563EB]"
                          : "font-medium text-[#F59E0B]"
                      }
                    >
                      {statusText}
                    </span>
                    <span className="font-mono font-semibold text-[#172554] w-10 text-right">
                      {m.mastery}%
                    </span>
                  </div>
                </div>
                <div className="h-2 w-full rounded-full bg-slate-100 overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all ${barColor}`}
                    style={{ width: `${m.mastery}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Bottom Grid: Written-Answer Mastery Check + Recent Quiz Results */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        <form
          onSubmit={handleLogWrittenPractice}
          className="lg:col-span-5 rounded-xl border border-slate-200 bg-white p-6 space-y-4"
        >
          <div className="flex items-center gap-2">
            <PenLine className="h-4 w-4 text-[#2563EB]" />
            <h2 className="font-display text-base font-semibold text-[#172554]">
              Written-Answer Recall Check
            </h2>
          </div>
          <p className="text-xs text-slate-500">
            Write a short recall summary from memory for any topic and record
            your rubric self-score to update mastery.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            <select
              value={writtenSubject}
              onChange={(e) => {
                setWrittenSubject(e.target.value);
                const first = topics.find((t) => t.subject === e.target.value);
                setWrittenTopic(first?.name || "General");
              }}
              className="rounded-lg border border-slate-200 bg-[#F8FAFC] px-3 py-2 text-xs text-[#0F172A] focus:border-[#2563EB] focus:outline-none"
            >
              {subjects.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
            <select
              value={writtenTopic}
              onChange={(e) => setWrittenTopic(e.target.value)}
              className="rounded-lg border border-slate-200 bg-[#F8FAFC] px-3 py-2 text-xs text-[#0F172A] focus:border-[#2563EB] focus:outline-none"
            >
              {subjectTopics.map((t) => (
                <option key={t.id} value={t.name}>
                  {t.name}
                </option>
              ))}
            </select>
          </div>

          <textarea
            rows={3}
            value={writtenPrompt}
            onChange={(e) => setWrittenPrompt(e.target.value)}
            placeholder="Write the key equations, definitions, or derivation steps from memory..."
            className="w-full rounded-lg border border-slate-200 bg-[#F8FAFC] px-3 py-2 text-sm text-[#0F172A] focus:border-[#2563EB] focus:bg-white focus:outline-none"
          />

          <div>
            <div className="flex items-center justify-between text-xs text-slate-600 mb-1">
              <span>Self-assessed accuracy</span>
              <span className="font-mono font-semibold text-[#172554] tabular-nums">
                {writtenConfidence}%
              </span>
            </div>
            <input
              type="range"
              min={20}
              max={100}
              step={5}
              value={writtenConfidence}
              onChange={(e) => setWrittenConfidence(Number(e.target.value))}
              className="w-full accent-[#2563EB]"
            />
          </div>

          <div className="flex items-center justify-between gap-2">
            <span className="text-xs text-[#16A34A] font-medium">
              {writtenSaved ? "Mastery updated!" : ""}
            </span>
            <button
              type="submit"
              disabled={!writtenPrompt.trim()}
              className="rounded-lg bg-[#172554] px-4 py-2 text-xs font-medium text-white hover:bg-[#1E3A8A] disabled:opacity-50 transition-colors"
            >
              Save Written Check
            </button>
          </div>
        </form>

        {/* Recent Quiz Results Table */}
        <div className="lg:col-span-7 rounded-xl border border-slate-200 bg-white p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="flex items-center gap-2 font-display text-base font-semibold text-[#172554]">
              <ClipboardCheck className="h-4 w-4 text-[#2563EB]" />
              Recent Quiz Results
            </h2>
            <span className="text-xs text-slate-500 tabular-nums">
              {quizResults.length} entries
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 text-xs font-semibold text-slate-500">
                  <th className="py-2.5 pr-4">Topic</th>
                  <th className="py-2.5 px-3">Date</th>
                  <th className="py-2.5 px-3">Source</th>
                  <th className="py-2.5 pl-3 text-right">Score</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {quizResults.length === 0 ? (
                  <tr>
                    <td
                      colSpan={4}
                      className="py-8 text-center text-xs text-slate-500"
                    >
                      No quiz results yet. Complete a practice quiz to see your
                      history.
                    </td>
                  </tr>
                ) : (
                  quizResults.map((res) => (
                    <tr key={res.id} className="hover:bg-[#F8FAFC]">
                      <td className="py-3 pr-4">
                        <p className="font-medium text-[#0F172A]">
                          {res.topic}
                        </p>
                        <p className="text-xs text-slate-500">{res.subject}</p>
                      </td>
                      <td className="py-3 px-3 font-mono text-xs text-slate-600 tabular-nums whitespace-nowrap">
                        {res.completedAt}
                      </td>
                      <td className="py-3 px-3 text-xs text-slate-500 whitespace-nowrap">
                        {res.origin === "user" ? "Your Attempt" : "Sample Data"}
                      </td>
                      <td className="py-3 pl-3 text-right font-mono text-xs font-semibold tabular-nums whitespace-nowrap">
                        <span
                          className={
                            res.percentage >= 75
                              ? "text-[#16A34A]"
                              : res.percentage >= 55
                              ? "text-[#2563EB]"
                              : "text-[#F59E0B]"
                          }
                        >
                          {res.score}/{res.total} ({res.percentage}%)
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </section>
    </div>
  );
}
