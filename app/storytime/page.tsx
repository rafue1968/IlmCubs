import StoryTime from "../components/StoryTime";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Storytime",
};


export default function StoryTimePage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-sky-200 via-emerald-100 to-yellow-100 px-5 py-10">
      <div className="mx-auto w-full max-w-md">
        <StoryTime />
      </div>
    </main>
  );
}