import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { VocabularyWord, vocabularyWords, CREATOR_EMAIL } from '@/data/arabicData';

interface DailyWord {
  word: VocabularyWord;
  date: string;
}

interface DailyHistoryEntry {
  date: string;
  word: VocabularyWord;
  won: boolean;
  attempts: number;
}

interface Player {
  id: string;
  name: string;
  email?: string;
  avatarId?: string;
  trophies: number;
  gamesPlayed: number;
  gamesWon: number;
  isPremium: boolean;
  isCreator: boolean;
}

interface GameState {
  // Mot du jour
  dailyWords: DailyWord[];
  currentDailyWord: VocabularyWord | null;
  dailyAttempts: number;
  dailyCompleted: boolean;
  dailyWon: boolean;
  lastDailyDate: string | null;
  dailyHistory: DailyHistoryEntry[];
  
  // Favoris
  favorites: number[];
  
  // Joueur
  player: Player;
  
  // Admin
  isAdmin: boolean;
  
  // Actions
  setDailyWord: (date: string, word: VocabularyWord) => void;
  removeDailyWord: (date: string) => void;
  getDailyWord: () => VocabularyWord;
  submitDailyAnswer: (answer: string) => { correct: boolean; attempts: number };
  resetDaily: () => void;
  
  // Favoris
  toggleFavorite: (wordId: number) => void;
  
  // Trophées
  addTrophies: (amount: number) => void;
  removeTrophies: (amount: number) => void;
  
  // Admin
  setIsAdmin: (value: boolean) => void;
  
  // Premium
  setPlayerEmail: (email: string) => void;
  setIsPremium: (value: boolean) => void;
  checkCreatorStatus: () => boolean;
  
  // Stats
  incrementGamesPlayed: () => void;
  incrementGamesWon: () => void;
  
  // Auth sync
  setPlayerFromProfile: (profile: {
    display_name: string | null;
    avatar_url: string | null;
    trophies: number | null;
    games_played: number | null;
    games_won: number | null;
    is_premium: boolean | null;
    favorites: number[] | null;
  }) => void;
  syncToSupabase: (userId: string) => Promise<void>;
  setPlayerName: (name: string) => void;
  setPlayerAvatar: (avatarId: string) => void;
}

// Fonction pour normaliser les réponses (tolérance aux fautes et caractères spéciaux)
const normalizeAnswer = (answer: string): string => {
  let normalized = answer
    .toLowerCase()
    .trim()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // Enlever les accents
    .replace(/œ/g, "oe") // Remplacer œ par oe
    .replace(/æ/g, "ae") // Remplacer æ par ae
    .replace(/[^a-z0-9\s\/]/g, "") // Garder lettres, chiffres et /
    .replace(/\s+/g, " "); // Normaliser les espaces
  
  // Remplacer les chiffres par leurs équivalents textuels
  const numberMap: Record<string, string> = {
    "0": "zero",
    "1": "un",
    "2": "deux",
    "3": "trois",
    "4": "quatre",
    "5": "cinq",
    "6": "six",
    "7": "sept",
    "8": "huit",
    "9": "neuf",
    "10": "dix",
    "11": "onze",
    "12": "douze",
  };
  
  // Remplacer les chiffres par du texte
  Object.entries(numberMap).forEach(([num, text]) => {
    normalized = normalized.replace(new RegExp(`\\b${num}\\b`, "g"), text);
  });
  
  return normalized;
};

// Distance de Levenshtein pour tolérer les fautes d'orthographe
const levenshteinDistance = (a: string, b: string): number => {
  const matrix: number[][] = [];

  for (let i = 0; i <= b.length; i++) {
    matrix[i] = [i];
  }
  for (let j = 0; j <= a.length; j++) {
    matrix[0][j] = j;
  }

  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      if (b.charAt(i - 1) === a.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1,
          matrix[i][j - 1] + 1,
          matrix[i - 1][j] + 1
        );
      }
    }
  }

  return matrix[b.length][a.length];
};

// Vérifier si la réponse est correcte (avec tolérance)
const isAnswerCorrect = (answer: string, correctAnswer: string): boolean => {
  const normalizedAnswer = normalizeAnswer(answer);
  const normalizedCorrect = normalizeAnswer(correctAnswer);
  
  // Réponse exacte
  if (normalizedAnswer === normalizedCorrect) {
    return true;
  }
  
  // Tolérer 1-2 fautes selon la longueur du mot
  const maxErrors = normalizedCorrect.length <= 4 ? 1 : 2;
  const distance = levenshteinDistance(normalizedAnswer, normalizedCorrect);
  
  return distance <= maxErrors;
};

const getTodayDate = (): string => {
  return new Date().toISOString().split('T')[0];
};

