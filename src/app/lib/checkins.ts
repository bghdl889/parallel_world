import { supabase } from "./supabase";
import { getCurrentUserId } from "./auth";

// ─── Types ───────────────────────────────────────────────

export interface CheckIn {
  id: string;
  challenge_id: string;
  user_id: string;
  checkpoint: string;
  photo_url: string;
  caption: string;
  created_at: string;
}

// ─── Create ──────────────────────────────────────────────

/**
 * Compress an image file to max 800px width, quality 0.8.
 * Returns a Blob.
 */
function compressImage(file: File, maxWidth = 800, quality = 0.8): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement("canvas");
      const scale = Math.min(1, maxWidth / img.width);
      canvas.width = img.width * scale;
      canvas.height = img.height * scale;
      const ctx = canvas.getContext("2d")!;
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      canvas.toBlob(
        (blob) => {
          if (blob) resolve(blob);
          else reject(new Error("Image compression failed"));
        },
        "image/jpeg",
        quality
      );
    };
    img.onerror = reject;
    img.src = URL.createObjectURL(file);
  });
}

/**
 * Upload a photo to Supabase Storage and create a checkin record.
 */
export async function checkIn(
  challengeId: string,
  checkpoint: string,
  photoFile: File,
  caption: string
): Promise<CheckIn> {
  const userId = await getCurrentUserId();
  if (!userId) throw new Error("Not authenticated");

  // 1. Compress image
  const compressed = await compressImage(photoFile);

  // 2. Upload to storage
  const ext = photoFile.name.split(".").pop() || "jpg";
  const storagePath = `${challengeId}/${userId}/${checkpoint}_${Date.now()}.${ext}`;
  const { error: uploadErr } = await supabase.storage
    .from("photos")
    .upload(storagePath, compressed, { contentType: "image/jpeg", upsert: true });

  if (uploadErr) throw uploadErr;

  // 3. Get public URL
  const { data: urlData } = supabase.storage
    .from("photos")
    .getPublicUrl(storagePath);

  // 4. Upsert checkin record
  const { data, error } = await supabase
    .from("checkins")
    .upsert(
      {
        challenge_id: challengeId,
        user_id: userId,
        checkpoint,
        photo_url: urlData.publicUrl,
        caption,
      },
      { onConflict: "challenge_id,user_id,checkpoint" }
    )
    .select()
    .single();

  if (error) throw error;
  return data;
}

// ─── Read ────────────────────────────────────────────────

/**
 * Get the current user's checkins for a challenge.
 */
export async function getMyCheckins(challengeId: string): Promise<CheckIn[]> {
  const userId = await getCurrentUserId();
  if (!userId) return [];

  const { data, error } = await supabase
    .from("checkins")
    .select("*")
    .eq("challenge_id", challengeId)
    .eq("user_id", userId)
    .order("checkpoint", { ascending: true });

  if (error) throw error;
  return data ?? [];
}

/**
 * Get ALL checkins for a challenge (for results page).
 * Should only be called when challenge status is "completed".
 */
export async function getAllCheckins(challengeId: string): Promise<CheckIn[]> {
  const { data, error } = await supabase
    .from("checkins")
    .select("*")
    .eq("challenge_id", challengeId)
    .order("checkpoint", { ascending: true });

  if (error) throw error;
  return data ?? [];
}

/**
 * Check if the current user has completed all checkpoints.
 */
export async function hasCompletedAllCheckins(
  challengeId: string,
  checkpoints: string[]
): Promise<boolean> {
  const myCheckins = await getMyCheckins(challengeId);
  const completedPoints = new Set(myCheckins.map((c) => c.checkpoint));
  return checkpoints.every((cp) => completedPoints.has(cp));
}

/**
 * Submit/complete the challenge for the current user.
 * This checks if all checkpoints are done, then marks the challenge as completed.
 */
export async function submitChallenge(
  challengeId: string,
  checkpoints: string[]
): Promise<void> {
  const done = await hasCompletedAllCheckins(challengeId, checkpoints);
  if (!done) throw new Error("还有未完成的打卡哦~");

  // Check if ALL participants have completed their checkins
  const { data: participants } = await supabase
    .from("participants")
    .select("user_id")
    .eq("challenge_id", challengeId);

  if (!participants) return;

  const { count: totalCheckins } = await supabase
    .from("checkins")
    .select("*", { count: "exact", head: true })
    .eq("challenge_id", challengeId);

  const expectedTotal = participants.length * checkpoints.length;
  if (totalCheckins !== null && totalCheckins >= expectedTotal) {
    // All participants done → mark completed
    const { error } = await supabase
      .from("challenges")
      .update({ status: "completed" })
      .eq("id", challengeId);

    if (error) throw error;
  }
}
