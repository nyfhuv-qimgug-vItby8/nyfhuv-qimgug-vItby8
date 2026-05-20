export type ActivityLogInput = {
  logDate: string;
  studyMinutes: number;
  exerciseMinutes: number;
  readingMinutes: number;
  snsMinutes: number;
  sleepHours: number;
  moodScore?: number;
  note?: string;
};

export type ReflectionSummary = {
  wins: string[];
  bottlenecks: string[];
  micro_actions: string[];
  tomorrow_one_thing: string;
  risk_alerts: string[];
  focus_conditions: string[];
};

export type ActionState = {
  ok: boolean;
  message: string;
};

export const DEFAULT_ACTIVITY_INPUT: ActivityLogInput = {
  logDate: new Date().toISOString().slice(0, 10),
  studyMinutes: 0,
  exerciseMinutes: 0,
  readingMinutes: 0,
  snsMinutes: 0,
  sleepHours: 0,
  note: ""
};

export function isReflectionSummary(value: unknown): value is ReflectionSummary {
  if (!value || typeof value !== "object") return false;
  const v = value as Record<string, unknown>;
  return (
    Array.isArray(v.wins) &&
    Array.isArray(v.bottlenecks) &&
    Array.isArray(v.micro_actions) &&
    typeof v.tomorrow_one_thing === "string" &&
    Array.isArray(v.risk_alerts) &&
    Array.isArray(v.focus_conditions)
  );
}
