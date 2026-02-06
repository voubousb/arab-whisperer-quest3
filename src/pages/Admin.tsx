import { motion } from "framer-motion";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Lock, Calendar, Plus, Crown, Unlock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useGameStore } from "@/store/gameStore";
import { vocabularyWords, vocabularyCategories, VocabularyWord, CREATOR_EMAIL } from "@/data/arabicData";
import { useGameSounds } from "@/hooks/useGameSounds";
import { toast } from "sonner";

const Admin = () => {
  const navigate = useNavigate();
  const { playClick, playSuccess, playError, playTrophy } = useGameSounds();
  const {
    isAdmin,
    setIsAdmin,
    dailyWords,
    setDailyWord,
    player,
    setIsPremium,
    setPlayerEmail,
  } = useGameStore();
  
  const [passwordInput, setPasswordInput] = useState("");
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    const password = passwordInput.trim();
    if (!password) return;

    try {
      setIsLoggingIn(true);

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/admin-auth`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
            Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
          },
          body: JSON.stringify({ password }),
        }
      );

      const result = await response.json().catch(() => ({}));

      if (!response.ok || !result?.ok) {
        playError();
        toast.error("Mot de passe incorrect");
        return;
      }

      playSuccess();
      setIsAdmin(true);
      toast.success("Bienvenue Bilal !");
    } catch {
      playError();
      toast.error("Erreur de connexion admin");
    } finally {
      setIsLoggingIn(false);
      setPasswordInput("");
    }
  };
  
  const handleLogout = () => {
    playClick();
    setIsAdmin(false);
    toast.info("Déconnecté");
  };
  
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="p-4 flex items-center gap-4 sticky top-0 bg-background/80 backdrop-blur-lg z-50">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => {
            playClick();
            navigate("/");
          }}
          className="text-foreground hover:bg-muted"
        >
          <ArrowLeft className="w-6 h-6" />
        </Button>
        <h1 className="text-2xl font-bold text-gradient-gold">Administration</h1>
        
        {isAdmin && (
          <Button
            variant="outline"
            size="sm"
            onClick={handleLogout}
            className="ml-auto"
          >
            Déconnexion
          </Button>
        )}
      </header>
      
      <main className="container max-w-2xl mx-auto p-4">
        {!isAdmin ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="card-glass p-8 text-center space-y-6"
          >
            <Lock className="w-16 h-16 mx-auto text-primary" />
            <div>
              <h2 className="text-2xl font-bold mb-2">Espace Administrateur</h2>
              <p className="text-muted-foreground">
                Réservé au créateur : Bilal Al-Masoudi
              </p>
            </div>
            
            <form onSubmit={handleLogin} className="space-y-4 max-w-xs mx-auto">
              <Input
                type="password"
                placeholder="Mot de passe..."
                value={passwordInput}
                onChange={(e) => setPasswordInput(e.target.value)}
                className="text-center"
              />
              <Button type="submit" className="btn-gold w-full" disabled={isLoggingIn || !passwordInput.trim()}>
                {isLoggingIn ? "Connexion..." : "Connexion"}
              </Button>
            </form>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            {/* Déblocage Premium Créateur */}
            <div className="card-glass p-6 space-y-4">
              <div className="flex items-center gap-2">
                <Crown className="w-5 h-5 text-primary" />
                <h3 className="font-semibold text-lg">Déblocage Premium Créateur</h3>
              </div>
              
              <p className="text-sm text-muted-foreground">
                En tant que créateur, tu peux débloquer l'accès Premium manuellement.
              </p>
              
              <div className="flex items-center gap-4">
                <Button
                  onClick={() => {
                    playClick();
                    setPlayerEmail(CREATOR_EMAIL);
                    setIsPremium(true);
                    playTrophy();
                    toast.success("Premium Créateur activé !");
                  }}
                  className="btn-gold flex-1"
                  disabled={player.isPremium}
                >
                  <Unlock className="w-4 h-4 mr-2" />
                  {player.isPremium ? "Premium actif" : "Activer Premium"}
                </Button>
                
                {player.isPremium && (
                  <span className="text-secondary font-bold flex items-center gap-1">
                    <Crown className="w-4 h-4" />
                    Actif
                  </span>
                )}
              </div>
            </div>
            
            {/* Gestion des mots du jour */}
            <DailyWordsManager
              dailyWords={dailyWords}
              onSetWord={setDailyWord}
            />
          </motion.div>
        )}
      </main>
    </div>
  );
};

interface DailyWordsManagerProps {
  dailyWords: { date: string; word: VocabularyWord }[];
  onSetWord: (date: string, word: VocabularyWord) => void;
}

const DailyWordsManager = ({ dailyWords, onSetWord }: DailyWordsManagerProps) => {
  const { playClick, playSuccess } = useGameSounds();
  const [selectedDate, setSelectedDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  );
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [selectedWord, setSelectedWord] = useState<VocabularyWord | null>(null);
  
  const filteredWords = selectedCategory
    ? vocabularyWords.filter(w => w.category === selectedCategory)
    : vocabularyWords;
  
  const handleSave = () => {
    if (!selectedWord || !selectedDate) return;
    playSuccess();
    onSetWord(selectedDate, selectedWord);
    toast.success(`Mot du ${selectedDate} programmé : ${selectedWord.french}`);
    setSelectedWord(null);
  };
  
  // Générer les 14 prochains jours
  const upcomingDates = Array.from({ length: 14 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() + i);
    return date.toISOString().split('T')[0];
  });
  
  return (
    <div className="space-y-6">
      <div className="card-glass p-6 space-y-4">
        <div className="flex items-center gap-2">
          <Calendar className="w-5 h-5 text-primary" />
          <h3 className="font-semibold text-lg">Programmer les mots du jour</h3>
        </div>
        
        {/* Sélection de la date */}
        <div className="space-y-2">
          <label className="text-sm text-muted-foreground">Date</label>
          <select
            value={selectedDate}
            onChange={(e) => {
              playClick();
              setSelectedDate(e.target.value);
            }}
            className="w-full bg-muted border border-border rounded-lg px-4 py-2"
          >
            {upcomingDates.map(date => {
              const scheduled = dailyWords.find(dw => dw.date === date);
              return (
                <option key={date} value={date}>
                  {new Date(date).toLocaleDateString('fr-FR', {
                    weekday: 'long',
                    day: 'numeric',
                    month: 'long'
                  })}
                  {scheduled && ` ✓ ${scheduled.word.french}`}
                </option>
              );
            })}
          </select>
        </div>
        
        {/* Filtre par catégorie */}
        <div className="space-y-2">
          <label className="text-sm text-muted-foreground">Catégorie</label>
          <select
            value={selectedCategory}
            onChange={(e) => {
              playClick();
              setSelectedCategory(e.target.value);
            }}
            className="w-full bg-muted border border-border rounded-lg px-4 py-2"
          >
            <option value="">Toutes les catégories</option>
            {vocabularyCategories.map(cat => (
              <option key={cat.id} value={cat.id}>
                {cat.icon} {cat.name}
              </option>
            ))}
          </select>
        </div>
        
        {/* Liste des mots */}
        <div className="space-y-2">
          <label className="text-sm text-muted-foreground">Mot</label>
          <div className="max-h-60 overflow-y-auto space-y-2 border border-border rounded-lg p-2">
            {filteredWords.map(word => (
              <button
                key={word.id}
                onClick={() => {
                  playClick();
                  setSelectedWord(word);
                }}
                className={`w-full text-left p-3 rounded-lg transition-colors ${
                  selectedWord?.id === word.id
                    ? "bg-primary/20 border border-primary"
                    : "bg-muted hover:bg-muted/80"
                }`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <span className="font-arabic text-xl text-primary mr-3">
                      {word.arabic}
                    </span>
                    <span className="font-medium">{word.french}</span>
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {word.phonetic}
                  </span>
                </div>
              </button>
            ))}
          </div>
        </div>
        
        {/* Bouton sauvegarder */}
        <Button
          onClick={handleSave}
          disabled={!selectedWord}
          className="btn-gold w-full"
        >
          <Plus className="w-4 h-4 mr-2" />
          Programmer ce mot
        </Button>
      </div>
      
      {/* Mots programmés */}
      <div className="card-glass p-6 space-y-4">
        <h3 className="font-semibold text-lg">Mots programmés</h3>
        
        {dailyWords.length === 0 ? (
          <p className="text-muted-foreground text-center py-4">
            Aucun mot programmé
          </p>
        ) : (
          <div className="space-y-2">
            {dailyWords.sort((a, b) => a.date.localeCompare(b.date)).map(({ date, word }) => (
              <div
                key={date}
                className="flex items-center justify-between p-3 bg-muted rounded-lg"
              >
                <div>
                  <span className="text-sm text-muted-foreground mr-3">
                    {new Date(date).toLocaleDateString('fr-FR', {
                      weekday: 'short',
                      day: 'numeric',
                      month: 'short'
                    })}
                  </span>
                  <span className="font-arabic text-primary mr-2">{word.arabic}</span>
                  <span>{word.french}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Admin;
