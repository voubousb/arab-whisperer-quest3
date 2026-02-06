import { useState, useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";

/**
 * Hook pour compter le nombre réel de joueurs en ligne
 * Utilise Supabase Realtime Presence pour un comptage précis
 */
export const useOnlinePresence = () => {
  const { user } = useAuth();
  const [onlineCount, setOnlineCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null);

  useEffect(() => {
    const updateCount = (channel: ReturnType<typeof supabase.channel>) => {
      const state = channel.presenceState();
      const count = Object.keys(state).length;
      setOnlineCount(count);
    };

    // Créer un canal de présence
    const channel = supabase.channel("online-users", {
      config: {
        presence: {
          key: user?.id || `anon-${Math.random().toString(36).slice(2)}`,
        },
      },
    });

    channel
      .on("presence", { event: "sync" }, () => {
        updateCount(channel);
        setLoading(false);
      })
      .on("presence", { event: "join" }, ({ newPresences }) => {
        // Recompter à chaque join/leave pour éviter un affichage bloqué à 0
        updateCount(channel);
        console.log("Nouveau joueur:", newPresences);
      })
      .on("presence", { event: "leave" }, ({ leftPresences }) => {
        updateCount(channel);
        console.log("Joueur parti:", leftPresences);
      })
      .subscribe(async (status) => {
        if (status === "SUBSCRIBED") {
          // Annoncer notre présence
          await channel.track({
            online_at: new Date().toISOString(),
            user_id: user?.id || null,
          });

          // Fallback: si jamais le "sync" ne remonte pas (réseau/realtime), ne pas rester bloqué.
          setLoading(false);
          updateCount(channel);
        }

        if (status === "CHANNEL_ERROR" || status === "TIMED_OUT") {
          setLoading(false);
        }
      });

    channelRef.current = channel;

    return () => {
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
      }
    };
  }, [user?.id]);

  return { onlineCount, loading };
};
