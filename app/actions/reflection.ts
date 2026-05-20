"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { analyzeReflection } from "../../lib/ai/analyze";
import { getSupabaseServerClient } from "../../lib/supabase/server";
import type { ActionState, ReflectionSummary } from "../../lib/types/domain";

const reflectionInputSchema = z.object({
  userId: z.string().uuid(),
  logDate: z.string().date()
});

export async function generateReflectionAction(userId: string, logDate: string): Promise<ReflectionSummary> {
  const supabase = getSupabaseServerClient();

  const { data: dayLog } = await supabase
    .from("activity_logs")
    .select("id")
    .eq("user_id", userId)
    .eq("log_date", logDate)
    .maybeSingle();

  if (!dayLog) {
    throw new Error("先にこの日付の行動ログを保存してください。");
  }

  const { data: logs, error } = await supabase
    .from("activity_logs")
    .select("log_date, study_minutes, exercise_minutes, reading_minutes, sns_minutes, sleep_hours, mood_score, note")
    .eq("user_id", userId)
    .lte("log_date", logDate)
    .order("log_date", { ascending: false })
    .limit(30);

  if (error) throw new Error(`Failed to load activity logs: ${error.message}`);

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

  if (upsertError) throw new Error(`Failed to save reflection: ${upsertError.message}`);

  revalidatePath("/reflections");
  return summary;
}

export async function generateReflectionFromFormAction(_: ActionState, formData: FormData): Promise<ActionState> {
  const parsed = reflectionInputSchema.safeParse({ userId: formData.get("userId"), logDate: formData.get("logDate") });
  if (!parsed.success) return { ok: false, message: "userId または日付が不正です。" };

  try {
    await generateReflectionAction(parsed.data.userId, parsed.data.logDate);
    return { ok: true, message: "AI振り返りを生成しました。" };
  } catch (error) {
    return { ok: false, message: error instanceof Error ? error.message : "AI振り返りの生成に失敗しました。" };
  }
}
