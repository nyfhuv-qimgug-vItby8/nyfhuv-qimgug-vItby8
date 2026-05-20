export default function DashboardPage() {
  return (
    <section className="space-y-6">
      <h1 className="text-3xl">Dashboard</h1>
      <div className="grid gap-4 md:grid-cols-3">
        <div className="card"><p className="text-muted">連続記録</p><p className="text-3xl">0日</p></div>
        <div className="card"><p className="text-muted">合計行動量</p><p className="text-3xl">0分</p></div>
        <div className="card"><p className="text-muted">継続率</p><p className="text-3xl">0%</p></div>
      </div>
    </section>
  );
}
