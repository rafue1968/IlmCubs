import { BookOpen, Brain, Flame } from "lucide-react";

const steps = [
  {
    icon: BookOpen,
    title: "Read a short passage",
    description:
      "Engage with carefully selected verses, translations, and a focused daily session.",
  },
  {
    icon: Brain,
    title: "Understand and reflect",
    description:
      "See concise tafsir and reflection prompts that connect Quranic meaning to daily life.",
  },
  {
    icon: Flame,
    title: "Stay consistent",
    description:
      "Build streaks, hit goals, and track your journey with visible daily progress.",
  },
];

export default function HowItWorks() {
  return (
    <section id="how-it-works" className="bg-slate-950 py-20">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="max-w-2xl">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-emerald-300">
            How It Works
          </p>
          <h2 className="mt-4 text-3xl font-semibold text-white sm:text-4xl">
            A simple loop designed to build a lasting habit
          </h2>
          <p className="mt-4 text-base leading-8 text-slate-300">
            The experience is built around small, meaningful daily actions that are easy
            to return to.
          </p>
        </div>

        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {steps.map((step, index) => {
            const Icon = step.icon;

            return (
              <div
                key={step.title}
                className="rounded-3xl border border-white/10 bg-white/[0.03] p-6"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-500/15 ring-1 ring-emerald-400/20">
                  <Icon className="h-5 w-5 text-emerald-400" />
                </div>

                <div className="mt-6 flex items-center gap-3">
                  <span className="text-sm font-medium text-emerald-300">
                    0{index + 1}
                  </span>
                  <div className="h-px flex-1 bg-white/10" />
                </div>

                <h3 className="mt-5 text-xl font-semibold text-white">{step.title}</h3>
                <p className="mt-3 text-sm leading-7 text-slate-300">
                  {step.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}