import { useState, useEffect, useCallback, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";

interface MatchmakingState {
  status: "idle" | "searching" | "found" | "timeout" | "error";
  matchId: string | null;
  opponentId: string | null;
  opponentName: string | null;
  opponentAvatar: string | null;
  isPlayer1: boolean;
  error: string | null;
  queueStartTime: number | null; // Timestamp ISO du serveur quand la queue a démarré
}

const MATCHMAKING_TIMEOUT = 60000; // 60 secondes

export const useMatchmaking = (playerTrophies: number, userId: string | null) => {
  const [state, setState] = useState<MatchmakingState>({
    status: "idle",
    matchId: null,
    opponentId: null,
    opponentName: null,
    opponentAvatar: null,
    isPlayer1: false,
    error: null,
    queueStartTime: null,
  });

  const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const pollingRef = useRef<NodeJS.Timeout | null>(null);

  // Nettoyer la queue quand on quitte
  const leaveQueue = useCallback(async () => {
    if (!userId) return;

    try {
      await supabase.from("matchmaking_queue").delete().eq("user_id", userId);
    } catch (error) {
      console.error("Erreur en quittant la queue:", error);
    }
  }, [userId]);

  // Match trouvé via Realtime
  const handleMatchFound = useCallback(async (match: any, isPlayer1: boolean) => {
    // Nettoyer les timers
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    if (pollingRef.current) clearInterval(pollingRef.current);
    await leaveQueue();

    // Récupérer les infos de l'adversaire
    const opponentId = isPlayer1 ? match.player2_id : match.player1_id;
    
    const { data: opponentProfile } = await supabase
      .from("public_profiles")
      .select("display_name, avatar_url")
      .eq("user_id", opponentId)
      .single();

    setState({
      status: "found",
      matchId: match.id,
      opponentId,
      opponentName: opponentProfile?.display_name || "Adversaire",
      opponentAvatar: opponentProfile?.avatar_url || "tree",
      isPlayer1,
      error: null,
    });
  }, [leaveQueue]);

  // Annuler le matchmaking
  const cancelMatchmaking = useCallback(async () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    
    if (pollingRef.current) {
      clearInterval(pollingRef.current);
      pollingRef.current = null;
    }
    
    if (channelRef.current) {
      supabase.removeChannel(channelRef.current);
      channelRef.current = null;
    }
    
    await leaveQueue();
    setState(s => ({ ...s, status: "idle" }));
  }, [leaveQueue]);

  // Rejoindre la queue de matchmaking
  const joinQueue = useCallback(async () => {
    if (!userId) {
      setState((s) => ({ ...s, status: "error", error: "Non authentifié" }));
      return;
    }

    setState((s) => ({ ...s, status: "searching", error: null }));

    try {
      // D'abord, nettoyer toute entrée existante
      await leaveQueue();

      // Rejoindre la queue et récupérer le timestamp du serveur
      const { data: queueEntry, error: insertError } = await supabase
        .from("matchmaking_queue")
        .insert({
          user_id: userId,
          trophies: playerTrophies,
        })
        .select("created_at")
        .single();

      if (insertError) throw insertError;

      // Stocker le timestamp du serveur pour synchronisation
      const serverTimestamp = queueEntry?.created_at ? new Date(queueEntry.created_at).getTime() : Date.now();
      setState((s) => ({ ...s, queueStartTime: serverTimestamp }));

      // Écouter les nouvelles parties via Realtime (backup si polling rate)
      const channel = supabase
        .channel(`matchmaking:${userId}`)
        .on(
          "postgres_changes",
          {
            event: "INSERT",
            schema: "public",
            table: "online_matches",
            filter: `player1_id=eq.${userId}`,
          },
          async (payload) => {
            const match = payload.new as any;
            await handleMatchFound(match, true);
          }
        )
        .on(
          "postgres_changes",
          {
            event: "INSERT",
            schema: "public",
            table: "online_matches",
            filter: `player2_id=eq.${userId}`,
          },
          async (payload) => {
            const match = payload.new as any;
            await handleMatchFound(match, false);
          }
        )
        .subscribe();

      channelRef.current = channel;

      // Timeout après 60 secondes
      timeoutRef.current = setTimeout(() => {
        cancelMatchmaking();
        setState(s => ({ ...s, status: "timeout" }));
      }, MATCHMAKING_TIMEOUT);

      // Polling: vérifier toutes les 3 secondes via edge function
      const pollForOpponent = async () => {
        try {
          const { data, error } = await supabase.functions.invoke("find-match");

          if (error) {
            console.error("Erreur find-match:", error);
            // Important: si l'appel backend échoue (401, 500...), on stoppe la recherche
            // et on remonte une erreur visible côté UI.
            await cancelMatchmaking();
            setState(s => ({
              ...s,
              status: "error",
              error: "Connexion expirée ou erreur serveur. Reconnecte-toi puis réessaie.",
            }));
            return;
          }

          if (data?._version) {
            console.log("[find-match]", data._version, data);
          }

          if (data?.found && data?.matchId) {
            // Match trouvé!
            const isP1 = data.player1Id === userId;
            const oppId = isP1 ? data.player2Id : data.player1Id;

            const { data: oppProfile } = await supabase
              .from("public_profiles")
              .select("display_name, avatar_url")
              .eq("user_id", oppId)
              .single();

            if (timeoutRef.current) clearTimeout(timeoutRef.current);
            if (pollingRef.current) clearInterval(pollingRef.current);

            setState({
              status: "found",
              matchId: data.matchId,
              opponentId: oppId,
              opponentName: oppProfile?.display_name || "Adversaire",
              opponentAvatar: oppProfile?.avatar_url || "tree",
              isPlayer1: isP1,
              error: null,
            });
          }
        } catch (err) {
          console.error("Erreur polling:", err);
          await cancelMatchmaking();
          setState(s => ({
            ...s,
            status: "error",
            error: "Erreur réseau. Vérifie ta connexion et réessaie.",
          }));
        }
      };

      // Premier check immédiat, puis toutes les 3 secondes
      pollForOpponent();
      pollingRef.current = setInterval(pollForOpponent, 3000);
      
    } catch (error: any) {
      console.error("Erreur matchmaking:", error);
      const message = error?.message || error?.error_description || (typeof error === "string" ? error : "Impossible de lancer le match. Réessaie.");
      setState((s) => ({ ...s, status: "error", error: message }));
    }
  }, [userId, playerTrophies, leaveQueue, handleMatchFound, cancelMatchmaking]);

  // Reset
  const reset = useCallback(() => {
    setState({
      status: "idle",
      matchId: null,
      opponentId: null,
      opponentName: null,
      opponentAvatar: null,
      isPlayer1: false,
      error: null,
      queueStartTime: null,
    });
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      if (pollingRef.current) clearInterval(pollingRef.current);
      if (channelRef.current) supabase.removeChannel(channelRef.current);
      leaveQueue();
    };
  }, [leaveQueue]);

  return {
    ...state,
    joinQueue,
    cancelMatchmaking,
    reset,
  };
};
