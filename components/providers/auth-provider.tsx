"use client";

import { useAuthStore } from "@/store/useAuthStore";
import { createClient, IS_MOCK_MODE } from "@/lib/client";

import { useEffect } from "react";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { setUser, setProfile, setIsLoading, clearAuth } = useAuthStore();

  useEffect(() => {
    // In local dev without Supabase credentials, skip auth entirely.
    if (IS_MOCK_MODE) {
      setIsLoading(false);
      return;
    }

    const supabase = createClient();

    const loadUserProfile = async (userId: string) => {
      try {
        const { data: profile } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", userId)
          .single();
        if (profile) setProfile(profile);
      } catch {
        // swallow profile fetch errors in dev
      }
    };

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      const currentUser = useAuthStore.getState().user;
      if (event === "SIGNED_OUT" || !session?.user) {
        clearAuth();
        setIsLoading(false);
        return;
      }
      if (currentUser?.id === session.user.id) {
        setIsLoading(false);
        return;
      }
      setUser(session.user);
      await loadUserProfile(session.user.id);
      setIsLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [clearAuth, setIsLoading, setProfile, setUser]);

  return <>{children}</>;
}
