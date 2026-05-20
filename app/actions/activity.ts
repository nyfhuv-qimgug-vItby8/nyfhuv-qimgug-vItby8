"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { getSupabaseServerClient } from "../../lib/supabase/server";
import type { ActionState, ActivityLogInput } from "../../lib/types/domain";

const userIdSchema = z.string().uuid();

const activitySchema = z.object({
  logDate: z.string().date(),
  studyMinutes: z.number().int().min(0),
  exerciseMinutes: z.number().int().min(0),
  readingMinutes: z.number().int().min(0),
  snsMinutes: z.number().int().min(0),
  sleepHours: z.number().min(0).max(24),
  moodScore: z.number().int().min(1).max(10).optional(),
  note: z.string().max(2000).optional()
});

function toNumber(value: FormDataEntryValue | null): number {
  if (typeof value !== "string" || value.trim() === "") return 0;
  const num = Number(value);
  return Number.isFinite(num) ? num : 0;
}

export async function saveActivityLogAction(_: ActionState, formData: FormData): Promise<ActionState> {
  const userIdRaw = (formData.get("userId") as string | null)?.trim();
  const userIdParsed = userIdSchema.safeParse(userIdRaw);
  if (!userIdParsed.success) return { ok: false, message: "userId が不正です。" };

  const input: ActivityLogInput = {
    logDate: (formData.get("logDate") as string) ?? "",
    studyMinutes: toNumber(formData.get("studyMinutes")),
    exerciseMinutes: toNumber(formData.get("exerciseMinutes")),
    readingMinutes: toNumber(formData.get("readingMinutes")),
    snsMinutes: toNumber(formData.get("snsMinutes")),
    sleepHours: toNumber(formData.get("sleepHours")),
    moodScore: formData.get("moodScore") ? toNumber(formData.get("moodScore")) : undefined,
    note: ((formData.get("note") as string | null) ?? "").trim() || undefined
  };

  const parsed = activitySchema.safeParse(input);
  if (!parsed.success) return { ok: false, message: "入力値が不正です。数値と日付を確認してください。" };

  const supabase = getSupabaseServerClient();
  const payload = parsed.data;
  const userId = userIdParsed.data;

  const { error: userError } = await supabase.from("users").upsert(
    { id: userId, display_name: "Demo User" },
    { onConflict: "id" }
  );
  if (userError) return { ok: false, message: `users 初期化に失敗しました: ${userError.message}` };

  const { error } = await supabase.from("activity_logs").upsert(
    {
      user_id: userId,
      log_date: payload.logDate,
      study_minutes: payload.studyMinutes,
      exercise_minutes: payload.exerciseMinutes,
      reading_minutes: payload.readingMinutes,
      sns_minutes: payload.snsMinutes,
      sleep_hours: payload.sleepHours,
      mood_score: payload.moodScore ?? null,
      note: payload.note ?? null
    },
    { onConflict: "user_id,log_date" }
  );
  if (error) return { ok: false, message: `保存に失敗しました: ${error.message}` };

  const { data: streakRow, error: streakReadError } = await supabase
    .from("streaks")
    .select("current_streak_days,longest_streak_days,last_logged_date")
    .eq("user_id", userId)
    .maybeSingle();

  if (streakReadError) return { ok: false, message: `streak 読み込みに失敗しました: ${streakReadError.message}` };

  const last = streakRow?.last_logged_date ? new Date(streakRow.last_logged_date) : null;
  const current = new Date(payload.logDate);
  const diffDays = last ? Math.floor((current.getTime() - last.getTime()) / 86400000) : null;

  let currentStreak = streakRow?.current_streak_days ?? 0;
  if (diffDays === 1) currentStreak += 1;
  else if (diffDays === 0) currentStreak = streakRow?.current_streak_days ?? 1;
  else currentStreak = 1;

  const longestStreak = Math.max(streakRow?.longest_streak_days ?? 0, currentStreak);

  const { error: streakWriteError } = await supabase.from("streaks").upsert(
    {
      user_id: userId,
      current_streak_days: currentStreak,
      longest_streak_days: longestStreak,
      last_logged_date: payload.logDate
    },
    { onConflict: "user_id" }
  );

  if (streakWriteError) return { ok: false, message: `streak 更新に失敗しました: ${streakWriteError.message}` };

  revalidatePath("/dashboard");
  revalidatePath("/reflections");
  return { ok: true, message: "保存しました。次にAI振り返りを生成してください。" };
}
