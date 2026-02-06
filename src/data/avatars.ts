// Avatars sans représentation humaine - objets, nature, symboles
export interface Avatar {
  id: string;
  name: string;
  emoji: string;
  color: string;
}

export const avatars: Avatar[] = [
  // Nature
  { id: "tree", name: "Arbre", emoji: "🌳", color: "#22c55e" },
  { id: "mountain", name: "Montagne", emoji: "🏔️", color: "#6b7280" },
  { id: "sun", name: "Soleil", emoji: "☀️", color: "#fbbf24" },
  { id: "moon", name: "Lune", emoji: "🌙", color: "#a78bfa" },
  { id: "star", name: "Étoile", emoji: "⭐", color: "#f59e0b" },
  { id: "fire", name: "Feu", emoji: "🔥", color: "#ef4444" },
  { id: "water", name: "Eau", emoji: "💧", color: "#3b82f6" },
  { id: "leaf", name: "Feuille", emoji: "🍃", color: "#22c55e" },
  { id: "flower", name: "Fleur", emoji: "🌸", color: "#ec4899" },
  { id: "cactus", name: "Cactus", emoji: "🌵", color: "#84cc16" },
  
  // Objets
  { id: "diamond", name: "Diamant", emoji: "💎", color: "#06b6d4" },
  { id: "crown", name: "Couronne", emoji: "👑", color: "#f59e0b" },
  { id: "rocket", name: "Fusée", emoji: "🚀", color: "#6366f1" },
  { id: "lightning", name: "Éclair", emoji: "⚡", color: "#eab308" },
  { id: "crystal", name: "Cristal", emoji: "🔮", color: "#8b5cf6" },
  { id: "shield", name: "Bouclier", emoji: "🛡️", color: "#64748b" },
  { id: "sword", name: "Épée", emoji: "⚔️", color: "#94a3b8" },
  { id: "book", name: "Livre", emoji: "📚", color: "#b45309" },
  { id: "lamp", name: "Lampe", emoji: "🪔", color: "#f97316" },
  { id: "compass", name: "Boussole", emoji: "🧭", color: "#0891b2" },
  
  // Animaux stylisés (sans âme visible)
  { id: "butterfly", name: "Papillon", emoji: "🦋", color: "#a855f7" },
  { id: "phoenix", name: "Phénix", emoji: "🔥", color: "#dc2626" },
  { id: "dragon", name: "Dragon", emoji: "🐉", color: "#16a34a" },
  
  // Symboles arabes/islamiques
  { id: "crescent", name: "Croissant", emoji: "🌙", color: "#fbbf24" },
  { id: "lantern", name: "Lanterne", emoji: "🏮", color: "#dc2626" },
];

export const getAvatarById = (id: string): Avatar => {
  return avatars.find(a => a.id === id) || avatars[0];
};
