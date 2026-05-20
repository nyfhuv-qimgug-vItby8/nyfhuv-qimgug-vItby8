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
