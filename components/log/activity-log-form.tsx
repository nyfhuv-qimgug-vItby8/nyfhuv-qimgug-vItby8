"use client";

import { useState } from "react";

export function ActivityLogForm() {
  const [saved, setSaved] = useState(false);

  return (
    <form className="card space-y-4" onSubmit={(e) => { e.preventDefault(); setSaved(true); }}>
      <h2 className="text-xl">今日の行動ログ</h2>
      <div className="grid grid-cols-2 gap-3">
        <input className="rounded-lg bg-bg p-3" type="number" placeholder="学習(分)" />
        <input className="rounded-lg bg-bg p-3" type="number" placeholder="運動(分)" />
        <input className="rounded-lg bg-bg p-3" type="number" placeholder="読書(分)" />
        <input className="rounded-lg bg-bg p-3" type="number" placeholder="SNS(分)" />
        <input className="rounded-lg bg-bg p-3 col-span-2" type="number" step="0.1" placeholder="睡眠(時間)" />
      </div>
      <textarea className="min-h-24 w-full rounded-lg bg-bg p-3" placeholder="メモ" />
      <button className="rounded-lg bg-accent px-4 py-2 text-bg">保存</button>
      {saved && <p className="text-sm text-muted">保存しました（MVPモック）</p>}
    </form>
  );
}
