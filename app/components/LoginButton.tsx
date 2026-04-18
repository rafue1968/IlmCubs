"use client";

import { generatePkce, randomString } from "@/app/lib/pkce";

type Props = {
  className?: string;
  onClickStart?: () => void;
};

export default function LoginButton({ className, onClickStart }: Props) {
  async function handleLogin() {
    onClickStart?.();

    const { codeVerifier, codeChallenge } = await generatePkce();
    const state = randomString(32);

    sessionStorage.setItem("quran_pkce_code_verifier", codeVerifier);
    sessionStorage.setItem("quran_oauth_state", state);

    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        codeChallenge,
        state,
        redirectUri: "https://ilm-cubs.vercel.app/oauth/callback",
      }),
    });

    const data = await res.json();

    if (!res.ok || !data?.success || !data?.url) {
      throw new Error(data?.message || "Failed to start login");
    }

    window.location.href = data.url;
  }

  return (
    <button
      type="button"
      onClick={() => {
        handleLogin().catch((err) => {
          console.error(err);
          alert("Login failed. Please try again.");
        });
      }}
      className={className}
    >
      Sign in
    </button>
  );
}