import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Trophy, Swords, Bot, Users, Crown, ChevronLeft, ChevronRight, ChevronUp, ChevronDown, Star, Wifi, Clock, X, UsersRound, Lock, Eye, LogOut, Key } from "lucide-react";
import { useOnlinePresence } from "@/hooks/useOnlinePresence";
import { useRealRanking } from "@/hooks/useRealRanking";
import { Button } from "@/components/ui/button";
import { vocabularyWords, VocabularyWord, getCurrentSeasonMonth, getDaysRemainingInMonth } from "@/data/arabicData";
import { getArenaByTrophies, arenas, Arena, trainingArena } from "@/data/arenas";
import { useGameStore } from "@/store/gameStore";
import { useGameSounds } from "@/hooks/useGameSounds";
import { useElevenLabsSpeech } from "@/hooks/useElevenLabsSpeech";
import { MatchmakingLobby } from "@/components/MatchmakingLobby";
import { VictoryScreen } from "@/components/VictoryScreen";
import { AvatarDisplay } from "@/components/AvatarDisplay";
import { avatars, getAvatarById } from "@/data/avatars";
import { checkAnswerWithVariations } from "@/data/wordVariations";
import { getWordDifficulty, getWordsForArena, Difficulty } from "@/data/wordDifficulty";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";
import { AuthModal } from "@/components/AuthModal";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

// Générer un code de clan à 6 lettres majuscules
const generateClanCode = (): string => {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  let code = "";
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
};

// Plus de mock players - classement depuis Supabase uniquement

// Plus de faux clans - chargés depuis Supabase
const mockClans: { id: string; name: string; avatarId: string; members: number; trophies: number; code: string }[] = [];

// Niveaux de difficulté IA
type AIDifficulty = "facile" | "moyen" | "difficile";

// Calcul des trophées basé sur l'arène
const calculateTrophyGain = (playerTrophies: number, won: boolean): number => {
  const arena = getArenaByTrophies(playerTrophies);
  
  if (won) {
    const baseGain = 30;
    const reduction = Math.floor((arena.id - 1) * 2);
    return Math.max(10, baseGain - reduction);
  } else {
    const baseLoss = 15;
    const increase = Math.floor((arena.id - 1) * 1.5);
    return -(baseLoss + increase);
  }
};

const Competition = () => {
  const navigate = useNavigate();
  const { playClick } = useGameSounds();
  const { player, removeTrophies } = useGameStore();
  const { user, isAuthenticated } = useAuth();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [gameMode, setGameMode] = useState<"menu" | "lobby" | "playing" | "result">("menu");
  const [isVsAI, setIsVsAI] = useState(false);
  const [aiDifficulty, setAIDifficulty] = useState<AIDifficulty>("moyen");
  const [onlineMatchInfo, setOnlineMatchInfo] = useState<{
    matchId: string;
    opponentId: string;
    opponentName: string;
    opponentAvatar: string;
    isPlayer1: boolean;
  } | null>(null);
  const [lastGameResult, setLastGameResult] = useState<{
    won: boolean;
    playerScore: number;
    opponentScore: number;
    trophiesChange: number;
  } | null>(null);
  const [showQuitConfirm, setShowQuitConfirm] = useState(false);
  const [pendingQuitAction, setPendingQuitAction] = useState<"menu" | "home" | null>(null);
  
  const arena = getArenaByTrophies(player.trophies);
  
  // Calculer pénalité potentielle en cas d'abandon
  const calculatePenalty = (): number => {
    if (isVsAI) return 0; // Pas de pénalité contre l'IA
    const potentialGain = calculateTrophyGain(player.trophies, true);
    return potentialGain; // Perd ce qu'il aurait pu gagner
  };
  
  const handleTryToQuit = (action: "menu" | "home") => {
    if (gameMode === "playing" && !isVsAI) {
      // En jeu en ligne -> confirmation
      setPendingQuitAction(action);
      setShowQuitConfirm(true);
    } else {
      // Menu ou vs IA -> quitter directement
      if (action === "menu") setGameMode("menu");
      else navigate("/");
    }
  };
  
  const handleConfirmQuit = () => {
    const penalty = calculatePenalty();
    if (penalty > 0) {
      removeTrophies(penalty);
    }
    setShowQuitConfirm(false);
    if (pendingQuitAction === "menu") setGameMode("menu");
    else if (pendingQuitAction === "home") navigate("/");
    setPendingQuitAction(null);
  };
  
  const startGame = (vsAI: boolean, difficulty?: AIDifficulty) => {
    playClick();

    // Le mode en ligne requiert un compte (sinon tu restes bloqué en "recherche")
    if (!vsAI && !isAuthenticated) {
      toast.info("Connecte-toi pour jouer en ligne");
      setShowAuthModal(true);
      return;
    }

    setIsVsAI(vsAI);
    if (difficulty) setAIDifficulty(difficulty);
    setOnlineMatchInfo(null); // Reset match info
    setGameMode("lobby");
  };
  
  const handleMatchFound = (matchInfo?: {
    matchId: string;
    opponentId: string;
    opponentName: string;
    opponentAvatar: string;
    isPlayer1: boolean;
  }) => {
    if (matchInfo) {
      setOnlineMatchInfo(matchInfo);
    }
    setGameMode("playing");
  };
  
  const handleGameComplete = (result: { won: boolean; playerScore: number; opponentScore: number; trophiesChange: number }) => {
    setLastGameResult(result);
    setGameMode("result");
  };
  
  // Calculer temps restant avant fin de saison
  const getSeasonTimeRemaining = () => {
    const now = new Date();
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);
    const diff = endOfMonth.getTime() - now.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    return `${days}j ${hours}h`;
  };
  
  return (
    <div className="min-h-screen bg-background">
      {/* Header avec saison */}
      <header className="p-4 sticky top-0 bg-background/80 backdrop-blur-lg z-50">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => {
              playClick();
              if (gameMode === "menu") {
                navigate("/");
              } else if (gameMode === "playing") {
                handleTryToQuit("menu");
              } else {
                setGameMode("menu");
              }
            }}
            className="text-foreground hover:bg-muted"
          >
            <ArrowLeft className="w-6 h-6" />
          </Button>
          <h1 className="text-2xl font-bold text-gradient-yellow">Compétition</h1>
          
          {/* Affichage trophées + photo de profil */}
          <div className="ml-auto flex items-center gap-3">
            <div className="flex items-center gap-2 bg-muted px-4 py-2 rounded-full">
              <Trophy className="w-5 h-5 text-primary" />
              <span className="font-bold text-primary">{player.trophies}</span>
            </div>
            <AvatarDisplay avatarId={player.avatarId || "tree"} size="sm" />
          </div>
        </div>
        
        {/* Bannière saison */}
        <div className="mt-2 flex items-center justify-center gap-3 text-sm">
          <span className="font-bold text-primary">{getCurrentSeasonMonth().name}</span>
          <span className="text-muted-foreground">•</span>
          <span className="text-muted-foreground">Fin dans <span className="font-bold text-primary">{getSeasonTimeRemaining()}</span></span>
        </div>
      </header>

      <AuthModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} />
      
      <main className="container max-w-4xl mx-auto p-4">
        <AnimatePresence mode="wait">
          {gameMode === "menu" && (
            <CompetitionMenu
              key="menu"
              onStartVsAI={(difficulty) => startGame(true, difficulty)}
              onStartOnline={() => startGame(false)}
              player={player}
              playerName={player.name}
              authUserId={user?.id ?? null}
              isAuthenticated={isAuthenticated}
              onOpenAuth={() => setShowAuthModal(true)}
            />
          )}
          
          {gameMode === "lobby" && (
            <MatchmakingLobby
              key="lobby"
              isVsAI={isVsAI}
              playerTrophies={player.trophies}
              userId={user?.id ?? null}
              onMatchFound={handleMatchFound}
              onCancel={() => setGameMode("menu")}
            />
          )}
          
          {gameMode === "playing" && (
            <GameArena
              key="game"
              isVsAI={isVsAI}
              aiDifficulty={aiDifficulty}
              arena={isVsAI ? trainingArena : arena}
              playerTrophies={player.trophies}
              playerName={player.name}
              playerAvatar={player.avatarId || "tree"}
              onlineMatchInfo={onlineMatchInfo}
              onComplete={handleGameComplete}
            />
          )}
          
          {gameMode === "result" && lastGameResult && (
            <VictoryScreen
              key="result"
              won={lastGameResult.won}
              playerScore={lastGameResult.playerScore}
              opponentScore={lastGameResult.opponentScore}
              trophiesChange={lastGameResult.trophiesChange}
              totalTrophies={player.trophies}
              onPlayAgain={() => setGameMode("lobby")}
              onBackToMenu={() => setGameMode("menu")}
            />
          )}
        </AnimatePresence>
      </main>
      
      {/* Dialog de confirmation pour quitter */}
      <AlertDialog open={showQuitConfirm} onOpenChange={setShowQuitConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Quitter la partie ?</AlertDialogTitle>
            <AlertDialogDescription>
              Si tu quittes maintenant, tu perdras <span className="text-accent font-bold">{calculatePenalty()} trophées</span> (ce que tu aurais pu gagner).
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setShowQuitConfirm(false)}>
              Continuer
            </AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmQuit} className="bg-accent hover:bg-accent/90">
              Quitter
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

