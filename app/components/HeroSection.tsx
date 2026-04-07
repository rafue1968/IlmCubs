import { ArrowRight, Sparkles, Flame, BookOpenText } from "lucide-react";

function StatCard({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-md">
      <p className="text-xs uppercase tracking-[0.2em] text-slate-400">{label}</p>
      <p className="mt-2 text-xl font-semibold text-white">{value}</p>
    </div>
  );
}

function AppPreviewCard() {
  return (
    <div className="relative mx-auto w-full max-w-md">
      <div className="absolute -left-8 top-10 h-32 w-32 rounded-full bg-emerald-500/20 blur-3xl" />
      <div className="absolute -right-6 bottom-6 h-40 w-40 rounded-full bg-white/10 blur-3xl" />

      <div className="relative overflow-hidden rounded-[28px] border border-white/10 bg-slate-900/80 shadow-2xl shadow-black/30">
        <div className="border-b border-white/10 px-5 py-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-400">Today&apos;s Journey</p>
              <h3 className="text-lg font-semibold text-white">Hope & Healing</h3>
            </div>
            <div className="rounded-full bg-emerald-500/15 px-3 py-1 text-xs font-medium text-emerald-300">
              Day 4
            </div>
          </div>
        </div>

        <div className="space-y-5 p-5">
          <div className="rounded-2xl bg-white/5 p-4">
            <p className="mb-2 text-xs uppercase tracking-[0.18em] text-emerald-300">
              Verse of the day
            </p>
            <p className="text-right text-xl leading-9 text-white">
              فَإِنَّ مَعَ ٱلْعُسْرِ يُسْرًا
            </p>
            <p className="mt-3 text-sm text-slate-300">
              “Indeed, with hardship comes ease.”
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <StatCard label="Current Streak" value="12 days" />
            <StatCard label="Weekly Goal" value="4 / 5 done" />
          </div>

          <div className="rounded-2xl border border-emerald-400/20 bg-emerald-500/10 p-4">
            <p className="text-sm font-medium text-white">Reflection Prompt</p>
            <p className="mt-2 text-sm leading-6 text-slate-300">
              Where in your life do you need to remember that ease can come after struggle?
            </p>
          </div>

          <button className="flex w-full items-center justify-center gap-2 rounded-2xl bg-white px-4 py-3 text-sm font-semibold text-slate-950 transition hover:bg-emerald-400">
            Continue Session
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

export default function HeroSection() {
  return (
    <section className="relative overflow-hidden bg-slate-950">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(16,185,129,0.18),_transparent_30%),radial-gradient(circle_at_bottom_right,_rgba(255,255,255,0.08),_transparent_25%)]" />
      <div className="mx-auto grid max-w-7xl gap-14 px-6 py-20 lg:grid-cols-2 lg:px-8 lg:py-28">
        <div className="relative z-10 flex flex-col justify-center">
          <div className="mb-6 inline-flex w-fit items-center gap-2 rounded-full border border-emerald-400/20 bg-emerald-500/10 px-4 py-2 text-sm text-emerald-300">
            <Sparkles className="h-4 w-4" />
            Built for a lasting Quran habit
          </div>

          <h1 className="max-w-2xl text-4xl font-bold tracking-tight text-white sm:text-5xl lg:text-6xl">
            Build a daily connection with the Quran
          </h1>

          <p className="mt-6 max-w-xl text-base leading-8 text-slate-300 sm:text-lg">
            A modern, guided Quran journey for youth — combining verses, tafsir,
            reflection, streaks, and goals into a daily habit that lasts beyond Ramadan.
          </p>

          <div className="mt-8 flex flex-col gap-4 sm:flex-row">
            <a
              href="#cta"
              className="inline-flex items-center justify-center gap-2 rounded-full bg-white px-6 py-3.5 text-sm font-semibold text-slate-950 transition hover:bg-emerald-400"
            >
              Start Your Journey
              <ArrowRight className="h-4 w-4" />
            </a>

            <a
              href="#features"
              className="inline-flex items-center justify-center rounded-full border border-white/15 bg-white/5 px-6 py-3.5 text-sm font-medium text-white transition hover:bg-white/10"
            >
              Explore Features
            </a>
          </div>

          <div className="mt-10 grid max-w-lg grid-cols-1 gap-3 sm:grid-cols-3">
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
              <Flame className="h-5 w-5 text-emerald-400" />
              <p className="mt-3 text-sm font-medium text-white">Daily streaks</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
              <BookOpenText className="h-5 w-5 text-emerald-400" />
              <p className="mt-3 text-sm font-medium text-white">Guided ayah sessions</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
              <Sparkles className="h-5 w-5 text-emerald-400" />
              <p className="mt-3 text-sm font-medium text-white">Reflect with meaning</p>
            </div>
          </div>
        </div>

        <div className="relative z-10 flex items-center justify-center">
          <AppPreviewCard />
        </div>
      </div>
    </section>
  );
}