export const useGameStore = create<GameState>()(
  persist(
    (set, get) => ({
      // État initial
      dailyWords: [],
      currentDailyWord: null,
      dailyAttempts: 0,
      dailyCompleted: false,
      dailyWon: false,
      lastDailyDate: null,
      dailyHistory: [],
      
      // Favoris
      favorites: [] as number[],
      
      player: {
        id: crypto.randomUUID(),
        name: "Joueur",
        avatarId: "tree",
        trophies: 0,
        gamesPlayed: 0,
        gamesWon: 0,
        isPremium: false,
        isCreator: false,
      },
      
      isAdmin: false,
      
      // Toggle favori
      toggleFavorite: (wordId: number) => {
        set((state) => ({
          favorites: state.favorites.includes(wordId)
            ? state.favorites.filter(id => id !== wordId)
            : [...state.favorites, wordId]
        }));
      },
      setDailyWord: (date: string, word: VocabularyWord) => {
        set((state) => ({
          dailyWords: [
            ...state.dailyWords.filter(dw => dw.date !== date),
            { date, word }
          ].sort((a, b) => a.date.localeCompare(b.date)),
        }));
      },
      
      removeDailyWord: (date: string) => {
        set((state) => ({
          dailyWords: state.dailyWords.filter(dw => dw.date !== date),
        }));
      },
      
      getDailyWord: () => {
        const state = get();
        const today = getTodayDate();
        
        // Vérifier si on a un mot programmé pour aujourd'hui
        const scheduledWord = state.dailyWords.find(dw => dw.date === today);
        
        if (scheduledWord) {
          return scheduledWord.word;
        }
        
        // Sinon, générer un mot aléatoire basé sur la date
        const dateHash = today.split('-').reduce((acc, val) => acc + parseInt(val), 0);
        const index = dateHash % vocabularyWords.length;
        return vocabularyWords[index];
      },
      
      submitDailyAnswer: (answer: string) => {
        const state = get();
        const dailyWord = state.getDailyWord();
        const correct = isAnswerCorrect(answer, dailyWord.french);
        const newAttempts = state.dailyAttempts + 1;
        const completed = correct || newAttempts >= 3;
        
        set({
          dailyAttempts: newAttempts,
          dailyCompleted: completed,
          dailyWon: correct,
          lastDailyDate: getTodayDate(),
        });
        
        // Ajouter à l'historique si terminé
        if (completed) {
          const today = getTodayDate();
          const existingEntry = state.dailyHistory.find(h => h.date === today);
          
          if (!existingEntry) {
            set((state) => ({
              dailyHistory: [
                ...state.dailyHistory,
                {
                  date: today,
                  word: dailyWord,
                  won: correct,
                  attempts: newAttempts,
                }
              ].slice(-30), // Garder les 30 derniers jours
            }));
          }
        }
        
        if (correct) {
          // Bonus de trophées pour le mot du jour
          const trophyBonus = 4 - newAttempts; // 3, 2 ou 1 trophée selon les essais
          get().addTrophies(trophyBonus);
        }
        
        return { correct, attempts: newAttempts };
      },
      
      resetDaily: () => {
        const today = getTodayDate();
        const state = get();
        
        if (state.lastDailyDate !== today) {
          set({
            dailyAttempts: 0,
            dailyCompleted: false,
            dailyWon: false,
            lastDailyDate: today,
          });
        }
      },
      
      addTrophies: (amount: number) => {
        set((state) => ({
          player: {
            ...state.player,
            trophies: state.player.trophies + amount,
          },
        }));
      },
      
      removeTrophies: (amount: number) => {
        set((state) => ({
          player: {
            ...state.player,
            trophies: Math.max(0, state.player.trophies - amount),
          },
        }));
      },
      
      setIsAdmin: (value: boolean) => {
        set({ isAdmin: value });
      },
      
      setPlayerEmail: (email: string) => {
        const isCreator = email.toLowerCase() === CREATOR_EMAIL.toLowerCase();
        set((state) => ({
          player: {
            ...state.player,
            email,
            isCreator,
            isPremium: isCreator ? true : state.player.isPremium,
          },
        }));
      },
      
      setIsPremium: (value: boolean) => {
        set((state) => ({
          player: {
            ...state.player,
            isPremium: value,
          },
        }));
      },
      
      checkCreatorStatus: () => {
        const state = get();
        return state.player.email?.toLowerCase() === CREATOR_EMAIL.toLowerCase();
      },
      
      incrementGamesPlayed: () => {
        set((state) => ({
          player: {
            ...state.player,
            gamesPlayed: state.player.gamesPlayed + 1,
          },
        }));
      },
      
      incrementGamesWon: () => {
        set((state) => ({
          player: {
            ...state.player,
            gamesWon: state.player.gamesWon + 1,
          },
        }));
      },
      
      setPlayerName: (name: string) => {
        set((state) => ({
          player: {
            ...state.player,
            name,
          },
        }));
      },
      
      setPlayerFromProfile: (profile) => {
        set((state) => ({
          player: {
            ...state.player,
            name: profile.display_name || "Joueur",
            avatarId: profile.avatar_url || "tree",
            trophies: profile.trophies ?? 0,
            gamesPlayed: profile.games_played ?? 0,
            gamesWon: profile.games_won ?? 0,
            isPremium: profile.is_premium ?? false,
          },
          favorites: profile.favorites ?? [],
        }));
      },
      
      setPlayerAvatar: (avatarId: string) => {
        set((state) => ({
          player: {
            ...state.player,
            avatarId,
          },
        }));
      },
      
      syncToSupabase: async (userId: string) => {
        const state = get();
        const { supabase } = await import("@/integrations/supabase/client");
        
        await supabase
          .from("profiles")
          .update({
            display_name: state.player.name,
            avatar_url: state.player.avatarId || "tree",
            trophies: state.player.trophies,
            games_played: state.player.gamesPlayed,
            games_won: state.player.gamesWon,
            is_premium: state.player.isPremium,
            favorites: state.favorites,
          })
          .eq("user_id", userId);
      },
    }),
    {
      name: 'arab-facile-storage',
    }
  )
);
