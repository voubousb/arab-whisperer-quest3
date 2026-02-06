import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useGameStore } from "@/store/gameStore";
import type { User } from "@supabase/supabase-js";

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const { 
    player, 
    favorites,
    setPlayerFromProfile, 
    syncToSupabase 
  } = useGameStore();

  useEffect(() => {
    // Set up auth state listener BEFORE checking session
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        // Important: on peut se retrouver avec un refresh_token cassé en localStorage.
        // Dans ce cas, Supabase déclenche TOKEN_REFRESH_FAILED et l'app peut rester dans un état bizarre.
        // On force un "sign out local" pour repartir proprement.
        if ((event as unknown as string) === "TOKEN_REFRESH_FAILED") {
          try {
            // `scope: 'local'` évite toute dépendance réseau, et purge la session locale.
            await supabase.auth.signOut({ scope: "local" } as any);
          } catch {
            // noop
          }
          setUser(null);
          setLoading(false);
          return;
        }

        setUser(session?.user ?? null);
        
        if (session?.user) {
          // Fetch profile from Supabase
          setTimeout(async () => {
            const { data: profile } = await supabase
              .from("profiles")
              .select("*")
              .eq("user_id", session.user.id)
              .single();
            
            if (profile) {
              setPlayerFromProfile(profile);
            }
          }, 0);
        }
        
        setLoading(false);
      }
    );

    // Check for existing session
    (async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setUser(session?.user ?? null);
      if (!session?.user) setLoading(false);
    })();

    return () => subscription.unsubscribe();
  }, []);

  const signUp = async (email: string, password: string, displayName: string, avatarId?: string) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          display_name: displayName,
          avatar_id: avatarId || "tree",
        },
        emailRedirectTo: window.location.origin,
      },
    });
    
    return { data, error };
  };

  const signIn = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    
    return { data, error };
  };

  const signOut = async () => {
    // Sync data before signing out
    if (user) {
      await syncToSupabase(user.id);
    }
    
    const { error } = await supabase.auth.signOut();
    return { error };
  };

  // Sync player data to Supabase when it changes
  const syncData = async () => {
    if (!user) return;
    
    await syncToSupabase(user.id);
  };

  return {
    user,
    loading,
    signUp,
    signIn,
    signOut,
    syncData,
    isAuthenticated: !!user,
  };
};
