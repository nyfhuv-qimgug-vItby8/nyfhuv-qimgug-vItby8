"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { getSupabaseServerClient } from "../../lib/supabase/server";
import type { ActionState, ActivityLogInput } from "../../lib/types/domain";

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
  const userId = (formData.get("userId") as string | null)?.trim();
  if (!userId) {
    return { ok: false, message: "userId が未設定です。" };
  }

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
  if (!parsed.success) {
    return { ok: false, message: "入力値が不正です。数値と日付を確認してください。" };
  }

  const supabase = getSupabaseServerClient();
  const payload = parsed.data;

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

  if (error) {
    return { ok: false, message: `保存に失敗しました: ${error.message}` };
  }

  revalidatePath("/dashboard");
  revalidatePath("/reflections");
  return { ok: true, message: "保存しました。" };
}
