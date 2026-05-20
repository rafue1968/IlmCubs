/**
 * IlmCubs Child Progress System - Export Index
 * Re-export all service functions and helpers for easy imports
 */

// Service Helpers
export * from "./bookmarks-service";
export * from "./streak-service";
export * from "./children-service";
export * from "./quran-validation";

// This allows imports like:
// import { incrementStreak, getBookmarksForChild } from "@/app/lib";
// Instead of:
// import { incrementStreak } from "@/app/lib/streak-service";
// import { getBookmarksForChild } from "@/app/lib/bookmarks-service";
