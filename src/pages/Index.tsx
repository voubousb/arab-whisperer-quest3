import { motion } from "framer-motion";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Sun, Trophy, Settings, Crown, Sparkles, BookOpen, Wifi, CreditCard, Clock, User, LogOut } from "lucide-react";
import { useGameStore } from "@/store/gameStore";
import { getCurrentSeasonMonth, getCurrentDayInMonth, getDaysRemainingInMonth } from "@/data/arabicData";
import { getArenaByTrophies } from "@/data/arenas";
import { useGameSounds } from "@/hooks/useGameSounds";
import { Button } from "@/components/ui/button";
import mascotImage from "@/assets/mascot-main.jpeg";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";
import { AuthModal } from "@/components/AuthModal";
import { useOnlinePresence } from "@/hooks/useOnlinePresence";

// Fonction pour calculer le temps restant avant minuit (prochain mot du jour)
const getTimeUntilNextWord = () => {
  const now = new Date();
  const tomorrow = new Date(now);
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(0, 0, 0, 0);
  
  const diff = tomorrow.getTime() - now.getTime();
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  
  return `${hours}h ${minutes}m`;
};

// Fonction pour calculer le temps restant avant fin de mois
const getTimeRemainingInSeason = () => {
  const now = new Date();
  const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);
  const diff = endOfMonth.getTime() - now.getTime();
  
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  
  return `${days}j ${hours}h`;
};

