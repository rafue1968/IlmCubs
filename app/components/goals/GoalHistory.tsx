const historyItems = [
  "Completed your daily goal 3 days in a row",
  "Reached last week’s reading target",
  "Finished 8 guided sessions this month",
];

export default function GoalHistory() {
  return (
    <section className="rounded-3xl border border-white/10 bg-white/[0.03] p-6">
      <p className="text-sm font-medium uppercase tracking-[0.2em] text-emerald-300">
        Milestones
      </p>
      <h2 className="mt-2 text-2xl font-semibold text-white">
        Recent progress worth celebrating
      </h2>

      <div className="mt-6 space-y-4">
        {historyItems.map((item) => (
          <div
            key={item}
            className="rounded-2xl border border-white/10 bg-slate-900/60 p-4 text-sm text-slate-200"
          >
            {item}
          </div>
        ))}
      </div>
    </section>
  );
}