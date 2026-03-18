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
  newsletter_accepted: boolean;
};

export async function updateMemberAfterSignup(
  data: SignupData
): Promise<{ error: string | null }> {
  if (!data.userId) {
    return { error: "Missing user ID" };
  }

  const supabase = createAdminClient();

  const updatePayload: Record<string, unknown> = {
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
