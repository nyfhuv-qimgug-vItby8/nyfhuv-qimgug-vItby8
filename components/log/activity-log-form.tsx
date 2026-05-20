"use client";

import { useActionState } from "react";
import { saveActivityLogAction } from "../../app/actions/activity";
import { DEFAULT_ACTIVITY_INPUT, type ActionState } from "../../lib/types/domain";

const initialState: ActionState = { ok: false, message: "" };

export function ActivityLogForm() {
  const [state, formAction, pending] = useActionState(saveActivityLogAction, initialState);

  return (
    <form action={formAction} className="card space-y-5">
      <input type="hidden" name="userId" value={process.env.NEXT_PUBLIC_DEMO_USER_ID ?? "00000000-0000-0000-0000-000000000001"} />
      <div className="space-y-1">
        <h2 className="text-xl">今日の行動ログ</h2>
        <p className="text-sm text-muted">小さく、正確に。1分で記録。</p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <input name="logDate" className="rounded-lg bg-bg p-3 col-span-2" type="date" defaultValue={DEFAULT_ACTIVITY_INPUT.logDate} required />
        <input name="studyMinutes" className="rounded-lg bg-bg p-3" type="number" min={0} placeholder="学習(分)" defaultValue={0} />
        <input name="exerciseMinutes" className="rounded-lg bg-bg p-3" type="number" min={0} placeholder="運動(分)" defaultValue={0} />
        <input name="readingMinutes" className="rounded-lg bg-bg p-3" type="number" min={0} placeholder="読書(分)" defaultValue={0} />
        <input name="snsMinutes" className="rounded-lg bg-bg p-3" type="number" min={0} placeholder="SNS(分)" defaultValue={0} />
        <input name="sleepHours" className="rounded-lg bg-bg p-3" type="number" step="0.1" min={0} max={24} placeholder="睡眠(時間)" defaultValue={0} />
        <input name="moodScore" className="rounded-lg bg-bg p-3" type="number" min={1} max={10} placeholder="気分(1-10)" />
      </div>

      <textarea name="note" className="min-h-24 w-full rounded-lg bg-bg p-3" placeholder="今日の気づき、感情、集中を阻害した要因など" />

      <button disabled={pending} className="rounded-lg bg-accent px-4 py-2 text-bg disabled:opacity-60">
        {pending ? "保存中..." : "保存"}
      </button>

      {state.message && (
        <p className={`text-sm ${state.ok ? "text-emerald-300" : "text-rose-300"}`}>{state.message}</p>
      )}
    </form>
  );
}
