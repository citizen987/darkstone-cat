"use server";

import { createClient } from "@/lib/supabase/server";
import type { AdminMember } from "@/lib/supabase/auth";

// ---------------------------------------------------------------------------
// getAllMembers — calls get_all_members_for_admin() RPC
// ---------------------------------------------------------------------------

export async function getAllMembers(): Promise<{
  data: AdminMember[] | null;
  error: string | null;
}> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { data: null, error: "Not authenticated" };
  }

  const { data, error } = await supabase.rpc("get_all_members_for_admin");

  if (error) {
    console.error("[getAllMembers] RPC error:", error.message);
    return { data: null, error: error.message };
  }

  return { data: data as AdminMember[], error: null };
}
