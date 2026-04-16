import Link from "next/link";

type Choice = {
  id: string;
  icon: string;
  latinName: string;
  arabicName: string;
};

const choices: Choice[] = [
  { id: "fil", icon: "🐘", latinName: "Al-Fil", arabicName: "الفيل" },
  { id: "nasr", icon: "🏆", latinName: "An-Nasr", arabicName: "النصر" },
  { id: "nas", icon: "👥", latinName: "An-Nas", arabicName: "الناس" },
  { id: "maun", icon: "🙌", latinName: "Al-Ma'un", arabicName: "الماعون" },
];

export default function MatchTheSurahPage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-sky-200 via-emerald-100 to-yellow-100 px-5 py-10">
      <div className="mx-auto w-full max-w-md">
        <div className="mb-4 flex items-center justify-between">
          <Link
            href="/quizzes"
            className="rounded-full bg-white/55 px-4 py-2 text-sm font-extrabold text-slate-800 ring-2 ring-white/70 backdrop-blur transition hover:bg-white/65"
          >
            ← Back
          </Link>
          <div className="rounded-full bg-white/55 px-4 py-2 text-sm font-extrabold text-slate-800 ring-2 ring-white/70 backdrop-blur">
            Match the Surah
          </div>
        </div>

        <div className="rounded-[34px] border-4 border-white/70 bg-white/35 p-5 shadow-[0_30px_80px_-55px_rgba(2,6,23,0.6)] backdrop-blur">
          <div className="rounded-[22px] border-2 border-emerald-300/60 bg-emerald-50/70 p-4 shadow-inner">
            <p className="text-center text-2xl font-bold text-emerald-900 leading-relaxed [font-family:var(--font-geist-sans)]">
              إِذَا جَاءَ نَصْرُ ٱللَّهِ وَٱلْفَتْحُ
            </p>
          </div>
          <div className="mt-4 rounded-[22px] border-2 border-emerald-300/60 bg-emerald-50/70 p-3">
            <div className="flex items-center gap-3">
              <button
                type="button"
                className="flex h-11 w-11 items-center justify-center rounded-full bg-emerald-700 text-white shadow-[0_14px_30px_-22px_rgba(2,6,23,0.65)] ring-2 ring-white/60 transition active:scale-[0.98]"
                aria-label="Listen"
              >
                <span className="ml-0.5 text-lg">▶</span>
              </button>

              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <p className="text-base font-extrabold text-emerald-900">Listen!</p>
                  <div className="flex gap-1">
                    {Array.from({ length: 6 }).map((_, i) => (
                      <span
                        key={i}
                        className="h-2 w-2 rounded-full bg-emerald-700/60"
                      />
                    ))}
                  </div>
                </div>
                <p className="mt-0.5 text-[11px] font-semibold text-emerald-900/80">
                  (Audio hookup coming next)
                </p>
              </div>
            </div>
          </div>
          <p className="mt-3 text-center text-sm font-semibold text-slate-700 italic">
            When the victory of Allah has come and the opening...
          </p>

          <div className="mt-5 rounded-[26px] border-3 border-white/70 bg-white/40 p-4">
            <p className="text-center text-xl font-extrabold text-slate-900">
              Which surah is this?{" "}
              <span className="inline-block rounded-xl bg-orange-200 px-2 py-0.5 text-slate-900">
                Pick the right name!
              </span>
            </p>

            <div className="mt-4 grid grid-cols-2 gap-4">
              {choices.map((c) => (
                <button
                  key={c.id}
                  type="button"
                  className="rounded-[22px] border-4 border-indigo-200/80 bg-indigo-50/80 p-4 text-left shadow-[0_18px_40px_-30px_rgba(2,6,23,0.6)] transition hover:bg-indigo-50 active:scale-[0.99]"
                >
                  <div className="flex items-center justify-center">
                    <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white/70 text-2xl ring-2 ring-indigo-200/80">
                      <span aria-hidden>{c.icon}</span>
                    </div>
                  </div>
                  <p className="mt-3 text-center text-lg font-extrabold text-slate-900">
                    {c.latinName}
                  </p>
                  <p className="mt-0.5 text-center text-sm font-bold text-purple-700">
                    {c.arabicName}
                  </p>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

