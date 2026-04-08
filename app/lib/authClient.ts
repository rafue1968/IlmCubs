export type AuthUser = {
  uid: string;
  email: string;
  displayName?: string | null;
};

function makeDemoUser(params: { email: string; displayName?: string }) {
  return {
    uid: `demo_${Math.random().toString(16).slice(2)}`,
    email: params.email,
    displayName: params.displayName ?? null,
  } satisfies AuthUser;
}

/**
 * Client-side auth adapter.
 *
 * For now this is a mock that matches the Firebase Auth shape we’ll use later.
 * When you’re ready, swap the internals to `firebase/auth` without changing UI code.
 */
export async function registerWithEmail(params: {
  email: string;
  password: string;
  displayName?: string;
}): Promise<{ user: AuthUser }> {
  // Placeholder for Firebase:
  // - createUserWithEmailAndPassword(auth, email, password)
  // - updateProfile(user, { displayName })
  await new Promise((r) => setTimeout(r, 650));
  return { user: makeDemoUser({ email: params.email, displayName: params.displayName }) };
}

export async function loginWithEmail(params: {
  email: string;
  password: string;
}): Promise<{ user: AuthUser }> {
  // Placeholder for Firebase:
  // - signInWithEmailAndPassword(auth, email, password)
  await new Promise((r) => setTimeout(r, 650));
  return { user: makeDemoUser({ email: params.email }) };
}

