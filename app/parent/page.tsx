import Link from "next/link";
import type { Metadata } from "next";
import ParentProgressPanel from "../components/ParentProgressPanel";

export const metadata: Metadata = {
  title: "Parent Progress - IlmCubs",
};

export default function ParentPage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-sky-200 via-emerald-100 to-yellow-100 px-5 py-10">
      <div className="mx-auto w-full max-w-6xl">
        <Link
          href="/"
          className="mb-5 inline-flex rounded-full bg-white/60 px-4 py-2 text-sm font-extrabold text-slate-800 ring-2 ring-white/70 transition hover:bg-white"
        >
          Back to home
        </Link>
        <ParentProgressPanel />
      </div>
    </main>
  );
}
