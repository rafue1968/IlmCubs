"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import LoginButton from "../../components/LoginButton";

export default function OAuthCallbackPage() {
  const [message, setMessage] = useState("Logging you in...");

  useEffect(() => {
    async function completeLogin() {
      const params = new URLSearchParams(window.location.search);
      const code = params.get("code");
      const returnedState = params.get("state");
      const providerError = params.get("error");
      const providerErrorDescription = params.get("error_description");

      console.info("[oauth.callback.page] OAuth callback received", {
        callbackUrl: window.location.href.replace(
          /([?&](code|state)=)[^&]+/g,
          "$1[redacted]"
        ),
        queryParamNames: Array.from(params.keys()),
        hasCode: Boolean(code),
        hasState: Boolean(returnedState),
        providerError,
      });

      if (providerError) {
        setMessage(
          providerErrorDescription ||
            `OAuth provider returned an error: ${providerError}`
        );
        return;
      }

      if (!code) {
        setMessage("OAuth provider returned without an authorization code.");
        return;
      }

      if (!returnedState) {
        setMessage("OAuth provider returned without state.");
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
            state: returnedState,
          }),
        });

        const data = await res.json().catch(() => null);

        if (!res.ok || !data?.success) {
          const details =
            data?.upstream?.error_description ||
            data?.upstream?.error ||
            data?.message ||
            "Failed to complete sign-in";
          throw new Error(details);
        }

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
        <h1 className="text-4xl font-bold sm:text-5xl">Connecting your account...</h1>
        <p className="mt-6 leading-8 text-slate-300">{message}</p>

        <div className="mt-10 rounded-3xl border border-white/10 bg-slate-900/80 p-8">
          <p className="leading-7 text-slate-300">
            If the page does not continue automatically, go back home and try
            connecting again.
          </p>

          <div className="mt-6 flex flex-wrap gap-3">
            <LoginButton className="inline-flex rounded-full bg-emerald-400 px-6 py-3 text-sm font-semibold text-slate-950 transition hover:bg-emerald-300">
              Try sign in again
            </LoginButton>

            <Link
              href="/"
              className="inline-flex rounded-full border border-white/15 bg-white/5 px-6 py-3 text-sm font-semibold text-white transition hover:bg-white/10"
            >
              Back to Home
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
