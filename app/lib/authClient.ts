"use client";

export type AuthUser = {
  uid: string;
  email: string;
  displayName?: string | null;
};

import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  updateProfile,
} from "firebase/auth";

import { getFirebaseAuth } from "./firebaseClient";

export async function registerWithEmail(params: {
  email: string;
  password: string;
  displayName?: string;
}): Promise<{ user: AuthUser }> {
  try {
    const auth = getFirebaseAuth();
    if (!auth) throw new Error("Firebase is not configured.");

    const cred = await createUserWithEmailAndPassword(
      auth,
      params.email,
      params.password
    );

    if (params.displayName?.trim()) {
      await updateProfile(cred.user, { displayName: params.displayName.trim() });
    }

    return {
      user: {
        uid: cred.user.uid,
        email: cred.user.email ?? params.email,
        displayName: cred.user.displayName,
      },
    };
  } catch (err) {
    throw new Error(getFriendlyAuthErrorMessage(err));
  }
}

export async function loginWithEmail(params: {
  email: string;
  password: string;
}): Promise<{ user: AuthUser }> {
  try {
    const auth = getFirebaseAuth();
    if (!auth) throw new Error("Firebase is not configured.");

    const cred = await signInWithEmailAndPassword(
      auth,
      params.email,
      params.password
    );
    return {
      user: {
        uid: cred.user.uid,
        email: cred.user.email ?? params.email,
        displayName: cred.user.displayName,
      },
    };
  } catch (err) {
    throw new Error(getFriendlyAuthErrorMessage(err));
  }
}

function getFriendlyAuthErrorMessage(err: unknown) {
  const code =
    typeof err === "object" && err && "code" in err
      ? String((err as { code?: unknown }).code)
      : "";

  switch (code) {
    case "auth/email-already-in-use":
      return "That email is already in use. Try signing in instead.";
    case "auth/invalid-email":
      return "That email address is invalid.";
    case "auth/weak-password":
      return "Password is too weak. Use at least 8 characters.";
    case "auth/invalid-credential":
    case "auth/wrong-password":
    case "auth/user-not-found":
      return "Incorrect email or password.";
    case "auth/network-request-failed":
      return "Network error. Check your connection and try again.";
    case "auth/operation-not-allowed":
      return "Email/password sign-in is disabled in Firebase for this project.";
    default:
      return "Authentication failed. Please try again.";
  }
}
