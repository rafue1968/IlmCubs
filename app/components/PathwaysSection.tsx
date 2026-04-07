const pathways = [
  {
    title: "Anxiety & Calm",
    description: "Verses and reflections for reassurance, patience, and inner peace.",
  },
  {
    title: "Discipline & Consistency",
    description: "A pathway for building strong Quran habits through small daily wins.",
  },
  {
    title: "Hope & Healing",
    description: "Sessions designed around resilience, mercy, and trusting Allah.",
  },
  {
    title: "Focus & Purpose",
    description: "For users who feel distracted and want grounded spiritual direction.",
  },
];

export default function Pathways() {
  return (
    <section id="pathways" className="bg-slate-950 py-20">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="max-w-2xl">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-emerald-300">
            Choose a Pathway
          </p>
          <h2 className="mt-4 text-3xl font-semibold text-white sm:text-4xl">
            A journey shaped around what you&apos;re going through
          </h2>
          <p className="mt-4 text-base leading-8 text-slate-300">
            Instead of a generic experience, users can choose a path that feels relevant,
            supportive, and personal.
          </p>
        </div>

        <div className="mt-12 grid gap-6 md:grid-cols-2">
          {pathways.map((pathway, index) => (
            <div
              key={pathway.title}
              className="rounded-3xl border border-white/10 bg-gradient-to-br from-white/[0.04] to-white/[0.02] p-6"
            >
              <div className="flex items-center justify-between">
                <span className="rounded-full border border-emerald-400/20 bg-emerald-500/10 px-3 py-1 text-xs font-medium text-emerald-300">
                  Path {index + 1}
                </span>
                <div className="flex gap-2">
                  <span className="h-2.5 w-2.5 rounded-full bg-emerald-400" />
                  <span className="h-2.5 w-2.5 rounded-full bg-white/20" />
                  <span className="h-2.5 w-2.5 rounded-full bg-white/20" />
                </div>
              </div>

              <h3 className="mt-6 text-2xl font-semibold text-white">{pathway.title}</h3>
              <p className="mt-3 text-sm leading-7 text-slate-300">
                {pathway.description}
              </p>

              <div className="mt-6 flex items-center gap-3">
                <div className="h-3 flex-1 rounded-full bg-white/10">
                  <div className="h-3 w-1/3 rounded-full bg-emerald-400" />
                </div>
                <span className="text-xs text-slate-400">7-day track</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}