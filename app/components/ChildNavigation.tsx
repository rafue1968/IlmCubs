import Link from "next/link";
import { BookOpen, Home, Map, Puzzle, ShieldCheck, Sparkles } from "lucide-react";

const navItems = [
  {
    href: "/",
    label: "Home",
    description: "Start again",
    Icon: Home,
  },
  {
    href: "/quizzes",
    label: "Games",
    description: "Pick a challenge",
    Icon: Map,
  },
  {
    href: "/quizzes/match-the-surah",
    label: "Match",
    description: "Surah game",
    Icon: Puzzle,
  },
  {
    href: "/storytime",
    label: "StoryTime",
    description: "Listen and learn",
    Icon: BookOpen,
  },
  {
    href: "/parent",
    label: "Gems",
    description: "Saved progress",
    Icon: Sparkles,
  },
];

export default function ChildNavigation() {
  return (
    <nav
      aria-label="Learning navigation"
      className="mb-5 rounded-[28px] border-4 border-white/60 bg-white/35 p-3 shadow-[0_20px_50px_-40px_rgba(2,6,23,0.55)] backdrop-blur"
    >
      <div className="mb-3 flex items-center gap-2 px-2 text-sm font-black uppercase tracking-[0.18em] text-slate-700">
        <ShieldCheck className="h-4 w-4 text-emerald-600" aria-hidden="true" />
        Learning paths
      </div>

      <div className="grid gap-2 sm:grid-cols-3 lg:grid-cols-5">
        {navItems.map(({ href, label, description, Icon }) => (
          <Link
            key={href}
            href={href}
            className="group rounded-[20px] bg-white/60 p-3 text-slate-900 ring-2 ring-white/70 transition hover:-translate-y-0.5 hover:bg-white focus:outline-none focus:ring-4 focus:ring-emerald-300"
          >
            <span className="flex items-center gap-2">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-700 transition group-hover:bg-yellow-100 group-hover:text-yellow-700">
                <Icon className="h-4 w-4" aria-hidden="true" />
              </span>
              <span className="min-w-0">
                <span className="block text-sm font-black">{label}</span>
                <span className="block truncate text-xs font-bold text-slate-600">
                  {description}
                </span>
              </span>
            </span>
          </Link>
        ))}
      </div>
    </nav>
  );
}
