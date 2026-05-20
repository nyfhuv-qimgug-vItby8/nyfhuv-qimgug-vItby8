"use server";

import { revalidatePath } from "next/cache";
import { analyzeReflection } from "../../lib/ai/analyze";
import { getSupabaseServerClient } from "../../lib/supabase/server";
import type { ReflectionSummary } from "../../lib/types/domain";

export async function generateReflectionAction(userId: string, logDate: string): Promise<ReflectionSummary> {
  const supabase = getSupabaseServerClient();
  const { data: logs, error } = await supabase
    .from("activity_logs")
    .select("log_date, study_minutes, exercise_minutes, reading_minutes, sns_minutes, sleep_hours, mood_score, note")
    .eq("user_id", userId)
    .lte("log_date", logDate)
    .order("log_date", { ascending: false })
    .limit(30);

  if (error) {
    throw new Error(`Failed to load activity logs: ${error.message}`);
  }

  const summary = await analyzeReflection({ logDate, logs: logs ?? [] });

  const { error: upsertError } = await supabase.from("ai_reflections").upsert(
    {
      user_id: userId,
      log_date: logDate,
      summary,
      model: process.env.OPENAI_MODEL ?? "gpt-4.1-mini"
    },
    { onConflict: "user_id,log_date" }
  );

  if (upsertError) {
    throw new Error(`Failed to save reflection: ${upsertError.message}`);
  }

  revalidatePath("/reflections");
  return summary;
}
