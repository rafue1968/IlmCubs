"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { BookmarkCheck, Sparkles } from "lucide-react";
import { type BookmarkItem, getBookmarks } from "@/lib/progress-storage";

export default function SavedGemsPreview() {
  const [bookmarks, setBookmarks] = useState<BookmarkItem[]>([]);

  useEffect(() => {
    queueMicrotask(() => {
      setBookmarks(getBookmarks().slice().reverse().slice(0, 4));
    });
  }, []);

  return (
    <section className="mt-8 rounded-[36px] border-4 border-white/60 bg-white/35 p-6 shadow-[0_30px_70px_-45px_rgba(2,6,23,0.55)] backdrop-blur sm:p-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="flex items-center gap-2 text-sm font-black uppercase tracking-[0.24em] text-slate-700">
            <BookmarkCheck className="h-4 w-4 text-yellow-600" aria-hidden="true" />
            Saved gems
          </p>
          <h2 className="mt-2 text-3xl font-extrabold tracking-tight text-slate-950">
            Your favorite Quran moments
          </h2>
        </div>
        <Link
          href="/parent"
          className="rounded-full bg-slate-900 px-5 py-3 text-sm font-extrabold text-white transition hover:bg-slate-800"
        >
          Open collection
        </Link>
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {bookmarks.length > 0 ? (
          bookmarks.map((bookmark, index) => (
            <div
              key={bookmark.id}
              className="ilm-pop rounded-[26px] border-4 border-white/60 bg-white/55 p-5 shadow-[0_18px_45px_-35px_rgba(2,6,23,0.45)]"
              style={{ animationDelay: `${index * 80}ms` }}
            >
              <div className="ilm-float flex h-12 w-12 items-center justify-center rounded-2xl bg-yellow-100 text-yellow-700 ring-2 ring-white/70">
                <Sparkles className="h-5 w-5" aria-hidden="true" />
              </div>
              <p className="mt-4 text-xs font-black uppercase tracking-[0.18em] text-slate-600">
                {bookmark.type === "story" ? "Story gem" : "Verse gem"}
              </p>
              <p className="mt-1 line-clamp-2 text-base font-extrabold text-slate-950">
                {bookmark.title}
              </p>
            </div>
          ))
        ) : (
          <div className="rounded-[26px] border-4 border-white/60 bg-white/55 p-5 sm:col-span-2 xl:col-span-4">
            <p className="text-base font-extrabold text-slate-950">
              Save a story or verse during play, and it will appear here.
            </p>
            <p className="mt-2 text-sm font-bold leading-6 text-slate-700">
              This helps children return to gentle lessons they enjoyed.
            </p>
          </div>
        )}
      </div>
    </section>
  );
}
