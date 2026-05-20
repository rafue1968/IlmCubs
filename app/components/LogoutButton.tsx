"use client";

import { logout } from "@/app/lib/auth/logout";

export function LogoutButton() {
  return (
    <button
      onClick={async () => {
        try {
          await logout();
        } catch (e) {
          console.error("Logout failed", e);
        }
      }}
      className="px-4 py-2 rounded bg-red-500 text-white"
    >
      Logout
    </button>
  );
}