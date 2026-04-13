import Link from "next/link";

export const metadata = {
  title: "Callback | Quran Journey",
  description: "Callback route for sign-in redirects and authentication flow.",
};

export default function CallbackPage() {
  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <div className="mx-auto max-w-4xl px-6 py-20 lg:px-8">
        <h1 className="text-4xl font-bold text-white sm:text-5xl">Callback</h1>
        <p className="mt-6 text-slate-300 leading-8">
          This page is used to complete authentication redirects or other callback flows. If you were redirected here after signing in, the app is finalizing the process.
        </p>
        <div className="mt-10 rounded-3xl border border-white/10 bg-slate-900/80 p-8">
          <p className="text-slate-300 leading-7">
            If the page does not continue automatically, please return to the homepage or try signing in again.
          </p>
          <Link
            href="/"
            className="mt-6 inline-flex rounded-full bg-emerald-400 px-6 py-3 text-sm font-semibold text-slate-950 transition hover:bg-emerald-300"
          >
            Back to Home
          </Link>
        </div>
      </div>
    </main>
  );
}