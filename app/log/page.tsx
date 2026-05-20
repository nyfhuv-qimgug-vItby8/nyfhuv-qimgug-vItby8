import { ActivityLogForm } from "../../components/log/activity-log-form";

export default function LogPage() {
  return (
    <section className="space-y-6">
      <h1 className="text-3xl">Log</h1>
      <p className="text-muted">1分以内で今日を記録。</p>
      <ActivityLogForm />
    </section>
  );
}
