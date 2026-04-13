# IlmCubs

A gamified, child-friendly Quran-based quiz application designed to help children aged 4–6 fall in love with the Quran through visual, interactive, and fun experiences.

## Problem

Young children need engaging, age-appropriate ways to connect with the Quran early in life. Traditional learning methods can feel overwhelming or disconnected, making it challenging to build a foundation of faith (Imaan), good character (Ihsaan), and knowledge (Ilm) in a way that's joyful and memorable.

## Solution

IlmCubs transforms Quran learning into an exciting adventure for little ones. Through story-based narratives, visual quizzes, and gamified rewards, children explore Quranic values through simple moral choices and interactive challenges. The app emphasizes fun over text, helping kids develop a lifelong love for the Quran while tracking their progress and celebrating their achievements.

## Features

- 📚 **StoryTime Mode**: Immersive stories that introduce Quranic themes and characters in an engaging, narrative format
- 🎯 **Visual Quiz Interactions**: Choose-the-correct-good-action quizzes with colorful, intuitive interfaces
- ⭐ **Gamified Rewards**: Earn stars, positive feedback, and unlockable content for completing activities
- 📊 **Progress Tracking**: Streak counters and completion badges to motivate consistent engagement
- 🤝 **Good Deed Challenges**: Post-activity prompts encouraging real-world application of learned values
- 📖 **Quran API Integration**: Seamless access to verses, translations, and tafsir through Quran Foundation APIs
- 🎨 **Child-Friendly UI**: Minimal text, vibrant colors, and simple navigation designed for young users

## How It Works

1. **Choose a Story**: Kids select from themed stories that align with Quranic lessons and values.
2. **Engage in Quizzes**: Interactive visual challenges present simple moral dilemmas or knowledge checks.
3. **Earn Rewards**: Successful choices unlock stars, feedback, and progress toward streaks.
4. **Complete Challenges**: After each activity, kids are prompted to perform a good deed in real life.
5. **Track Progress**: The app monitors streaks and completion, providing a sense of accomplishment and motivation.

## Tech Stack

- **Frontend Framework**: Next.js (App Router) with TypeScript for robust, scalable development
- **Styling**: Tailwind CSS for responsive, child-friendly designs
- **APIs**: Quran Foundation Content and User APIs for Quran data and progress tracking
- **Internal Routing**: Custom API routes (e.g., `/api/content/verse`, `/api/content/juz`) for efficient data handling

## API Usage

### Content APIs
- Retrieve verses, juz, tafsir, and translations for story mapping and quiz content
- Search functionality for thematic content alignment
- Audio and metadata support for enhanced learning experiences

### User APIs
- Progress tracking and streak management for personalized engagement
- User profiles and achievement storage (planned for future expansion)

## Setup Instructions

### Installation
1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```

### Environment Variables
Create a `.env.local` file with the following keys:
- `NEXT_PUBLIC_QURAN_API_URL` (Quran Foundation Content API)
- `NEXT_PUBLIC_QURAN_USER_API_URL` (Quran Foundation User API)
- `NEXTAUTH_URL` (for authentication, if applicable)
- `NEXTAUTH_SECRET` (for authentication, if applicable)

### Running Locally
- Start the development server:
  ```bash
  npm run dev
  ```

## Future Improvements

- Expand story themes and surah coverage for broader Quranic exploration
- Introduce multiplayer family challenges to involve parents and siblings
- Add customizable avatars and reward systems for deeper personalization
- Implement offline mode for stories and quizzes
- Enhance accessibility features for diverse learning needs

## Team Section

> Team details coming soon. Add names, roles, and contributions here.

## Hackathon Attribution

IlmCubs  
Quran Foundation Hackathon 2026