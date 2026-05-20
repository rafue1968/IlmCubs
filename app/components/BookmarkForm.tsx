"use client";

import { useState } from "react";
import { validateVerseInput, getSurahName } from "@/app/lib/quran-validation";

interface BookmarkFormProps {
  childId: string;
  onSuccess?: (bookmark: any) => void;
  onError?: (error: string) => void;
}

export function BookmarkForm({
  childId,
  onSuccess,
  onError,
}: BookmarkFormProps) {
  const [surah, setSurah] = useState("");
  const [ayah, setAyah] = useState("");
  const [note, setNote] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Client-side validation
    const validation = validateVerseInput(Number(surah), Number(ayah));
    if (!validation.valid) {
      const errorMsg = validation.errors.join(", ");
      setError(errorMsg);
      onError?.(errorMsg);
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch(`/api/children/${childId}/bookmarks`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          surah: Number(surah),
          ayah: Number(ayah),
          note: note.trim() || null,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to save bookmark");
      }

      const data = await res.json();
      onSuccess?.(data.bookmark);

      // Reset form
      setSurah("");
      setAyah("");
      setNote("");
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : "Unknown error";
      setError(errorMsg);
      onError?.(errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 rounded-xl border border-emerald-400/20 bg-emerald-500/5 p-6">
      <h3 className="font-semibold text-emerald-300">Add Bookmark</h3>

      {error && (
        <div className="rounded-lg bg-red-500/10 p-3 text-sm text-red-300">
          {error}
        </div>
      )}

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="surah" className="block text-sm text-white/70 mb-2">
            Surah (Chapter)
          </label>
          <input
            id="surah"
            type="number"
            min="1"
            max="114"
            value={surah}
            onChange={(e) => setSurah(e.target.value)}
            placeholder="e.g., 1"
            className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-white placeholder-white/40 focus:border-emerald-400 focus:outline-none"
            required
          />
        </div>

        <div>
          <label htmlFor="ayah" className="block text-sm text-white/70 mb-2">
            Ayah (Verse)
          </label>
          <input
            id="ayah"
            type="number"
            min="1"
            value={ayah}
            onChange={(e) => setAyah(e.target.value)}
            placeholder="e.g., 1"
            className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-white placeholder-white/40 focus:border-emerald-400 focus:outline-none"
            required
          />
        </div>
      </div>

      {surah && getSurahName(Number(surah)) && (
        <p className="text-sm text-emerald-300">
          {getSurahName(Number(surah))}
        </p>
      )}

      <div>
        <label htmlFor="note" className="block text-sm text-white/70 mb-2">
          Note (Optional)
        </label>
        <textarea
          id="note"
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="Add a personal note about this verse..."
          className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-white placeholder-white/40 focus:border-emerald-400 focus:outline-none resize-none"
          rows={3}
        />
      </div>

      <button
        type="submit"
        disabled={isLoading || !surah || !ayah}
        className="w-full rounded-lg bg-emerald-500 hover:bg-emerald-600 disabled:bg-emerald-500/50 py-2 font-semibold text-white transition-colors"
      >
        {isLoading ? "Saving..." : "Save Bookmark"}
      </button>
    </form>
  );
}
