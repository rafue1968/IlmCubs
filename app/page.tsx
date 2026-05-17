import Link from "next/link";
import type { Metadata } from "next";
import LoginButton from "./components/LoginButton";

export const metadata: Metadata = {
  title: "IlmCubs Homepage",
};

function FeatureBubble(props: {
  emoji: string;
  title: string;
  subtitle: string;
}) {
  return (
    <div className="rounded-[28px] border-4 border-white/60 bg-white/40 p-5 text-center shadow-[0_18px_45px_-30px_rgba(2,6,23,0.45)] backdrop-blur">
      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-white/70 text-3xl ring-2 ring-white/70">
        <span aria-hidden>{props.emoji}</span>
      </div>
      <p className="mt-4 text-lg font-extrabold text-slate-900">{props.title}</p>
      <p className="mt-1 text-sm font-semibold text-slate-700">{props.subtitle}</p>
    </div>
  );
}

function ActivityCard(props: {
  title: string;
  subtitle: string;
  emoji: string;
  href?: string;
  disabled?: boolean;
}) {
  const content = (
    <div
      className={[
        "group relative overflow-hidden rounded-[28px] border-4 p-6 text-left shadow-[0_18px_45px_-30px_rgba(2,6,23,0.55)] transition active:scale-[0.99]",
        props.disabled
          ? "cursor-not-allowed border-white/40 bg-white/30 opacity-80"
          : "border-white/60 bg-white/40 hover:bg-white/50",
      ].join(" ")}
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl">
            {props.title}
          </p>
          <p className="mt-2 text-sm font-semibold text-slate-700 sm:text-base">
            {props.subtitle}
          </p>
        </div>
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/60 text-3xl ring-2 ring-white/70">
          <span aria-hidden>{props.emoji}</span>
        </div>
      </div>

      <div className="mt-5 flex items-center justify-between gap-3">
        <span
          className={[
            "inline-flex items-center rounded-full px-4 py-2 text-sm font-extrabold",
            props.disabled ? "bg-slate-900/10 text-slate-700" : "bg-slate-900 text-white",
          ].join(" ")}
        >
          {props.disabled ? "Coming soon" : "Let’s play"}
        </span>
        <span className="text-sm font-bold text-slate-700">Ages 4–6</span>
      </div>

      <div className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-gradient-to-br from-yellow-300/55 via-pink-300/35 to-sky-300/55 blur-2xl" />
      <div className="pointer-events-none absolute -bottom-12 -left-12 h-44 w-44 rounded-full bg-gradient-to-br from-emerald-300/35 via-sky-300/25 to-violet-300/40 blur-2xl" />
    </div>
  );

  if (props.disabled || !props.href) return content;

  return (
    <Link
      href={props.href}
      className="block rounded-[32px] focus:outline-none focus:ring-4 focus:ring-white/60"
    >
      {content}
    </Link>
  );
}

