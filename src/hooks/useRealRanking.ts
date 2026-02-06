import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

interface RankedPlayer {
  id: string;
  user_id: string;
  display_name: string;
  avatar_url: string;
  trophies: number;
  games_played: number;
  games_won: number;
}

/**
 * Hook pour récupérer le vrai classement depuis Supabase
 */
export const useRealRanking = (limit: number = 100) => {
  const [players, setPlayers] = useState<RankedPlayer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchRanking = async () => {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from("public_profiles")
          .select("id, user_id, display_name, avatar_url, trophies, games_played, games_won")
          .order("trophies", { ascending: false })
          .limit(limit);

        if (error) throw error;

        setPlayers((data as RankedPlayer[]) || []);
        setError(null);
      } catch (err: any) {
        console.error("Erreur classement:", err);
        setError(err.message);
        setPlayers([]);
      } finally {
        setLoading(false);
      }
    };

    fetchRanking();
  }, [limit]);

  return { players, loading, error };
};
