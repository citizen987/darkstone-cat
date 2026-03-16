"use server";

import { createAdminClient } from "./admin";
import { encrypt } from "@/lib/encryption";

type SignupData = {
  userId: string;
  phone?: string;
  dni?: string;
  postal_code?: string;
  ludoya_username?: string;
  bgg_username?: string;
  conduct_accepted: boolean;
  privacy_accepted: boolean;
  newsletter_accepted: boolean;
};

export async function updateMemberAfterSignup(
  data: SignupData
): Promise<{ error: string | null }> {
  if (!data.userId) {
    return { error: "Missing user ID" };
  }

  const supabase = createAdminClient();

  const now = new Date().toISOString();

  const updatePayload: Record<string, unknown> = {
    conduct_accepted: data.conduct_accepted,
    conduct_accepted_at: data.conduct_accepted ? now : null,
    privacy_accepted: data.privacy_accepted,
    privacy_accepted_at: data.privacy_accepted ? now : null,
    newsletter_accepted: data.newsletter_accepted,
  };

  if (data.phone?.trim()) {
    updatePayload.phone_encrypted = encrypt(data.phone.trim());
  }

  if (data.dni?.trim()) {
    updatePayload.dni_nie_encrypted = encrypt(data.dni.trim());
  }

  if (data.postal_code?.trim()) {
    updatePayload.postal_code = data.postal_code.trim();
  }

  if (data.ludoya_username?.trim()) {
    updatePayload.ludoya_username = data.ludoya_username.trim();
  }

  if (data.bgg_username?.trim()) {
    updatePayload.bgg_username = data.bgg_username.trim();
  }

  const { error } = await supabase
    .from("members")
    .update(updatePayload)
    .eq("id", data.userId);

  if (error) {
    return { error: error.message };
  }

  return { error: null };
}
