import Link from "next/link";
import ChildNavigation from "../components/ChildNavigation";

function QuizCard(props: {
  title: string;
  subtitle: string;
  emoji: string;
  href?: string;
  disabled?: boolean;
}) {
  const content = (
    <div
      className={[
        "group relative w-full overflow-hidden rounded-[28px] border-4 p-6 text-left shadow-[0_18px_45px_-30px_rgba(2,6,23,0.55)]",
        "transition active:scale-[0.99]",
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
          <p className="mt-1 text-sm font-semibold text-slate-700 sm:text-base">
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
        <span className="text-sm font-bold text-slate-700">
          Ages 4–6
        </span>
      </div>

      <div className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-gradient-to-br from-yellow-300/55 via-pink-300/35 to-sky-300/55 blur-2xl" />
      <div className="pointer-events-none absolute -bottom-12 -left-12 h-44 w-44 rounded-full bg-gradient-to-br from-emerald-300/35 via-sky-300/25 to-violet-300/40 blur-2xl" />
    </div>
  );

  if (props.disabled || !props.href) return content;
  return (
    <Link href={props.href} className="block focus:outline-none focus:ring-4 focus:ring-white/60 rounded-[32px]">
      {content}
    </Link>
  );
}

export default function QuizzesPage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-sky-200 via-emerald-100 to-yellow-100 px-5 py-10">
      <div className="mx-auto max-w-4xl">
        <ChildNavigation />
        <div className="rounded-[34px] border-4 border-white/60 bg-white/35 p-7 shadow-[0_30px_70px_-45px_rgba(2,6,23,0.55)] backdrop-blur">
          <p className="text-sm font-black uppercase tracking-widest text-slate-700">
            Quizzes
          </p>
          <h1 className="mt-2 text-3xl font-extrabold tracking-tight text-slate-950 sm:text-4xl">
            Pick a game to play
          </h1>
          <p className="mt-2 text-base font-semibold text-slate-700 sm:text-lg">
            Short, joyful Quran games made for little learners.
          </p>

          <div className="mt-8 grid gap-5 sm:grid-cols-2">
            <QuizCard
              title="Match the Surah"
              subtitle="Hear a verse and choose the right surah name."
              emoji="🧩"
              href="/quizzes/match-the-surah"
            />
            <QuizCard
              title="Story Time"
              subtitle="Little stories and lessons from the Quran."
              emoji="📖"
              href="/storytime"
            />
          </div>

          <div className="mt-7 rounded-2xl border-2 border-white/60 bg-white/35 p-4">
            <p className="text-sm font-bold text-slate-800">
              Tip
            </p>
            <p className="mt-1 text-sm font-semibold text-slate-700">
              Keep it fun: one question at a time, lots of cheering, and repeat your favorites.
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}

