export default function GoalsHeader() {
  return (
    <section className="flex flex-col gap-4 rounded-3xl border border-white/10 bg-white/[0.03] p-6 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <p className="text-sm font-medium uppercase tracking-[0.2em] text-emerald-300">
          Goals
        </p>
        <h1 className="mt-2 text-3xl font-semibold text-white sm:text-4xl">
          Your Quran Goals
        </h1>
        <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-300">
          Stay focused with small, meaningful targets that help you build a lasting
          relationship with the Quran.
        </p>
      </div>

      <button className="rounded-full bg-white px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-emerald-400">
        Edit Goals
      </button>
    </section>
  );
}