interface CompetitionMenuProps {
  onStartVsAI: (difficulty: AIDifficulty) => void;
  onStartOnline: () => void;
  player: { trophies: number; gamesPlayed: number; gamesWon: number; avatarId?: string };
  playerName: string;
  authUserId: string | null;
  isAuthenticated: boolean;
  onOpenAuth: () => void;
}

const CompetitionMenu = ({ onStartVsAI, onStartOnline, player, playerName, authUserId, isAuthenticated, onOpenAuth }: CompetitionMenuProps) => {
  const { playClick } = useGameSounds();
  const arena = getArenaByTrophies(player.trophies);
  const nextArena = arenas.find(a => a.minTrophies > player.trophies);
  const [showAIDifficultyModal, setShowAIDifficultyModal] = useState(false);
  const [showArenasView, setShowArenasView] = useState(false);
  const [showRankingView, setShowRankingView] = useState(false);
  const [showClanView, setShowClanView] = useState(false);
  const { onlineCount: onlinePlayers } = useOnlinePresence();
  
  const seasonMonth = getCurrentSeasonMonth();
  const daysRemaining = getDaysRemainingInMonth();
  
  // Calcul progression vers prochaine arène
  const trophiesToNextArena = nextArena ? nextArena.minTrophies - player.trophies : 0;
  const progressToNextArena = nextArena 
    ? ((player.trophies - arena.minTrophies) / (nextArena.minTrophies - arena.minTrophies)) * 100
    : 100;
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="space-y-6"
    >
      {/* Arène actuelle - Bandeau compact - cliquable pour voir l'arène */}
      <motion.button
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        whileHover={{ scale: 1.01 }}
        whileTap={{ scale: 0.99 }}
        onClick={() => {
          playClick();
          setShowArenasView(true);
        }}
        className="relative overflow-hidden rounded-2xl w-full text-left"
        style={{
          backgroundImage: `url(${arena.image})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent" />
        
        <div className="relative z-10 p-6 pt-20">
          {/* Badge arène en haut - cliquable pour voir en grand */}
          <div className="absolute top-4 left-1/2 -translate-x-1/2">
            <div className="w-16 h-16 rounded-full overflow-hidden border-4 border-primary shadow-xl">
              <img src={arena.image} alt={arena.name} className="w-full h-full object-cover" />
            </div>
          </div>
          
          {/* Nom et trophées */}
          <div className="text-center mt-2">
            <h3 className="text-2xl font-bold text-white mb-1">{arena.name}</h3>
            <p className="text-primary font-semibold">{arena.minTrophies}+ trophées</p>
          </div>
          
          {/* Progression vers prochaine arène */}
          {nextArena && (
            <div className="mt-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-white/80">{player.trophies}</span>
                <span className="text-white/80">{nextArena.minTrophies}</span>
              </div>
              <div className="h-3 rounded-full bg-white/20 overflow-hidden">
                <motion.div 
                  className="h-full rounded-full bg-gradient-to-r from-primary to-yellow-400"
                  initial={{ width: 0 }}
                  animate={{ width: `${progressToNextArena}%` }}
                  transition={{ duration: 1, ease: "easeOut" }}
                />
              </div>
              <p className="text-center text-sm text-white/80">
                Encore <span className="text-primary font-bold">{trophiesToNextArena}</span> pour <span className="text-white font-bold">{nextArena.name}</span>
              </p>
            </div>
          )}
        </div>
      </motion.button>
      
      {/* Stats du joueur */}
      <div className="flex items-center justify-center gap-4 text-sm">
        <div className="flex items-center gap-2 text-muted-foreground">
          <Wifi className="w-4 h-4 text-secondary" />
          <span><span className="text-secondary font-bold">{onlinePlayers}</span> en ligne</span>
        </div>
        <div className="flex items-center gap-2 text-muted-foreground">
          <Clock className="w-4 h-4 text-primary" />
          <span>Fin dans <span className="text-primary font-bold">{daysRemaining}</span>j</span>
        </div>
      </div>
      
      {/* 5 GROS BLOCS - Style Clash Royale */}
      <div className="grid grid-cols-2 gap-4">
        {/* Jouer contre IA */}
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => setShowAIDifficultyModal(true)}
          className="btn-violet flex flex-col items-center gap-4 py-8 rounded-2xl"
        >
          <Bot className="w-14 h-14" />
          <div className="text-center">
            <h3 className="text-xl font-bold">Contre l'IA</h3>
            <p className="text-sm opacity-80">Entraînement</p>
          </div>
        </motion.button>
        
        {/* Jouer en ligne */}
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={onStartOnline}
          className="btn-coral flex flex-col items-center gap-4 py-8 rounded-2xl"
        >
          <Users className="w-14 h-14" />
          <div className="text-center">
            <h3 className="text-xl font-bold">En ligne</h3>
            <p className="text-sm opacity-80">Gagne des trophées</p>
          </div>
        </motion.button>
        
        {/* Arènes */}
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => {
            playClick();
            setShowArenasView(true);
          }}
          className="bg-gradient-to-br from-amber-500 to-orange-600 text-white flex flex-col items-center gap-4 py-8 rounded-2xl shadow-lg"
        >
          <Star className="w-14 h-14" />
          <div className="text-center">
            <h3 className="text-xl font-bold">Arènes</h3>
            <p className="text-sm opacity-80">Voir toutes</p>
          </div>
        </motion.button>
        
        {/* Classement */}
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => {
            playClick();
            setShowRankingView(true);
          }}
          className="bg-gradient-to-br from-emerald-500 to-teal-600 text-white flex flex-col items-center gap-4 py-8 rounded-2xl shadow-lg"
        >
          <Crown className="w-14 h-14" />
          <div className="text-center">
            <h3 className="text-xl font-bold">Classement</h3>
            <p className="text-sm opacity-80">Mondial</p>
          </div>
        </motion.button>
        
        {/* Clan - NOUVEAU */}
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => {
            playClick();
            setShowClanView(true);
          }}
          className="col-span-2 bg-gradient-to-br from-indigo-500 to-purple-600 text-white flex flex-col items-center gap-4 py-8 rounded-2xl shadow-lg"
        >
          <UsersRound className="w-14 h-14" />
          <div className="text-center">
            <h3 className="text-xl font-bold">Clan</h3>
            <p className="text-sm opacity-80">Rejoins ou crée un clan</p>
          </div>
        </motion.button>
      </div>
      
      {/* Modal difficulté IA */}
      <AnimatePresence>
        {showAIDifficultyModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
            onClick={() => setShowAIDifficultyModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="card-glass p-6 max-w-sm w-full space-y-4"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-xl font-bold text-center">Choisis ta difficulté</h3>
              <p className="text-sm text-center text-muted-foreground">
                Mode entraînement - Pas de trophées
              </p>
              
              <div className="space-y-3">
                <Button
                  onClick={() => {
                    setShowAIDifficultyModal(false);
                    onStartVsAI("facile");
                  }}
                  className="w-full bg-secondary hover:bg-secondary/90"
                >
                  Facile - Mots simples
                </Button>
                <Button
                  onClick={() => {
                    setShowAIDifficultyModal(false);
                    onStartVsAI("moyen");
                  }}
                  className="w-full bg-primary hover:bg-primary/90"
                >
                  Moyen - Mots variés
                </Button>
                <Button
                  onClick={() => {
                    setShowAIDifficultyModal(false);
                    onStartVsAI("difficile");
                  }}
                  className="w-full bg-accent hover:bg-accent/90"
                >
                  Difficile - Mots complexes
                </Button>
              </div>
              
              <Button
                variant="ghost"
                onClick={() => setShowAIDifficultyModal(false)}
                className="w-full"
              >
                Annuler
              </Button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Vue Arènes - Style Clash Royale (scroll vertical) */}
      <AnimatePresence>
        {showArenasView && (
          <ArenasScrollView 
            playerTrophies={player.trophies} 
            onClose={() => setShowArenasView(false)} 
          />
        )}
      </AnimatePresence>
      
      {/* Vue Classement */}
      <AnimatePresence>
        {showRankingView && (
          <RankingView 
            player={player}
            onClose={() => setShowRankingView(false)} 
          />
        )}
      </AnimatePresence>
      
      {/* Vue Clan */}
      <AnimatePresence>
        {showClanView && (
          <ClanView 
            playerAvatarId={player.avatarId || "tree"}
            playerName={playerName}
            userId={authUserId}
            onOpenAuth={onOpenAuth}
            onClose={() => setShowClanView(false)} 
          />
        )}
      </AnimatePresence>
    </motion.div>
  );
};

// Vue des arènes style Clash Royale (scroll vertical)
interface ArenasScrollViewProps {
  playerTrophies: number;
  onClose: () => void;
}

const ArenasScrollView = ({ playerTrophies, onClose }: ArenasScrollViewProps) => {
  const { playClick } = useGameSounds();
  const scrollRef = useRef<HTMLDivElement>(null);
  const currentArena = getArenaByTrophies(playerTrophies);
  const [selectedArena, setSelectedArena] = useState<Arena | null>(null);
  
  // Scroll jusqu'à l'arène actuelle au montage
  useEffect(() => {
    if (scrollRef.current) {
      const currentArenaIndex = arenas.findIndex(a => a.id === currentArena.id);
      const arenaHeight = 200; // hauteur approximative de chaque arène
      const scrollPosition = (arenas.length - 1 - currentArenaIndex) * arenaHeight;
      scrollRef.current.scrollTop = scrollPosition;
    }
  }, [currentArena.id]);
  
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-gradient-to-b from-sky-900 via-sky-800 to-sky-900"
    >
      {/* Header */}
      <div className="sticky top-0 z-10 p-4 bg-black/40 backdrop-blur-lg flex items-center justify-between">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => {
            playClick();
            onClose();
          }}
          className="text-white hover:bg-white/20"
        >
          <X className="w-6 h-6" />
        </Button>
        <h2 className="text-2xl font-bold text-white">Arènes</h2>
        <div className="flex items-center gap-2 bg-black/30 px-3 py-1 rounded-full">
          <Trophy className="w-4 h-4 text-primary" />
          <span className="font-bold text-primary">{playerTrophies}</span>
        </div>
      </div>
      
      {/* Pattern de fond style Clash Royale */}
      <div 
        className="absolute inset-0 opacity-20"
        style={{
          backgroundImage: `
            repeating-linear-gradient(
              0deg,
              transparent,
              transparent 40px,
              rgba(255,255,255,0.05) 40px,
              rgba(255,255,255,0.05) 80px
            ),
            repeating-linear-gradient(
              90deg,
              transparent,
              transparent 40px,
              rgba(255,255,255,0.05) 40px,
              rgba(255,255,255,0.05) 80px
            )
          `,
        }}
      />
      
      {/* Liste scrollable des arènes (inversée - plus haute en haut) */}
      <div 
        ref={scrollRef}
        className="h-[calc(100vh-80px)] overflow-y-auto px-4 py-6 relative"
      >
        <div className="max-w-lg mx-auto space-y-4 flex flex-col-reverse">
          {arenas.map((arena, index) => {
            const isCurrentArena = arena.id === currentArena.id;
            const isLocked = arena.minTrophies > playerTrophies;
            
            return (
              <motion.div
                key={arena.id}
                initial={{ opacity: 0, x: index % 2 === 0 ? -50 : 50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                className="relative"
              >
                {/* Ligne de connexion vers l'arène suivante */}
                {index < arenas.length - 1 && (
                  <div className="absolute left-1/2 -translate-x-1/2 -top-4 w-2 h-8 bg-gradient-to-t from-primary/50 to-transparent rounded-full" />
                )}
                
                {/* Carte arène - cliquable pour voir */}
                <button
                  onClick={() => {
                    playClick();
                    setSelectedArena(arena);
                  }}
                  className={`relative overflow-hidden rounded-2xl transition-all w-full ${
                    isCurrentArena 
                      ? "ring-4 ring-primary shadow-2xl shadow-primary/30" 
                      : isLocked 
                        ? "opacity-70"
                        : ""
                  }`}
                >
                  {/* Image de fond avec filtre gris si non débloqué */}
                  <div 
                    className={`h-44 bg-cover bg-center relative ${isLocked ? "grayscale" : ""}`}
                    style={{ backgroundImage: `url(${arena.image})` }}
                  >
                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />
                    
                    {/* Contenu */}
                    <div className="absolute inset-0 flex flex-col justify-end p-4">
                      {/* Badge trophées */}
                      <div className="absolute top-3 left-3 flex items-center gap-1 bg-black/60 px-3 py-1 rounded-full">
                        <Trophy className="w-4 h-4 text-primary" />
                        <span className="font-bold text-primary">{arena.minTrophies}</span>
                      </div>
                      
                      {/* Badge "Tu es ici" */}
                      {isCurrentArena && (
                        <div className="absolute top-3 right-3 bg-primary text-primary-foreground px-3 py-1 rounded-full text-sm font-bold animate-pulse">
                          Tu es ici !
                        </div>
                      )}
                      
                      {/* Cadenas si locked */}
                      {isLocked && (
                        <div className="absolute top-3 right-3 bg-black/60 text-white px-3 py-1 rounded-full text-sm flex items-center gap-1">
                          <Lock className="w-3 h-3" />
                          +{arena.minTrophies - playerTrophies}
                        </div>
                      )}
                      
                      {/* Bouton voir */}
                      <div className="absolute top-1/2 right-3 -translate-y-1/2">
                        <div className="bg-white/20 backdrop-blur-sm p-2 rounded-full">
                          <Eye className="w-5 h-5 text-white" />
                        </div>
                      </div>
                      
                      {/* Nom arène */}
                      <div className="text-center">
                        <h3 className="text-2xl font-bold text-white drop-shadow-lg">
                          {arena.name}
                        </h3>
                        {arena.nameAr && (
                          <p className="font-arabic text-lg text-primary mt-1">
                            {arena.nameAr}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </button>
              </motion.div>
            );
          })}
        </div>
        
        {/* Indicateurs de scroll */}
        <div className="fixed bottom-20 right-4 flex flex-col gap-2">
          <Button
            size="icon"
            variant="secondary"
            onClick={() => {
              if (scrollRef.current) {
                scrollRef.current.scrollBy({ top: -200, behavior: 'smooth' });
              }
            }}
            className="rounded-full bg-black/50 hover:bg-black/70"
          >
            <ChevronUp className="w-5 h-5 text-white" />
          </Button>
          <Button
            size="icon"
            variant="secondary"
            onClick={() => {
              if (scrollRef.current) {
                scrollRef.current.scrollBy({ top: 200, behavior: 'smooth' });
              }
            }}
            className="rounded-full bg-black/50 hover:bg-black/70"
          >
            <ChevronDown className="w-5 h-5 text-white" />
          </Button>
        </div>
      </div>
      
      {/* Modal preview arène */}
      <AnimatePresence>
        {selectedArena && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-60 bg-black/80 flex items-center justify-center p-4"
            onClick={() => setSelectedArena(null)}
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              className="max-w-md w-full"
              onClick={(e) => e.stopPropagation()}
            >
              <div 
                className={`rounded-3xl overflow-hidden ${selectedArena.minTrophies > playerTrophies ? "grayscale" : ""}`}
                style={{ 
                  backgroundImage: `url(${selectedArena.image})`,
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                }}
              >
                <div className="bg-gradient-to-t from-black/90 via-black/50 to-black/20 p-6">
                  <div className="text-center space-y-4">
                    <h2 className="text-3xl font-bold text-white">{selectedArena.name}</h2>
                    {selectedArena.nameAr && (
                      <p className="font-arabic text-2xl text-primary">{selectedArena.nameAr}</p>
                    )}
                    <div className="flex items-center justify-center gap-2">
                      <Trophy className="w-6 h-6 text-primary" />
                      <span className="text-2xl font-bold text-primary">{selectedArena.minTrophies}+</span>
                    </div>
                    {selectedArena.minTrophies > playerTrophies && (
                      <p className="text-muted-foreground">
                        Encore {selectedArena.minTrophies - playerTrophies} trophées pour débloquer
                      </p>
                    )}
                    <Button onClick={() => setSelectedArena(null)} variant="secondary" className="mt-4">
                      Fermer
                    </Button>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

// Vue Classement mondial
interface RankingViewProps {
  player: { trophies: number; gamesPlayed: number; gamesWon: number; avatarId?: string; name?: string };
  onClose: () => void;
}

const RankingView = ({ player, onClose }: RankingViewProps) => {
  const { playClick } = useGameSounds();
  const [currentPage, setCurrentPage] = useState(1);
  const playersPerPage = 10;
  
  const seasonMonth = getCurrentSeasonMonth();
  const daysRemaining = getDaysRemainingInMonth();
  
  // Charger le classement réel depuis Supabase
  const { players: rankedPlayers, loading: rankingLoading } = useRealRanking(100);
  
  // Ajouter le joueur au classement s'il n'est pas déjà dedans
  const allPlayers = [...rankedPlayers.map(p => ({
    id: p.user_id || p.id,
    name: p.display_name || "Joueur",
    trophies: p.trophies || 0,
    gamesPlayed: p.games_played || 0,
    gamesWon: p.games_won || 0,
    avatarId: p.avatar_url || "tree",
  }))];
  
  // Ajouter le joueur actuel s'il n'est pas dans la liste
  const isPlayerInList = allPlayers.some(p => p.name === player.name && p.trophies === player.trophies);
  if (!isPlayerInList) {
    allPlayers.push({
      id: "current",
      name: player.name || "Toi",
      trophies: player.trophies,
      gamesPlayed: player.gamesPlayed,
      gamesWon: player.gamesWon,
      avatarId: player.avatarId || "tree",
    });
  }
  
  // Trier par trophées
  allPlayers.sort((a, b) => b.trophies - a.trophies);
  
  const playerRankPosition = allPlayers.findIndex(p => 
    p.id === "current" || (p.name === player.name && p.trophies === player.trophies)
  ) + 1;
  
  // Pagination
  const totalPages = Math.ceil(allPlayers.length / playersPerPage);
  const startIndex = (currentPage - 1) * playersPerPage;
  const currentPlayers = allPlayers.slice(startIndex, startIndex + playersPerPage);
  
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-background"
    >
      {/* Header */}
      <div className="sticky top-0 z-10 p-4 bg-background/90 backdrop-blur-lg flex items-center justify-between border-b border-border">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => {
            playClick();
            onClose();
          }}
        >
          <X className="w-6 h-6" />
        </Button>
        <h2 className="text-2xl font-bold text-foreground">Classement</h2>
        <div className="w-10" />
      </div>
      
      {/* Contenu */}
      <div className="h-[calc(100vh-80px)] overflow-y-auto px-4 py-4 space-y-4">
        {/* Saison */}
        <div className="card-glass p-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-primary" />
            <span className="text-sm font-bold">{seasonMonth.name}</span>
          </div>
          <span className="text-sm text-primary font-bold">
            Fin dans {daysRemaining} jours
          </span>
        </div>
        
        {/* Ton rang */}
        <div className="card-glass p-4 bg-primary/10 border border-primary/30">
          <div className="flex items-center gap-4">
            <div className="text-3xl font-bold text-primary">#{playerRankPosition}</div>
            <AvatarDisplay avatarId={player.avatarId || "tree"} size="lg" />
            <div className="flex-1">
              <p className="font-bold text-foreground">{player.name || "Toi"}</p>
              <p className="text-sm text-muted-foreground">
                {player.trophies} trophées
              </p>
            </div>
          </div>
        </div>
        
        {/* Liste des joueurs */}
        <div className="card-glass overflow-hidden">
          <div className="divide-y divide-border">
            {currentPlayers.map((p, i) => {
              const globalRank = startIndex + i + 1;
              const pArena = getArenaByTrophies(p.trophies);
              const isCurrentPlayer = p.id === "current";
              
              return (
                <motion.div
                  key={p.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.03 }}
                  className={`flex items-center gap-4 p-4 ${
                    isCurrentPlayer ? "bg-primary/10" : ""
                  }`}
                >
                  {/* Rang */}
                  <div className="w-10 text-center">
                    {globalRank <= 3 ? (
                      <span className={`text-2xl ${
                        globalRank === 1 ? "text-yellow-400" :
                        globalRank === 2 ? "text-gray-400" :
                        "text-orange-400"
                      }`}>
                        ★
                      </span>
                    ) : (
                      <span className="text-muted-foreground font-bold">{globalRank}</span>
                    )}
                  </div>
                  
                  {/* Avatar */}
                  <AvatarDisplay avatarId={p.avatarId} size="sm" />
                  
                  <div className="flex-1">
                    <p className={`font-medium ${isCurrentPlayer ? "text-primary" : ""}`}>
                      {p.name} {isCurrentPlayer && "(Toi)"}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {pArena.name}
                    </p>
                  </div>
                  
                  {/* Trophées */}
                  <div className="flex items-center gap-1">
                    <Trophy className="w-4 h-4 text-primary" />
                    <span className="font-bold">{p.trophies}</span>
                  </div>
                </motion.div>
              );
            })}
          </div>
          
          {/* Pagination */}
          <div className="p-4 border-t border-border flex items-center justify-between">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                playClick();
                setCurrentPage(p => Math.max(1, p - 1));
              }}
              disabled={currentPage === 1}
            >
              <ChevronLeft className="w-4 h-4 mr-1" />
              Précédent
            </Button>
            
            <span className="text-sm text-muted-foreground">
              Page {currentPage}/{totalPages}
            </span>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                playClick();
                setCurrentPage(p => Math.min(totalPages, p + 1));
              }}
              disabled={currentPage === totalPages}
            >
              Suivant
              <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

// Vue Clan avec chat général
interface ClanViewProps {
  playerAvatarId: string;
  playerName: string;
  userId: string | null;
  onOpenAuth: () => void;
  onClose: () => void;
}

interface ClanSummary {
  id: string;
  name: string;
  avatarId: string;
  code: string;
  members: number;
}

interface ChatMessage {
  id: string;
  userId: string;
  message: string;
  createdAt: string;
}

const ClanView = ({ playerAvatarId, playerName, userId, onOpenAuth, onClose }: ClanViewProps) => {
  const { playClick, playTrophy, playError } = useGameSounds();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showJoinByCodeModal, setShowJoinByCodeModal] = useState(false);
  const [clanName, setClanName] = useState("");
  const [clanCode, setClanCode] = useState("");
  const [selectedAvatarId, setSelectedAvatarId] = useState(playerAvatarId);
  const [clans, setClans] = useState<ClanSummary[]>([]);
  const [joinedClan, setJoinedClan] = useState<ClanSummary | null>(null);
  const [showLeaveClanConfirm, setShowLeaveClanConfirm] = useState(false);
  const [chatMessage, setChatMessage] = useState("");
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [profilesByUserId, setProfilesByUserId] = useState<Record<string, { name: string; avatarId: string }>>({});
  const [loadingClans, setLoadingClans] = useState(true);
  const [busy, setBusy] = useState(false);
  const chatScrollRef = useRef<HTMLDivElement>(null);

  const formatTime = (iso: string) => {
    try {
      return new Date(iso).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" });
    } catch {
      return "";
    }
  };

  const fetchProfiles = useCallback(async (ids: string[]) => {
    const missing = ids.filter((id) => id && !profilesByUserId[id] && id !== userId);
    if (missing.length === 0) return;

    const { data, error } = await supabase
      .from("public_profiles")
      .select("user_id, display_name, avatar_url")
      .in("user_id", missing);

    if (error || !data) return;

    setProfilesByUserId((prev) => {
      const next = { ...prev };
      for (const p of data as any[]) {
        if (!p?.user_id) continue;
        next[p.user_id] = {
          name: p.display_name || "Joueur",
          avatarId: p.avatar_url || "tree",
        };
      }
      return next;
    });
  }, [profilesByUserId, userId]);

  const refreshClans = useCallback(async () => {
    setLoadingClans(true);
    const { data: clansData, error: clansError } = await supabase
      .from("clans")
      .select("id, name, avatar_id, code, created_at")
      .order("created_at", { ascending: false })
      .limit(50);

    if (clansError || !clansData) {
      setClans([]);
      setLoadingClans(false);
      return;
    }

    const ids = (clansData as any[]).map((c) => c.id).filter(Boolean);
    let counts: Record<string, number> = {};
    if (ids.length > 0) {
      const { data: membersData } = await supabase
        .from("clan_members")
        .select("clan_id")
        .in("clan_id", ids);

      if (membersData) {
        for (const m of membersData as any[]) {
          if (!m?.clan_id) continue;
          counts[m.clan_id] = (counts[m.clan_id] || 0) + 1;
        }
      }
    }

    setClans(
      (clansData as any[]).map((c) => ({
        id: c.id,
        name: c.name,
        avatarId: c.avatar_id || "tree",
        code: c.code,
        members: counts[c.id] || 0,
      }))
    );
    setLoadingClans(false);
  }, []);

  const refreshMyClan = useCallback(async () => {
    if (!userId) {
      setJoinedClan(null);
      return;
    }

    const { data: membership, error: memErr } = await supabase
      .from("clan_members")
      .select("clan_id")
      .eq("user_id", userId)
      .maybeSingle();

    if (memErr || !membership?.clan_id) {
      setJoinedClan(null);
      return;
    }

    const { data: clan, error: clanErr } = await supabase
      .from("clans")
      .select("id, name, avatar_id, code")
      .eq("id", membership.clan_id)
      .single();

    if (clanErr || !clan) {
      setJoinedClan(null);
      return;
    }

    const { count } = await supabase
      .from("clan_members")
      .select("id", { count: "exact", head: true })
      .eq("clan_id", clan.id);

    setJoinedClan({
      id: clan.id,
      name: clan.name,
      avatarId: clan.avatar_id || "tree",
      code: clan.code,
      members: count || 1,
    });
  }, [userId]);

  // Charger clans + clan actuel
  useEffect(() => {
    refreshClans();
    refreshMyClan();
  }, [refreshClans, refreshMyClan]);

  // Charger les messages + realtime quand on est dans un clan
  useEffect(() => {
    if (!joinedClan?.id) return;
    let mounted = true;

    const loadMessages = async () => {
      const { data, error } = await supabase
        .from("clan_messages")
        .select("id, user_id, message, created_at")
        .eq("clan_id", joinedClan.id)
        .order("created_at", { ascending: true })
        .limit(100);

      if (!mounted) return;
      if (error || !data) {
        setChatMessages([]);
        return;
      }

      const rows = (data as any[]).map((m) => ({
        id: m.id,
        userId: m.user_id,
        message: m.message,
        createdAt: m.created_at,
      }));

      setChatMessages(rows);
      fetchProfiles(Array.from(new Set(rows.map((r) => r.userId))));
    };

    loadMessages();

    const channel = supabase
      .channel(`clan-messages:${joinedClan.id}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "clan_messages",
          filter: `clan_id=eq.${joinedClan.id}`,
        },
        (payload) => {
          const m = payload.new as any;
          const row = {
            id: m.id,
            userId: m.user_id,
            message: m.message,
            createdAt: m.created_at,
          } satisfies ChatMessage;
          setChatMessages((prev) => [...prev, row]);
          fetchProfiles([m.user_id]);
        }
      )
      .subscribe();

    return () => {
      mounted = false;
      supabase.removeChannel(channel);
    };
  }, [joinedClan?.id, fetchProfiles]);

  // Auto-scroll
  useEffect(() => {
    setTimeout(() => {
      chatScrollRef.current?.scrollTo({ top: chatScrollRef.current.scrollHeight, behavior: "smooth" });
    }, 50);
  }, [chatMessages.length]);
  
  const handleJoinClan = async (clan: ClanSummary) => {
    if (!userId) {
      onOpenAuth();
      return;
    }
    setBusy(true);
    try {
      const { error } = await supabase.from("clan_members").insert({
        clan_id: clan.id,
        user_id: userId,
      });

      if (error) throw error;
      playTrophy();
      await refreshMyClan();
      await refreshClans();
    } catch (e: any) {
      playError();
      toast.error(e?.message || "Impossible de rejoindre ce clan");
    } finally {
      setBusy(false);
    }
  };
  
  const handleJoinByCode = async () => {
    if (!userId) {
      onOpenAuth();
      return;
    }
    setBusy(true);
    try {
      const { data: clan, error } = await supabase
        .from("clans")
        .select("id, name, avatar_id, code")
        .eq("code", clanCode.toUpperCase())
        .maybeSingle();

      if (error || !clan) {
        playError();
        toast.error("Code invalide");
        return;
      }

      await handleJoinClan({
        id: (clan as any).id,
        name: (clan as any).name,
        avatarId: (clan as any).avatar_id || "tree",
        code: (clan as any).code,
        members: 0,
      });

      setShowJoinByCodeModal(false);
      setClanCode("");
    } catch (e: any) {
      playError();
      toast.error(e?.message || "Erreur");
    } finally {
      setBusy(false);
    }
  };
  
  const handleLeaveClan = () => {
    setShowLeaveClanConfirm(true);
  };
  
  const confirmLeaveClan = async () => {
    if (!userId || !joinedClan) return;
    setBusy(true);
    try {
      playClick();
      await supabase
        .from("clan_members")
        .delete()
        .eq("user_id", userId)
        .eq("clan_id", joinedClan.id);

      setJoinedClan(null);
      setChatMessages([]);
      setShowLeaveClanConfirm(false);
      await refreshClans();
    } finally {
      setBusy(false);
    }
  };
  
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatMessage.trim()) return;
    if (!userId || !joinedClan) {
      onOpenAuth();
      return;
    }
    
    setBusy(true);
    try {
      playClick();
      const { error } = await supabase.from("clan_messages").insert({
        clan_id: joinedClan.id,
        user_id: userId,
        message: chatMessage.trim(),
      });
      if (error) throw error;
      setChatMessage("");
    } catch (e: any) {
      playError();
      toast.error(e?.message || "Impossible d'envoyer le message");
    } finally {
      setBusy(false);
    }
  };
  
  const handleCreateClan = async () => {
    if (!userId) {
      onOpenAuth();
      return;
    }
    if (!clanName.trim()) return;

    setBusy(true);
    try {
      // Retry code generation a few times in case of collision
      let created: any = null;
      let lastError: any = null;
      for (let i = 0; i < 5; i++) {
        const newClanCode = generateClanCode();
        const { data, error } = await supabase
          .from("clans")
          .insert({
            name: clanName.trim(),
            avatar_id: selectedAvatarId,
            code: newClanCode,
            created_by: userId,
          })
          .select("id, name, avatar_id, code")
          .single();

        if (!error && data) {
          created = data;
          break;
        }
        lastError = error;
      }

      if (!created) throw lastError || new Error("Erreur création clan");

      const { error: joinError } = await supabase.from("clan_members").insert({
        clan_id: created.id,
        user_id: userId,
      });
      if (joinError) throw joinError;

      playTrophy();
      setShowCreateModal(false);
      setClanName("");
      await refreshClans();
      await refreshMyClan();
    } catch (e: any) {
      playError();
      toast.error(e?.message || "Impossible de créer le clan");
    } finally {
      setBusy(false);
    }
  };
  
  // Si on a rejoint un clan, afficher le chat
  if (joinedClan) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 bg-background flex flex-col"
      >
        {/* Header avec infos du clan */}
        <div className="sticky top-0 z-10 p-3 sm:p-4 bg-background/90 backdrop-blur-lg flex items-center gap-3 border-b border-border">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onClose()}
          >
            <ArrowLeft className="w-5 h-5 sm:w-6 sm:h-6" />
          </Button>
          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-secondary/20 flex items-center justify-center border-2 border-secondary">
            <AvatarDisplay avatarId={joinedClan.avatarId} size="sm" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-bold text-foreground truncate text-sm sm:text-base">{joinedClan.name}</p>
            <p className="text-xs text-muted-foreground">
              {joinedClan.members} membres • Code: <span className="font-mono text-primary">{joinedClan.code}</span>
            </p>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleLeaveClan}
            className="text-accent hover:bg-accent/20"
          >
            <LogOut className="w-5 h-5" />
          </Button>
        </div>
        
        {/* Dialog confirmation quitter clan */}
        <AlertDialog open={showLeaveClanConfirm} onOpenChange={setShowLeaveClanConfirm}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Quitter le clan ?</AlertDialogTitle>
              <AlertDialogDescription>
                Tu vas quitter "{joinedClan.name}". Tu pourras toujours le rejoindre plus tard avec le code.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Annuler</AlertDialogCancel>
              <AlertDialogAction onClick={confirmLeaveClan} className="bg-accent hover:bg-accent/90">
                Quitter
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
        
        {/* Zone de chat */}
        <div ref={chatScrollRef} className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-3">
          {chatMessages.map((msg) => (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex gap-2 sm:gap-3 ${msg.userId === userId ? "flex-row-reverse" : ""}`}
            >
              <AvatarDisplay
                avatarId={
                  msg.userId === userId
                    ? playerAvatarId
                    : (profilesByUserId[msg.userId]?.avatarId || "tree")
                }
                size="sm"
              />
              <div className={`max-w-[75%] sm:max-w-[70%] ${msg.userId === userId ? "items-end" : ""}`}>
                <div className="flex items-center gap-2 mb-1">
                  <span className={`text-xs sm:text-sm font-medium ${msg.userId === userId ? "text-secondary" : "text-primary"}`}>
                    {msg.userId === userId ? "Toi" : (profilesByUserId[msg.userId]?.name || "Joueur")}
                  </span>
                  <span className="text-xs text-muted-foreground">{formatTime(msg.createdAt)}</span>
                </div>
                <div className={`rounded-2xl px-3 sm:px-4 py-2 text-sm sm:text-base ${
                  msg.userId === userId 
                    ? "bg-secondary/20 text-foreground rounded-tr-sm" 
                    : "bg-muted text-foreground rounded-tl-sm"
                }`}>
                  {msg.message}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
        
        {/* Zone de saisie + Bouton créer partie */}
        <div className="p-3 sm:p-4 border-t border-border space-y-2">
          {/* Bouton créer partie privée */}
          <Button
            onClick={() => {
              playClick();
              // Message persistant (simple annonce)
              if (!userId || !joinedClan) return;
              supabase.from("clan_messages").insert({
                clan_id: joinedClan.id,
                user_id: userId,
                message: "🎮 J'ai créé une partie ! Rejoignez-moi !",
              });
            }}
            variant="outline"
            className="w-full flex items-center justify-center gap-2 border-primary/50 text-primary hover:bg-primary/10"
          >
            <Swords className="w-4 h-4" />
            Créer une partie (10 questions)
          </Button>
          
          <form onSubmit={handleSendMessage} className="flex gap-2">
            <input
              type="text"
              value={chatMessage}
              onChange={(e) => setChatMessage(e.target.value)}
              placeholder="Écris un message..."
              disabled={busy}
              className="flex-1 bg-muted border border-border rounded-full px-3 sm:px-4 py-2 text-sm sm:text-base focus:outline-none focus:border-primary"
            />
            <Button type="submit" size="icon" disabled={busy} className="rounded-full bg-primary hover:bg-primary/90 flex-shrink-0">
              <ChevronRight className="w-5 h-5" />
            </Button>
          </form>
        </div>
      </motion.div>
    );
  }

  // Pas connecté -> CTA
  if (!userId) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 bg-background flex flex-col"
      >
        <div className="sticky top-0 z-10 p-3 sm:p-4 bg-background/90 backdrop-blur-lg flex items-center justify-between border-b border-border">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => {
              playClick();
              onClose();
            }}
          >
            <X className="w-5 h-5 sm:w-6 sm:h-6" />
          </Button>
          <h2 className="text-xl sm:text-2xl font-bold text-foreground">Clan</h2>
          <div className="w-10" />
        </div>

        <div className="flex-1 flex flex-col items-center justify-center p-6 text-center space-y-4">
          <p className="text-lg font-bold">Connecte-toi pour créer ou rejoindre un clan</p>
          <Button
            onClick={() => {
              playClick();
              onOpenAuth();
            }}
            className="bg-primary text-primary-foreground"
          >
            Se connecter
          </Button>
        </div>
      </motion.div>
    );
  }
  
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-background"
    >
      {/* Header */}
      <div className="sticky top-0 z-10 p-3 sm:p-4 bg-background/90 backdrop-blur-lg flex items-center justify-between border-b border-border">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => {
            playClick();
            onClose();
          }}
        >
          <X className="w-5 h-5 sm:w-6 sm:h-6" />
        </Button>
        <h2 className="text-xl sm:text-2xl font-bold text-foreground">Clan</h2>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => {
            playClick();
            setShowCreateModal(true);
          }}
          className="text-primary text-sm"
        >
          Créer
        </Button>
      </div>
      
      {/* Contenu */}
      <div className="h-[calc(100vh-60px)] sm:h-[calc(100vh-80px)] overflow-y-auto px-3 sm:px-4 py-4 space-y-4 sm:space-y-6">
        {/* Bouton rejoindre avec code */}
        <Button
          onClick={() => {
            playClick();
            setShowJoinByCodeModal(true);
          }}
          className="w-full flex items-center justify-center gap-2 bg-secondary hover:bg-secondary/90"
        >
          <Key className="w-4 h-4" />
          Rejoindre avec un code
        </Button>
        
        {/* Tous les clans */}
        <div className="space-y-2 sm:space-y-3">
          <h3 className="text-base sm:text-lg font-bold text-primary flex items-center gap-2">
            <UsersRound className="w-4 h-4 sm:w-5 sm:h-5" />
            Clans disponibles
          </h3>
          {loadingClans ? (
            <div className="text-sm text-muted-foreground">Chargement...</div>
          ) : clans.length === 0 ? (
            <div className="text-sm text-muted-foreground">Aucun clan pour le moment</div>
          ) : clans.map(clan => (
            <motion.div
              key={clan.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="card-glass p-3 sm:p-4 flex items-center gap-3 sm:gap-4 border border-border"
            >
              {/* Avatar clan au centre rond */}
              <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-primary/20 flex items-center justify-center border-2 border-primary flex-shrink-0">
                <AvatarDisplay avatarId={clan.avatarId} size="md" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-bold text-foreground text-sm sm:text-base truncate">{clan.name}</p>
                <p className="text-xs sm:text-sm text-muted-foreground">
                  {clan.members} membres
                </p>
              </div>
              <Button
                onClick={() => handleJoinClan(clan)}
                disabled={busy}
                size="sm"
                className="bg-primary hover:bg-primary/90 text-xs sm:text-sm flex-shrink-0"
              >
                Rejoindre
              </Button>
            </motion.div>
          ))}
        </div>
      </div>
      
      {/* Modal rejoindre avec code */}
      <AnimatePresence>
        {showJoinByCodeModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-60 bg-black/60 flex items-center justify-center p-4"
            onClick={() => setShowJoinByCodeModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              className="card-glass p-4 sm:p-6 max-w-sm w-full space-y-4"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-lg sm:text-xl font-bold text-center">Rejoindre avec un code</h3>
              
              <div className="space-y-2">
                <label className="text-xs sm:text-sm text-muted-foreground">Code du clan (6 lettres)</label>
                <input
                  type="text"
                  value={clanCode}
                  onChange={(e) => setClanCode(e.target.value.toUpperCase().slice(0, 6))}
                  placeholder="ABCDEF"
                  className="w-full bg-muted border border-border rounded-lg px-3 sm:px-4 py-3 text-center text-xl font-mono tracking-widest uppercase"
                  maxLength={6}
                />
              </div>
              
              <div className="flex gap-2">
                <Button variant="ghost" onClick={() => setShowJoinByCodeModal(false)} className="flex-1 text-sm">
                  Annuler
                </Button>
                <Button onClick={handleJoinByCode} disabled={clanCode.length !== 6} className="flex-1 bg-secondary text-sm">
                  Rejoindre
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Modal création clan */}
      <AnimatePresence>
        {showCreateModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-60 bg-black/60 flex items-center justify-center p-4"
            onClick={() => setShowCreateModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              className="card-glass p-4 sm:p-6 max-w-sm w-full space-y-4"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-lg sm:text-xl font-bold text-center">Créer un clan</h3>
              
              {/* Sélection avatar */}
              <div className="space-y-2">
                <label className="text-xs sm:text-sm text-muted-foreground">Avatar du clan</label>
                <div className="flex flex-wrap gap-1 sm:gap-2 justify-center">
                  {avatars.map(avatar => (
                    <button
                      key={avatar.id}
                      onClick={() => {
                        playClick();
                        setSelectedAvatarId(avatar.id);
                      }}
                      className={`p-1 sm:p-2 rounded-full transition-all ${
                        selectedAvatarId === avatar.id 
                          ? "ring-2 ring-primary bg-primary/20" 
                          : "hover:bg-muted"
                      }`}
                    >
                      <AvatarDisplay avatarId={avatar.id} size="sm" />
                    </button>
                  ))}
                </div>
              </div>
              
              {/* Nom du clan */}
              <div className="space-y-2">
                <label className="text-xs sm:text-sm text-muted-foreground">Nom du clan</label>
                <input
                  type="text"
                  value={clanName}
                  onChange={(e) => setClanName(e.target.value)}
                  placeholder="Ex: Les Gentils du 95"
                  className="w-full bg-muted border border-border rounded-lg px-3 sm:px-4 py-2 text-sm sm:text-base"
                />
              </div>
              
              <div className="flex gap-2">
                <Button variant="ghost" onClick={() => setShowCreateModal(false)} className="flex-1 text-sm">
                  Annuler
                </Button>
                <Button onClick={handleCreateClan} disabled={!clanName.trim()} className="flex-1 bg-primary text-sm">
                  Créer
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

interface GameArenaProps {
  isVsAI: boolean;
  aiDifficulty: AIDifficulty;
  arena: Arena;
  playerTrophies: number;
  playerName: string;
  playerAvatar: string;
  onlineMatchInfo?: {
    matchId: string;
    opponentId: string;
    opponentName: string;
    opponentAvatar: string;
    isPlayer1: boolean;
  } | null;
  onComplete: (result: { won: boolean; playerScore: number; opponentScore: number; trophiesChange: number }) => void;
}

const GameArena = ({ isVsAI, aiDifficulty, arena, playerTrophies, playerName, playerAvatar, onlineMatchInfo, onComplete }: GameArenaProps) => {
  const { playClick, playCorrect, playError, playTrophy, playGameOver } = useGameSounds();
  const { speak } = useElevenLabsSpeech();
  const { addTrophies, removeTrophies, incrementGamesPlayed, incrementGamesWon } = useGameStore();
  const { user } = useAuth();
  
  const [currentRound, setCurrentRound] = useState(1);
  const [playerScore, setPlayerScore] = useState(0);
  const [opponentScore, setOpponentScore] = useState(0);
  const previousOpponentScoreRef = useRef(0);
  const [currentWord, setCurrentWord] = useState<VocabularyWord | null>(null);
  const [answer, setAnswer] = useState("");
  const [timeLeft, setTimeLeft] = useState(10);
  const [showAnswer, setShowAnswer] = useState(false);
  
  // État pour savoir si chaque joueur a trouvé
  const [playerFound, setPlayerFound] = useState(false);
  const [opponentFound, setOpponentFound] = useState(false);
  const [playerTimeRemaining, setPlayerTimeRemaining] = useState(0);
  const [opponentTimeRemaining, setOpponentTimeRemaining] = useState(0);
  
  // Tracking si le joueur a échoué (mauvaise réponse ou temps écoulé sans répondre)
  const [playerFailed, setPlayerFailed] = useState(false);
  
  // Message de félicitation
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  
  // Couleur de l'avatar pour les points
  const avatarColor = getAvatarById(playerAvatar).color;
  
  // Pseudo et avatar adversaire (réel si match en ligne, simulé sinon)
  const [opponentName] = useState(() => {
    if (isVsAI) return "IA";
    if (onlineMatchInfo) return onlineMatchInfo.opponentName;
    return ["أحمد", "سارة", "محمد", "فاطمة", "يوسف"][Math.floor(Math.random() * 5)];
  });
  const [opponentAvatar] = useState(() => {
    if (isVsAI) return "bot";
    if (onlineMatchInfo) return onlineMatchInfo.opponentAvatar;
    return ["diamond", "crown", "star", "fire", "moon"][Math.floor(Math.random() * 5)];
  });
  
  // Sélectionner les mots selon la difficulté
  // Pour les matchs en ligne, utiliser le matchId comme seed pour avoir les mêmes mots
  const [gameWords] = useState(() => {
    let filteredWords = [...vocabularyWords];
    
    if (isVsAI) {
      if (aiDifficulty === "facile") {
        filteredWords = filteredWords.filter(w => w.phonetic.length <= 6);
      } else if (aiDifficulty === "difficile") {
        filteredWords = filteredWords.filter(w => w.phonetic.length > 6 || w.isVerb);
      }
    }
    
    // Pour les matchs en ligne, utiliser le matchId comme seed pour générer les mêmes mots
    if (onlineMatchInfo) {
      const seed = onlineMatchInfo.matchId.split('-').reduce((acc, val) => acc + parseInt(val.slice(0, 8), 16), 0);
      const seededRandom = (seed: number) => {
        const x = Math.sin(seed++) * 10000;
        return x - Math.floor(x);
      };
      let currentSeed = seed;
      const shuffled = [...filteredWords].sort(() => {
        currentSeed++;
        return seededRandom(currentSeed) - 0.5;
      });
      return shuffled.slice(0, 10);
    }
    
    const shuffled = filteredWords.sort(() => Math.random() - 0.5);
    return shuffled.slice(0, 10);
  });
  
  const TOTAL_ROUNDS = 10;
  
  // Normalisation des réponses avec support chiffres
  const normalizeForCheck = (text: string): string => {
    let normalized = text
      .toLowerCase()
      .trim()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/œ/g, "oe")
      .replace(/æ/g, "ae")
      .replace(/[^a-z0-9\s\/]/g, "")
      .replace(/\s+/g, " ");
    
    const numberMap: Record<string, string> = {
      "0": "zero", "1": "un", "2": "deux", "3": "trois", "4": "quatre",
      "5": "cinq", "6": "six", "7": "sept", "8": "huit", "9": "neuf",
      "10": "dix", "11": "onze", "12": "douze",
    };
    
    Object.entries(numberMap).forEach(([num, text]) => {
      normalized = normalized.replace(new RegExp(`\\b${num}\\b`, "g"), text);
    });
    
    return normalized;
  };
  
  // Timer - se termine quand les deux ont trouvé OU quand temps écoulé
  useEffect(() => {
    if (showAnswer || !currentWord) return;
    
    if (playerFound && opponentFound) {
      setPlayerScore(s => s + playerTimeRemaining);
      setOpponentScore(s => s + opponentTimeRemaining);
      
      setShowAnswer(true);
      setTimeout(() => {
        setCurrentRound(r => r + 1);
      }, 1500);
      return;
    }
    
    const timer = setInterval(() => {
      setTimeLeft(t => {
        if (t <= 1) {
          clearInterval(timer);
          handleTimeUp();
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    
    return () => clearInterval(timer);
  }, [currentWord, showAnswer, playerFound, opponentFound]);
  
  // Simuler l'IA qui répond (seulement si vs IA)
  useEffect(() => {
    if (!isVsAI || !currentWord || showAnswer || opponentFound) return;
    
    const aiSuccessRate = aiDifficulty === "facile" ? 0.5 : aiDifficulty === "moyen" ? 0.7 : 0.85;
    const minDelay = aiDifficulty === "facile" ? 4000 : aiDifficulty === "moyen" ? 2500 : 1500;
    const maxDelay = aiDifficulty === "facile" ? 8000 : aiDifficulty === "moyen" ? 6000 : 4000;
    
    const delay = Math.random() * (maxDelay - minDelay) + minDelay;
    
    const aiTimer = setTimeout(() => {
      if (!showAnswer && Math.random() < aiSuccessRate) {
        const aiTime = Math.max(1, 10 - Math.floor(delay / 1000));
        setOpponentTimeRemaining(aiTime);
        setOpponentFound(true);
      }
    }, delay);
    
    return () => clearTimeout(aiTimer);
  }, [isVsAI, currentWord, showAnswer, aiDifficulty, opponentFound]);

  // Synchronisation du match en ligne
  useEffect(() => {
    if (isVsAI || !onlineMatchInfo || !user?.id) return;

    const matchId = onlineMatchInfo.matchId;
    const isPlayer1 = onlineMatchInfo.isPlayer1;

    // Écouter les changements du match
    const channel = supabase
      .channel(`match:${matchId}`)
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "online_matches",
          filter: `id=eq.${matchId}`,
        },
        async (payload) => {
          const match = payload.new as any;
          
          // Détecter si l'adversaire a trouvé (score a augmenté pendant ce round)
          const newOpponentScore = isPlayer1 ? (match.player2_score || 0) : (match.player1_score || 0);
          if (newOpponentScore > previousOpponentScoreRef.current && !opponentFound && !showAnswer) {
            // L'adversaire a trouvé ! Estimer le temps restant basé sur l'augmentation du score
            const scoreIncrease = newOpponentScore - previousOpponentScoreRef.current;
            if (scoreIncrease > 0 && scoreIncrease <= 10) {
              setOpponentTimeRemaining(scoreIncrease);
              setOpponentFound(true);
            }
          }
          previousOpponentScoreRef.current = newOpponentScore;
          
          // Synchroniser les scores
          if (isPlayer1) {
            setPlayerScore(match.player1_score || 0);
            setOpponentScore(match.player2_score || 0);
          } else {
            setPlayerScore(match.player2_score || 0);
            setOpponentScore(match.player1_score || 0);
          }
          
          // Synchroniser le round
          if (match.current_round && match.current_round !== currentRound) {
            setCurrentRound(match.current_round);
          }
        }
      )
      .subscribe();

    // Charger l'état initial du match
    const loadMatchState = async () => {
      const { data, error } = await supabase
        .from("online_matches")
        .select("*")
        .eq("id", matchId)
        .single();

      if (data && !error) {
        if (isPlayer1) {
          setPlayerScore(data.player1_score || 0);
          setOpponentScore(data.player2_score || 0);
          previousOpponentScoreRef.current = data.player2_score || 0;
        } else {
          setPlayerScore(data.player2_score || 0);
          setOpponentScore(data.player1_score || 0);
          previousOpponentScoreRef.current = data.player1_score || 0;
        }
        if (data.current_round) {
          setCurrentRound(data.current_round);
        }
      }
    };

    loadMatchState();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [isVsAI, onlineMatchInfo, currentRound, user?.id, opponentFound, showAnswer]);
  
  // Charger le mot suivant
  useEffect(() => {
    if (currentRound <= TOTAL_ROUNDS) {
      setCurrentWord(gameWords[currentRound - 1]);
      setTimeLeft(10);
      setAnswer("");
      setShowAnswer(false);
      setPlayerFound(false);
      setOpponentFound(false);
      setPlayerTimeRemaining(0);
      setOpponentTimeRemaining(0);
      setPlayerFailed(false);
      setSuccessMessage(null);
      
      // Réinitialiser le score précédent de l'adversaire pour le nouveau round
      if (onlineMatchInfo) {
        const isPlayer1 = onlineMatchInfo.isPlayer1;
        // Le score précédent est maintenant le score actuel de l'adversaire
        previousOpponentScoreRef.current = opponentScore;
      }
      
      setTimeout(() => {
        if (gameWords[currentRound - 1]) {
          speak(gameWords[currentRound - 1].arabic, { isVerb: gameWords[currentRound - 1].isVerb });
        }
      }, 300);
    } else {
      // Fin du jeu
      incrementGamesPlayed();
      const won = playerScore > opponentScore;
      let trophiesChange = 0;
      
      // Trophées SEULEMENT en partie en ligne
      if (!isVsAI) {
        trophiesChange = calculateTrophyGain(playerTrophies, won);
        
        if (won) {
          incrementGamesWon();
          addTrophies(trophiesChange);
          playTrophy();
        } else if (playerScore < opponentScore) {
          removeTrophies(Math.abs(trophiesChange));
          // Pas de son de défaite à la fin - juste à la perte individuelle
        }
        
        // Synchroniser les trophées avec Supabase pour persistance indéfinie
        if (user?.id) {
          // Utiliser setTimeout pour ne pas bloquer le rendu
          setTimeout(async () => {
            const store = useGameStore.getState();
            await store.syncToSupabase(user.id);
          }, 100);
        }
      } else {
        if (won) {
          incrementGamesWon();
          playTrophy();
        }
      }
      
      onComplete({ won, playerScore, opponentScore, trophiesChange });
    }
  }, [currentRound]);
  
  const handleTimeUp = () => {
    if (playerFound) {
      setPlayerScore(s => s + playerTimeRemaining);
    } else {
      // Le joueur n'a PAS trouvé à temps = DÉFAITE pour cette manche
      setPlayerFailed(true);
      playGameOver(); // Son de défaite UNIQUEMENT si le joueur n'a pas trouvé
    }
    if (opponentFound) {
      setOpponentScore(s => s + opponentTimeRemaining);
    }
    
    setShowAnswer(true);
    
    // Mettre à jour le round dans le match en ligne
    const updateRound = () => {
      if (onlineMatchInfo && user?.id) {
        const matchId = onlineMatchInfo.matchId;
        supabase
          .from("online_matches")
          .update({
            current_round: currentRound + 1,
          })
          .eq("id", matchId)
          .then(({ error }) => {
            if (error) console.error("Erreur mise à jour round:", error);
          });
      }
    };
    
    setTimeout(() => {
      setCurrentRound(r => {
        const newRound = r + 1;
        updateRound();
        return newRound;
      });
    }, 2000);
  };
  
  const handleSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    if (!answer.trim() || showAnswer || !currentWord || playerFound) return;
    
    playClick();
    
    // Utiliser le système de variations avec tolérance 1 erreur max
    const isCorrect = checkAnswerWithVariations(currentWord.id, currentWord.french, answer);
    
    if (isCorrect) {
      playCorrect();
      setPlayerTimeRemaining(timeLeft);
      setPlayerFound(true);
      
      // Mettre à jour le score dans le match en ligne
      if (onlineMatchInfo && user?.id) {
        const isPlayer1 = onlineMatchInfo.isPlayer1;
        const matchId = onlineMatchInfo.matchId;
        const newScore = playerScore + timeLeft;
        
        supabase
          .from("online_matches")
          .update({
            [isPlayer1 ? "player1_score" : "player2_score"]: newScore,
          })
          .eq("id", matchId)
          .then(({ error }) => {
            if (error) console.error("Erreur mise à jour score:", error);
          });
      }
      
      // Message de félicitation basé sur le temps
      if (timeLeft >= 8) {
        setSuccessMessage("Parfait !");
      } else if (timeLeft >= 5) {
        setSuccessMessage("Bien joué !");
      } else {
        setSuccessMessage("Trouvé !");
      }
    } else {
      // Mauvaise réponse = son d'erreur (pas le gameOver, juste l'erreur)
      playError();
      setAnswer("");
    }
  }, [answer, showAnswer, currentWord, timeLeft, playerFound, playClick, playCorrect, playError]);
  
  if (!currentWord) return null;
  
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-40"
      style={{
        backgroundImage: `url(${arena.image})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      {/* Overlay semi-transparent */}
      <div className="absolute inset-0 bg-black/60" />
      
      <div className="relative z-10 h-full flex flex-col p-1 sm:p-2 md:p-4 overflow-hidden">
        {/* Zone de jeu principale avec scores sur les côtés */}
        <div className="flex-1 flex items-center gap-1 sm:gap-2 md:gap-4 min-w-0">
          {/* Score joueur - gauche - couleur de l'avatar */}
          <div className="flex flex-col items-center gap-0.5 sm:gap-1 md:gap-2 bg-black/50 backdrop-blur-sm rounded-lg sm:rounded-xl px-1.5 sm:px-2 md:px-4 py-1.5 sm:py-2 md:py-4 flex-shrink-0 w-[60px] sm:w-[70px] md:min-w-[100px]">
            <AvatarDisplay avatarId={playerAvatar} size="sm" />
            <p className="text-[10px] sm:text-xs md:text-sm text-white/80 font-medium truncate w-full text-center">{playerName}</p>
            <p className="text-lg sm:text-xl md:text-3xl font-bold" style={{ color: avatarColor }}>{playerScore}</p>
            {playerFound && !showAnswer && (
              <p className="text-[10px] sm:text-xs" style={{ color: avatarColor }}>+{playerTimeRemaining}</p>
            )}
          </div>
          
          {/* Carte du mot - centre */}
          <div className="flex-1 flex flex-col items-center justify-center min-w-0 px-1 sm:px-2">
            {/* INDICATEUR DE MANCHE au-dessus du compteur */}
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-1 sm:mb-2 md:mb-3"
            >
              <span className="text-[10px] sm:text-xs md:text-sm text-white/90 font-medium bg-black/40 backdrop-blur-sm px-2 sm:px-3 md:px-4 py-0.5 sm:py-1 md:py-1.5 rounded-full">
                Manche {currentRound}/{TOTAL_ROUNDS}
              </span>
            </motion.div>
            
            {/* COMPTEUR ROND - unique, sans key sur timeLeft pour éviter les doublons */}
            <div
              className={`w-12 h-12 sm:w-16 sm:h-16 md:w-20 md:h-20 rounded-full flex items-center justify-center mb-2 sm:mb-3 md:mb-4 transition-colors duration-300 ${
                timeLeft <= 3 
                  ? "bg-accent/80 text-white" 
                  : "bg-white/20 backdrop-blur-sm text-white"
              }`}
              style={{
                boxShadow: timeLeft <= 3 ? "0 0 20px rgba(255,100,100,0.5)" : "none"
              }}
            >
              <span className="text-xl sm:text-2xl md:text-4xl font-bold">{timeLeft}</span>
            </div>
            
            <motion.div
              key={currentWord.id}
              initial={{ opacity: 0, scale: 0.9, rotateY: -90 }}
              animate={{ opacity: 1, scale: 1, rotateY: 0 }}
              className="card-glass p-2 sm:p-4 md:p-6 text-center w-full max-w-full sm:max-w-md"
            >
              <motion.p
                className="font-arabic text-2xl sm:text-3xl md:text-5xl text-primary mb-1 sm:mb-2 md:mb-3"
                animate={{ scale: [1, 1.02, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                {currentWord.arabic}
              </motion.p>
              
              <p className="text-xs sm:text-sm md:text-lg text-muted-foreground">
                {currentWord.phonetic}
              </p>
            </motion.div>
            
            {/* Message de succès "Bien joué" / "Parfait" */}
            <AnimatePresence>
              {successMessage && !showAnswer && (
                <motion.div
                  initial={{ opacity: 0, y: -20, scale: 0.8 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="absolute -bottom-12 left-1/2 -translate-x-1/2"
                >
                  <span 
                    className="text-lg sm:text-2xl font-bold px-4 py-2 rounded-full"
                    style={{ color: avatarColor, backgroundColor: `${avatarColor}20` }}
                  >
                    {successMessage}
                  </span>
                </motion.div>
              )}
            </AnimatePresence>
            
            {/* Zone de réponse */}
            <div className="w-full max-w-full sm:max-w-md mt-2 sm:mt-3 md:mt-4">
              <AnimatePresence mode="wait">
                {!showAnswer ? (
                  <motion.form
                    key="input"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onSubmit={handleSubmit}
                    className="flex gap-1 sm:gap-2"
                  >
                    <input
                      type="text"
                      value={answer}
                      onChange={e => setAnswer(e.target.value)}
                      placeholder={playerFound ? "✓ Trouvé !" : "Traduction..."}
                      autoFocus
                      disabled={playerFound}
                      className={`flex-1 bg-white/10 backdrop-blur-sm border-2 rounded-lg sm:rounded-xl px-2 sm:px-3 md:px-4 py-1.5 sm:py-2 md:py-3 text-xs sm:text-sm md:text-lg text-white placeholder:text-white/50 focus:outline-none transition-colors ${
                        playerFound ? "border-secondary bg-secondary/20" : "border-white/30 focus:border-primary"
                      }`}
                    />
                    {!playerFound && (
                      <Button type="submit" className="btn-yellow px-2 sm:px-4 md:px-6 text-xs sm:text-sm md:text-base flex-shrink-0">
                        OK
                      </Button>
                    )}
                  </motion.form>
                ) : (
                  <motion.div
                    key="answer"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center space-y-0.5 sm:space-y-1 md:space-y-2 bg-black/40 rounded-lg sm:rounded-xl p-2 sm:p-3 md:p-4"
                  >
                    <p className="text-muted-foreground text-[10px] sm:text-xs md:text-sm">La réponse était :</p>
                    <p className="text-sm sm:text-lg md:text-2xl font-bold text-white">
                      {currentWord.french}
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
          
          {/* Score adversaire - droite - couleur de l'avatar adversaire */}
          <div className="flex flex-col items-center gap-0.5 sm:gap-1 md:gap-2 bg-black/50 backdrop-blur-sm rounded-lg sm:rounded-xl px-1.5 sm:px-2 md:px-4 py-1.5 sm:py-2 md:py-4 flex-shrink-0 w-[60px] sm:w-[70px] md:min-w-[100px]">
            <AvatarDisplay avatarId={opponentAvatar} size="sm" />
            <p className="text-[10px] sm:text-xs md:text-sm text-white/80 font-medium truncate w-full text-center">{opponentName}</p>
            <p className="text-lg sm:text-xl md:text-3xl font-bold" style={{ color: getAvatarById(opponentAvatar).color }}>{opponentScore}</p>
            {opponentFound && !showAnswer && (
              <p className="text-[10px] sm:text-xs" style={{ color: getAvatarById(opponentAvatar).color }}>+{opponentTimeRemaining}</p>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

// Utilitaire pour la distance de Levenshtein
const levenshteinDistance = (a: string, b: string): number => {
  const matrix: number[][] = [];
  for (let i = 0; i <= b.length; i++) matrix[i] = [i];
  for (let j = 0; j <= a.length; j++) matrix[0][j] = j;
  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      matrix[i][j] = b[i-1] === a[j-1]
        ? matrix[i-1][j-1]
        : Math.min(matrix[i-1][j-1] + 1, matrix[i][j-1] + 1, matrix[i-1][j] + 1);
    }
  }
  return matrix[b.length][a.length];
};

export default Competition;
