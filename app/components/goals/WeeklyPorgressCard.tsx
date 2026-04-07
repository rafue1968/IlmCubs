const days = [
  { day: "Mon", done: true },
  { day: "Tue", done: true },
  { day: "Wed", done: true },
  { day: "Thu", done: true },
  { day: "Fri", done: false },
  { day: "Sat", done: false },
  { day: "Sun", done: false },
];

export default function WeeklyProgressCard() {
  return (
    <section className="rounded-3xl border border-white/10 bg-white/[0.03] p-6">
      <p className="text-sm font-medium uppercase tracking-[0.2em] text-emerald-300">
        Weekly Progress
      </p>
      <h2 className="mt-2 text-2xl font-semibold text-white">
        4 of 7 days completed
      </h2>

      <p className="mt-4 text-sm leading-7 text-slate-300">
        You&apos;re building consistency. Complete a few more sessions this week to hit
        your target.
      </p>

      <div className="mt-6 grid grid-cols-7 gap-3">
        {days.map((item) => (
          <div key={item.day} className="flex flex-col items-center gap-2">
            <div
              className={`h-10 w-10 rounded-2xl border text-sm ${
                item.done
                  ? "border-emerald-400/30 bg-emerald-500/15 text-emerald-300"
                  : "border-white/10 bg-white/[0.03] text-slate-400"
              } flex items-center justify-center`}
            >
              {item.day[0]}
            </div>
            <span className="text-xs text-slate-400">{item.day}</span>
          </div>
        ))}
      </div>
    </section>
  );
}