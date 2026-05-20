import Link from "next/link";

export default function Home() {
  return (
    <section className="space-y-8">
      <h1 className="text-4xl font-semibold">AI自己進化OS</h1>
      <p className="max-w-2xl text-muted">
        行動ログを記録し、AIで振り返り、継続と集中を改善するための人生OS。
      </p>
      <div className="flex gap-4">
        <Link href="/log" className="card hover:border-accent">今日のログを入力</Link>
        <Link href="/dashboard" className="card hover:border-accent">ダッシュボードを見る</Link>
      </div>
    </section>
  );
}
