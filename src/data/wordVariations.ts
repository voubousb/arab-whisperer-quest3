// Variations de traductions pour les mots arabes
// Permet d'accepter plusieurs réponses correctes

export interface WordVariations {
  [wordId: number]: string[];
}

// Mapping wordId -> alternatives acceptées (en plus de la réponse principale)
export const wordVariations: WordVariations = {
  // "ismi" - je m'appelle / mon nom
  175: ["mon nom", "je m'appelle"],
  
  // Animaux
  1: ["chien", "le chien", "un chien"],
  2: ["chat", "le chat", "un chat", "chatte"],
  3: ["lion", "le lion", "un lion"],
  4: ["cheval", "le cheval", "un cheval"],
  5: ["vache", "la vache", "une vache"],
  6: ["elephant", "l'elephant", "un elephant"],
  7: ["oiseau", "l'oiseau", "un oiseau"],
  8: ["poisson", "le poisson", "un poisson"],
  9: ["mouton", "le mouton", "un mouton"],
  10: ["poule", "la poule", "une poule"],
  11: ["chameau", "le chameau", "un chameau"],
  12: ["tigre", "le tigre", "un tigre"],
  13: ["loup", "le loup", "un loup"],
  14: ["lapin", "le lapin", "un lapin"],
  15: ["ours", "l'ours", "un ours"],
  
  // Couleurs
  16: ["rouge", "le rouge"],
  17: ["bleu", "le bleu"],
  18: ["vert", "le vert"],
  19: ["jaune", "le jaune"],
  20: ["noir", "le noir"],
  21: ["blanc", "le blanc"],
  22: ["orange", "l'orange"],
  23: ["rose", "le rose"],
  24: ["marron", "le marron", "brun"],
  25: ["gris", "le gris"],
  
  // Nourriture
  26: ["pain", "le pain", "du pain"],
  27: ["eau", "l'eau", "de l'eau"],
  28: ["lait", "le lait", "du lait"],
  29: ["viande", "la viande", "de la viande"],
  30: ["poisson", "le poisson", "du poisson"],
  31: ["pomme", "la pomme", "une pomme"],
  32: ["banane", "la banane", "une banane"],
  33: ["riz", "le riz", "du riz"],
  34: ["sucre", "le sucre", "du sucre"],
  35: ["sel", "le sel", "du sel"],
  36: ["oeuf", "l'oeuf", "un oeuf", "œuf"],
  37: ["fromage", "le fromage", "du fromage"],
  38: ["poulet", "le poulet", "du poulet"],
  39: ["the", "le the", "du the", "thé"],
  40: ["cafe", "le cafe", "du cafe", "café"],
  
  // Famille
  41: ["pere", "le pere", "papa", "père"],
  42: ["mere", "la mere", "maman", "mère"],
  43: ["frere", "le frere", "mon frere", "frère"],
  44: ["soeur", "la soeur", "ma soeur", "sœur"],
  45: ["grand-pere", "le grand-pere", "papy", "grand père"],
  46: ["grand-mere", "la grand-mere", "mamie", "grand mère"],
  47: ["fils", "le fils", "mon fils"],
  48: ["fille", "la fille", "ma fille"],
  49: ["oncle", "l'oncle", "mon oncle"],
  50: ["tante", "la tante", "ma tante"],
  
  // Corps humain
  51: ["tete", "la tete", "tête"],
  52: ["oeil", "l'oeil", "un oeil", "œil"],
  53: ["nez", "le nez", "un nez"],
  54: ["bouche", "la bouche", "une bouche"],
  55: ["main", "la main", "une main"],
  56: ["pied", "le pied", "un pied"],
  57: ["coeur", "le coeur", "un coeur", "cœur"],
  58: ["bras", "le bras", "un bras"],
  59: ["jambe", "la jambe", "une jambe"],
  60: ["oreille", "l'oreille", "une oreille"],
  
  // Maison
  61: ["maison", "la maison", "une maison"],
  62: ["porte", "la porte", "une porte"],
  63: ["fenetre", "la fenetre", "une fenetre", "fenêtre"],
  64: ["chambre", "la chambre", "une chambre"],
  65: ["cuisine", "la cuisine", "une cuisine"],
  66: ["salle de bain", "la salle de bain", "sdb", "toilettes"],
  67: ["chaise", "la chaise", "une chaise"],
  68: ["table", "la table", "une table"],
  69: ["lit", "le lit", "un lit"],
  70: ["toit", "le toit", "un toit"],
  
  // Nature
  71: ["soleil", "le soleil"],
  72: ["lune", "la lune"],
  73: ["etoile", "l'etoile", "une etoile", "étoile"],
  74: ["eau", "l'eau"],
  75: ["feu", "le feu", "du feu"],
  76: ["arbre", "l'arbre", "un arbre"],
  77: ["fleur", "la fleur", "une fleur"],
  78: ["mer", "la mer"],
  79: ["montagne", "la montagne", "une montagne"],
  80: ["vent", "le vent", "du vent"],
  
  // Vêtements
  81: ["chemise", "la chemise", "une chemise"],
  82: ["pantalon", "le pantalon", "un pantalon"],
  83: ["chaussure", "la chaussure", "une chaussure", "chaussures"],
  84: ["chapeau", "le chapeau", "un chapeau"],
  85: ["robe", "la robe", "une robe"],
  86: ["manteau", "le manteau", "un manteau"],
  87: ["chaussette", "la chaussette", "une chaussette", "chaussettes"],
  88: ["veste", "la veste", "une veste"],
  89: ["ceinture", "la ceinture", "une ceinture"],
  90: ["jupe", "la jupe", "une jupe"],
  
  // Nombres
  91: ["un", "1", "une"],
  92: ["deux", "2"],
  93: ["trois", "3"],
  94: ["quatre", "4"],
  95: ["cinq", "5"],
  96: ["six", "6"],
  97: ["sept", "7"],
  98: ["huit", "8"],
  99: ["neuf", "9"],
  100: ["dix", "10"],
  
  // Verbes
  108: ["aller", "partir", "s'en aller"],
  109: ["manger", "se nourrir"],
  110: ["boire", "se desalterer"],
  111: ["lire", "bouquiner"],
  112: ["ecrire", "rediger", "écrire", "rédiger"],
  113: ["dormir", "se reposer", "faire dodo"],
  114: ["s'asseoir", "sasseoir", "asseoir"],
  115: ["se lever", "se dresser", "lever"],
  116: ["ouvrir", "debloquer"],
  117: ["fermer", "clore"],
  118: ["jouer", "s'amuser"],
  119: ["travailler", "bosser"],
  120: ["voir", "regarder", "apercevoir"],
  
  // Adjectifs
  121: ["grand", "grande", "gros"],
  122: ["petit", "petite"],
  123: ["beau", "belle", "joli", "jolie"],
  124: ["laid", "laide", "moche"],
  125: ["rapide", "vite", "veloce"],
  126: ["lent", "lente"],
  127: ["facile", "simple", "aise"],
  128: ["difficile", "dur", "complique"],
  129: ["nouveau", "nouvelle", "neuf"],
  130: ["ancien", "ancienne", "vieux"],
  131: ["fort", "forte", "costaud"],
  132: ["faible"],
  
  // Lieux
  133: ["ecole", "l'ecole", "école"],
  134: ["mosquee", "la mosquee", "mosquée"],
  135: ["marche", "le marche", "marché"],
  136: ["rue", "la rue", "avenue"],
  137: ["ville", "la ville", "cite"],
  138: ["village", "le village", "hameau"],
  139: ["hopital", "l'hopital", "hôpital"],
  140: ["restaurant", "le restaurant", "resto"],
  141: ["aeroport", "l'aeroport", "aéroport"],
  142: ["parc", "le parc", "jardin"],
  
  // Temps
  101: ["aujourd'hui", "ce jour", "aujourdhui"],
  102: ["demain", "le lendemain"],
  103: ["hier", "la veille"],
  104: ["maintenant", "a present", "tout de suite"],
  105: ["matin", "le matin", "matinee"],
  106: ["soir", "le soir", "soiree"],
  107: ["nuit", "la nuit"],
  
  // Expressions
  161: ["bonjour", "salut", "hello", "salam"],
  162: ["bonsoir", "bonne soiree"],
  163: ["au revoir", "bye", "a bientot", "ciao"],
  164: ["merci", "thanks", "remerciement"],
  165: ["s'il te plait", "stp", "s'il vous plait", "svp"],
  166: ["oui", "ouais", "yes"],
  167: ["non", "nan", "no"],
  168: ["bienvenue", "welcome"],
  169: ["bonne nuit", "dors bien"],
  170: ["felicitations", "bravo", "félicitations"],
  171: ["comment ca va", "ca va", "comment vas-tu", "ça va"],
  172: ["bien", "ca va bien", "tres bien"],
  173: ["pas bien", "ca va pas", "mal"],
  174: ["comment t'appelles-tu", "ton nom", "c'est quoi ton nom"],
  176: ["enchanté", "enchante", "ravi de te connaitre"],
  177: ["excuse-moi", "pardon", "desole", "désolé"],
};

