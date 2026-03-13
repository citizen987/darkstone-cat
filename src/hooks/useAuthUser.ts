"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { User } from "@supabase/supabase-js";

type AuthState = {
  user: User | null;
  role: "member" | "admin" | null;
  loading: boolean;
};

export function useAuthUser(): AuthState {
  const [state, setState] = useState<AuthState>({
    user: null,
    role: null,
    loading: true,
  });

  useEffect(() => {
    const supabase = createClient();

    async function fetchRole(userId: string) {
      const { data } = await supabase
        .from("members")
        .select("role")
        .eq("id", userId)
        .single();
      return (data?.role as "member" | "admin") ?? null;
    }

    // Initial fetch
    supabase.auth.getUser().then(async ({ data: { user } }) => {
      if (user) {
        const role = await fetchRole(user.id);
        setState({ user, role, loading: false });
      } else {
        setState({ user: null, role: null, loading: false });
      }
    });

    // Listen for auth state changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session?.user) {
        const role = await fetchRole(session.user.id);
        setState({ user: session.user, role, loading: false });
      } else {
        setState({ user: null, role: null, loading: false });
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  return state;
}
