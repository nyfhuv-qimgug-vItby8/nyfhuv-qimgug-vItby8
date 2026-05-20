import { getDemoUserId } from "../../lib/config";
import { getSupabaseServerClient } from "../../lib/supabase/server";

export default async function DashboardPage() {
  const supabase = getSupabaseServerClient();
  const userId = getDemoUserId();

  const [streakRes, logsRes] = await Promise.all([
    supabase.from("streaks").select("current_streak_days,longest_streak_days").eq("user_id", userId).maybeSingle(),
    supabase
      .from("activity_logs")
      .select("study_minutes,exercise_minutes,reading_minutes,sns_minutes")
      .eq("user_id", userId)
      .order("log_date", { ascending: false })
      .limit(30)
  ]);

  const currentStreak = streakRes.data?.current_streak_days ?? 0;
  const longestStreak = streakRes.data?.longest_streak_days ?? 0;
  const logs = logsRes.data ?? [];
  const totalActionMinutes = logs.reduce((sum, row) => sum + row.study_minutes + row.exercise_minutes + row.reading_minutes, 0);
  const continuityRate = Math.round((logs.length / 30) * 100);

  return (
    <section className="space-y-6">
      <h1 className="text-3xl">Dashboard</h1>
      <div className="grid gap-4 md:grid-cols-3">
        <div className="card"><p className="text-muted">連続記録</p><p className="text-3xl">{currentStreak}日</p><p className="text-xs text-muted">最長 {longestStreak}日</p></div>
        <div className="card"><p className="text-muted">合計行動量(直近30日)</p><p className="text-3xl">{totalActionMinutes}分</p></div>
        <div className="card"><p className="text-muted">継続率(30日)</p><p className="text-3xl">{continuityRate}%</p></div>
      </div>
    </section>
  );
}
