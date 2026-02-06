import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Volume2, BookOpen, Languages, Heart, HeartOff, Lock, Crown, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { arabicAlphabet, vocabularyWords, vocabularyCategories, VocabularyWord } from "@/data/arabicData";
import { premiumCategories, getTotalPremiumWords } from "@/data/premiumCategories";
import { getPremiumWordsByCategory, PremiumWord } from "@/data/premiumWords";
import { useGameSounds } from "@/hooks/useGameSounds";
import { useElevenLabsSpeech } from "@/hooks/useElevenLabsSpeech";
import { useGameStore } from "@/store/gameStore";

const Training = () => {
  const navigate = useNavigate();
  const { playClick, playSuccess, playTrophy } = useGameSounds();
  const { speak } = useElevenLabsSpeech();
  const { favorites, toggleFavorite, player } = useGameStore();
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  const [selectedPremiumCategory, setSelectedPremiumCategory] = useState<string | null>(null);
  
  const handleSpeak = (text: string, options?: { isVerb?: boolean }) => {
    playClick();
    speak(text, options);
  };
  
  const filteredWords = vocabularyWords.filter(w => {
    const categoryMatch = selectedCategory === null || w.category === selectedCategory;
    const favoriteMatch = !showFavoritesOnly || favorites.includes(w.id);
    return categoryMatch && favoriteMatch;
  });
  
  const handleToggleFavorite = (wordId: number) => {
    playClick();
    toggleFavorite(wordId);
  };
  
  const totalPremiumWords = getTotalPremiumWords();
  
  // Obtenir les mots de la catégorie premium sélectionnée
  const selectedPremiumWords = selectedPremiumCategory 
    ? getPremiumWordsByCategory(selectedPremiumCategory) 
    : [];
  
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
        <h1 className="text-2xl font-bold text-gradient-yellow">Entraînement</h1>
      </header>
      
      <main className="container max-w-6xl mx-auto p-4">
        <Tabs defaultValue="letters" className="space-y-6">
          <TabsList className="grid w-full max-w-2xl mx-auto grid-cols-4 bg-muted">
            <TabsTrigger value="letters" className="flex items-center gap-1 text-xs sm:text-sm" onClick={playClick}>
              <BookOpen className="w-3 h-3 sm:w-4 sm:h-4" />
              <span className="hidden sm:inline">Alphabet</span>
              <span className="sm:hidden">ABC</span>
            </TabsTrigger>
            <TabsTrigger value="vocabulary" className="flex items-center gap-1 text-xs sm:text-sm" onClick={playClick}>
              <Languages className="w-3 h-3 sm:w-4 sm:h-4" />
              <span className="hidden sm:inline">Vocabulaire</span>
              <span className="sm:hidden">Mots</span>
            </TabsTrigger>
            <TabsTrigger value="premium" className="flex items-center gap-1 text-xs sm:text-sm" onClick={playClick}>
              <Crown className="w-3 h-3 sm:w-4 sm:h-4" />
              <span className="hidden sm:inline">Premium</span>
              <span className="sm:hidden">Pro</span>
            </TabsTrigger>
            <TabsTrigger value="favorites" className="flex items-center gap-1 text-xs sm:text-sm" onClick={playClick}>
              <Heart className="w-3 h-3 sm:w-4 sm:h-4" />
              <span>({favorites.length})</span>
            </TabsTrigger>
          </TabsList>
          
          {/* Alphabet arabe */}
          <TabsContent value="letters" className="space-y-6">
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center text-muted-foreground"
            >
              Les 28 lettres de l'alphabet arabe • Clique pour écouter la prononciation
            </motion.p>
            
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {arabicAlphabet.map((letter, index) => (
                <motion.button
                  key={letter.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.03 }}
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                    onClick={() => handleSpeak(letter.isolated)}
                  className="arabic-letter-card group"
                >
                  {/* Nom de la lettre */}
                  <p className="text-sm text-muted-foreground mb-2">{letter.name}</p>
                  
                  {/* Formes de la lettre (de droite à gauche) */}
                  <div className="grid grid-cols-4 gap-1 text-center mb-3" dir="rtl">
                    <div className="space-y-1">
                      <span className="text-xs text-muted-foreground">Isolé</span>
                      <p className="font-arabic text-2xl text-primary">{letter.isolated}</p>
                    </div>
                    <div className="space-y-1">
                      <span className="text-xs text-muted-foreground">Début</span>
                      <p className="font-arabic text-2xl text-foreground">{letter.initial}</p>
                    </div>
                    <div className="space-y-1">
                      <span className="text-xs text-muted-foreground">Milieu</span>
                      <p className="font-arabic text-2xl text-foreground">{letter.medial}</p>
                    </div>
                    <div className="space-y-1">
                      <span className="text-xs text-muted-foreground">Fin</span>
                      <p className="font-arabic text-2xl text-foreground">{letter.final}</p>
                    </div>
                  </div>
                  
                  {/* Phonétique - remplacer â par aa */}
                  <p className="text-xs text-muted-foreground">
                    {letter.phonetic.replace(/â/g, 'aa')}
                  </p>
                  
                  {/* Icône son */}
                  <Volume2 className="w-4 h-4 absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity text-primary" />
                </motion.button>
              ))}
            </div>
          </TabsContent>
          
          {/* Vocabulaire */}
          <TabsContent value="vocabulary" className="space-y-6">
            {/* Catégories */}
            <div className="flex flex-wrap gap-2 justify-center">
              <Button
                variant={selectedCategory === null ? "default" : "outline"}
                size="sm"
                onClick={() => {
                  playClick();
                  setSelectedCategory(null);
                }}
                className={selectedCategory === null ? "bg-primary text-primary-foreground" : ""}
              >
                Tous ({vocabularyWords.length})
              </Button>
              {vocabularyCategories.map((cat) => {
                const count = vocabularyWords.filter(w => w.category === cat.id).length;
                return (
                  <Button
                    key={cat.id}
                    variant={selectedCategory === cat.id ? "default" : "outline"}
                    size="sm"
                    onClick={() => {
                      playClick();
                      setSelectedCategory(cat.id);
                    }}
                    className={selectedCategory === cat.id ? "bg-primary text-primary-foreground" : ""}
                  >
                    {cat.icon} {cat.name} ({count})
                  </Button>
                );
              })}
            </div>
            
            {/* Grille de vocabulaire */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {filteredWords.map((word, index) => (
                <VocabularyCard 
                  key={word.id} 
                  word={word} 
                  index={index} 
                  onSpeak={handleSpeak}
                  isFavorite={favorites.includes(word.id)}
                  onToggleFavorite={() => handleToggleFavorite(word.id)}
                />
              ))}
            </div>
          </TabsContent>
          
          {/* Premium */}
          <TabsContent value="premium" className="space-y-6">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center space-y-4"
            >
              <Crown className={`w-16 h-16 mx-auto ${player.isPremium ? "text-primary" : "text-muted-foreground"}`} />
              <h3 className="text-2xl font-bold">
                {player.isPremium ? "Premium Actif" : "Contenu Premium"}
              </h3>
              <p className="text-muted-foreground">
                {player.isPremium 
                  ? `Tu as accès à ${totalPremiumWords} mots supplémentaires !`
                  : `Débloque ${totalPremiumWords} mots avec l'abonnement Premium`
                }
              </p>
            </motion.div>
            
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {premiumCategories.map((cat, index) => (
                <motion.button
                  key={cat.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.03 }}
                  onClick={() => {
                    if (player.isPremium) {
                      playClick();
                      setSelectedPremiumCategory(cat.id);
                    }
                  }}
                  className={`card-glass p-4 text-center relative ${
                    player.isPremium ? "cursor-pointer hover:bg-muted/50 transition-colors" : "opacity-70 cursor-not-allowed"
                  }`}
                >
                  {!player.isPremium && (
                    <div className="absolute top-2 right-2">
                      <Lock className="w-4 h-4 text-muted-foreground" />
                    </div>
                  )}
                  <span className="text-3xl mb-2 block">{cat.icon}</span>
                  <h4 className="font-medium text-sm">{cat.name}</h4>
                  <p className="text-xs text-muted-foreground">{cat.wordCount} mots</p>
                </motion.button>
              ))}
            </div>
            
            {!player.isPremium && (
              <Button
                onClick={() => {
                  playClick();
                  navigate("/");
                }}
                className="btn-gold w-full max-w-md mx-auto"
              >
                <Crown className="w-4 h-4 mr-2" />
                Débloquer Premium - 9,99€
              </Button>
            )}
          </TabsContent>
          
          {/* Favoris */}
          <TabsContent value="favorites" className="space-y-6">
            {favorites.length === 0 ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-12"
              >
                <HeartOff className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-xl font-bold mb-2">Aucun favori</h3>
                <p className="text-muted-foreground">
                  Ajoute des mots à tes favoris dans l'onglet Vocabulaire
                </p>
              </motion.div>
            ) : (
              <>
                <p className="text-center text-muted-foreground">
                  Tes {favorites.length} mots favoris pour réviser
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {vocabularyWords
                    .filter(w => favorites.includes(w.id))
                    .map((word, index) => (
                      <VocabularyCard 
                        key={word.id} 
                        word={word} 
                        index={index} 
                        onSpeak={handleSpeak}
                        isFavorite={true}
                        onToggleFavorite={() => handleToggleFavorite(word.id)}
                      />
                    ))}
                </div>
              </>
            )}
          </TabsContent>
        </Tabs>
      </main>
      
      {/* Modal pour afficher les mots d'une catégorie premium */}
      <AnimatePresence>
        {selectedPremiumCategory && player.isPremium && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4"
            onClick={() => setSelectedPremiumCategory(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-background rounded-2xl w-full max-w-4xl max-h-[85vh] overflow-hidden flex flex-col"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header du modal */}
              <div className="p-4 border-b border-border flex items-center justify-between bg-muted/50">
                <div className="flex items-center gap-3">
                  <span className="text-3xl">
                    {premiumCategories.find(c => c.id === selectedPremiumCategory)?.icon}
                  </span>
                  <div>
                    <h3 className="text-xl font-bold">
                      {premiumCategories.find(c => c.id === selectedPremiumCategory)?.name}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {selectedPremiumWords.length} mots
                    </p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setSelectedPremiumCategory(null)}
                >
                  <X className="w-5 h-5" />
                </Button>
              </div>
              
              {/* Liste des mots scrollable */}
              <div className="flex-1 overflow-y-auto p-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                  {selectedPremiumWords.map((word, index) => (
                    <PremiumWordCard
                      key={word.id}
                      word={word}
                      index={index}
                      onSpeak={handleSpeak}
                    />
                  ))}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

