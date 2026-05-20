"use client";

import { useActionState } from "react";
import { generateReflectionFromFormAction } from "../../app/actions/reflection";
import type { ActionState } from "../../lib/types/domain";

const initialState: ActionState = { ok: false, message: "" };

export function ReflectionGenerateForm({ userId, defaultDate }: { userId: string; defaultDate: string }) {
  const [state, formAction, pending] = useActionState(generateReflectionFromFormAction, initialState);

  return (
    <form action={formAction} className="card flex flex-wrap items-end gap-3">
      <input type="hidden" name="userId" value={userId} />
      <label className="text-sm text-muted">分析日付
        <input name="logDate" type="date" defaultValue={defaultDate} className="ml-2 rounded-lg bg-bg p-2" required />
      </label>
      <button disabled={pending} className="rounded-lg bg-accent px-4 py-2 text-bg disabled:opacity-60">{pending ? "生成中..." : "AI振り返りを生成"}</button>
      {state.message && <p className={`text-sm ${state.ok ? "text-emerald-300" : "text-rose-300"}`}>{state.message}</p>}
    </form>
  );
}
