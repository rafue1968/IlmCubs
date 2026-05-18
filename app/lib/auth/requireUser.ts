// app/lib/auth/requireUser.ts
import { getCurrentUser } from "./getCurrentUser";

export async function requireUser() {
  const user = await getCurrentUser();

  if (!user) {
    throw new Error("UNAUTHORIZED");
  }

  return user;
}