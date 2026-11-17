import { useMemo } from "react";
import { CalendarClock, Check, RefreshCw } from "lucide-react";
import { useStudy } from "../context/StudyContext";
import { getDaysUntilExam } from "../utils/studyMath";

export function StudyPlannerPage() {
  const {
    examConfig,
    updateExamConfig,
    topicMetrics,
    studyPlanTasks,
    togglePlanTask,
    regenerateStudyPlan,
  } = useStudy();

  const daysUntilExam = getDaysUntilExam(examConfig.examDate);

  const completedCount = useMemo(
    () => studyPlanTasks.filter((t) => t.completed).length,
    [studyPlanTasks]
  );

  const planCompletionPct =
    studyPlanTasks.length > 0
      ? Math.round((completedCount / studyPlanTasks.length) * 100)
      : 0;

  const groupedByDay = useMemo(() => {
    const map = new Map<string, typeof studyPlanTasks>();
    for (const task of studyPlanTasks) {
      const key = `${task.dayLabel} · ${task.dateLabel}`;
      const existing = map.get(key) || [];
      existing.push(task);
      map.set(key, existing);
    }
    return Array.from(map.entries());
  }, [studyPlanTasks]);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl sm:text-3xl font-bold tracking-tight text-[#172554]">
            Study Planner
          </h1>
          <p className="mt-1 text-sm text-slate-600">
            Adaptive weekly revision schedule prioritizing weak, high-weight
            topics as your exam approaches.
          </p>
        </div>

        <button
          type="button"
          onClick={regenerateStudyPlan}
          className="inline-flex items-center gap-2 rounded-lg bg-[#2563EB] px-4 py-2.5 text-sm font-medium text-white hover:bg-[#1D4ED8] transition-colors whitespace-nowrap shrink-0"
        >
          <RefreshCw className="h-4 w-4" />
          Regenerate Study Plan
        </button>
      </div>

      {/* Exam Config & Formula Overview */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        <div className="lg:col-span-5 rounded-xl border border-slate-200 bg-white p-6 space-y-4">
          <h2 className="font-display text-base font-semibold text-[#172554] flex items-center gap-2">
            <CalendarClock className="h-4 w-4 text-[#2563EB]" />
            Exam & Schedule Parameters
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="exam-date-input"
                className="block text-xs font-medium text-slate-600 mb-1.5"
              >
                Target Exam Date
              </label>
              <input
                id="exam-date-input"
                type="date"
                value={examConfig.examDate}
                onChange={(e) => {
                  updateExamConfig({ examDate: e.target.value });
                }}
                className="w-full rounded-lg border border-slate-200 bg-[#F8FAFC] px-3 py-2 text-sm font-mono text-[#0F172A] focus:border-[#2563EB] focus:bg-white focus:outline-none"
              />
            </div>

            <div>
              <label
                htmlFor="study-hours-input"
                className="block text-xs font-medium text-slate-600 mb-1.5"
              >
                Available Study Hours / Day
              </label>
              <select
                id="study-hours-input"
                value={examConfig.hoursPerDay}
                onChange={(e) =>
                  updateExamConfig({ hoursPerDay: Number(e.target.value) })
                }
                className="w-full rounded-lg border border-slate-200 bg-[#F8FAFC] px-3 py-2 text-sm font-mono text-[#0F172A] focus:border-[#2563EB] focus:bg-white focus:outline-none"
              >
                {[1, 2, 3, 4, 5, 6, 8].map((h) => (
                  <option key={h} value={h}>
                    {h} hour{h === 1 ? "" : "s"} / day
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
            <span className="text-slate-500">Countdown to Exam</span>
            <span className="font-mono font-semibold text-[#172554] tabular-nums">
              {daysUntilExam} day{daysUntilExam === 1 ? "" : "s"} remaining
            </span>
          </div>
        </div>

        {/* Priority Formula & Progress Indicator */}
        <div className="lg:col-span-7 rounded-xl border border-slate-200 bg-white p-6 flex flex-col justify-between space-y-5">
          <div>
            <p className="text-xs font-semibold text-[#2563EB]">
              Adaptive Priority Engine
            </p>
            <p className="mt-1.5 font-mono text-sm sm:text-base font-semibold text-[#172554]">
              Priority = (1 - Mastery) × Exam Weight × Urgency
            </p>
            <p className="mt-1.5 text-xs text-slate-600 leading-relaxed">
              Topics with lower mastery, higher syllabus exam weight, and
              closer exam dates automatically receive top placement in your
              weekly revision plan. Click{" "}
              <strong className="font-medium text-[#172554]">
                Regenerate Study Plan
              </strong>{" "}
              after changing your exam date or daily hours.
            </p>
          </div>

          <div className="pt-4 border-t border-slate-100 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-medium text-slate-700">
                Weekly Plan Progress
              </span>
              <span className="font-mono font-semibold text-[#172554] tabular-nums">
                {completedCount}/{studyPlanTasks.length} sessions (
                {planCompletionPct}%)
              </span>
            </div>
            <div className="h-2.5 w-full rounded-full bg-slate-100 overflow-hidden">
              <div
                className="h-full rounded-full bg-[#16A34A] transition-all"
                style={{ width: `${planCompletionPct}%` }}
              />
            </div>
          </div>
        </div>
      </section>

      {/* Priority Topics Ranked Table */}
      <section className="rounded-xl border border-slate-200 bg-white p-6 space-y-4">
        <div>
          <h2 className="font-display text-lg font-semibold text-[#172554]">
            Priority Topics (Weakest & Highest Priority First)
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Sorted descending by Priority = (1 - Mastery) × Exam Weight ×
            Urgency
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 text-xs font-semibold text-slate-500">
                <th className="py-2.5 pr-4">Rank & Topic</th>
                <th className="py-2.5 px-3">Subject</th>
                <th className="py-2.5 px-3 text-right">Mastery</th>
                <th className="py-2.5 px-3 text-right">Exam Weight</th>
                <th className="py-2.5 px-3 text-right">Urgency</th>
                <th className="py-2.5 pl-3 text-right">Priority Score</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {topicMetrics.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    className="py-8 text-center text-xs text-slate-500"
                  >
                    Add syllabus topics in My Library to compute revision
                    priorities.
                  </td>
                </tr>
              ) : (
                topicMetrics.map((m, idx) => (
                  <tr key={m.topic.id} className="hover:bg-[#F8FAFC]">
                    <td className="py-3 pr-4">
                      <span className="font-mono text-xs text-slate-400 mr-2 tabular-nums">
                        {String(idx + 1).padStart(2, "0")}.
                      </span>
                      <span className="font-medium text-[#0F172A]">
                        {m.topic.name}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-xs text-slate-600">
                      {m.topic.subject}
                    </td>
                    <td className="py-3 px-3 text-right font-mono text-xs font-semibold tabular-nums">
                      <span
                        className={
                          m.mastery < 55
                            ? "text-[#F59E0B]"
                            : m.mastery >= 75
                            ? "text-[#16A34A]"
                            : "text-[#2563EB]"
                        }
                      >
                        {m.mastery}%
                      </span>
                    </td>
                    <td className="py-3 px-3 text-right font-mono text-xs text-slate-700 tabular-nums">
                      {m.topic.examWeight.toFixed(2)}
                    </td>
                    <td className="py-3 px-3 text-right font-mono text-xs text-slate-700 tabular-nums">
                      {m.urgency.toFixed(2)}×
                    </td>
                    <td className="py-3 pl-3 text-right font-mono text-xs font-bold text-[#172554] tabular-nums">
                      {m.priorityScore.toFixed(2)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>

      {/* Recommended Weekly Study Schedule & Daily Checklist */}
      <section className="space-y-4">
        <div>
          <h2 className="font-display text-lg font-semibold text-[#172554]">
            Recommended Weekly Study Schedule & Daily Checklist
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Mark study sessions as completed to track your daily revision
            consistency
          </p>
        </div>

        {groupedByDay.length === 0 ? (
          <div className="rounded-xl border border-slate-200 bg-white p-10 text-center text-sm text-slate-500">
            Click “Regenerate Study Plan” after adding syllabus topics to build
            your weekly schedule.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {groupedByDay.map(([dayTitle, dayTasks]) => (
              <div
                key={dayTitle}
                className="rounded-xl border border-slate-200 bg-white p-5 flex flex-col justify-between space-y-3"
              >
                <div className="border-b border-slate-100 pb-2.5 flex items-center justify-between">
                  <h3 className="font-display text-sm font-semibold text-[#172554]">
                    {dayTitle}
                  </h3>
                  <span className="font-mono text-xs text-slate-500 tabular-nums">
                    {dayTasks
                      .reduce((acc, t) => acc + t.durationHours, 0)
                      .toFixed(1)}{" "}
                    h
                  </span>
                </div>

                <ul className="space-y-3 flex-1">
                  {dayTasks.map((task) => (
                    <li key={task.id}>
                      <button
                        type="button"
                        onClick={() => togglePlanTask(task.id)}
                        className="w-full flex items-start gap-2.5 text-left group"
                      >
                        <span
                          className={`mt-0.5 flex h-4.5 w-4.5 shrink-0 items-center justify-center rounded border transition-colors ${
                            task.completed
                              ? "border-[#16A34A] bg-[#16A34A] text-white"
                              : "border-slate-300 bg-white group-hover:border-[#2563EB]"
                          }`}
                        >
                          {task.completed && <Check className="h-3 w-3" />}
                        </span>
                        <div className="min-w-0">
                          <p
                            className={`text-xs font-semibold leading-snug ${
                              task.completed
                                ? "line-through text-slate-400"
                                : "text-[#0F172A]"
                            }`}
                          >
                            {task.topicName}
                          </p>
                          <p className="mt-0.5 text-[11px] text-slate-500 tabular-nums">
                            {task.focusType} · {task.durationHours}h · Priority{" "}
                            {task.priorityScore.toFixed(2)}
                          </p>
                        </div>
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
