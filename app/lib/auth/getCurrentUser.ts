import { headers } from "next/headers";

// IMPORTANT:
// Replace this with actual hackathon OAuth SDK when available
// For now we assume OAuth gives us a user id via headers or session token

export async function getOAuthUserId(): Promise<string | null> {
  const headersList = await headers();

  // Example: depending on hackathon OAuth implementation
  const userId = headersList.get("x-oauth-user-id");

  return userId;
}