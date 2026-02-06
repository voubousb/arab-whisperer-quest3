// Catégories premium avec mots générés par Azure
// Ces catégories sont verrouillées jusqu'à l'achat du premium

export interface PremiumCategory {
  id: string;
  name: string;
  icon: string;
  wordCount: number;
  description: string;
}

export const premiumCategories: PremiumCategory[] = [
  { id: "medecine", name: "Médecine", icon: "🏥", wordCount: 40, description: "Termes médicaux" },
  { id: "cuisine", name: "Cuisine", icon: "👨‍🍳", wordCount: 40, description: "Gastronomie et recettes" },
  { id: "sciences", name: "Sciences", icon: "🔬", wordCount: 40, description: "Vocabulaire scientifique" },
  { id: "commerce", name: "Commerce", icon: "💼", wordCount: 40, description: "Business et économie" },
  { id: "religion", name: "Religion", icon: "🕌", wordCount: 40, description: "Vocabulaire islamique" },
  { id: "sport", name: "Sport", icon: "⚽", wordCount: 40, description: "Termes sportifs" },
  { id: "voyage", name: "Voyage", icon: "✈️", wordCount: 40, description: "Tourisme et déplacements" },
  { id: "art", name: "Art", icon: "🎨", wordCount: 40, description: "Vocabulaire artistique" },
  { id: "informatique", name: "Informatique", icon: "💻", wordCount: 40, description: "Tech et programmation" },
  { id: "nature", name: "Nature", icon: "🌿", wordCount: 40, description: "Environnement" },
  { id: "emotions", name: "Émotions", icon: "🎭", wordCount: 40, description: "Sentiments complexes" },
  { id: "animaux", name: "Animaux", icon: "🦁", wordCount: 40, description: "Faune du monde" },
];

// Total des mots premium : ~480
export const getTotalPremiumWords = (): number => {
  return premiumCategories.reduce((acc, cat) => acc + cat.wordCount, 0);
};
