# Quran Companion AI

A modern AI-powered Quran companion that connects real-life emotions with meaningful Quranic guidance.

## Problem Statement

Many people want a deeper, consistent relationship with the Quran, but struggle to find relevant verses during everyday emotional moments. Existing tools often feel distant and are not tailored to personal feelings or context.

## Solution Overview

Quran Companion AI bridges emotion and scripture by letting users describe how they feel or what they are going through. The app then uses Quran APIs and generative AI to provide relevant ayahs, simple explanations, and reflection prompts that support long-term spiritual growth.

## Features

- ✨ AI-powered personalized Quran guidance
- 📝 Emotion and situation input with text and mood buttons
- 📖 Relevant ayah retrieval using Quran Foundation content APIs
- 🤖 Simple explanation generation with Gemini API
- 📔 Reflection journaling for personal insight and growth
- 🔖 Bookmark and save ayahs for later
- 📈 Streak tracking for habit building
- 🔊 Optional audio playback for selected verses

## How It Works

1. User enters their current emotion or situation.
2. The app classifies the input and maps it to relevant Quranic themes.
3. Quran Foundation Content APIs retrieve matching ayahs.
4. Gemini API generates a simple explanation and reflection prompt.
5. The user can read, bookmark, journal, or listen to the verse.
6. Streak tracking rewards consistent engagement.

## Tech Stack

- Next.js (App Router)
- TypeScript
- Tailwind CSS
- Gemini API (Google Generative AI)
- Quran Foundation APIs (content + user APIs)

## API Usage

### Content APIs
- Verse lookup and retrieval
- Search by theme, mood, or situation
- Ayah metadata and translations
- Audio playback links

### User APIs
- User authentication and profiles
- Saved bookmarks and journal entries
- Streak and engagement tracking
- Personal preference settings

## Setup Instructions

### Installation
1. Clone the repository
2. Install dependencies
    - `npm install`

### Environment Variables
Create a `.env` file with required keys:
- `NEXT_PUBLIC_GEMINI_API_KEY`
- `NEXT_PUBLIC_QURAN_API_URL`
- `NEXT_PUBLIC_QURAN_USER_API_URL`
- `NEXTAUTH_URL`
- `NEXTAUTH_SECRET`

### Running Locally
- Start the development server:
  - `npm run dev`

## Demo Section

> Demo content coming soon. Replace this placeholder with a live demo link or video once available.

## Future Improvements

- Add offline support for saved ayahs and notes
- Enhance mood detection with richer emotion categories
- Introduce AI-driven daily Quran reflections
- Add multilingual support for translation and explanation
- Improve audio playback experience with reciter selection

## Team Section

> Team details coming soon. Add names, roles, and contributions here.

## Hackathon Attribution

Quran Companion AI  
Quran Foundation Hackathon 2026