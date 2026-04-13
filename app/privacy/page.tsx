import Link from "next/link";

export const metadata = {
  title: "Privacy Policy | Quran Journey",
  description: "Privacy policy for Quran Journey, explaining data collection and child-friendly practices.",
};

export default function PrivacyPage() {
  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <div className="mx-auto max-w-5xl px-6 py-16 lg:px-8">
        <Link href="/" className="text-sm text-emerald-400 hover:text-emerald-300">Home</Link>
        <h1 className="mt-6 text-4xl font-bold tracking-tight text-white sm:text-5xl">
          Privacy Policy
        </h1>
        <p className="mt-6 max-w-3xl text-slate-300 leading-8">
          Quran Journey is designed for learning and enjoyment. We take privacy seriously, especially for younger users, and keep data collection minimal and transparent.
        </p>

        <section className="mt-12 space-y-8">
          <div className="space-y-4 rounded-3xl border border-white/10 bg-slate-900/80 p-8">
            <h2 className="text-2xl font-semibold text-white">What data we collect</h2>
            <p className="text-slate-300 leading-7">
              We collect only the information needed to support the app experience. This includes non-personal usage data such as session behavior, device type, and anonymous learning progress. If you register an account, we may also store your email and chosen display name.
            </p>
          </div>

          <div className="space-y-4 rounded-3xl border border-white/10 bg-slate-900/80 p-8">
            <h2 className="text-2xl font-semibold text-white">Why we collect it</h2>
            <p className="text-slate-300 leading-7">
              The data helps us improve the app, keep it stable, and make learning smoother for children and families. We use it to provide educational features, fix issues, and ensure the app works safely.
            </p>
          </div>

          <div className="space-y-4 rounded-3xl border border-white/10 bg-slate-900/80 p-8">
            <h2 className="text-2xl font-semibold text-white">Progress, bookmarks, and child activity</h2>
            <p className="text-slate-300 leading-7">
              We do not track or store sensitive child activity. If a user signs in, we may save simple learning progress and bookmarks so the experience can continue across visits. This helps keep the focus on education, not surveillance.
            </p>
          </div>

          <div className="space-y-4 rounded-3xl border border-white/10 bg-slate-900/80 p-8">
            <h2 className="text-2xl font-semibold text-white">Contact us</h2>
            <p className="text-slate-300 leading-7">
              If you have questions or concerns about privacy, please contact us through the app support channels or send a message to <span className="text-white">privacy@quran-journey.example</span>. We will respond as quickly as possible.
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}