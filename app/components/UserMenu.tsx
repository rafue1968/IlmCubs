"use client";

import { logout } from "../lib/auth/logout";

export function UserMenu() {
  return (
    <div className="flex flex-col gap-2">
      <button onClick={logout} className="text-left">
        Profile
      </button>

      <button onClick={logout} className="text-left text-red-500">
        Sign out
      </button>
    </div>
  );
}