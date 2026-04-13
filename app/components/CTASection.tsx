import { ArrowRight } from "lucide-react";

export default function CTASection() {
  return (
    <section id="cta" className="bg-slate-950 py-20">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="relative overflow-hidden rounded-[32px] border border-white/10 bg-gradient-to-br from-emerald-500/20 via-slate-900 to-slate-950 p-8 sm:p-10 lg:p-14">
          <div className="absolute -right-16 -top-16 h-48 w-48 rounded-full bg-white/10 blur-3xl" />
          <div className="absolute -bottom-16 -left-16 h-56 w-56 rounded-full bg-emerald-500/20 blur-3xl" />

          <div className="relative z-10 max-w-3xl">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-emerald-300">
              Start Today
            </p>
            <h2 className="mt-4 text-3xl font-semibold text-white sm:text-4xl">
              Build a relationship with the Quran that lasts beyond Ramadan
            </h2>
            <p className="mt-4 text-base leading-8 text-slate-200">
              Begin a daily journey with guided verses, reflection, and progress that
              helps you return tomorrow.
            </p>

            <div className="mt-8 flex flex-col gap-4 sm:flex-row">
              <a
                href="/signup"
                className="inline-flex items-center justify-center gap-2 rounded-full bg-white px-6 py-3.5 text-sm font-semibold text-slate-950 transition hover:bg-emerald-400"
              >
                Start Your Journey
                <ArrowRight className="h-4 w-4" />
              </a>

              <a
                href="/demo"
                className="inline-flex items-center justify-center rounded-full border border-white/15 bg-white/5 px-6 py-3.5 text-sm font-medium text-white transition hover:bg-white/10"
              >
                View Demo
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}