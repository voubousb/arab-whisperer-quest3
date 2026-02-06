// Système d'arènes pour la compétition
// 12 arènes correspondant aux paliers de rangs + 1 arène d'entraînement

import arena1 from "@/assets/arenas/arena-1.jpg";
import arena2 from "@/assets/arenas/arena-2.jpg";
import arena3 from "@/assets/arenas/arena-3.jpg";
import arena4 from "@/assets/arenas/arena-4.jpg";
import arena5 from "@/assets/arenas/arena-5.jpg";
import arena6 from "@/assets/arenas/arena-6.jpg";
import arena7 from "@/assets/arenas/arena-7.jpg";
import arena8 from "@/assets/arenas/arena-8.jpg";
import arena9 from "@/assets/arenas/arena-9.jpg";
import arena10 from "@/assets/arenas/arena-10.jpg";
import arena11 from "@/assets/arenas/arena-11.jpg";
import arena12 from "@/assets/arenas/arena-12.jpg";
import arenaTraining from "@/assets/arenas/arena-training.jpg";

export interface Arena {
  id: number;
  name: string;
  nameAr?: string; // Nom en arabe
  image: string;
  minTrophies: number;
  maxTrophies: number;
  isTraining?: boolean;
}

// Arène d'entraînement (IA uniquement)
export const trainingArena: Arena = {
  id: 0,
  name: "Camp d'Entraînement",
  nameAr: "مُعَسْكَر التَّدْرِيب",
  image: arenaTraining,
  minTrophies: -1,
  maxTrophies: -1,
  isTraining: true,
};

// Arènes de compétition - Progression cohérente d'un édifice qui grandit
// Ordre: Terres → Bronze → Argent → Or → Mécanique → Diamant → Glace → Royal → Platine → Électrique → Cristal → Légende
export const arenas: Arena[] = [
  // Début - Ruines simples
  { id: 1, name: "Terres Oubliées", nameAr: "الأَرَاضِي المَنْسِيَّة", image: arena1, minTrophies: 0, maxTrophies: 299 },
  { id: 2, name: "Arène de Bronze", nameAr: "سَاحَة البِرُونْز", image: arena2, minTrophies: 300, maxTrophies: 699 },
  { id: 3, name: "Arène d'Argent", nameAr: "سَاحَة الفِضَّة", image: arena3, minTrophies: 700, maxTrophies: 1199 },
  { id: 4, name: "Arène d'Or", nameAr: "سَاحَة الذَّهَب", image: arena4, minTrophies: 1200, maxTrophies: 1799 },
  
  // Progression intermédiaire
  { id: 5, name: "Arène Mécanique", nameAr: "سَاحَة الآلَات", image: arena5, minTrophies: 1800, maxTrophies: 2499 },
  { id: 6, name: "Arène de Diamant", nameAr: "سَاحَة الأَلْمَاس", image: arena6, minTrophies: 2500, maxTrophies: 3299 },
  { id: 7, name: "Arène de Glace", nameAr: "سَاحَة الجَلِيد", image: arena7, minTrophies: 3300, maxTrophies: 4199 },
  { id: 8, name: "Arène Royale", nameAr: "السَّاحَة المَلَكِيَّة", image: arena8, minTrophies: 4200, maxTrophies: 5099 },
  
  // Arènes avancées
  { id: 9, name: "Arène de Platine", nameAr: "سَاحَة البْلَاتِين", image: arena9, minTrophies: 5100, maxTrophies: 5999 },
  { id: 10, name: "Arène Électrique", nameAr: "سَاحَة الكَهْرَبَاء", image: arena10, minTrophies: 6000, maxTrophies: 6899 },
  { id: 11, name: "Arène Améthyste", nameAr: "سَاحَة الجَمَشْت", image: arena11, minTrophies: 6900, maxTrophies: 7799 },
  
  // Ultime
  { id: 12, name: "Arène Ultime", nameAr: "السَّاحَة القُصْوَى", image: arena12, minTrophies: 7800, maxTrophies: Infinity },
];

export const getArenaByTrophies = (trophies: number): Arena => {
  return arenas.find(a => trophies >= a.minTrophies && trophies <= a.maxTrophies) || arenas[0];
};

export const getNextArena = (trophies: number): Arena | null => {
  const currentArena = getArenaByTrophies(trophies);
  const nextArenaIndex = arenas.findIndex(a => a.id === currentArena.id) + 1;
  return nextArenaIndex < arenas.length ? arenas[nextArenaIndex] : null;
};

export const getTrophiesToNextArena = (trophies: number): number => {
  const nextArena = getNextArena(trophies);
  if (!nextArena) return 0;
  return nextArena.minTrophies - trophies;
};

export const getAllArenas = (): Arena[] => arenas;
