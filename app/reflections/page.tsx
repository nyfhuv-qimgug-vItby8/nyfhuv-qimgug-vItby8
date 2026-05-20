import { ReflectionGenerateForm } from "../../components/reflection/reflection-generate-form";
import { getDemoUserId } from "../../lib/config";
import { getSupabaseServerClient } from "../../lib/supabase/server";

export default async function ReflectionsPage() {
  const supabase = getSupabaseServerClient();
  const userId = getDemoUserId();
  const today = new Date().toISOString().slice(0, 10);

  const { data } = await supabase
    .from("ai_reflections")
    .select("log_date, summary")
    .eq("user_id", userId)
    .order("log_date", { ascending: false })
    .limit(1)
    .maybeSingle();

  const summary = data?.summary as {
    wins?: string[];
    bottlenecks?: string[];
    micro_actions?: string[];
    tomorrow_one_thing?: string;
  } | null;

  return (
    <section className="space-y-6">
      <h1 className="text-3xl">AI Reflections</h1>
      <ReflectionGenerateForm userId={userId} defaultDate={today} />
      <p className="text-sm text-muted">最新の振り返り: {data?.log_date ?? "まだありません"}</p>
      <div className="card space-y-2"><h2 className="text-lg">今日の良かった点</h2><ul className="list-disc pl-5 text-muted">{(summary?.wins ?? ["ログを保存するとAI分析が表示されます"]).map((v) => <li key={v}>{v}</li>)}</ul></div>
      <div className="card space-y-2"><h2 className="text-lg">ボトルネック</h2><ul className="list-disc pl-5 text-muted">{(summary?.bottlenecks ?? ["直近ログ不足"]).map((v) => <li key={v}>{v}</li>)}</ul></div>
      <div className="card space-y-2"><h2 className="text-lg">小さな改善提案</h2><ul className="list-disc pl-5 text-muted">{(summary?.micro_actions ?? ["学習を5分だけ開始する"]).map((v) => <li key={v}>{v}</li>)}</ul></div>
      <div className="card"><h2 className="text-lg">明日の最重要行動</h2><p className="text-muted">{summary?.tomorrow_one_thing ?? "起床後に学習教材を開く"}</p></div>
    </section>
  );
}