const Index = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { playClick, playTrophy } = useGameSounds();
  const { player, setIsPremium, syncToSupabase } = useGameStore();
  const { user, signOut, isAuthenticated, syncData } = useAuth();
  const arena = getArenaByTrophies(player.trophies);
  const seasonMonth = getCurrentSeasonMonth();
  const currentDay = getCurrentDayInMonth();
  const daysRemaining = getDaysRemainingInMonth();
  const { onlineCount: onlinePlayers } = useOnlinePresence();
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [timeUntilNextWord, setTimeUntilNextWord] = useState(getTimeUntilNextWord());
  const [seasonTimeRemaining, setSeasonTimeRemaining] = useState(getTimeRemainingInSeason());
  const [showAuthModal, setShowAuthModal] = useState(false);
  
  // Son d'entrée: désactivé (l'utilisateur ne veut plus le son "vent")
  
  // Mettre à jour les compteurs
  useEffect(() => {
    const interval = setInterval(() => {
      setTimeUntilNextWord(getTimeUntilNextWord());
      setSeasonTimeRemaining(getTimeRemainingInSeason());
    }, 60000); // Mise à jour chaque minute
    return () => clearInterval(interval);
  }, []);
  
  // Gérer le retour de Stripe checkout
  useEffect(() => {
    const paymentStatus = searchParams.get("payment");
    const checkoutStatus = searchParams.get("checkout");
    if (paymentStatus === "success" || checkoutStatus === "success") {
      playTrophy();
      setIsPremium(true);
      toast.success("Bienvenue dans le Premium ! 480+ mots débloqués !");
      // Nettoyer l'URL
      window.history.replaceState({}, "", "/");
    } else if (paymentStatus === "cancel" || checkoutStatus === "cancel") {
      toast.info("Paiement annulé");
      window.history.replaceState({}, "", "/");
    }
  }, [searchParams, playTrophy, setIsPremium]);
  
  const handleSubscribe = async () => {
    playClick();
    setIsCheckingOut(true);
    
    try {
      const { data, error } = await supabase.functions.invoke("create-checkout");
      
      if (error) {
        throw error;
      }
      
      if (data?.url) {
        window.open(data.url, "_blank");
      } else {
        throw new Error("Pas d'URL de checkout reçue");
      }
    } catch (error: any) {
      console.error("Erreur checkout:", error);
      toast.error("Erreur lors de la création du paiement. Réessaie plus tard.");
    } finally {
      setIsCheckingOut(false);
    }
  };
  
  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Fond animé avec couleurs qui bougent */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <motion.div 
          className="absolute top-0 left-0 w-[600px] h-[600px] rounded-full blur-[120px]"
          style={{ backgroundColor: "hsl(270 70% 60% / 0.2)" }}
          animate={{
            x: [0, 100, 50, 0],
            y: [0, 50, 100, 0],
            scale: [1, 1.1, 0.9, 1],
          }}
          transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div 
          className="absolute bottom-0 right-0 w-[500px] h-[500px] rounded-full blur-[100px]"
          style={{ backgroundColor: "hsl(50 100% 55% / 0.2)" }}
          animate={{
            x: [0, -80, -40, 0],
            y: [0, -60, -120, 0],
            scale: [1, 0.9, 1.1, 1],
          }}
          transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div 
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full blur-[150px]"
          style={{ backgroundColor: "hsl(270 50% 50% / 0.1)" }}
          animate={{
            scale: [1, 1.15, 1],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        />
      </div>
      
      {/* Header navigation */}
      <header className="relative z-10 p-4">
        <nav className="max-w-6xl mx-auto flex items-center justify-between">
          {/* Logo avec couleurs de la mascotte - jaune et violet */}
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-2"
          >
            <span className="text-xl font-bold tracking-wide" style={{ letterSpacing: '0.05em' }}>
              <span className="text-primary drop-shadow-md" style={{ color: 'hsl(50 100% 55%)' }}>ARAB</span>
              <span className="text-muted-foreground">.</span>
              <span className="text-secondary drop-shadow-md" style={{ color: 'hsl(270 70% 60%)' }}>FACILE</span>
            </span>
          </motion.div>
          
          {/* Nav links - centre */}
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="hidden sm:flex items-center gap-2 bg-card/50 backdrop-blur-sm px-2 py-1 rounded-full border border-border/50"
          >
            <NavButton 
              active 
              onClick={() => { playClick(); }}
            >
              Accueil
            </NavButton>
            <NavButton onClick={() => { playClick(); navigate("/training"); }}>
              Entraînement
            </NavButton>
            <NavButton onClick={() => { playClick(); navigate("/competition"); }}>
              Classement
            </NavButton>
          </motion.div>
          
          {/* Right side - profil + trophees + settings */}
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-2"
          >
            {/* Bouton profil/connexion */}
            {isAuthenticated ? (
              <div className="flex items-center gap-2">
                <span className="hidden sm:inline text-xs text-muted-foreground">
                  Connecté : <span className="text-primary font-medium">{player.name}</span>
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    playClick();
                    syncData();
                    signOut();
                    toast.success("Déconnecté !");
                  }}
                  className="text-muted-foreground hover:text-foreground rounded-full flex items-center gap-1"
                >
                  <LogOut className="w-4 h-4" />
                  <span className="hidden sm:inline text-sm">Déconnexion</span>
                </Button>
              </div>
            ) : (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  playClick();
                  setShowAuthModal(true);
                }}
                className="text-muted-foreground hover:text-foreground rounded-full flex items-center gap-1"
              >
                <User className="w-4 h-4" />
                <span className="hidden sm:inline text-sm">Connexion</span>
              </Button>
            )}
            
            <div className="flex items-center gap-2 bg-card/50 backdrop-blur-sm px-4 py-2 rounded-full border border-border/50">
              <Trophy className="w-4 h-4 text-primary" />
              <span className="font-bold text-primary">{player.trophies}</span>
            </div>
            
            <Button
              variant="ghost"
              size="icon"
              onClick={() => {
                playClick();
                navigate("/admin");
              }}
              className="text-muted-foreground hover:text-foreground rounded-full"
            >
              <Settings className="w-5 h-5" />
            </Button>
          </motion.div>
        </nav>
      </header>
      
      {/* Modal d'authentification */}
      <AuthModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} />
      
      <main className="relative z-10 container max-w-5xl mx-auto px-4 py-8 flex flex-col items-center">
        {/* Hero section - Logo + Mascotte */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          {/* Mascot */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="mb-4"
          >
            <motion.img 
              src={mascotImage}
              alt="Mascotte Arab.facile"
              className="w-32 h-32 sm:w-40 sm:h-40 mx-auto object-cover rounded-full border-4 border-primary/50 shadow-2xl"
              animate={{ y: [0, -8, 0] }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
            />
          </motion.div>
          
          {/* Titre avec couleurs de la mascotte - style jeu */}
          <h1 className="text-4xl sm:text-6xl font-bold mb-2 tracking-wide" style={{ letterSpacing: '0.05em' }}>
            <span className="text-primary drop-shadow-lg" style={{ color: 'hsl(50 100% 55%)', textShadow: '2px 2px 4px rgba(0,0,0,0.3)' }}>ARAB</span>
            <span className="text-muted-foreground">.</span>
            <span className="text-secondary drop-shadow-lg" style={{ color: 'hsl(270 70% 60%)', textShadow: '2px 2px 4px rgba(0,0,0,0.3)' }}>FACILE</span>
          </h1>
        </motion.div>
        
        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="text-muted-foreground text-lg sm:text-xl mb-10 text-center"
        >
          Apprends l'arabe facilement et deviens un champion !
        </motion.p>
        
        {/* Menu principal - 3 grandes cartes rectangulaires */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="grid grid-cols-1 sm:grid-cols-3 gap-4 w-full max-w-4xl mb-12"
        >
          <MenuCard
            title="Le Mot du Jour"
            icon={<Sun className="w-8 h-8" />}
            variant="yellow"
            description="Un nouveau mot chaque jour"
            timer={timeUntilNextWord}
            onClick={() => {
              playClick();
              navigate("/word-of-the-day");
            }}
          />
          
          <MenuCard
            title="Entraînement"
            icon={<BookOpen className="w-8 h-8" />}
            variant="violet"
            description="Apprends l'alphabet et le vocabulaire"
            onClick={() => {
              playClick();
              navigate("/training");
            }}
          />
          
          <MenuCard
            title="Compétition"
            icon={<Trophy className="w-8 h-8" />}
            variant="coral"
            description="Affronte d'autres joueurs"
            onlinePlayers={onlinePlayers}
            onClick={() => {
              playClick();
              navigate("/competition");
            }}
          />
        </motion.div>
        
        {/* Season widget */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="w-full max-w-2xl space-y-3"
        >
          <div className="card-glass p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Saison en cours</p>
                <p className="font-bold text-foreground">{seasonMonth.name}</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm text-muted-foreground">Jour {currentDay} / {seasonMonth.days}</p>
              <p className="font-bold text-primary">Fin dans {seasonTimeRemaining}</p>
            </div>
          </div>
        </motion.div>
        
        {/* Arena display - icône ronde comme photo de profil */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="mt-8 flex items-center gap-3 bg-card/50 backdrop-blur-sm px-6 py-3 rounded-full border border-border/50"
        >
          <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-primary/50">
            <img src={arena.image} alt={arena.name} className="w-full h-full object-cover" />
          </div>
          <div>
            <p className="font-bold text-foreground">{arena.name}</p>
            <p className="text-xs text-muted-foreground">{player.trophies} trophées</p>
          </div>
        </motion.div>
        
        {/* Premium badge or subscribe button */}
        {player.isPremium ? (
          <motion.div
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.7 }}
            className="mt-4 flex items-center gap-2 bg-gradient-to-r from-primary/20 to-secondary/20 px-4 py-2 rounded-full border border-primary/30"
          >
            <Crown className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium text-primary">
              {player.isCreator ? "Premium Créateur" : "Premium Actif"}
            </span>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            className="mt-6"
          >
            <Button
              onClick={handleSubscribe}
              disabled={isCheckingOut}
              className="btn-gold flex items-center gap-2"
            >
              <CreditCard className="w-4 h-4" />
              {isCheckingOut ? "Chargement..." : "Débloquer Premium - 4,99€"}
            </Button>
            <p className="text-xs text-muted-foreground mt-2 text-center">
              480+ mots • Parties privées
            </p>
          </motion.div>
        )}
        
        {/* Footer */}
        <motion.footer
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="mt-16 text-center text-sm text-muted-foreground"
        >
          <p>Créé avec ❤️ par arab.facile</p>
        </motion.footer>
      </main>
    </div>
  );
};

// Navigation button component
const NavButton = ({ 
  children, 
  active = false, 
  onClick 
}: { 
  children: React.ReactNode; 
  active?: boolean; 
  onClick: () => void;
}) => (
  <button
    onClick={onClick}
    className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
      active 
        ? "bg-primary text-primary-foreground" 
        : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
    }`}
  >
    {children}
  </button>
);

// Menu card component - grandes cartes rectangulaires
const MenuCard = ({ 
  title, 
  description,
  icon, 
  variant, 
  timer,
  onlinePlayers,
  onClick 
}: { 
  title: string;
  description: string;
  icon: React.ReactNode;
  variant: "yellow" | "violet" | "coral";
  timer?: string;
  onlinePlayers?: number;
  onClick: () => void;
}) => {
  const styles = {
    yellow: "menu-card-yellow",
    violet: "menu-card-violet",
    coral: "menu-card-coral",
  };
  
  return (
    <motion.button
      whileHover={{ scale: 1.03, y: -4 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className={`${styles[variant]} flex flex-col items-center justify-center gap-3 p-8 min-h-[180px] rounded-2xl relative`}
    >
      {/* Timer pour Mot du Jour */}
      {timer && (
        <div className="absolute top-3 right-3 flex items-center gap-1 bg-black/20 px-2 py-1 rounded-full text-xs">
          <Clock className="w-3 h-3" />
          <span>{timer}</span>
        </div>
      )}
      
      {/* Joueurs en ligne pour Compétition */}
      {onlinePlayers && (
        <div className="absolute top-3 right-3 flex items-center gap-1 bg-black/20 px-2 py-1 rounded-full text-xs">
          <Wifi className="w-3 h-3" />
          <span>{onlinePlayers} en ligne</span>
        </div>
      )}
      
      <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center">
        {icon}
      </div>
      <div className="text-center">
        <span className="font-bold text-xl block">{title}</span>
        <span className="text-sm opacity-80 mt-1 block">{description}</span>
      </div>
    </motion.button>
  );
};

export default Index;