interface VocabularyCardProps {
  word: VocabularyWord;
  index: number;
  onSpeak: (text: string, options?: { isVerb?: boolean }) => void;
  isFavorite: boolean;
  onToggleFavorite: () => void;
}

const VocabularyCard = ({ word, index, onSpeak, isFavorite, onToggleFavorite }: VocabularyCardProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: Math.min(index * 0.02, 0.5) }}
      className="card-glass p-4 text-center group relative"
    >
      {/* Bouton favori */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          onToggleFavorite();
        }}
        className={`absolute top-2 left-2 p-1.5 rounded-full transition-all ${
          isFavorite 
            ? "bg-accent/20 text-accent" 
            : "bg-muted text-muted-foreground hover:text-accent"
        }`}
      >
        <Heart className={`w-4 h-4 ${isFavorite ? "fill-current" : ""}`} />
      </button>
      
      {/* Zone cliquable pour le son */}
      <button
        onClick={() => onSpeak(word.arabic, { isVerb: word.isVerb })}
        className="w-full"
      >
        {/* Mot en arabe avec harakat */}
        <p className="font-arabic text-3xl text-primary mb-2" dir="rtl">
          {word.arabic}
        </p>
        
        {/* Phonétique - remplacer â par aa */}
        <p className="text-sm text-muted-foreground mb-2">
          {word.phonetic.replace(/â/g, 'aa')}
        </p>
        
        {/* Traduction française */}
        <p className="text-lg font-medium text-foreground">
          {word.french}
        </p>
      </button>
      
      {/* Icône son */}
      <Volume2 className="w-4 h-4 absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity text-primary" />
    </motion.div>
  );
};

