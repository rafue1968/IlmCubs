const categories = [
  {
    title: "Consistency",
    description: "Build the habit of opening and engaging with the Quran every day.",
  },
  {
    title: "Reading",
    description: "Spend a set number of minutes or verses reading daily.",
  },
  {
    title: "Reflection",
    description: "Pause after each session to think, write, and connect the meaning.",
  },
  {
    title: "Memorisation",
    description: "Set a target for memorising short surahs or selected ayat.",
  },
];

export default function GoalCategories() {
  return (
    <section className="rounded-3xl border border-white/10 bg-white/[0.03] p-6">
      <div className="max-w-2xl">
        <p className="text-sm font-medium uppercase tracking-[0.2em] text-emerald-300">
          Goal Categories
        </p>
        <h2 className="mt-2 text-2xl font-semibold text-white">
          Focus on what matters most to your journey
        </h2>
      </div>

      <div className="mt-6 grid gap-4 md:grid-cols-2">
        {categories.map((category) => (
          <div
            key={category.title}
            className="rounded-2xl border border-white/10 bg-slate-900/60 p-5"
          >
            <h3 className="text-lg font-semibold text-white">{category.title}</h3>
            <p className="mt-2 text-sm leading-7 text-slate-300">
              {category.description}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}