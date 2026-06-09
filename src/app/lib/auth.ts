import { supabase } from "./supabase";

/**
 * Ensure the current user is authenticated (anonymous auth).
 * Call this on app startup. If no session exists, signs in anonymously.
 * Returns the user id.
 */
export async function ensureAuth(): Promise<string> {
  const { data: { session } } = await supabase.auth.getSession();
  if (session?.user) return session.user.id;

  const { data, error } = await supabase.auth.signInAnonymously();
  if (error) throw error;
  if (!data.user) throw new Error("Anonymous sign-in failed: no user returned");
  return data.user.id;
}

/**
 * Get current user id, or null if not authenticated.
 */
export async function getCurrentUserId(): Promise<string | null> {
  const { data: { session } } = await supabase.auth.getSession();
  return session?.user?.id ?? null;
}

/**
 * Sign out completely.
 */
export async function signOut(): Promise<void> {
  await supabase.auth.signOut();
}