interface PremiumWordCardProps {
  word: PremiumWord;
  index: number;
  onSpeak: (text: string, options?: { isVerb?: boolean }) => void;
}

const PremiumWordCard = ({ word, index, onSpeak }: PremiumWordCardProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: Math.min(index * 0.02, 0.5) }}
      className="card-glass p-4 text-center group relative cursor-pointer hover:bg-muted/50 transition-colors"
      onClick={() => onSpeak(word.arabic)}
    >
      {/* Mot en arabe avec harakat */}
      <p className="font-arabic text-3xl text-primary mb-2" dir="rtl">
        {word.arabic}
      </p>
      
      {/* Phonétique - remplacer â par aa */}
      <p className="text-sm text-muted-foreground mb-2">
        {word.phonetic.replace(/â/g, 'aa')}
      </p>
      
      {/* Traduction française */}
      <p className="text-lg font-medium text-foreground">
        {word.french}
      </p>
      
      {/* Badge difficulté */}
      <div className="absolute top-2 right-2">
        <span className={`text-xs px-2 py-0.5 rounded-full ${
          word.difficulty <= 3 ? 'bg-secondary/20 text-secondary' :
          word.difficulty <= 6 ? 'bg-primary/20 text-primary' :
          'bg-accent/20 text-accent'
        }`}>
          Niv. {word.difficulty}
        </span>
      </div>
      
      {/* Icône son */}
      <Volume2 className="w-4 h-4 absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity text-primary" />
    </motion.div>
  );
};

export default Training;
