"use server";

import { analyzeReflection } from "../../lib/ai/analyze";
import { getSupabaseServerClient } from "../../lib/supabase/server";

export async function generateReflectionAction(userId: string, logDate: string) {
  const supabase = getSupabaseServerClient();
  const { data: logs } = await supabase
    .from("activity_logs")
    .select("*")
    .eq("user_id", userId)
    .lte("log_date", logDate)
    .order("log_date", { ascending: false })
    .limit(30);

  const summary = await analyzeReflection({ logDate, logs });

  await supabase.from("ai_reflections").upsert({
    user_id: userId,
    log_date: logDate,
    summary,
    model: process.env.OPENAI_MODEL ?? "gpt-4.1-mini"
  });

  return summary;
}
