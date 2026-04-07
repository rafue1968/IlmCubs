const stats = [
  { label: "Daily Target", value: "5 mins" },
  { label: "Weekly Progress", value: "4 / 7 days" },
  { label: "Current Streak", value: "12 days" },
  { label: "Sessions Done", value: "28" },
];

export default function GoalsOverviewCards() {
  return (
    <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {stats.map((stat) => (
        <div
          key={stat.label}
          className="rounded-3xl border border-white/10 bg-white/[0.03] p-6"
        >
          <p className="text-sm text-slate-400">{stat.label}</p>
          <p className="mt-3 text-2xl font-semibold text-white">{stat.value}</p>
        </div>
      ))}
    </section>
  );
}