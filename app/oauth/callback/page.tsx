"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

const REDIRECT_URI =
  "https://quran-companion-real-life-guidance-omega.vercel.app/oauth/callback";

export default function OAuthCallbackPage() {
  const [message, setMessage] = useState("Logging you in...");

  useEffect(() => {
    async function completeLogin() {
      const params = new URLSearchParams(window.location.search);
      const code = params.get("code");
      const returnedState = params.get("state");

      const storedState = sessionStorage.getItem("quran_oauth_state");
      const codeVerifier = sessionStorage.getItem("quran_pkce_code_verifier");

      if (!code) {
        setMessage("Missing authorization code.");
        return;
      }

      if (!returnedState || !storedState || returnedState !== storedState) {
        setMessage("Invalid OAuth state.");
        return;
      }

      if (!codeVerifier) {
        setMessage("Missing PKCE code verifier.");
        return;
      }

      try {
        const res = await fetch("/api/auth/callback", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "same-origin",
          body: JSON.stringify({
            code,
            codeVerifier,
            redirectUri: REDIRECT_URI,
          }),
        });

        const data = await res.json();

        if (!res.ok || !data?.success) {
          throw new Error(data?.message || "Failed to complete sign-in");
        }

        sessionStorage.removeItem("quran_oauth_state");
        sessionStorage.removeItem("quran_pkce_code_verifier");

        window.location.href = "/";
      } catch (error) {
        setMessage(
          error instanceof Error ? error.message : "Login failed unexpectedly."
        );
      }
    }

    completeLogin();
  }, []);

  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <div className="mx-auto max-w-4xl px-6 py-20 lg:px-8">
        <h1 className="text-4xl font-bold sm:text-5xl">Signing you in...</h1>
        <p className="mt-6 leading-8 text-slate-300">{message}</p>

        <div className="mt-10 rounded-3xl border border-white/10 bg-slate-900/80 p-8">
          <p className="leading-7 text-slate-300">
            If the page does not continue automatically, go back home and try
            signing in again.
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