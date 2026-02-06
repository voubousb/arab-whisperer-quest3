// Système de difficulté pour les mots
// facile = mots courts et courants
// moyen = mots de longueur moyenne
// difficile = mots longs ou abstraits

export type Difficulty = "facile" | "moyen" | "difficile";

export interface WordDifficulty {
  [wordId: number]: Difficulty;
}

// Attribution de difficulté basée sur la longueur et complexité
export const wordDifficulty: WordDifficulty = {
  // Animaux - majoritairement facile/moyen
  1: "facile",   // chien
  2: "facile",   // chat
  3: "facile",   // lion
  4: "moyen",    // cheval
  5: "moyen",    // vache
  6: "moyen",    // éléphant
  7: "moyen",    // oiseau
  8: "moyen",    // poisson
  9: "moyen",    // mouton
  10: "moyen",   // poule
  11: "moyen",   // chameau
  12: "moyen",   // tigre
  13: "moyen",   // loup
  14: "facile",  // lapin
  15: "facile",  // ours
  
  // Couleurs - facile
  16: "facile",  // rouge
  17: "facile",  // bleu
  18: "facile",  // vert
  19: "facile",  // jaune
  20: "facile",  // noir
  21: "facile",  // blanc
  22: "moyen",   // orange
  23: "facile",  // rose
  24: "moyen",   // marron
  25: "facile",  // gris
  
  // Nourriture - facile/moyen
  26: "facile",  // pain
  27: "facile",  // eau
  28: "facile",  // lait
  29: "moyen",   // viande
  30: "moyen",   // poisson
  31: "facile",  // pomme
  32: "facile",  // banane
  33: "facile",  // riz
  34: "facile",  // sucre
  35: "facile",  // sel
  36: "facile",  // œuf
  37: "moyen",   // fromage
  38: "moyen",   // poulet
  39: "facile",  // thé
  40: "facile",  // café
  
  // Famille - facile
  41: "facile",  // père
  42: "facile",  // mère
  43: "facile",  // frère
  44: "facile",  // sœur
  45: "moyen",   // grand-père
  46: "moyen",   // grand-mère
  47: "facile",  // fils
  48: "facile",  // fille
  49: "moyen",   // oncle
  50: "moyen",   // tante
  
  // Corps humain - facile/moyen
  51: "facile",  // tête
  52: "facile",  // œil
  53: "facile",  // nez
  54: "moyen",   // bouche
  55: "facile",  // main
  56: "facile",  // pied
  57: "moyen",   // cœur
  58: "facile",  // bras
  59: "moyen",   // jambe
  60: "moyen",   // oreille
  
  // Maison - moyen
  61: "facile",  // maison
  62: "facile",  // porte
  63: "moyen",   // fenêtre
  64: "moyen",   // chambre
  65: "moyen",   // cuisine
  66: "difficile", // salle de bain
  67: "moyen",   // chaise
  68: "facile",  // table
  69: "facile",  // lit
  70: "moyen",   // toit
  
  // Nature - moyen
  71: "facile",  // soleil
  72: "facile",  // lune
  73: "moyen",   // étoile
  74: "facile",  // eau
  75: "facile",  // feu
  76: "moyen",   // arbre
  77: "moyen",   // fleur
  78: "facile",  // mer
  79: "moyen",   // montagne
  80: "moyen",   // vent
  
  // Vêtements - moyen
  81: "moyen",   // chemise
  82: "moyen",   // pantalon
  83: "moyen",   // chaussure
  84: "moyen",   // chapeau
  85: "facile",  // robe
  86: "moyen",   // manteau
  87: "moyen",   // chaussette
  88: "moyen",   // veste
  89: "moyen",   // ceinture
  90: "facile",  // jupe
  
  // Nombres - facile
  91: "facile",  // un
  92: "facile",  // deux
  93: "facile",  // trois
  94: "moyen",   // quatre
  95: "facile",  // cinq
  96: "facile",  // six
  97: "facile",  // sept
  98: "facile",  // huit
  99: "facile",  // neuf
  100: "facile", // dix
  
  // Temps - moyen
  101: "moyen",  // aujourd'hui
  102: "moyen",  // demain
  103: "moyen",  // hier
  104: "difficile", // maintenant
  105: "moyen",  // matin
  106: "moyen",  // soir
  107: "facile", // nuit
  
  // Verbes - difficile
  108: "moyen",  // aller
  109: "moyen",  // manger
  110: "moyen",  // boire
  111: "facile", // lire
  112: "moyen",  // écrire
  113: "moyen",  // dormir
  114: "difficile", // s'asseoir
  115: "difficile", // se lever
  116: "moyen",  // ouvrir
  117: "moyen",  // fermer
  118: "moyen",  // jouer
  119: "difficile", // travailler
  120: "facile", // voir
  
  // Adjectifs - moyen
  121: "facile", // grand
  122: "facile", // petit
  123: "facile", // beau
  124: "moyen",  // laid
  125: "moyen",  // rapide
  126: "moyen",  // lent
  127: "moyen",  // facile
  128: "difficile", // difficile
  129: "moyen",  // nouveau
  130: "moyen",  // ancien
  131: "facile", // fort
  132: "moyen",  // faible
  
  // Lieux - moyen/difficile
  133: "moyen",  // école
  134: "moyen",  // mosquée
  135: "moyen",  // marché
  136: "facile", // rue
  137: "moyen",  // ville
  138: "moyen",  // village
  139: "difficile", // hôpital
  140: "difficile", // restaurant
  141: "difficile", // aéroport
  142: "facile", // parc
  
  // Professions - difficile
  143: "moyen",  // médecin
  144: "difficile", // professeur
  145: "difficile", // policier
  146: "difficile", // ingénieur
  147: "difficile", // chauffeur
  148: "difficile", // cuisinier
  149: "difficile", // infirmier
  150: "difficile", // avocat
  
  // Transports - moyen
  151: "moyen",  // voiture
  152: "moyen",  // avion
  153: "moyen",  // bateau
  154: "facile", // bus
  155: "moyen",  // train
  156: "moyen",  // vélo
  
  // Expressions - moyen/difficile
  161: "facile", // bonjour
  162: "moyen",  // bonsoir
  163: "moyen",  // au revoir
  164: "facile", // merci
  165: "difficile", // s'il te plaît
  166: "facile", // oui
  167: "facile", // non
  168: "moyen",  // bienvenue
  169: "moyen",  // bonne nuit
  170: "difficile", // félicitations
  171: "moyen",  // comment ça va
  172: "facile", // bien
  173: "moyen",  // pas bien
  174: "difficile", // comment t'appelles-tu
  175: "moyen",  // je m'appelle
  176: "moyen",  // enchanté
  177: "moyen",  // excuse-moi
};

// Récupérer la difficulté d'un mot
export const getWordDifficulty = (wordId: number): Difficulty => {
  return wordDifficulty[wordId] || "moyen";
};

// Sélection de mots par arène (niveau)
export const getWordsForArena = (
  arenaId: number, 
  allWords: { id: number; premium?: boolean }[]
): number[] => {
  // Arène 1-4: Majoritairement facile
  // Arène 5-8: Mélange facile/moyen
  // Arène 9-12: Tous niveaux, y compris difficile
  
  const filteredWordIds = allWords
    .filter(w => {
      const difficulty = getWordDifficulty(w.id);
      
      if (arenaId <= 4) {
        // Arènes débutantes: facile seulement
        return difficulty === "facile";
      } else if (arenaId <= 8) {
        // Arènes intermédiaires: facile et moyen
        return difficulty === "facile" || difficulty === "moyen";
      } else {
        // Arènes avancées: tous les niveaux
        return true;
      }
    })
    .map(w => w.id);
  
  return filteredWordIds;
};
