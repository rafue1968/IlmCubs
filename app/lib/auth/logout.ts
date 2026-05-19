// /app/lib/auth/logout.ts

export async function logout() {
  const res = await fetch("/api/logout", {
    method: "POST",
    credentials: "include",
  });

  if (!res.ok) {
    throw new Error("Logout failed");
  }

  // Hard reset client state
  window.location.href = "/";
}