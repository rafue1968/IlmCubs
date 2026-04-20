"use client";

import { useAuth } from "../providers/AuthProvider";
import LoginButton from "../components/LoginButton";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function ConnectClient() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-400 mx-auto"></div>
          <p className="mt-4 text-slate-300">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <div className="mx-auto max-w-4xl px-6 py-20 lg:px-8">
        <h1 className="text-4xl font-bold sm:text-5xl">Connect Your Account</h1>
        <p className="mt-6 leading-8 text-slate-300">
          Welcome {user.displayName || user.email}! To access your Quran progress,
          streaks, and bookmarks, please connect your Quran.com account.
        </p>

        <div className="mt-10 rounded-3xl border border-white/10 bg-slate-900/80 p-8">
          <h2 className="text-xl font-semibold mb-4">Connect Quran.com Account</h2>
          <p className="leading-7 text-slate-300 mb-6">
            This allows you to sync your reading progress, streaks, and bookmarks
            across devices.
          </p>

          <LoginButton
            className="inline-flex rounded-full bg-emerald-400 px-6 py-3 text-sm font-semibold text-slate-950 transition hover:bg-emerald-300"
            onClickStart={() => {}}
          />

          <div className="mt-6 pt-6 border-t border-white/10">
            <p className="text-sm text-slate-400">
              Don't have a Quran.com account?{" "}
              <a
                href="https://quran.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-emerald-400 hover:text-emerald-300"
              >
                Create one here
              </a>
            </p>
          </div>
        </div>

        <div className="mt-8 text-center">
          <button
            onClick={() => router.push("/")}
            className="text-slate-400 hover:text-slate-200 underline"
          >
            Skip for now
          </button>
        </div>
      </div>
    </main>
  );
}