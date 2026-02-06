import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Check, X, Volume2, History, Calendar, Clock, Trophy, Sparkles, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useGameStore } from "@/store/gameStore";
import { useGameSounds } from "@/hooks/useGameSounds";
import { useElevenLabsSpeech } from "@/hooks/useElevenLabsSpeech";
import { checkAnswerWithVariations } from "@/data/wordVariations";
import { useAuth } from "@/hooks/useAuth";

const WordOfTheDay = () => {
  const navigate = useNavigate();
  const { playClick, playSuccess, playError, playCorrect, playTrophy } = useGameSounds();
  const { speak } = useElevenLabsSpeech();
  const { user } = useAuth();
  
  const {
    getDailyWord,
    submitDailyAnswer,
    dailyAttempts,
    dailyCompleted,
    dailyWon,
    resetDaily,
    dailyHistory,
    syncToSupabase,
  } = useGameStore();
  
  const [answer, setAnswer] = useState("");
  const [feedback, setFeedback] = useState<"correct" | "incorrect" | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [semanticProgress, setSemanticProgress] = useState<number | null>(null);
  const [timeUntilReset, setTimeUntilReset] = useState("");
  
  const dailyWord = getDailyWord();
  
  // Timer jusqu'au prochain mot
  useEffect(() => {
    const updateTimer = () => {
      const now = new Date();
      const tomorrow = new Date(now);
      tomorrow.setDate(tomorrow.getDate() + 1);
      tomorrow.setHours(0, 0, 0, 0);
      
      const diff = tomorrow.getTime() - now.getTime();
      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);
      
      setTimeUntilReset(
        `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
      );
    };
    
    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, []);
  
  useEffect(() => {
    resetDaily();
    if (dailyCompleted) {
      setShowResult(true);
      setFeedback(dailyWon ? "correct" : "incorrect");
    }
  }, [resetDaily, dailyCompleted, dailyWon]);
  
  // Calculer la proximité sémantique
  const calculateSemanticProgress = (userAnswer: string, correctAnswer: string): number => {
    const normalizedUser = userAnswer.toLowerCase().trim();
    const normalizedCorrect = correctAnswer.toLowerCase().trim();
    
    if (normalizedUser === normalizedCorrect) return 100;
    
    const maxLen = Math.max(normalizedUser.length, normalizedCorrect.length);
    if (maxLen === 0) return 0;
    
    let matches = 0;
    const correctChars = normalizedCorrect.split('');
    const userChars = normalizedUser.split('');
    
    correctChars.forEach((char, i) => {
      if (userChars[i] === char) matches++;
    });
    
    let prefixBonus = 0;
    for (let i = 0; i < Math.min(normalizedUser.length, normalizedCorrect.length); i++) {
      if (normalizedUser[i] === normalizedCorrect[i]) {
        prefixBonus += 5;
      } else {
        break;
      }
    }
    
    const baseProgress = (matches / maxLen) * 70 + prefixBonus;
    return Math.min(Math.round(baseProgress), 95);
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!answer.trim() || dailyCompleted) return;
    
    playClick();
    
    const progress = calculateSemanticProgress(answer, dailyWord.french);
    setSemanticProgress(progress);
    
    // Utiliser le système de variations avec tolérance 1 erreur max
    const isCorrect = checkAnswerWithVariations(dailyWord.id, dailyWord.french, answer);
    
    // Soumettre la réponse
    const result = submitDailyAnswer(answer);
    
    if (isCorrect || result.correct) {
      playCorrect();
      setTimeout(() => {
        playSuccess();
        // Son trophées après un court délai
        setTimeout(() => playTrophy(), 500);
      }, 300);
      setFeedback("correct");
      setSemanticProgress(100);
      setShowResult(true);
      
      // Synchroniser les trophées avec Supabase pour persistance indéfinie
      if (user?.id) {
        setTimeout(async () => {
          await syncToSupabase(user.id);
        }, 100);
      }
    } else {
      playError();
      setFeedback("incorrect");
      if (result.attempts >= 3) {
        setShowResult(true);
      } else {
        setTimeout(() => {
          setFeedback(null);
          setAnswer("");
        }, 1500);
      }
    }
  };
  
  const handleSpeak = () => {
    playClick();
    speak(dailyWord.arabic, { isVerb: (dailyWord as { isVerb?: boolean }).isVerb });
  };
  
  const remainingAttempts = 3 - dailyAttempts;
  
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('fr-FR', {
      weekday: 'short',
      day: 'numeric',
      month: 'short'
    });
  };
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-900 via-background to-primary/20 flex flex-col">
      {/* Header stylisé */}
      <header className="p-4 flex items-center justify-between relative z-10">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => {
            playClick();
            navigate("/");
          }}
          className="text-white hover:bg-white/10"
        >
          <ArrowLeft className="w-6 h-6" />
        </Button>
        
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              playClick();
              setShowHistory(!showHistory);
            }}
            className="flex items-center gap-2 text-white hover:bg-white/10"
          >
            <History className="w-4 h-4" />
          </Button>
        </div>
      </header>
      
      <main className="flex-1 flex flex-col items-center justify-center p-4">
        {showHistory ? (
          // Historique plein écran
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full max-w-lg space-y-6"
          >
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold flex items-center gap-3 text-white">
                <Calendar className="w-6 h-6 text-primary" />
                Historique
              </h2>
              <Button
                variant="outline"
                onClick={() => setShowHistory(false)}
                className="border-white/30 text-white hover:bg-white/10"
              >
                Retour
              </Button>
            </div>
            
            {dailyHistory.length === 0 ? (
              <div className="text-center py-16">
                <Sparkles className="w-16 h-16 mx-auto text-primary/50 mb-4" />
                <p className="text-white/70">
                  Aucun historique pour le moment.
                  <br />
                  Reviens chaque jour !
                </p>
              </div>
            ) : (
              <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-2">
                {dailyHistory.slice().reverse().map((entry, index) => (
                  <motion.div
                    key={entry.date}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className={`p-4 rounded-xl backdrop-blur-sm ${
                      entry.won 
                        ? "bg-secondary/20 border border-secondary/40" 
                        : "bg-accent/20 border border-accent/40"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-white/70">
                        {formatDate(entry.date)}
                      </span>
                      <span className={`font-semibold ${entry.won ? "text-secondary" : "text-accent"}`}>
                        {entry.won ? "✓ Gagné" : "✗ Perdu"}
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="font-arabic text-2xl text-primary">
                        {entry.word.arabic}
                      </span>
                      <span className="text-white font-medium text-lg">
                        {entry.word.french}
                      </span>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>
        ) : (
          // Quiz principal PLEIN ÉCRAN
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-2xl text-center flex flex-col items-center justify-center min-h-[70vh]"
          >
            {/* Titre avec timer et étoiles décoratives */}
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-2 mb-8"
            >
              <div className="flex items-center justify-center gap-3">
                <Star className="w-6 h-6 text-primary animate-pulse" />
                <h1 className="text-4xl sm:text-5xl font-bold bg-gradient-to-r from-primary via-yellow-300 to-primary bg-clip-text text-transparent">
                  Mot du Jour
                </h1>
                <Star className="w-6 h-6 text-primary animate-pulse" />
              </div>
              <div className="flex items-center justify-center gap-2 text-white/70">
                <Clock className="w-4 h-4" />
                <span className="font-mono text-lg">{timeUntilReset}</span>
              </div>
            </motion.div>
            
            {/* Mot en arabe - TRÈS GROS ET CENTRAL */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1 }}
              className="py-8 sm:py-12"
            >
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleSpeak}
                className="group relative inline-block"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-primary/30 to-violet-500/30 rounded-3xl blur-xl" />
                <div className="relative bg-white/10 backdrop-blur-sm rounded-3xl px-8 sm:px-12 py-6 sm:py-8 border border-white/20">
                  <p className="font-arabic text-6xl sm:text-8xl text-primary drop-shadow-lg leading-relaxed">
                    {dailyWord.arabic}
                  </p>
                  <Volume2 className="w-8 h-8 absolute -right-12 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity text-primary" />
                </div>
              </motion.button>
              
              <p className="text-xl sm:text-2xl text-white/80 mt-6 font-medium">
                {dailyWord.phonetic}
              </p>
            </motion.div>
            
            {/* Zone de réponse ou résultat */}
            <AnimatePresence mode="wait">
              {!showResult ? (
                <motion.form
                  key="form"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  onSubmit={handleSubmit}
                  className="space-y-6 w-full max-w-md"
                >
                  <div className="relative">
                    <Input
                      type="text"
                      placeholder="Écris la traduction en français..."
                      value={answer}
                      onChange={(e) => setAnswer(e.target.value)}
                      disabled={dailyCompleted}
                      autoFocus
                      className={`text-center text-xl py-6 bg-white/10 backdrop-blur-sm border-2 rounded-2xl text-white placeholder:text-white/50 transition-colors ${
                        feedback === "correct"
                          ? "border-secondary bg-secondary/20"
                          : feedback === "incorrect"
                          ? "border-accent bg-accent/20"
                          : "border-white/30 focus:border-primary"
                      }`}
                    />
                    
                    <AnimatePresence>
                      {feedback && (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          exit={{ scale: 0 }}
                          className={`absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full flex items-center justify-center ${
                            feedback === "correct" ? "bg-secondary" : "bg-accent"
                          }`}
                        >
                          {feedback === "correct" ? (
                            <Check className="w-6 h-6 text-white" />
                          ) : (
                            <X className="w-6 h-6 text-white" />
                          )}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                  
                  {/* Barre de progression sémantique */}
                  {semanticProgress !== null && feedback === "incorrect" && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="space-y-2"
                    >
                      <div className="flex justify-between text-sm">
                        <span className="text-white/70">Proximité</span>
                        <span className="font-bold text-primary">
                          {semanticProgress}%
                        </span>
                      </div>
                      <div className="h-3 bg-white/20 rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${semanticProgress}%` }}
                          className="h-full bg-gradient-to-r from-primary to-yellow-400 rounded-full"
                        />
                      </div>
                      <p className="text-sm text-white/70">
                        {semanticProgress > 70 ? "Tu y es presque !" :
                         semanticProgress > 40 ? "Tu t'approches..." :
                         "Essaie encore !"}
                      </p>
                    </motion.div>
                  )}
                  
                  {/* Essais restants */}
                  <div className="flex justify-center gap-3">
                    {[...Array(3)].map((_, i) => (
                      <motion.div
                        key={i}
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: i * 0.1 }}
                        className={`w-4 h-4 rounded-full transition-colors ${
                          i < remainingAttempts ? "bg-primary" : "bg-white/30"
                        }`}
                      />
                    ))}
                  </div>
                  <p className="text-sm text-white/70">
                    {remainingAttempts} essai{remainingAttempts > 1 ? "s" : ""} restant{remainingAttempts > 1 ? "s" : ""}
                  </p>
                  
                  <Button
                    type="submit"
                    disabled={!answer.trim() || dailyCompleted}
                    className="w-full text-lg py-6 rounded-2xl bg-gradient-to-r from-primary to-yellow-400 hover:from-primary/90 hover:to-yellow-500 text-background font-bold"
                  >
                    Valider
                  </Button>
                </motion.form>
              ) : (
                <motion.div
                  key="result"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-6"
                >
                  {feedback === "correct" || dailyWon ? (
                    <>
                      <motion.div
                        initial={{ scale: 0, rotate: -180 }}
                        animate={{ scale: 1, rotate: 0 }}
                        transition={{ type: "spring", damping: 10 }}
                        className="w-32 h-32 mx-auto rounded-full bg-gradient-to-br from-secondary/40 to-primary/40 backdrop-blur-sm flex items-center justify-center border border-secondary/50"
                      >
                        <Check className="w-16 h-16 text-secondary" />
                      </motion.div>
                      <h3 className="text-4xl font-bold text-secondary">
                        Bravo !
                      </h3>
                      <p className="text-xl text-white/80">
                        Tu as trouvé <span className="font-bold text-orange-400">{dailyWord.french}</span>
                        <br />en {dailyAttempts} essai{dailyAttempts > 1 ? "s" : ""} !
                      </p>
                      
                      {/* Animation trophées */}
                      <motion.div 
                        initial={{ scale: 0, y: 20 }}
                        animate={{ scale: 1, y: 0 }}
                        transition={{ delay: 0.3, type: "spring", stiffness: 200 }}
                        className="flex items-center justify-center gap-3"
                      >
                        {[...Array(4 - dailyAttempts)].map((_, i) => (
                          <motion.div
                            key={i}
                            initial={{ scale: 0, rotate: -180, y: 50 }}
                            animate={{ scale: 1, rotate: 0, y: 0 }}
                            transition={{ delay: 0.5 + i * 0.2, type: "spring", stiffness: 300 }}
                          >
                            <Trophy className="w-10 h-10 text-primary drop-shadow-lg" />
                          </motion.div>
                        ))}
                      </motion.div>
                      <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 1 }}
                        className="text-2xl text-primary font-bold"
                      >
                        +{4 - dailyAttempts} trophées
                      </motion.p>
                    </>
                  ) : (
                    <>
                      <motion.div
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="w-32 h-32 mx-auto rounded-full bg-gradient-to-br from-accent/40 to-red-500/40 backdrop-blur-sm flex items-center justify-center border border-accent/50"
                      >
                        <X className="w-16 h-16 text-accent" />
                      </motion.div>
                      <h3 className="text-4xl font-bold text-accent">
                        Dommage !
                      </h3>
                      <p className="text-xl text-white/80">
                        La réponse était <span className="font-bold text-white">{dailyWord.french}</span>
                      </p>
                      <p className="text-white/60">
                        Reviens demain pour un nouveau mot !
                      </p>
                    </>
                  )}
                  
                  <Button
                    onClick={() => navigate("/")}
                    className="mt-6 bg-white/20 hover:bg-white/30 text-white border border-white/30"
                  >
                    Retour à l'accueil
                  </Button>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}
      </main>
    </div>
  );
};

export default WordOfTheDay;