// Fonction pour vérifier si une réponse est correcte (avec variations)
export const checkAnswerWithVariations = (
  wordId: number, 
  mainAnswer: string, 
  userAnswer: string
): boolean => {
  const normalizeText = (text: string): string => {
    return text
      .toLowerCase()
      .trim()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/œ/g, "oe")
      .replace(/æ/g, "ae")
      .replace(/[^a-z0-9\s]/g, "")
      .replace(/\s+/g, " ");
  };
  
  const normalizedUserAnswer = normalizeText(userAnswer);
  const normalizedMainAnswer = normalizeText(mainAnswer);
  
  // Vérifier réponse principale
  if (normalizedUserAnswer === normalizedMainAnswer) return true;
  
  // Vérifier tolérance 1 erreur sur la réponse principale
  if (levenshteinDistance(normalizedUserAnswer, normalizedMainAnswer) <= 1) return true;
  
  // Vérifier les variations
  const variations = wordVariations[wordId];
  if (variations) {
    for (const variation of variations) {
      const normalizedVariation = normalizeText(variation);
      if (normalizedUserAnswer === normalizedVariation) return true;
      // Tolérance 1 erreur sur les variations aussi
      if (levenshteinDistance(normalizedUserAnswer, normalizedVariation) <= 1) return true;
    }
  }
  
  return false;
};

// Distance de Levenshtein
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
