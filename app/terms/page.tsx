import Link from "next/link";

export const metadata = {
  title: "Terms of Service | Quran Journey",
  description: "Terms of service for Quran Journey, describing educational use and responsible app use.",
};

export default function TermsPage() {
  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <div className="mx-auto max-w-5xl px-6 py-16 lg:px-8">
        <Link href="/" className="text-sm text-emerald-400 hover:text-emerald-300">Home</Link>
        <h1 className="mt-6 text-4xl font-bold tracking-tight text-white sm:text-5xl">
          Terms of Service
        </h1>
        <p className="mt-6 max-w-3xl text-slate-300 leading-8">
          Quran Journey is intended as an educational experience. These terms describe how the app should be used and what to expect during the current stage of development.
        </p>

        <section className="mt-12 space-y-8">
          <div className="space-y-4 rounded-3xl border border-white/10 bg-slate-900/80 p-8">
            <h2 className="text-2xl font-semibold text-white">Educational use only</h2>
            <p className="text-slate-300 leading-7">
              This app is provided for educational purposes and is meant to support learning about the Quran. It should not be used as a substitute for formal instruction or guidance from trusted adults.
            </p>
          </div>

          <div className="space-y-4 rounded-3xl border border-white/10 bg-slate-900/80 p-8">
            <h2 className="text-2xl font-semibold text-white">Responsible use</h2>
            <p className="text-slate-300 leading-7">
              Users must use the app responsibly and respectfully. Parents, guardians, and educators should supervise children to ensure the app is used in a positive way.
            </p>
          </div>

          <div className="space-y-4 rounded-3xl border border-white/10 bg-slate-900/80 p-8">
            <h2 className="text-2xl font-semibold text-white">Development stage notices</h2>
            <p className="text-slate-300 leading-7">
              The service may change as the app is refined, especially during hackathon or demo stages. Features, content, and design may be updated without advance notice as we improve the learning experience.
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}
