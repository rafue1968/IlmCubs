import { ThemePack } from "./theme-packs";

export type QuizRound = {
  id: string;
  chapter: number;
  surahTitle: string;
  arabicText: string;
  translationText: string;
  prompt: string;
  coverImage: string;
  options: ThemePack["options"];
  rewardStars: number;
  goodDeed: string;
};

export function buildQuizRound(apiResponse: any, pack: ThemePack): QuizRound {
  const firstVerse = apiResponse?.data?.verses?.[0];

  return {
    id: pack.id,
    chapter: pack.chapter,
    surahTitle: pack.title,
    arabicText: firstVerse?.text_uthmani || "",
    translationText: firstVerse?.translations?.[0]?.text || "",
    prompt: pack.prompt,
    coverImage: pack.coverImage,
    options: pack.options,
    rewardStars: pack.rewardStars,
    goodDeed: pack.goodDeed,
  };
}