export default function ProblemSolution() {
  return (
    <section className="bg-slate-950 py-20">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="grid gap-6 lg:grid-cols-2">
          <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-8">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-400">
              The Problem
            </p>
            <h2 className="mt-4 text-3xl font-semibold text-white">
              Many reconnect in Ramadan, then struggle to stay consistent
            </h2>
            <p className="mt-4 text-base leading-8 text-slate-300">
              The intention is there, but everyday life gets busy. Without structure,
              small guidance, and visible progress, it becomes hard to maintain a real
              relationship with the Quran.
            </p>
          </div>

          <div className="rounded-3xl border border-emerald-400/20 bg-emerald-500/10 p-8">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-emerald-300">
              Our Solution
            </p>
            <h2 className="mt-4 text-3xl font-semibold text-white">
              Turn Quran engagement into a guided daily journey
            </h2>
            <p className="mt-4 text-base leading-8 text-slate-200">
              Short sessions, reflection prompts, personalized pathways, and progress
              tracking help users stay connected to the Quran in a way that feels
              meaningful, modern, and sustainable.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}