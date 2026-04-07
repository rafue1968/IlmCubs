import Link from "next/link";

export default function Footer() {
  return (
    <footer className="border-t border-white/10 bg-slate-950">
      <div className="mx-auto flex max-w-7xl flex-col gap-6 px-6 py-8 text-sm text-slate-400 md:flex-row md:items-center md:justify-between lg:px-8">
        <div>
          <p className="font-medium text-slate-200">Quran Journey</p>
          <p className="mt-1">Helping youth build a lasting connection with the Quran.</p>
        </div>

        <div className="flex flex-wrap items-center gap-5">
          <Link href="/" className="transition hover:text-white">
            Home
          </Link>
          <a href="#features" className="transition hover:text-white">
            Features
          </a>
          <a href="#pathways" className="transition hover:text-white">
            Pathways
          </a>
          <a href="#cta" className="transition hover:text-white">
            Get Started
          </a>
        </div>
      </div>
    </footer>
  );
}