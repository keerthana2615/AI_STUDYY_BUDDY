import type {
  ExamConfig,
  QuizResult,
  StudyPlanTask,
  SyllabusTopic,
} from "../types/study";

export interface ComputedTopicMetric {
  topic: SyllabusTopic;
  mastery: number; // 0..100
  masterySource: "user" | "sample" | "untested";
  attemptsCount: number;
  urgency: number; // 1.0 .. 3.0
  priorityScore: number; // Priority = (1 - Mastery) * ExamWeight * Urgency
}

export function getDaysUntilExam(examDate: string): number {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const target = new Date(examDate + "T00:00:00");
  if (Number.isNaN(target.getTime())) return 14;
  const diffMs = target.getTime() - today.getTime();
  return Math.max(1, Math.ceil(diffMs / (1000 * 60 * 60 * 24)));
}

export function calculateUrgency(daysUntilExam: number): number {
  // Smooth urgency multiplier in [0.8, 3.0]: closer exam = higher urgency
  const raw = 21 / Math.max(3, daysUntilExam);
  return Number(Math.min(3.0, Math.max(0.8, raw)).toFixed(2));
}

export function computeTopicMetrics(
  topics: SyllabusTopic[],
  quizResults: QuizResult[],
  examConfig: ExamConfig,
  includeSampleData: boolean
): ComputedTopicMetric[] {
  const daysLeft = getDaysUntilExam(examConfig.examDate);
  const urgency = calculateUrgency(daysLeft);

  return topics
    .map((topic) => {
      const userAttempts = quizResults.filter(
        (r) =>
          r.origin === "user" &&
          (r.topic === topic.name ||
            (r.subject === topic.subject && r.topic === "General"))
      );
      const sampleAttempts = includeSampleData
        ? quizResults.filter(
            (r) => r.origin === "sample" && r.topic === topic.name
          )
        : [];

      let mastery = 0;
      let masterySource: "user" | "sample" | "untested" = "untested";

      if (userAttempts.length > 0) {
        const avg =
          userAttempts.reduce((acc, r) => acc + r.percentage, 0) /
          userAttempts.length;
        mastery = Math.round(avg);
        masterySource = "user";
      } else if (includeSampleData && sampleAttempts.length > 0) {
        const avg =
          sampleAttempts.reduce((acc, r) => acc + r.percentage, 0) /
          sampleAttempts.length;
        mastery = Math.round(avg);
        masterySource = "sample";
      } else if (includeSampleData && topic.origin === "sample") {
        mastery = topic.sampleMastery;
        masterySource = "sample";
      } else {
        mastery = 0;
        masterySource = "untested";
      }

      // Formula: Priority = (1 - Mastery) * Exam Weight * Urgency
      const masteryRatio = Math.max(0, Math.min(1, mastery / 100));
      const priorityScore = Number(
        ((1 - masteryRatio) * topic.examWeight * urgency).toFixed(3)
      );

      return {
        topic,
        mastery,
        masterySource,
        attemptsCount: userAttempts.length + sampleAttempts.length,
        urgency,
        priorityScore,
      };
    })
    .sort((a, b) => b.priorityScore - a.priorityScore);
}

export function generateWeeklyStudyPlan(
  metrics: ComputedTopicMetric[],
  hoursPerDay: number
): StudyPlanTask[] {
  if (metrics.length === 0) return [];

  const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  const today = new Date();
  const focusCycle: Array<"Concept Review" | "Practice Quiz" | "Active Recall"> = [
    "Concept Review",
    "Practice Quiz",
    "Active Recall",
  ];

  const tasks: StudyPlanTask[] = [];
  const safeHours = Math.max(1, Math.min(12, hoursPerDay));
  const sessionsPerDay = safeHours >= 3 ? 2 : 1;
  const sessionDuration = Number((safeHours / sessionsPerDay).toFixed(1));

  // Focus 70% of slots on top weak/high-priority topics, cycling through priority-sorted list
  const topPool = metrics.slice(0, Math.min(metrics.length, 6));

  let cursor = 0;
  for (let d = 0; d < 7; d++) {
    const slotDate = new Date(today);
    slotDate.setDate(today.getDate() + d);
    const dateLabel = slotDate.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });

    for (let s = 0; s < sessionsPerDay; s++) {
      const picked = topPool[cursor % topPool.length];
      cursor++;

      const focusType =
        picked.mastery < 60
          ? focusCycle[(d + s) % 2] // Concept Review or Practice Quiz for weak topics
          : focusCycle[2]; // Active Recall for stronger topics

      tasks.push({
        id: `plan-${d}-${s}-${picked.topic.id}`,
        dayLabel: days[d],
        dateLabel,
        topicId: picked.topic.id,
        topicName: picked.topic.name,
        subject: picked.topic.subject,
        focusType,
        durationHours: sessionDuration,
        priorityScore: picked.priorityScore,
        completed: false,
      });
    }
  }

  return tasks;
}