export default function HomePage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-sky-200 via-emerald-100 to-yellow-100 px-5 py-8 sm:py-10">
      <div className="mx-auto max-w-6xl">
        <section className="rounded-[36px] border-4 border-white/60 bg-white/35 p-6 shadow-[0_30px_70px_-45px_rgba(2,6,23,0.55)] backdrop-blur sm:p-8">
          <div className="grid items-center gap-8 lg:grid-cols-2">
            <div>
              <p className="text-sm font-black uppercase tracking-[0.24em] text-slate-700">
                IlmCubs
              </p>

              <h1 className="mt-3 text-4xl font-extrabold tracking-tight text-slate-950 sm:text-5xl">
                Little hearts,
                <br />
                big Quran adventures 🌙
              </h1>

              <p className="mt-4 max-w-xl text-base font-semibold leading-7 text-slate-700 sm:text-lg">
                A joyful Quran learning space for children aged 4–6 with stories,
                matching games, kind choices, and cheerful learning moments.
              </p>

              <div className="mt-6 flex flex-wrap gap-3">
                <Link
                  href="/quizzes"
                  className="rounded-full bg-slate-900 px-6 py-3 text-sm font-extrabold text-white transition hover:bg-slate-800"
                >
                  Start Playing
                </Link>

                <Link
                  href="/storytime"
                  className="rounded-full bg-white/70 px-6 py-3 text-sm font-extrabold text-slate-900 ring-2 ring-white/70 transition hover:bg-white"
                >
                  Open StoryTime
                </Link>

                <LoginButton
                  href="/api/auth/login"
                  testId="home-quran-oauth-login"
                  className="inline-flex rounded-full border-4 border-white/70 bg-emerald-300 px-6 py-3 text-sm font-extrabold text-slate-950 shadow-[0_14px_30px_-20px_rgba(2,6,23,0.7)] transition hover:bg-emerald-200 focus:outline-none focus:ring-4 focus:ring-white/70"
                >
                  Sign in with Quran.com
                </LoginButton>
              </div>

              <div className="mt-6 flex flex-wrap gap-3">
                <span className="rounded-full bg-white/60 px-4 py-2 text-sm font-bold text-slate-700 ring-2 ring-white/70">
                  Ages 4–6
                </span>
                <span className="rounded-full bg-white/60 px-4 py-2 text-sm font-bold text-slate-700 ring-2 ring-white/70">
                  Quran-centered
                </span>
                <span className="rounded-full bg-white/60 px-4 py-2 text-sm font-bold text-slate-700 ring-2 ring-white/70">
                  Short & playful
                </span>
              </div>
            </div>

            <div className="relative flex min-h-[320px] items-center justify-center rounded-[30px] border-4 border-white/60 bg-white/35 p-6 shadow-inner">
              <div className="grid grid-cols-2 gap-4">
                <div className="flex h-28 w-28 items-center justify-center rounded-[28px] bg-white/70 text-5xl ring-2 ring-white/70 shadow">
                  📖
                </div>
                <div className="flex h-28 w-28 items-center justify-center rounded-[28px] bg-white/70 text-5xl ring-2 ring-white/70 shadow">
                  🧩
                </div>
                <div className="flex h-28 w-28 items-center justify-center rounded-[28px] bg-white/70 text-5xl ring-2 ring-white/70 shadow">
                  ⭐
                </div>
                <div className="flex h-28 w-28 items-center justify-center rounded-[28px] bg-white/70 text-5xl ring-2 ring-white/70 shadow">
                  🌈
                </div>
              </div>

              <div className="pointer-events-none absolute -right-8 -top-8 h-40 w-40 rounded-full bg-gradient-to-br from-yellow-300/60 via-pink-300/35 to-orange-300/45 blur-2xl" />
              <div className="pointer-events-none absolute -bottom-10 -left-10 h-44 w-44 rounded-full bg-gradient-to-br from-emerald-300/40 via-sky-300/30 to-violet-300/35 blur-2xl" />
            </div>
          </div>
        </section>

        <section className="mt-8 rounded-[36px] border-4 border-white/60 bg-white/35 p-6 shadow-[0_30px_70px_-45px_rgba(2,6,23,0.55)] backdrop-blur sm:p-8">
          <p className="text-sm font-black uppercase tracking-[0.24em] text-slate-700">
            Choose an activity
          </p>
          <h2 className="mt-2 text-3xl font-extrabold tracking-tight text-slate-950">
            Pick a game to play
          </h2>
          <p className="mt-2 text-base font-semibold text-slate-700 sm:text-lg">
            Simple Quran adventures made for little learners.
          </p>

          <div className="mt-8 grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
            <ActivityCard
              title="Match the Surah"
              subtitle="Read or hear a verse and choose the right surah name."
              emoji="🧩"
              href="/quizzes/match-the-surah"
            />

            <ActivityCard
              title="StoryTime"
              subtitle="Little stories and gentle Quran lessons for children."
              emoji="📖"
              href="/storytime"
            />

            <ActivityCard
              title="More Games"
              subtitle="New activities, rewards, and learning paths are coming soon."
              emoji="🎈"
              disabled
            />
          </div>
        </section>

        <section className="mt-8 rounded-[36px] border-4 border-white/60 bg-white/35 p-6 shadow-[0_30px_70px_-45px_rgba(2,6,23,0.55)] backdrop-blur sm:p-8">
          <p className="text-sm font-black uppercase tracking-[0.24em] text-slate-700">
            Why children enjoy it
          </p>
          <h2 className="mt-2 text-3xl font-extrabold tracking-tight text-slate-950">
            Learn with joy
          </h2>

          <div className="mt-8 grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
            <FeatureBubble
              emoji="👂"
              title="Listen"
              subtitle="Hear Quran words in a calm and friendly way."
            />
            <FeatureBubble
              emoji="🎯"
              title="Match"
              subtitle="Choose the right answer one step at a time."
            />
            <FeatureBubble
              emoji="💛"
              title="Learn"
              subtitle="Build love for the Quran with simple meanings."
            />
            <FeatureBubble
              emoji="⭐"
              title="Celebrate"
              subtitle="Cheer every correct answer and happy effort."
            />
          </div>
        </section>

        <section className="mt-8 rounded-[36px] border-4 border-white/60 bg-white/35 p-6 shadow-[0_30px_70px_-45px_rgba(2,6,23,0.55)] backdrop-blur sm:p-8">
          <div className="grid gap-6 lg:grid-cols-2">
            <div className="rounded-[28px] border-4 border-white/60 bg-white/45 p-6">
              <p className="text-sm font-black uppercase tracking-[0.24em] text-slate-700">
                Made for little learners
              </p>
              <h3 className="mt-2 text-2xl font-extrabold text-slate-950">
                Child-friendly by design
              </h3>
              <p className="mt-3 text-base font-semibold leading-7 text-slate-700">
                Large buttons, soft colors, simple prompts, and short activities
                make learning feel safe, playful, and easy to enjoy.
              </p>
            </div>

            <div className="rounded-[28px] border-4 border-white/60 bg-white/45 p-6">
              <p className="text-sm font-black uppercase tracking-[0.24em] text-slate-700">
                For families too
              </p>
              <h3 className="mt-2 text-2xl font-extrabold text-slate-950">
                Gentle and meaningful
              </h3>
              <p className="mt-3 text-base font-semibold leading-7 text-slate-700">
                Every activity is designed to help children grow in love,
                kindness, remembrance, and connection to the Quran.
              </p>
            </div>
          </div>

          <div className="mt-8 rounded-[28px] border-4 border-white/60 bg-gradient-to-r from-yellow-200/60 via-white/50 to-sky-200/60 p-6 text-center">
            <p className="text-2xl font-extrabold text-slate-950">
              Ready for today’s Quran adventure?
            </p>
            <p className="mt-2 text-base font-semibold text-slate-700">
              Pick a game and begin with a smile.
            </p>

            <div className="mt-5 flex flex-wrap justify-center gap-3">
              <Link
                href="/quizzes"
                className="rounded-full bg-slate-900 px-6 py-3 text-sm font-extrabold text-white transition hover:bg-slate-800"
              >
                Go to Quizzes
              </Link>
              <Link
                href="/storytime"
                className="rounded-full bg-white px-6 py-3 text-sm font-extrabold text-slate-900 ring-2 ring-white/70 transition hover:bg-white/90"
              >
                Start StoryTime
              </Link>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
