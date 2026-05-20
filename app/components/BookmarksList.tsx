"use client";

import { useState } from "react";
import { Bookmark } from "@prisma/client";
import { getSurahName } from "@/app/lib/quran-validation";
import { Trash2 } from "lucide-react";

interface BookmarkListProps {
  bookmarks: Bookmark[];
  childId: string;
  onDelete?: (bookmarkId: string) => void;
}

export function BookmarksList({
  bookmarks,
  childId,
  onDelete,
}: BookmarkListProps) {
  const [isDeleting, setIsDeleting] = useState<string | null>(null);

  const handleDelete = async (bookmarkId: string) => {
    setIsDeleting(bookmarkId);
    try {
      const res = await fetch(`/api/children/${childId}/bookmarks/${bookmarkId}`, {
        method: "DELETE",
      });

      if (res.ok) {
        onDelete?.(bookmarkId);
      } else {
        alert("Failed to delete bookmark");
      }
    } catch (err) {
      console.error("Delete error:", err);
      alert("Error deleting bookmark");
    } finally {
      setIsDeleting(null);
    }
  };

  if (bookmarks.length === 0) {
    return (
      <div className="rounded-xl border border-emerald-400/20 bg-emerald-500/5 p-8 text-center">
        <p className="text-emerald-300">No bookmarks yet!</p>
        <p className="mt-1 text-sm text-emerald-200/60">
          Bookmark your favorite verses to save them here.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {bookmarks.map((bookmark) => (
        <div
          key={bookmark.id}
          className="flex items-start justify-between rounded-lg border border-white/10 bg-white/5 p-4 hover:bg-white/10 transition-colors"
        >
          <div className="flex-1">
            <div className="flex items-baseline gap-2">
              <span className="font-semibold text-emerald-400">
                {getSurahName(bookmark.surah)}
              </span>
              <span className="text-sm text-white/60">
                {bookmark.surah}:{bookmark.ayah}
              </span>
            </div>
            {bookmark.note && (
              <p className="mt-2 text-sm text-white/70">{bookmark.note}</p>
            )}
            <p className="mt-2 text-xs text-white/40">
              {new Date(bookmark.createdAt).toLocaleDateString()}
            </p>
          </div>
          <button
            onClick={() => handleDelete(bookmark.id)}
            disabled={isDeleting === bookmark.id}
            className="ml-4 flex-shrink-0 rounded-full p-2 hover:bg-red-500/20 disabled:opacity-50 transition-colors"
            aria-label="Delete bookmark"
          >
            <Trash2 className="h-4 w-4 text-red-400" />
          </button>
        </div>
      ))}
    </div>
  );
}
