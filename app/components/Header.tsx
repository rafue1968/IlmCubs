"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Menu } from "lucide-react";
import { useState } from "react";
import { useAuth } from "../providers/AuthProvider";
import LoginButton from "./LoginButton";

const navLinks = [
  { label: "How It Works", href: "#how-it-works" },
  { label: "Features", href: "#features" },
  { label: "Pathways", href: "#pathways" },
  { label: "For Who", href: "#audience" },
];

export default function Header() {
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const { user, loading, signOut } = useAuth();

  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-slate-950/80 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4 lg:px-8">
        <Link href="/" className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-emerald-500/15 ring-1 ring-emerald-400/30">
            <span className="text-lg font-bold text-emerald-400">I</span>
          </div>
          <div>
            <p className="text-sm font-semibold tracking-wide text-white">IlmCubs</p>
            <p className="text-xs text-slate-400">Grow knowledge with the Quran</p>
          </div>
        </Link>

        <nav className="hidden items-center gap-8 md:flex">
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="text-sm text-slate-300 transition hover:text-white"
            >
              {link.label}
            </a>
          ))}
        </nav>

        <div className="hidden items-center gap-3 md:flex">
          {!loading && user ? (
            <>
              <span className="hidden max-w-[220px] truncate text-sm text-slate-300 lg:inline">
                Signed in as{" "}
                <span className="font-medium text-white">
                  {user.displayName || user.email}
                </span>
              </span>
              <button
                type="button"
                onClick={async () => {
                  await signOut();
                  router.push("/");
                }}
                className="rounded-full border border-white/15 bg-white/5 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-white/10"
              >
                Sign out
              </button>
            </>
          ) : (
            <>
              <LoginButton
                className="rounded-full border border-white/15 bg-white/5 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-white/10"
                onClickStart={() => setOpen(false)} 
              />
              <Link
                href="/register"
                className="rounded-full bg-white px-5 py-2.5 text-sm font-medium text-slate-950 transition hover:bg-emerald-400"
              >
                Create account
              </Link>
            </>
          )}
        </div>

        <button
          type="button"
          aria-label="Toggle menu"
          onClick={() => setOpen((prev) => !prev)}
          className="rounded-xl border border-white/10 p-2 text-slate-200 md:hidden"
        >
          <Menu className="h-5 w-5" />
        </button>
      </div>

      {open && (
        <div className="border-t border-white/10 bg-slate-950 md:hidden">
          <div className="mx-auto flex max-w-7xl flex-col gap-4 px-6 py-5">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="text-sm text-slate-300 transition hover:text-white"
                onClick={() => setOpen(false)}
              >
                {link.label}
              </a>
            ))}

            {!loading && user ? (
              <>
                <p className="mt-2 text-sm text-slate-300">
                  Signed in as{" "}
                  <span className="font-medium text-white">
                    {user.displayName || user.email}
                  </span>
                </p>
                <button
                  type="button"
                  className="inline-flex w-fit rounded-full border border-white/15 bg-white/5 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-white/10"
                  onClick={async () => {
                    await signOut();
                    setOpen(false);
                    router.push("/");
                  }}
                >
                  Sign out
                </button>
              </>
            ) : (
              <>
                <LoginButton 
                  className="mt-2 inline-flex w-fit rounded-full border border-white/15 bg-white/5 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-white/10"
                  onClickStart={() => setOpen(false)}  
                />
                <Link
                  href="/register"
                  className="inline-flex w-fit rounded-full bg-white px-5 py-2.5 text-sm font-medium text-slate-950 transition hover:bg-emerald-400"
                  onClick={() => setOpen(false)}
                >
                  Create account
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}