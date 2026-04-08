const audience = [
  "Students building a Quran habit",
  "Young professionals with busy routines",
  "Beginners seeking a simpler entry point",
  "Anyone struggling with consistency",
];

export default function Audience() {
  return (
    <section id="audience" className="bg-slate-950 py-20">
      <div className="mx-auto grid max-w-7xl gap-8 px-6 lg:grid-cols-[1.15fr_0.85fr] lg:px-8">
        <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-8">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-emerald-300">
            Who It&apos;s For
          </p>
          <h2 className="mt-4 text-3xl font-semibold text-white sm:text-4xl">
            Built especially for youth, but beneficial for anyone
          </h2>
          <p className="mt-4 max-w-2xl text-base leading-8 text-slate-300">
            The tone, structure, and design are made to feel relevant, welcoming, and
            easy to use without losing depth or sincerity.
          </p>
        </div>

        <div className="grid gap-4">
          {audience.map((item) => (
            <div
              key={item}
              className="rounded-2xl border border-white/10 bg-white/[0.03] p-5 text-sm text-slate-200"
            >
              {item}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}