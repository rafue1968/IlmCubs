"use client";

import React, { useEffect, useMemo, useState } from "react";
import { getJuz, getVerseByKey } from "../lib/content-api";
import { CurrentStreakResponse, getCurrentQuranStreak } from "../lib/user-api";

type Juz = {
  id: number;
  juz_number: number;
};

type StoryItem = {
  juzNumber: number;
  title: string;
  story: string;
  verse: string;
  verseKey?: string;
  options: { label: string; correct: boolean }[];
};

type VerseDisplay = {
  verseKey: string | null;
  arabic: string | null;
  translation: string | null;
}

const storyItems: StoryItem[] = [
  {
    juzNumber: 1,
    title: "The Kind Start",
    story: "In Juz 1, the Quran begins with merciful words that teach us to be kind and gentle.",
    verse: "The Quran says to be kind and thankful to Allah.",
    verseKey: "1:1",
    options: [
      { label: "Be kind to others", correct: true },
      { label: "Be loud and rough", correct: false },
    ],
  },
  {
    juzNumber: 2,
    title: "The Helping Heart",
    story: "In Juz 2, the Quran teaches us to help our family and share good feelings.",
    verse: "Allah loves those who help and care.",
    verseKey: "2:83",
    options: [
      { label: "Help someone who is sad", correct: true },
      { label: "Keep all toys for yourself", correct: false },
    ],
  },
  {
    juzNumber: 3,
    title: "The Thankful Smile",
    story: "In Juz 3, the Quran tells us to say thank you for our food and our friends.",
    verse: "Be grateful and smile with your heart.",
    verseKey: "3:103",
    options: [
      { label: "Say thank you to Allah", correct: true },
      { label: "Say thank you only to yourself", correct: false },
    ],
  },
  // {
  //   juzNumber: 4,
  //   title: "The Gentle Friend",
  //   story: "In Juz 4, the Quran teaches us to speak softly and be a gentle friend.",
  //   verse: "Use kind words and make others happy.",
  //   options: [
  //     { label: "Speak softly and kindly", correct: true },
  //     { label: "Shout and be mean", correct: false },
  //   ],
  // },
  // {
  //   juzNumber: 5,
  //   title: "The Patient Child",
  //   story: "In Juz 5, the Quran reminds us to wait patiently and trust Allah’s timing.",
  //   verse: "Patience is good and brings peace.",
  //   options: [
  //     { label: "Be patient and calm", correct: true },
  //     { label: "Be angry and hurry", correct: false },
  //   ],
  // },
  // {
  //   juzNumber: 6,
  //   title: "The Brave Little Helper",
  //   story: "In Juz 6, the Quran shows that brave helpers take care of others and say the truth.",
  //   verse: "Truth and good deeds are always best.",
  //   options: [
  //     { label: "Tell the truth", correct: true },
  //     { label: "Tell a big lie", correct: false },
  //   ],
  // },
  // {
  //   juzNumber: 7,
  //   title: "The Caring Heart",
  //   story: "In Juz 7, the Quran teaches us to care for friends and family with love.",
  //   verse: "Love and care make hearts happy.",
  //   options: [
  //     { label: "Care for others", correct: true },
  //     { label: "Ignore others", correct: false },
  //   ],
  // },
  // {
  //   juzNumber: 8,
  //   title: "The Cheerful Prayer",
  //   story: "In Juz 8, the Quran reminds us to say our prayers with joy and remember Allah.",
  //   verse: "Remembering Allah makes the heart strong.",
  //   options: [
  //     { label: "Pray with a happy heart", correct: true },
  //     { label: "Forget to pray", correct: false },
  //   ],
  // },
  // {
  //   juzNumber: 9,
  //   title: "The Giving Gift",
  //   story: "In Juz 9, the Quran teaches us to give to those who need a little extra help.",
  //   verse: "Giving to others makes everyone smile.",
  //   options: [
  //     { label: "Share with someone in need", correct: true },
  //     { label: "Keep everything for yourself", correct: false },
  //   ],
  // },
  // {
  //   juzNumber: 10,
  //   title: "The Quiet Listener",
  //   story: "In Juz 10, the Quran says it is good to listen carefully and learn from wise words.",
  //   verse: "Listening is a way to learn and grow.",
  //   options: [
  //     { label: "Listen carefully", correct: true },
  //     { label: "Talk all the time", correct: false },
  //   ],
  // },
  // {
  //   juzNumber: 11,
  //   title: "The Bright Choice",
  //   story: "In Juz 11, the Quran shows that choosing good actions brings light to our day.",
  //   verse: "Good choices make life bright.",
  //   options: [
  //     { label: "Choose good actions", correct: true },
  //     { label: "Choose bad actions", correct: false },
  //   ],
  // },
  // {
  //   juzNumber: 12,
  //   title: "The Happy Helper",
  //   story: "In Juz 12, the Quran teaches us to help our family and be helpful at home.",
  //   verse: "Helping at home is a beautiful deed.",
  //   options: [
  //     { label: "Help parents at home", correct: true },
  //     { label: "Refuse to help", correct: false },
  //   ],
  // },
  // {
  //   juzNumber: 13,
  //   title: "The Caring Smile",
  //   story: "In Juz 13, the Quran teaches us that a small smile can make someone else happy.",
  //   verse: "A smile is a good gift.",
  //   options: [
  //     { label: "Share your smile", correct: true },
  //     { label: "Keep your face sad", correct: false },
  //   ],
  // },
  // {
  //   juzNumber: 14,
  //   title: "The Gentle Voice",
  //   story: "In Juz 14, the Quran reminds us to use gentle words and peaceful voices.",
  //   verse: "Words can be kind or hurtful.",
  //   options: [
  //     { label: "Use gentle words", correct: true },
  //     { label: "Use mean words", correct: false },
  //   ],
  // },
  // {
  //   juzNumber: 15,
  //   title: "The Little Promise",
  //   story: "In Juz 15, the Quran teaches that keeping promises is a sign of trust.",
  //   verse: "Promises should be kept.",
  //   options: [
  //     { label: "Keep your promise", correct: true },
  //     { label: "Break your promise", correct: false },
  //   ],
  // },
  // {
  //   juzNumber: 16,
  //   title: "The Friendly Helper",
  //   story: "In Juz 16, the Quran shows that helping friends makes everyone happy.",
  //   verse: "Helping others is a good deed.",
  //   options: [
  //     { label: "Help a friend", correct: true },
  //     { label: "Leave them alone", correct: false },
  //   ],
  // },
  // {
  //   juzNumber: 17,
  //   title: "The Caring Ears",
  //   story: "In Juz 17, the Quran teaches us to listen when our parents and teachers speak.",
  //   verse: "Listening shows respect.",
  //   options: [
  //     { label: "Listen to my parents", correct: true },
  //     { label: "Ignore them", correct: false },
  //   ],
  // },
  // {
  //   juzNumber: 18,
  //   title: "The Sharing Friend",
  //   story: "In Juz 18, the Quran reminds us that sharing toys is a kind way to play.",
  //   verse: "Sharing is a happy choice.",
  //   options: [
  //     { label: "Share with friends", correct: true },
  //     { label: "Keep all toys alone", correct: false },
  //   ],
  // },
  // {
  //   juzNumber: 19,
  //   title: "The Little Gift",
  //   story: "In Juz 19, the Quran teaches us to give small gifts with a joyful heart.",
  //   verse: "Giving brings joy to your heart.",
  //   options: [
  //     { label: "Give a kind gift", correct: true },
  //     { label: "Take instead of give", correct: false },
  //   ],
  // },
  // {
  //   juzNumber: 20,
  //   title: "The Patient Learner",
  //   story: "In Juz 20, the Quran reminds us that learning takes time and patience.",
  //   verse: "Be patient as you learn.",
  //   options: [
  //     { label: "Be patient while learning", correct: true },
  //     { label: "Give up quickly", correct: false },
  //   ],
  // },
  // {
  //   juzNumber: 21,
  //   title: "The Gentle Hand",
  //   story: "In Juz 21, the Quran teaches us to use gentle hands when we take care of others.",
  //   verse: "Care gently for the world.",
  //   options: [
  //     { label: "Be gentle with animals", correct: true },
  //     { label: "Be rough with animals", correct: false },
  //   ],
  // },
  // {
  //   juzNumber: 22,
  //   title: "The Thankful Heart",
  //   story: "In Juz 22, the Quran reminds us to say thank you for the good things we have.",
  //   verse: "Thankfulness brings happiness.",
  //   options: [
  //     { label: "Say thank you", correct: true },
  //     { label: "Take things without thanks", correct: false },
  //   ],
  // },
  // {
  //   juzNumber: 23,
  //   title: "The Bright Promise",
  //   story: "In Juz 23, the Quran teaches us to keep promises and do what is right.",
  //   verse: "Promises matter.",
  //   options: [
  //     { label: "Keep my promise", correct: true },
  //     { label: "Break a promise", correct: false },
  //   ],
  // },
  // {
  //   juzNumber: 24,
  //   title: "The Good Choice",
  //   story: "In Juz 24, the Quran reminds us to choose good deeds and avoid bad ones.",
  //   verse: "Choose good and you feel peaceful.",
  //   options: [
  //     { label: "Choose good deeds", correct: true },
  //     { label: "Choose bad deeds", correct: false },
  //   ],
  // },
  // {
  //   juzNumber: 25,
  //   title: "The Little Helper",
  //   story: "In Juz 25, the Quran teaches us to help the hungry and share our food with others.",
  //   verse: "Sharing food is loved by Allah.",
  //   options: [
  //     { label: "Share my food", correct: true },
  //     { label: "Keep my food just for me", correct: false },
  //   ],
  // },
  // {
  //   juzNumber: 26,
  //   title: "The Quiet Prayer",
  //   story: "In Juz 26, the Quran reminds us to pray quietly and listen to our heart.",
  //   verse: "Quiet prayer brings peace.",
  //   options: [
  //     { label: "Pray quietly", correct: true },
  //     { label: "Pray loudly with anger", correct: false },
  //   ],
  // },
  // {
  //   juzNumber: 27,
  //   title: "The Caring Voice",
  //   story: "In Juz 27, the Quran teaches us to say kind words to family and friends.",
  //   verse: "Kind words are beautiful.",
  //   options: [
  //     { label: "Say kind words", correct: true },
  //     { label: "Say mean words", correct: false },
  //   ],
  // },
  // {
  //   juzNumber: 28,
  //   title: "The Bright Heart",
  //   story: "In Juz 28, the Quran reminds us to do good deeds even when no one is watching.",
  //   verse: "Good deeds are always seen by Allah.",
  //   options: [
  //     { label: "Do good quietly", correct: true },
  //     { label: "Do bad deeds secretly", correct: false },
  //   ],
  // },
  // {
  //   juzNumber: 29,
  //   title: "The Little Caregiver",
  //   story: "In Juz 29, the Quran teaches us to be gentle with younger siblings and little friends.",
  //   verse: "Gentle care makes hearts happy.",
  //   options: [
  //     { label: "Be gentle with little ones", correct: true },
  //     { label: "Be rough with little ones", correct: false },
  //   ],
  // },
  // {
  //   juzNumber: 30,
  //   title: "The Loving Heart",
  //   story: "In Juz 30, the Quran reminds us that Allah loves those who are kind, patient, and thankful.",
  //   verse: "Allah loves kind hearts.",
  //   options: [
  //     { label: "Be kind and thankful", correct: true },
  //     { label: "Be unkind and angry", correct: false },
  //   ],
  // },
];

