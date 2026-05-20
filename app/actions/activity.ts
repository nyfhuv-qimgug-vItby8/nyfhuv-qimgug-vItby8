"use server";

import { z } from "zod";
import { getSupabaseServerClient } from "../../lib/supabase/server";
import type { ActivityLogInput } from "../../lib/types/domain";

const schema = z.object({
  logDate: z.string(),
  studyMinutes: z.number().int().min(0),
  exerciseMinutes: z.number().int().min(0),
  readingMinutes: z.number().int().min(0),
  snsMinutes: z.number().int().min(0),
  sleepHours: z.number().min(0),
  moodScore: z.number().int().min(1).max(10).optional(),
  note: z.string().optional()
});

export async function saveActivityLogAction(userId: string, input: ActivityLogInput) {
  const data = schema.parse(input);
  const supabase = getSupabaseServerClient();
  return supabase.from("activity_logs").upsert({ user_id: userId, log_date: data.logDate, ...data });
}
