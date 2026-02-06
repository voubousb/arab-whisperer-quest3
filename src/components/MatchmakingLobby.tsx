import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect, useRef, useCallback } from "react";
import { Loader2, Users, Bot, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useGameSounds } from "@/hooks/useGameSounds";
import { getArenaByTrophies, trainingArena } from "@/data/arenas";
import { useMatchmaking } from "@/hooks/useMatchmaking";

interface OnlineMatchInfo {
  matchId: string;
  opponentId: string;
  opponentName: string;
  opponentAvatar: string;
  isPlayer1: boolean;
}

interface MatchmakingLobbyProps {
  isVsAI: boolean;
  playerTrophies: number;
  userId?: string | null;
  onMatchFound: (matchInfo?: OnlineMatchInfo) => void;
  onCancel?: () => void;
}

export const MatchmakingLobby = ({
  isVsAI,
  playerTrophies,
  userId,
  onMatchFound,
  onCancel,
}: MatchmakingLobbyProps) => {
  const { playClick, playMatchFound } = useGameSounds();
  const matchmaking = useMatchmaking(playerTrophies, userId ?? null);

  const [stage, setStage] = useState<"searching" | "found" | "countdown" | "timeout" | "error">("searching");
  const [dots, setDots] = useState("");
  const [opponent, setOpponent] = useState("");
  const [countdown, setCountdown] = useState(3);
  const [searchTime, setSearchTime] = useState(0);
  const searchTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Arène: Camp d'entraînement pour IA, sinon arène du joueur
  const arena = isVsAI ? trainingArena : getArenaByTrophies(playerTrophies);

  // Démarrer le matchmaking réel pour le mode en ligne
  useEffect(() => {
    if (!isVsAI && userId && matchmaking.status === "idle") {
      matchmaking.joinQueue();
    }
  }, [isVsAI, userId, matchmaking.status, matchmaking.joinQueue]);

  // Réagir aux changements de statut du matchmaking
  useEffect(() => {
    if (matchmaking.status === "found") {
      setOpponent(matchmaking.opponentName || "Adversaire");
      setStage("found");
      playMatchFound();
    } else if (matchmaking.status === "timeout") {
      setStage("timeout");
    } else if (matchmaking.status === "error") {
      setStage("error");
    }
  }, [matchmaking.status, matchmaking.opponentName, playMatchFound]);

  // Timer de recherche (max 60 secondes pour mode en ligne)
  useEffect(() => {
    if (stage !== "searching" || isVsAI) return;
    
    searchTimerRef.current = setInterval(() => {
      setSearchTime(prev => {
        if (prev >= 60) {
          // Timeout après 1 minute
          setStage("timeout");
          matchmaking.cancelMatchmaking();
          return prev;
        }
        return prev + 1;
      });
    }, 1000);
    
    return () => {
      if (searchTimerRef.current) {
        clearInterval(searchTimerRef.current);
      }
    };
  }, [stage, isVsAI, matchmaking]);

  // Animation des points de chargement
  useEffect(() => {
    if (stage !== "searching") return;
    const interval = setInterval(() => {
      setDots(prev => prev.length >= 3 ? "" : prev + ".");
    }, 500);
    return () => clearInterval(interval);
  }, [stage]);

  // IA: transition directe sans "partie trouvée"
  useEffect(() => {
    if (isVsAI) {
      const timer = setTimeout(() => {
        setOpponent("Intelligence Artificielle");
        setStage("countdown");
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [isVsAI]);

  // Passage au countdown après "found"
  useEffect(() => {
    if (stage !== "found") return;
    const timer = setTimeout(() => {
      setStage("countdown");
    }, 1500);
    return () => clearTimeout(timer);
  }, [stage]);

  // Countdown final
  useEffect(() => {
    if (stage !== "countdown") return;
    
    if (countdown === 0) {
      // Passer les infos du match si c'est un match en ligne
      if (!isVsAI && matchmaking.matchId && matchmaking.opponentId) {
        onMatchFound({
          matchId: matchmaking.matchId,
          opponentId: matchmaking.opponentId,
          opponentName: matchmaking.opponentName || "Adversaire",
          opponentAvatar: matchmaking.opponentAvatar || "tree",
          isPlayer1: matchmaking.isPlayer1,
        });
      } else {
        onMatchFound();
      }
      return;
    }

    playClick();

    const timer = setTimeout(() => {
      setCountdown(prev => prev - 1);
    }, 1000);

    return () => clearTimeout(timer);
  }, [stage, countdown, onMatchFound, playClick, isVsAI, matchmaking]);
  
  const handleCancel = useCallback(() => {
    if (searchTimerRef.current) {
      clearInterval(searchTimerRef.current);
    }
    matchmaking.cancelMatchmaking();
    onCancel?.();
  }, [onCancel, matchmaking]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{
        backgroundImage: `url(${arena.image})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      {/* Overlay sombre */}
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
      
      {/* Bouton quitter en haut à droite pendant la recherche */}
      {stage === "searching" && !isVsAI && onCancel && (
        <Button
          variant="ghost"
          size="icon"
          onClick={handleCancel}
          className="absolute top-4 right-4 z-20 text-white hover:bg-white/20"
        >
          <X className="w-6 h-6" />
        </Button>
      )}
      
      <div className="relative z-10 text-center space-y-8">
        <AnimatePresence mode="wait">
          {stage === "searching" && (
            <motion.div
              key="searching"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              <div className="flex items-center justify-center gap-4">
                {isVsAI ? (
                  <Bot className="w-16 h-16 text-primary animate-pulse" />
                ) : (
                  <Users className="w-16 h-16 text-primary animate-pulse" />
                )}
              </div>
              
              <div className="space-y-2">
                <h2 className="text-3xl font-bold text-white">
                  {isVsAI ? "Préparation" : "Recherche"}{dots}
                </h2>
                <p className="text-muted-foreground">
                  {isVsAI ? "L'IA se prépare..." : "Recherche d'un adversaire..."}
                </p>
                {!isVsAI && (
                  <p className="text-sm text-white/60">
                    {searchTime}s / 60s
                  </p>
                )}
              </div>
              
              <Loader2 className="w-12 h-12 mx-auto text-primary animate-spin" />
              
              {/* Nom de l'arène */}
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-lg text-primary font-medium"
              >
                {arena.name}
              </motion.p>
            </motion.div>
          )}

          {stage === "timeout" && (
            <motion.div
              key="timeout"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className="space-y-6"
            >
              <h2 className="text-3xl font-bold text-white">
                Aucune partie n'a été trouvée
              </h2>
              <p className="text-muted-foreground">
                Aucune partie n'a été trouvée en 60s. Réessaie plus tard !
              </p>
              <Button
                onClick={handleCancel}
                className="btn-violet"
              >
                Quitter
              </Button>
            </motion.div>
          )}

          {stage === "error" && (
            <motion.div
              key="error"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className="space-y-6"
            >
              <h2 className="text-3xl font-bold text-white">
                Impossible de lancer le match
              </h2>
              <p className="text-muted-foreground">
                {matchmaking.error || "Une erreur est survenue."}
              </p>
              <Button onClick={handleCancel} className="btn-violet">
                Quitter
              </Button>
            </motion.div>
          )}

          {stage === "found" && !isVsAI && (
            <motion.div
              key="found"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.2 }}
              className="space-y-6"
            >
              <motion.h2
                initial={{ scale: 0 }}
                animate={{ scale: [0, 1.2, 1] }}
                className="text-4xl font-bold text-secondary"
              >
                Partie trouvée !
              </motion.h2>
              
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="space-y-2"
              >
                <p className="text-muted-foreground">Adversaire :</p>
                <p className="text-2xl font-bold text-white">{opponent}</p>
              </motion.div>
              
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6 }}
                className="text-lg text-primary"
              >
                {arena.name}
              </motion.p>
            </motion.div>
          )}

          {stage === "countdown" && (
            <motion.div
              key="countdown"
              className="space-y-6"
            >
              <h2 className="text-2xl font-bold text-white">
                {isVsAI ? "L'entraînement commence dans" : "La partie commence dans"}
              </h2>
              
              <motion.div
                key={countdown}
                initial={{ scale: 2, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0, opacity: 0 }}
                className="text-9xl font-bold text-primary"
              >
                {countdown}
              </motion.div>
              
              <p className="text-lg text-muted-foreground">
                vs {opponent}
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};
