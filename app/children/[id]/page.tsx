// SETUP INSTRUCTIONS:
// 1. Create the following directory structure:
//    app/children/[id]/
// 2. Move this file to: app/children/[id]/page.tsx
// 3. Rename from "children-id-page.tsx" to "page.tsx"

import { requireUser } from "@/app/lib/auth/requireUser";
import { prisma } from "@/app/lib/prisma";
import { ChildDashboard } from "@/app/components/ChildDashboard";
import { notFound } from "next/navigation";
import Link from "next/link";

interface PageProps {
  params: Promise<{ id: string }>;
}

export const metadata = {
  title: "Child Dashboard - IlmCubs",
  description: "Track reading streaks and bookmarks",
};

export default async function ChildPage({ params }: PageProps) {
  const { id: childId } = await params;
  const user = await requireUser();

  const child = await prisma.child.findFirst({
    where: {
      id: childId,
      userId: user.id,
    },
    include: {
      streak: true,
      bookmarks: {
        orderBy: { createdAt: "desc" },
      },
    },
  });

  if (!child) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-slate-950 px-4 py-8 md:px-6">
      <div className="mx-auto max-w-3xl">
        {/* Back link */}
        <Link
          href="/"
          className="mb-6 inline-flex text-sm text-emerald-400 hover:text-emerald-300 transition-colors"
        >
          ← Back to home
        </Link>

        <ChildDashboard child={child} />
      </div>
    </div>
  );
}
