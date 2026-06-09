import { supabase } from "./supabase";
import type { RealtimeChannel } from "@supabase/supabase-js";

// ─── Subscriptions ───────────────────────────────────────

let channels: RealtimeChannel[] = [];

/**
 * Subscribe to challenge state changes (forming → active → completed)
 * and participant changes for a specific challenge.
 */
export function subscribeToChallenge(
  challengeId: string,
  callbacks: {
    onStatusChange?: (status: string) => void;
    onParticipantJoin?: (participant: any) => void;
  }
): RealtimeChannel {
  const channel = supabase
    .channel(`challenge:${challengeId}`)
    .on(
      "postgres_changes",
      {
        event: "UPDATE",
        schema: "public",
        table: "challenges",
        filter: `id=eq.${challengeId}`,
      },
      (payload) => {
        callbacks.onStatusChange?.(payload.new.status);
      }
    )
    .on(
      "postgres_changes",
      {
        event: "INSERT",
        schema: "public",
        table: "participants",
        filter: `challenge_id=eq.${challengeId}`,
      },
      (payload) => {
        callbacks.onParticipantJoin?.(payload.new);
      }
    )
    .subscribe();

  channels.push(channel);
  return channel;
}

/**
 * Subscribe to checkin events for a challenge.
 */
export function subscribeToCheckins(
  challengeId: string,
  callbacks: {
    onCheckin?: (checkin: any) => void;
  }
): RealtimeChannel {
  const channel = supabase
    .channel(`checkins:${challengeId}`)
    .on(
      "postgres_changes",
      {
        event: "INSERT",
        schema: "public",
        table: "checkins",
        filter: `challenge_id=eq.${challengeId}`,
      },
      (payload) => {
        callbacks.onCheckin?.(payload.new);
      }
    )
    .subscribe();

  channels.push(channel);
  return channel;
}

/**
 * Unsubscribe all active channels.
 */
export function unsubscribeAll(): void {
  channels.forEach((ch) => {
    supabase.removeChannel(ch);
  });
  channels = [];
}

/**
 * Unsubscribe a specific channel.
 */
export function unsubscribeChannel(channel: RealtimeChannel): void {
  supabase.removeChannel(channel);
  channels = channels.filter((c) => c !== channel);
}
