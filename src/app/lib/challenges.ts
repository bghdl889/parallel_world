import { supabase } from "./supabase";
import { getCurrentUserId } from "./auth";

// ─── Types ───────────────────────────────────────────────

export interface Challenge {
  id: string;
  name: string;
  challenge_date: string;
  checkpoints: string[];
  template: number;
  status: "forming" | "active" | "completed";
  host_id: string;
  created_at: string;
}

export interface Participant {
  id: string;
  challenge_id: string;
  user_id: string;
  tags: string[];
  avatar_seed: string;
  is_host: boolean;
  joined_at: string;
}

// ─── Create ──────────────────────────────────────────────

/**
 * Create a new challenge and add the creator as host participant.
 * Returns the challenge id.
 */
export async function createChallenge(params: {
  name: string;
  challengeDate: string;
  checkpoints: string[];
  template: number;
  tags: string[];
}): Promise<string> {
  const userId = await getCurrentUserId();
  if (!userId) throw new Error("Not authenticated");

  // Generate a random avatar seed for the host
  const avatarSeed = Math.random().toString(36).slice(2, 10);

  // 1. Insert challenge
  const { data: challenge, error: cErr } = await supabase
    .from("challenges")
    .insert({
      name: params.name,
      challenge_date: params.challengeDate,
      checkpoints: params.checkpoints,
      template: params.template,
      status: "forming",
      host_id: userId,
    })
    .select("id")
    .single();

  if (cErr) throw cErr;

  // 2. Add creator as host participant
  const { error: pErr } = await supabase.from("participants").insert({
    challenge_id: challenge.id,
    user_id: userId,
    tags: params.tags,
    avatar_seed: avatarSeed,
    is_host: true,
  });

  if (pErr) throw pErr;

  return challenge.id;
}

// ─── Join ────────────────────────────────────────────────

/**
 * Join an existing challenge as a participant.
 * Fails if the challenge is full.
 */
export async function joinChallenge(
  challengeId: string,
  tags: string[]
): Promise<void> {
  const userId = await getCurrentUserId();
  if (!userId) throw new Error("Not authenticated");

  // Check challenge exists and is forming
  const { data: challenge, error: chErr } = await supabase
    .from("challenges")
    .select("template, status")
    .eq("id", challengeId)
    .single();

  if (chErr) throw chErr;
  if (challenge.status !== "forming") {
    throw new Error("该挑战已结束招募");
  }

  // Check not already joined
  const { data: existing } = await supabase
    .from("participants")
    .select("id")
    .eq("challenge_id", challengeId)
    .eq("user_id", userId)
    .maybeSingle();

  if (existing) throw new Error("你已经加入了该挑战");

  // Check not full
  const { count, error: cntErr } = await supabase
    .from("participants")
    .select("*", { count: "exact", head: true })
    .eq("challenge_id", challengeId);

  if (cntErr) throw cntErr;
  if (count !== null && count >= challenge.template) {
    throw new Error("该挑战已满员");
  }

  // Generate avatar seed
  const avatarSeed = Math.random().toString(36).slice(2, 10);

  // Insert participant
  const { error: pErr } = await supabase.from("participants").insert({
    challenge_id: challengeId,
    user_id: userId,
    tags,
    avatar_seed: avatarSeed,
    is_host: false,
  });

  if (pErr) throw pErr;

  // If now full, auto-confirm group
  if (count !== null && count + 1 >= challenge.template) {
    await confirmGroup(challengeId);
  }
}

// ─── Confirm Group ───────────────────────────────────────

/**
 * Confirm the group: change status from forming → active.
 * Only the host can confirm.
 */
export async function confirmGroup(challengeId: string): Promise<void> {
  const userId = await getCurrentUserId();
  if (!userId) throw new Error("Not authenticated");

  const { error } = await supabase
    .from("challenges")
    .update({ status: "active" })
    .eq("id", challengeId)
    .eq("host_id", userId)   // only host can confirm
    .eq("status", "forming"); // only forming → active

  if (error) throw error;
}

/**
 * Complete a challenge: change status from active → completed.
 * Called when a user submits all their checkins.
 */
export async function completeChallenge(challengeId: string): Promise<void> {
  const { error } = await supabase
    .from("challenges")
    .update({ status: "completed" })
    .eq("id", challengeId)
    .eq("status", "active");

  if (error) throw error;
}

// ─── Read ────────────────────────────────────────────────

/**
 * Get a single challenge by id.
 */
export async function getChallenge(challengeId: string): Promise<Challenge | null> {
  const { data, error } = await supabase
    .from("challenges")
    .select("*")
    .eq("id", challengeId)
    .single();

  if (error) {
    if (error.code === "PGRST116") return null; // not found
    throw error;
  }
  return data;
}

/**
 * Get all participants for a challenge.
 */
export async function getParticipants(challengeId: string): Promise<Participant[]> {
  const { data, error } = await supabase
    .from("participants")
    .select("*")
    .eq("challenge_id", challengeId)
    .order("joined_at", { ascending: true });

  if (error) throw error;
  return data ?? [];
}

/**
 * Get all challenges the current user is participating in.
 */
export async function getMyChallenges(): Promise<(Challenge & { my_role: "host" | "member" })[]> {
  const userId = await getCurrentUserId();
  if (!userId) return [];

  const { data, error } = await supabase
    .from("participants")
    .select("challenge_id, is_host, challenges(*)")
    .eq("user_id", userId)
    .order("joined_at", { ascending: false });

  if (error) throw error;

  return (data ?? [])
    .filter((p: any) => p.challenges)
    .map((p: any) => ({
      ...p.challenges,
      my_role: p.is_host ? "host" as const : "member" as const,
    }));
}
