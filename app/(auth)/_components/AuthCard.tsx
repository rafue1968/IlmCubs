"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { loginWithEmail, registerWithEmail } from "../../lib/authClient";

type Mode = "login" | "register";

function validateEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
}

export default function AuthCard({ mode }: { mode: Mode }) {
  const isRegister = mode === "register";
  const router = useRouter();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const errors = useMemo(() => {
    const e: Record<string, string> = {};

    if (isRegister && name.trim().length < 2) e.name = "Enter your name.";
    if (!validateEmail(email)) e.email = "Enter a valid email address.";
    if (password.length < 8) e.password = "Use at least 8 characters.";
    if (isRegister && confirm !== password) e.confirm = "Passwords do not match.";

    return e;
  }, [confirm, email, isRegister, name, password]);

  const canSubmit = Object.keys(errors).length === 0 && !submitting;

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMessage(null);

    if (!canSubmit) {
      setMessage("Please fix the errors above and try again.");
      return;
    }

    setSubmitting(true);
    try {
      if (isRegister) {
        await registerWithEmail({
          email,
          password,
          displayName: name.trim(),
        });
        router.push("/login");
      } else {
        await loginWithEmail({ email, password });
        router.push("/connect");
      }
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "Authentication failed.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="rounded-3xl border border-white/10 bg-white/5 p-7 shadow-2xl shadow-black/30 backdrop-blur-xl sm:p-8">
      <div className="mb-7">
        <p className="text-xs uppercase tracking-[0.22em] text-emerald-300/90">
          Quran Journey
        </p>
        <h1 className="mt-2 text-2xl font-semibold tracking-tight text-white">
          {isRegister ? "Create your account" : "Welcome back"}
        </h1>
        <p className="mt-2 text-sm leading-6 text-slate-300">
          {isRegister
            ? "Start a daily habit with guided Quran sessions, goals, and reflection."
            : "Sign in to continue your streak and daily sessions."}
        </p>
      </div>

      <form onSubmit={onSubmit} className="space-y-4">
        {isRegister && (
          <Field
            label="Name"
            value={name}
            onChange={setName}
            placeholder="Your name"
            error={errors.name}
            autoComplete="name"
          />
        )}

        <Field
          label="Email"
          value={email}
          onChange={setEmail}
          placeholder="you@example.com"
          error={errors.email}
          autoComplete="email"
          inputMode="email"
        />

        <Field
          label="Password"
          type="password"
          value={password}
          onChange={setPassword}
          placeholder="••••••••"
          error={errors.password}
          autoComplete={isRegister ? "new-password" : "current-password"}
        />

        {isRegister && (
          <Field
            label="Confirm password"
            type="password"
            value={confirm}
            onChange={setConfirm}
            placeholder="••••••••"
            error={errors.confirm}
            autoComplete="new-password"
          />
        )}

        <button
          type="submit"
          disabled={!canSubmit}
          className="mt-2 inline-flex w-full items-center justify-center rounded-2xl bg-white px-4 py-3 text-sm font-semibold text-slate-950 transition hover:bg-emerald-400 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {submitting
            ? isRegister
              ? "Creating account…"
              : "Signing in…"
            : isRegister
            ? "Create account"
            : "Sign in"}
        </button>

        {message && (
          <p className="rounded-2xl border border-white/10 bg-slate-950/40 px-4 py-3 text-sm text-slate-200">
            {message}
          </p>
        )}

        <div className="flex items-center justify-between gap-3 pt-1 text-sm text-slate-300">
          <p>
            {isRegister ? "Already have an account?" : "New here?"}{" "}
            <Link
              href={isRegister ? "/login" : "/register"}
              className="font-medium text-emerald-300 hover:text-emerald-200"
            >
              {isRegister ? "Sign in" : "Create an account"}
            </Link>
          </p>

          <Link href="/" className="text-slate-400 hover:text-slate-200">
            Back home
          </Link>
        </div>
      </form>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  error,
  type = "text",
  placeholder,
  autoComplete,
  inputMode,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  error?: string;
  type?: string;
  placeholder?: string;
  autoComplete?: string;
  inputMode?: React.HTMLAttributes<HTMLInputElement>["inputMode"];
}) {
  const id = label.toLowerCase().replace(/\s+/g, "-");
  const hasError = Boolean(error);

  return (
    <div>
      <label htmlFor={id} className="mb-1.5 block text-sm text-slate-200">
        {label}
      </label>
      <input
        id={id}
        type={type}
        value={value}
        placeholder={placeholder}
        autoComplete={autoComplete}
        inputMode={inputMode}
        onChange={(e) => onChange(e.target.value)}
        className={[
          "w-full rounded-2xl border bg-slate-950/40 px-4 py-3 text-sm text-white outline-none transition",
          hasError
            ? "border-rose-400/40 ring-1 ring-rose-400/20 focus:border-rose-300/60"
            : "border-white/10 focus:border-emerald-400/40 focus:ring-1 focus:ring-emerald-400/20",
          "placeholder:text-slate-500",
        ].join(" ")}
      />
      {hasError && <p className="mt-1.5 text-xs text-rose-200">{error}</p>}
    </div>
  );
}
