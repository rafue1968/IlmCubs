export type ImageOption = {
  id: string;
  imageSrc: string;
  alt: string;
  correct: boolean;
};

export type ThemePack = {
  id: string;
  chapter: number;
  title: string;
  subtitle: string;
  coverImage: string;
  prompt: string;
  goodDeed: string;
  rewardStars: number;
  options: ImageOption[];
};

export const themePacks: ThemePack[] = [
  {
    id: "al-fil",
    chapter: 105,
    title: "The Elephant Story",
    subtitle: "Tap and learn with the elephant",
    coverImage: "/images/al-fil-cover.png",
    prompt: "Tap the elephant",
    goodDeed: "Help tidy your toys",
    rewardStars: 3,
    options: [
      {
        id: "elephant",
        imageSrc: "/images/elephant.png",
        alt: "Elephant",
        correct: true,
      },
      {
        id: "fish",
        imageSrc: "/images/fish.png",
        alt: "Fish",
        correct: false,
      },
      {
        id: "boat",
        imageSrc: "/images/boat.png",
        alt: "Boat",
        correct: false,
      },
    ],
  },
  {
    id: "quraysh",
    chapter: 106,
    title: "Blessings Journey",
    subtitle: "Food, safety, and thankfulness",
    coverImage: "/images/quraysh-cover.png",
    prompt: "Which one is a blessing?",
    goodDeed: "Say Alhamdulillah before eating",
    rewardStars: 3,
    options: [
      {
        id: "food",
        imageSrc: "/images/food.png",
        alt: "Food",
        correct: true,
      },
      {
        id: "rock",
        imageSrc: "/images/rock.png",
        alt: "Rock",
        correct: false,
      },
      {
        id: "cloud",
        imageSrc: "/images/cloud.png",
        alt: "Cloud",
        correct: false,
      },
    ],
  },
];