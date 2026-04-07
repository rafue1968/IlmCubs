export default function DailyGoalCard() {
  return (
    <section className="rounded-3xl border border-white/10 bg-white/[0.03] p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium uppercase tracking-[0.2em] text-emerald-300">
            Daily Goal
          </p>
          <h2 className="mt-2 text-2xl font-semibold text-white">
            Read for 5 minutes
          </h2>
        </div>
        <span className="rounded-full bg-emerald-500/15 px-3 py-1 text-xs font-medium text-emerald-300">
          In Progress
        </span>
      </div>

      <p className="mt-4 text-sm leading-7 text-slate-300">
        Keep your daily connection strong by completing a short guided Quran session.
      </p>

      <div className="mt-6">
        <div className="mb-2 flex items-center justify-between text-sm text-slate-300">
          <span>Today&apos;s progress</span>
          <span>3 / 5 mins</span>
        </div>
        <div className="h-3 rounded-full bg-white/10">
          <div className="h-3 w-3/5 rounded-full bg-emerald-400" />
        </div>
      </div>
    </section>
  );
}