import { Flame, Target, BookMarked, NotebookPen } from "lucide-react";

const features = [
  {
    icon: Flame,
    title: "Daily Streaks",
    description: "Build momentum with consistent daily engagement and visible progress.",
  },
  {
    icon: Target,
    title: "Personalized Goals",
    description: "Choose a reading habit that fits your schedule and your growth.",
  },
  {
    icon: BookMarked,
    title: "Guided Sessions",
    description: "Read a verse, explore tafsir, and complete a focused daily journey.",
  },
  {
    icon: NotebookPen,
    title: "Reflections",
    description: "Capture thoughts, lessons, and reminders that matter to you.",
  },
];

export default function Features() {
  return (
    <section id="features" className="bg-slate-950 py-20">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div className="max-w-2xl">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-emerald-300">
              Core Features
            </p>
            <h2 className="mt-4 text-3xl font-semibold text-white sm:text-4xl">
              Everything centered around meaningful Quran engagement
            </h2>
          </div>

          <p className="max-w-xl text-sm leading-7 text-slate-300">
            A focused product experience for youth: modern, reflective, structured, and
            easy to return to every day.
          </p>
        </div>

        <div className="mt-12 grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
          {features.map((feature) => {
            const Icon = feature.icon;

            return (
              <div
                key={feature.title}
                className="group rounded-3xl border border-white/10 bg-white/[0.03] p-6 transition hover:-translate-y-1 hover:border-emerald-400/20 hover:bg-white/[0.05]"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/5 transition group-hover:bg-emerald-500/15">
                  <Icon className="h-5 w-5 text-emerald-400" />
                </div>

                <h3 className="mt-5 text-xl font-semibold text-white">{feature.title}</h3>
                <p className="mt-3 text-sm leading-7 text-slate-300">
                  {feature.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}