const defaultJuzList: Juz[] = Array.from({ length: 30 }, (_, index) => ({
  id: index + 1,
  juz_number: index + 1,
}));

const StoryTime: React.FC = () => {
  // const [juzList, setJuzList] = useState<Juz[]>([]);
  const [juzList] = useState<Juz[]>(defaultJuzList);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [verseDisplay, setVerseDisplay] = useState<VerseDisplay | null>(null);

  const [currentStreak, setCurrentStreak] = useState<number | null>(null);
  const [streakLoading, setStreakLoading] = useState(true);
  const [streakError, setStreakError] = useState<string | null>(null);

  const currentJuz = juzList[currentIndex];

  const currentStory = useMemo(() => {
    return (
      storyItems.find((item) => item.juzNumber === currentJuz?.juz_number) ??
      storyItems[0]
    );
  }, [currentJuz]);

  const totalJuz = juzList.length;

  useEffect(() => {
    async function loadStreak(){

      try {
        const result = await getCurrentQuranStreak();

        if(result.success && result.data){
          setCurrentStreak(result.data.currentStreak);
        } else {
          setStreakError(result.message || "Could not load streak");
        }
      } catch (error){
        setStreakError(
          error instanceof Error ? error.message : "Could not load streak"
        );
      } finally {
        setStreakLoading(false);
      }
    }

    loadStreak();
  }, [])

  useEffect(() => {
    let cancelled = false;
    
    async function loadCurrentStoryData(){
      if (!currentJuz) return;

      setLoading(true);
      setError(null);
      setVerseDisplay(null);

      try {
        await getJuz(currentJuz.juz_number);

        if (currentStory?.verseKey){
          const verseRes = await getVerseByKey(currentStory.verseKey);

          const verse = verseRes?.data?.verse;

          if (!cancelled){
            setVerseDisplay({
              verseKey: verse?.verse_key ?? currentStory.verseKey ?? null,
              arabic: verse?.text_uthmani ?? null,
              translation: verse?.translations?.[0]?.text ?? null,
            })
          }
        }
      } catch {
        if (!cancelled){
          setError("Could not load Quran content right now.");
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadCurrentStoryData();

    return () => {
      cancelled = true;
    };
  }, [currentJuz, currentStory]);

  // const currentJuz = juzList[currentIndex];
  // const currentStory = storyItems.find((item) => item.juzNumber === currentJuz?.juz_number) ?? storyItems[0];
  // const totalJuz = juzList.length || storyItems.length;

  const handleAnswer = (correct: boolean) => {
    setFeedback(correct ? "🎉 Yes! That is the kind answer!" : "Try again — choose the kind answer.");
  };

  const nextStory = () => {
    setFeedback(null);
    // setCurrentIndex((prev) => (prev + 1) % (juzList.length || storyItems.length));
    setCurrentIndex((prev) => (prev + 1) % totalJuz);
  };

  if (!currentJuz) {
    return (
      <div className="rounded-[34px] border-4 border-white/60 bg-white/35 p-7 text-center shadow-[0_30px_70px_-45px_rgba(2,6,23,0.55)] backdrop-blur">
        <p className="text-lg font-semibold text-slate-800">
          Loading story time...
        </p>
      </div>
    );
  }

  // if (loading) {
  //   return (
  //     <div className="rounded-[34px] border-4 border-white/60 bg-white/35 p-7 shadow-[0_30px_70px_-45px_rgba(2,6,23,0.55)] backdrop-blur text-center">
  //       <p className="text-lg font-semibold text-slate-800">Loading story time...</p>
  //     </div>
  //   );
  // }

  // if (!currentJuz) {
  //   return (
  //     <div className="rounded-[34px] border-4 border-white/60 bg-white/35 p-7 shadow-[0_30px_70px_-45px_rgba(2,6,23,0.55)] backdrop-blur text-center">
  //       <p className="text-lg font-semibold text-slate-800">Loading story time...</p>
  //     </div>
  //   );
  // }

  // return (
  //   <div className="rounded-[34px] border-4 border-white/60 bg-white/35 p-7 shadow-[0_30px_70px_-45px_rgba(2,6,23,0.55)] backdrop-blur">
  //     <div className="mb-6 rounded-3xl border border-white/70 bg-gradient-to-r from-sky-200 via-emerald-100 to-yellow-100 p-5 text-center shadow-inner">
  //       <h1 className="text-3xl font-extrabold text-slate-950">📖 Story Time</h1>
  //       <p className="mt-2 text-sm font-semibold text-slate-700">Learn what each surah teaches us!</p>
  //     </div>

  //     <div className="space-y-5">
  //       <div className="rounded-[28px] border-2 border-emerald-300/60 bg-emerald-50/80 p-6">
  //         <div className="flex items-center justify-between gap-3">
  //           <p className="text-sm font-semibold uppercase tracking-[0.2em] text-emerald-600">Juz {currentJuz.juz_number}</p>
  //           <p className="rounded-full bg-slate-900 px-3 py-1 text-xs font-bold uppercase tracking-[0.16em] text-white">
  //             {currentIndex + 1}/{totalJuz}
  //           </p>
  //         </div>
  //         <h2 className="mt-3 text-xl font-extrabold text-slate-950">{currentStory.title}</h2>
  //         <p className="mt-3 text-base leading-7 text-slate-700">{currentStory.story}</p>
  //         <p className="mt-4 rounded-2xl border border-slate-200 bg-white/80 px-4 py-3 text-sm font-semibold text-slate-700">
  //           {currentStory.verse}
  //         </p>
  //       </div>

  //       <div className="rounded-[28px] border-2 border-white/70 bg-white/60 p-6 shadow-[0_18px_40px_-20px_rgba(2,6,23,0.35)]">
  //         <p className="text-base font-extrabold text-slate-900">What should we do?</p>

  //         <div className="mt-4 grid gap-3 sm:grid-cols-2">
  //           {currentStory.options.map((option) => (
  //             <button
  //               key={option.label}
  //               type="button"
  //               onClick={() => handleAnswer(option.correct)}
  //               className={`rounded-[24px] px-4 py-3 text-sm font-bold text-white transition ${
  //                 option.correct ? "bg-emerald-700 hover:bg-emerald-600" : "bg-slate-900 hover:bg-slate-800"
  //               }`}
  //             >
  //               {option.label}
  //             </button>
  //           ))}
  //         </div>

  //         <p className="mt-4 text-center text-sm font-semibold text-slate-700">
  //           {feedback || "Choose the kind answer to learn from the story."}
  //         </p>

  //         <div className="mt-6 flex justify-center">
  //           <button
  //             type="button"
  //             onClick={nextStory}
  //             className="rounded-full bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
  //           >
  //             Next ➡️
  //           </button>
  //         </div>
  //       </div>
  //     </div>
  //   </div>
  // );

  return (
    <div className="rounded-[34px] border-4 border-white/60 bg-white/35 p-7 shadow-[0_30px_70px_-45px_rgba(2,6,23,0.55)] backdrop-blur">
      <div className="mb-6 rounded-3xl border border-white/70 bg-gradient-to-r from-sky-200 via-emerald-100 to-yellow-100 p-5 text-center shadow-inner">
        
        <div className="mb-4 flex justify-center">
          <div className="rounded-full bg-white/80 px-4 py-2 text-sm font-bold text-slate-800 shadow">
            {streakLoading
              ? "Loading streak..."
              : streakError
              ? "Story streak unavailable"
              : `🔥 ${currentStreak ?? 0} day Quran streak`}
          </div>
        </div>
        
        <h1 className="text-3xl font-extrabold text-slate-950">
          📖 Story Time
        </h1>
        <p className="mt-2 text-sm font-semibold text-slate-700">
          Learn what each juz teaches us!
        </p>
      </div>

      <div className="space-y-5">
        <div className="rounded-[28px] border-2 border-emerald-300/60 bg-emerald-50/80 p-6">
          <div className="flex items-center justify-between gap-3">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-emerald-600">
              Juz {currentJuz.juz_number}
            </p>
            <p className="rounded-full bg-slate-900 px-3 py-1 text-xs font-bold uppercase tracking-[0.16em] text-white">
              {currentIndex + 1}/{totalJuz}
            </p>
          </div>

          <h2 className="mt-3 text-xl font-extrabold text-slate-950">
            {currentStory.title}
          </h2>

          <p className="mt-3 text-base leading-7 text-slate-700">
            {currentStory.story}
          </p>

          <p className="mt-4 rounded-2xl border border-slate-200 bg-white/80 px-4 py-3 text-sm font-semibold text-slate-700">
            {currentStory.verse}
          </p>

          {loading ? (
            <p className="mt-4 text-sm font-medium text-slate-500">
              Loading Quran verse...
            </p>
          ) : (
            verseDisplay && (
              <div className="mt-4 rounded-2xl border border-emerald-200 bg-white px-4 py-4">
                <p className="text-right text-lg leading-9 text-slate-900">
                  {verseDisplay.arabic || "Arabic text unavailable"}
                </p>
                <p className="mt-3 text-sm font-medium text-slate-600">
                  {verseDisplay.translation || "Translation unavailable"}
                </p>
                {verseDisplay.verseKey && (
                  <p className="mt-2 text-xs font-semibold uppercase tracking-[0.18em] text-emerald-700">
                    {verseDisplay.verseKey}
                  </p>
                )}
              </div>
            )
          )}

          {error && (
            <p className="mt-3 text-sm font-semibold text-amber-700">
              {error}
            </p>
          )}
        </div>

        <div className="rounded-[28px] border-2 border-white/70 bg-white/60 p-6 shadow-[0_18px_40px_-20px_rgba(2,6,23,0.35)]">
          <p className="text-base font-extrabold text-slate-900">
            What should we do?
          </p>

          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {currentStory.options.map((option) => (
              <button
                key={option.label}
                type="button"
                onClick={() => handleAnswer(option.correct)}
                className="rounded-[24px] bg-slate-900 px-4 py-3 text-sm font-bold text-white transition hover:bg-slate-800"
              >
                {option.label}
              </button>
            ))}
          </div>

          <p className="mt-4 text-center text-sm font-semibold text-slate-700">
            {feedback || "Choose the kind answer to learn from the story."}
          </p>

          <div className="mt-6 flex justify-center">
            <button
              type="button"
              onClick={nextStory}
              className="rounded-full bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
            >
              Next ➡️
            </button>
          </div>
        </div>
      </div>
    </div>
  );


};

export default StoryTime;