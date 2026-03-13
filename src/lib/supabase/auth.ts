import { createClient } from "./server";
import type { User } from "@supabase/supabase-js";

export type Member = {
  id: string;
  first_name: string;
  last_name: string;
  member_number: string;
  phone_encrypted: string | null;
  dni_nie_encrypted: string | null;
  postal_code: string | null;
  ludoya_username: string | null;
  bgg_username: string | null;
  role: "member" | "admin";
  is_active: boolean;
  conduct_accepted: boolean;
  conduct_accepted_at: string | null;
  privacy_accepted: boolean;
  privacy_accepted_at: string | null;
  newsletter_accepted: boolean;
  newsletter_accepted_at: string | null;
  membership_start_date: string | null;
  created_at: string;
  updated_at: string;
};

export async function getCurrentUser(): Promise<User | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
}

export async function getCurrentMember(): Promise<Member | null> {
  const user = await getCurrentUser();
  if (!user) return null;

  const supabase = await createClient();
  const { data } = await supabase
    .from("members")
    .select("*")
    .eq("id", user.id)
    .single();

  return data as Member | null;
}

export async function isAdmin(): Promise<boolean> {
  const member = await getCurrentMember();
  return member?.role === "admin";
}

export async function getProfileData(): Promise<{
  email: string;
  member: Member;
} | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data } = await supabase
    .from("members")
    .select("*")
    .eq("id", user.id)
    .single();

  if (!data) return null;

  return {
    email: user.email ?? "",
    member: data as Member,
  };
}
