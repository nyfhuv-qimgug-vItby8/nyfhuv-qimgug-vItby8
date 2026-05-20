import Link from "next/link";
import { ActivityLogForm } from "../../components/log/activity-log-form";

export default function LogPage() {
  return (
    <section className="space-y-6">
      <h1 className="text-3xl">Log</h1>
      <p className="text-muted">1分以内で今日を記録し、AI振り返りへ接続。</p>
      <ActivityLogForm />
      <div className="flex justify-end">
        <Link href="/reflections" className="rounded-lg border border-border px-4 py-2 text-sm text-muted hover:text-white">
          振り返り画面へ
        </Link>
      </div>
    </section>
  );
}
