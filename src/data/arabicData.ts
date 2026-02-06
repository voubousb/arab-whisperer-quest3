// ============================================
// Source: arabi_facile_base_complete_28_lettres_200_mots_harakat.xlsx
// Généré automatiquement — ne pas modifier manuellement
// ============================================

// Les 28 lettres de l'alphabet arabe avec leurs formes et phonétique
export interface ArabicLetter {
  id: number;
  name: string;
  isolated: string;
  initial: string;
  medial: string;
  final: string;
  phonetic: string;
  audio?: string;
}

// Alphabet (28 lettres) - utilisation de "j" au lieu de "dj"
// Points sous les lettres emphatiques: ṣ ḍ ṭ ẓ
export const arabicAlphabet: ArabicLetter[] = [
  { id: 1, name: "Alif", isolated: "ا", initial: "ا", medial: "ـا", final: "ـا", phonetic: "a / â" },
  { id: 2, name: "Bā'", isolated: "ب", initial: "بـ", medial: "ـبـ", final: "ـب", phonetic: "b" },
  { id: 3, name: "Tā'", isolated: "ت", initial: "تـ", medial: "ـتـ", final: "ـت", phonetic: "t" },
  { id: 4, name: "Thā'", isolated: "ث", initial: "ثـ", medial: "ـثـ", final: "ـث", phonetic: "th" },
  { id: 5, name: "Jīm", isolated: "ج", initial: "جـ", medial: "ـجـ", final: "ـج", phonetic: "j" },
  { id: 6, name: "Ḥā'", isolated: "ح", initial: "حـ", medial: "ـحـ", final: "ـح", phonetic: "ḥ" },
  { id: 7, name: "Khā'", isolated: "خ", initial: "خـ", medial: "ـخـ", final: "ـخ", phonetic: "kh" },
  { id: 8, name: "Dāl", isolated: "د", initial: "د", medial: "ـد", final: "ـد", phonetic: "d" },
  { id: 9, name: "Dhāl", isolated: "ذ", initial: "ذ", medial: "ـذ", final: "ـذ", phonetic: "dh" },
  { id: 10, name: "Rā'", isolated: "ر", initial: "ر", medial: "ـر", final: "ـر", phonetic: "r" },
  { id: 11, name: "Zāy", isolated: "ز", initial: "ز", medial: "ـز", final: "ـز", phonetic: "z" },
  { id: 12, name: "Sīn", isolated: "س", initial: "سـ", medial: "ـسـ", final: "ـس", phonetic: "s" },
  { id: 13, name: "Shīn", isolated: "ش", initial: "شـ", medial: "ـشـ", final: "ـش", phonetic: "sh" },
  { id: 14, name: "Ṣād", isolated: "ص", initial: "صـ", medial: "ـصـ", final: "ـص", phonetic: "ṣ" },
  { id: 15, name: "Ḍād", isolated: "ض", initial: "ضـ", medial: "ـضـ", final: "ـض", phonetic: "ḍ" },
  { id: 16, name: "Ṭā'", isolated: "ط", initial: "طـ", medial: "ـطـ", final: "ـط", phonetic: "ṭ" },
  { id: 17, name: "Ẓā'", isolated: "ظ", initial: "ظـ", medial: "ـظـ", final: "ـظ", phonetic: "ẓ" },
  { id: 18, name: "'Ayn", isolated: "ع", initial: "عـ", medial: "ـعـ", final: "ـع", phonetic: "'ayn" },
  { id: 19, name: "Ghayn", isolated: "غ", initial: "غـ", medial: "ـغـ", final: "ـغ", phonetic: "gh" },
  { id: 20, name: "Fā'", isolated: "ف", initial: "فـ", medial: "ـفـ", final: "ـف", phonetic: "f" },
  { id: 21, name: "Qāf", isolated: "ق", initial: "قـ", medial: "ـقـ", final: "ـق", phonetic: "q" },
  { id: 22, name: "Kāf", isolated: "ك", initial: "كـ", medial: "ـكـ", final: "ـك", phonetic: "k" },
  { id: 23, name: "Lām", isolated: "ل", initial: "لـ", medial: "ـلـ", final: "ـل", phonetic: "l" },
  { id: 24, name: "Mīm", isolated: "م", initial: "مـ", medial: "ـمـ", final: "ـم", phonetic: "m" },
  { id: 25, name: "Nūn", isolated: "ن", initial: "نـ", medial: "ـنـ", final: "ـن", phonetic: "n" },
  { id: 26, name: "Hā'", isolated: "ه", initial: "هـ", medial: "ـهـ", final: "ـه", phonetic: "h" },
  { id: 27, name: "Wāw", isolated: "و", initial: "و", medial: "ـو", final: "ـو", phonetic: "w / ou / ô" },
  { id: 28, name: "Yā'", isolated: "ي", initial: "يـ", medial: "ـيـ", final: "ـي", phonetic: "y / i / î" },
];

// Vocabulaire (200 mots) avec harakat - "j" au lieu de "dj"
export interface VocabularyWord {
  id: number;
  arabic: string;
  phonetic: string;
  french: string;
  category: string;
  isVerb?: boolean;
  premium?: boolean;
}

export const vocabularyWords: VocabularyWord[] = [
  // Animaux
  { id: 1, arabic: "كَلْب", phonetic: "kalb", french: "chien", category: "animaux" },
  { id: 2, arabic: "قِطَّة", phonetic: "qiṭṭah", french: "chat", category: "animaux" },
  { id: 3, arabic: "أَسَد", phonetic: "asad", french: "lion", category: "animaux" },
  { id: 4, arabic: "حِصَان", phonetic: "ḥiṣān", french: "cheval", category: "animaux" },
  { id: 5, arabic: "بَقَرَة", phonetic: "baqarah", french: "vache", category: "animaux" },
  { id: 6, arabic: "فِيل", phonetic: "fīl", french: "éléphant", category: "animaux" },
  { id: 7, arabic: "طَائِر", phonetic: "ṭā'ir", french: "oiseau", category: "animaux" },
  { id: 8, arabic: "سَمَكَة", phonetic: "samakah", french: "poisson", category: "animaux" },
  { id: 9, arabic: "خَرُوف", phonetic: "kharūf", french: "mouton", category: "animaux" },
  { id: 10, arabic: "دَجَاجَة", phonetic: "dajājah", french: "poule", category: "animaux" },
  { id: 11, arabic: "جَمَل", phonetic: "jamal", french: "chameau", category: "animaux" },
  { id: 12, arabic: "نَمِر", phonetic: "namir", french: "tigre", category: "animaux" },
  { id: 13, arabic: "ذِئْب", phonetic: "dhi'b", french: "loup", category: "animaux" },
  { id: 14, arabic: "أَرْنَب", phonetic: "arnab", french: "lapin", category: "animaux" },
  { id: 15, arabic: "دُبّ", phonetic: "dubb", french: "ours", category: "animaux" },
  // Couleurs
  { id: 16, arabic: "أَحْمَر", phonetic: "aḥmar", french: "rouge", category: "couleurs" },
  { id: 17, arabic: "أَزْرَق", phonetic: "azraq", french: "bleu", category: "couleurs" },
  { id: 18, arabic: "أَخْضَر", phonetic: "akhḍar", french: "vert", category: "couleurs" },
  { id: 19, arabic: "أَصْفَر", phonetic: "aṣfar", french: "jaune", category: "couleurs" },
  { id: 20, arabic: "أَسْوَد", phonetic: "aswad", french: "noir", category: "couleurs" },
  { id: 21, arabic: "أَبْيَض", phonetic: "abyaḍ", french: "blanc", category: "couleurs" },
  { id: 22, arabic: "بُرْتُقَالِيّ", phonetic: "burtuqāliyy", french: "orange", category: "couleurs" },
  { id: 23, arabic: "وَرْدِيّ", phonetic: "wardiyy", french: "rose", category: "couleurs" },
  { id: 24, arabic: "بُنِّيّ", phonetic: "bunniyy", french: "marron", category: "couleurs" },
  { id: 25, arabic: "رَمَادِيّ", phonetic: "ramādiyy", french: "gris", category: "couleurs" },
  // Nourriture
  { id: 26, arabic: "خُبْز", phonetic: "khubz", french: "pain", category: "nourriture" },
  { id: 27, arabic: "مَاء", phonetic: "mā'", french: "eau", category: "nourriture" },
  { id: 28, arabic: "حَلِيب", phonetic: "ḥalīb", french: "lait", category: "nourriture" },
  { id: 29, arabic: "لَحْم", phonetic: "laḥm", french: "viande", category: "nourriture" },
  { id: 30, arabic: "سَمَك", phonetic: "samak", french: "poisson", category: "nourriture" },
  { id: 31, arabic: "تُفَّاح", phonetic: "tuffāḥ", french: "pomme", category: "nourriture" },
  { id: 32, arabic: "مَوْز", phonetic: "mawz", french: "banane", category: "nourriture" },
  { id: 33, arabic: "أُرُزّ", phonetic: "uruzz", french: "riz", category: "nourriture" },
  { id: 34, arabic: "سُكَّر", phonetic: "sukkar", french: "sucre", category: "nourriture" },
  { id: 35, arabic: "مِلْح", phonetic: "milḥ", french: "sel", category: "nourriture" },
  { id: 36, arabic: "بَيْض", phonetic: "bayḍ", french: "œuf", category: "nourriture" },
  { id: 37, arabic: "جُبْن", phonetic: "jubn", french: "fromage", category: "nourriture" },
  { id: 38, arabic: "دَجَاج", phonetic: "dajāj", french: "poulet", category: "nourriture" },
  { id: 39, arabic: "شَاي", phonetic: "shāy", french: "thé", category: "nourriture" },
  { id: 40, arabic: "قَهْوَة", phonetic: "qahwah", french: "café", category: "nourriture" },
  // Famille
  { id: 41, arabic: "أَب", phonetic: "ab", french: "père", category: "famille" },
  { id: 42, arabic: "أُمّ", phonetic: "umm", french: "mère", category: "famille" },
  { id: 43, arabic: "أَخ", phonetic: "akh", french: "frère", category: "famille" },
  { id: 44, arabic: "أُخْت", phonetic: "ukht", french: "sœur", category: "famille" },
  { id: 45, arabic: "جَدّ", phonetic: "jadd", french: "grand-père", category: "famille" },
  { id: 46, arabic: "جَدَّة", phonetic: "jaddah", french: "grand-mère", category: "famille" },
  { id: 47, arabic: "اِبْن", phonetic: "ibn", french: "fils", category: "famille" },
  { id: 48, arabic: "بِنْت", phonetic: "bint", french: "fille", category: "famille" },
  { id: 49, arabic: "عَمّ", phonetic: "'amm", french: "oncle", category: "famille" },
  { id: 50, arabic: "عَمَّة", phonetic: "'ammah", french: "tante", category: "famille" },
  // Corps humain
  { id: 51, arabic: "رَأْس", phonetic: "ra's", french: "tête", category: "corps" },
  { id: 52, arabic: "عَيْن", phonetic: "'ayn", french: "œil", category: "corps" },
  { id: 53, arabic: "أَنْف", phonetic: "anf", french: "nez", category: "corps" },
  { id: 54, arabic: "فَم", phonetic: "fam", french: "bouche", category: "corps" },
  { id: 55, arabic: "يَد", phonetic: "yad", french: "main", category: "corps" },
  { id: 56, arabic: "قَدَم", phonetic: "qadam", french: "pied", category: "corps" },
  { id: 57, arabic: "قَلْب", phonetic: "qalb", french: "cœur", category: "corps" },
  { id: 58, arabic: "ذِرَاع", phonetic: "dhirā'", french: "bras", category: "corps" },
  { id: 59, arabic: "سَاق", phonetic: "sāq", french: "jambe", category: "corps" },
  { id: 60, arabic: "أُذُن", phonetic: "udhun", french: "oreille", category: "corps" },
  // Maison
  { id: 61, arabic: "بَيْت", phonetic: "bayt", french: "maison", category: "maison" },
  { id: 62, arabic: "بَاب", phonetic: "bāb", french: "porte", category: "maison" },
  { id: 63, arabic: "نَافِذَة", phonetic: "nāfidhah", french: "fenêtre", category: "maison" },
  { id: 64, arabic: "غُرْفَة", phonetic: "ghurfah", french: "chambre", category: "maison" },
  { id: 65, arabic: "مَطْبَخ", phonetic: "maṭbakh", french: "cuisine", category: "maison" },
  { id: 66, arabic: "حَمَّام", phonetic: "ḥammām", french: "salle de bain", category: "maison" },
  { id: 67, arabic: "كُرْسِيّ", phonetic: "kursiyy", french: "chaise", category: "maison" },
  { id: 68, arabic: "طَاوِلَة", phonetic: "ṭāwilah", french: "table", category: "maison" },
  { id: 69, arabic: "سَرِير", phonetic: "sarīr", french: "lit", category: "maison" },
  { id: 70, arabic: "سَقْف", phonetic: "saqf", french: "toit", category: "maison" },
  // Nature
  { id: 71, arabic: "شَمْس", phonetic: "shams", french: "soleil", category: "nature" },
  { id: 72, arabic: "قَمَر", phonetic: "qamar", french: "lune", category: "nature" },
  { id: 73, arabic: "نَجْم", phonetic: "najm", french: "étoile", category: "nature" },
  { id: 74, arabic: "مَاء", phonetic: "mā'", french: "eau", category: "nature" },
  { id: 75, arabic: "نَار", phonetic: "nār", french: "feu", category: "nature" },
  { id: 76, arabic: "شَجَر", phonetic: "shajar", french: "arbre", category: "nature" },
  { id: 77, arabic: "وَرْد", phonetic: "ward", french: "fleur", category: "nature" },
  { id: 78, arabic: "بَحْر", phonetic: "baḥr", french: "mer", category: "nature" },
  { id: 79, arabic: "جَبَل", phonetic: "jabal", french: "montagne", category: "nature" },
  { id: 80, arabic: "رِيح", phonetic: "rīḥ", french: "vent", category: "nature" },
  // Vêtements
  { id: 81, arabic: "قَمِيص", phonetic: "qamīṣ", french: "chemise", category: "vêtements" },
  { id: 82, arabic: "سِرْوَال", phonetic: "sirwāl", french: "pantalon", category: "vêtements" },
  { id: 83, arabic: "حِذَاء", phonetic: "ḥidhā'", french: "chaussure", category: "vêtements" },
  { id: 84, arabic: "قُبَّعَة", phonetic: "qubba'ah", french: "chapeau", category: "vêtements" },
  { id: 85, arabic: "فُسْتَان", phonetic: "fustān", french: "robe", category: "vêtements" },
  { id: 86, arabic: "مِعْطَف", phonetic: "mi'ṭaf", french: "manteau", category: "vêtements" },
  { id: 87, arabic: "جَوْرَب", phonetic: "jawrab", french: "chaussette", category: "vêtements" },
  { id: 88, arabic: "سُتْرَة", phonetic: "sutrah", french: "veste", category: "vêtements" },
  { id: 89, arabic: "حِزَام", phonetic: "ḥizām", french: "ceinture", category: "vêtements" },
  { id: 90, arabic: "تَنُّورَة", phonetic: "tannūrah", french: "jupe", category: "vêtements" },
  // Nombres
  { id: 91, arabic: "وَاحِد", phonetic: "wāḥid", french: "un", category: "nombres" },
  { id: 92, arabic: "اِثْنَان", phonetic: "ithnān", french: "deux", category: "nombres" },
  { id: 93, arabic: "ثَلَاثَة", phonetic: "thalāthah", french: "trois", category: "nombres" },
  { id: 94, arabic: "أَرْبَعَة", phonetic: "arba'ah", french: "quatre", category: "nombres" },
  { id: 95, arabic: "خَمْسَة", phonetic: "khamsah", french: "cinq", category: "nombres" },
  { id: 96, arabic: "سِتَّة", phonetic: "sittah", french: "six", category: "nombres" },
  { id: 97, arabic: "سَبْعَة", phonetic: "sab'ah", french: "sept", category: "nombres" },
  { id: 98, arabic: "ثَمَانِيَة", phonetic: "thamāniyah", french: "huit", category: "nombres" },
  { id: 99, arabic: "تِسْعَة", phonetic: "tis'ah", french: "neuf", category: "nombres" },
  { id: 100, arabic: "عَشَرَة", phonetic: "'asharah", french: "dix", category: "nombres" },
  // Temps
  { id: 101, arabic: "اَلْيَوْم", phonetic: "al-yawm", french: "aujourd'hui", category: "temps" },
  { id: 102, arabic: "غَدًا", phonetic: "ghadan", french: "demain", category: "temps" },
  { id: 103, arabic: "أَمْس", phonetic: "ams", french: "hier", category: "temps" },
  { id: 104, arabic: "اَلْآن", phonetic: "al-ān", french: "maintenant", category: "temps" },
  { id: 105, arabic: "صَبَاح", phonetic: "ṣabāḥ", french: "matin", category: "temps" },
  { id: 106, arabic: "مَسَاء", phonetic: "masā'", french: "soir", category: "temps" },
  { id: 107, arabic: "لَيْل", phonetic: "layl", french: "nuit", category: "temps" },
  // Verbes (isVerb = true → garder la voyelle finale)
  { id: 108, arabic: "ذَهَبَ", phonetic: "dhahaba", french: "aller", category: "verbes", isVerb: true },
  { id: 109, arabic: "أَكَلَ", phonetic: "akala", french: "manger", category: "verbes", isVerb: true },
  { id: 110, arabic: "شَرِبَ", phonetic: "shariba", french: "boire", category: "verbes", isVerb: true },
  { id: 111, arabic: "قَرَأَ", phonetic: "qara'a", french: "lire", category: "verbes", isVerb: true },
  { id: 112, arabic: "كَتَبَ", phonetic: "kataba", french: "écrire", category: "verbes", isVerb: true },
  { id: 113, arabic: "نَامَ", phonetic: "nāma", french: "dormir", category: "verbes", isVerb: true },
  { id: 114, arabic: "جَلَسَ", phonetic: "jalasa", french: "s'asseoir", category: "verbes", isVerb: true },
  { id: 115, arabic: "وَقَفَ", phonetic: "waqafa", french: "se lever", category: "verbes", isVerb: true },
  { id: 116, arabic: "فَتَحَ", phonetic: "fataḥa", french: "ouvrir", category: "verbes", isVerb: true },
  { id: 117, arabic: "أَغْلَقَ", phonetic: "aghlaqa", french: "fermer", category: "verbes", isVerb: true },
  { id: 118, arabic: "لَعِبَ", phonetic: "la'iba", french: "jouer", category: "verbes", isVerb: true },
  { id: 119, arabic: "عَمِلَ", phonetic: "'amila", french: "travailler", category: "verbes", isVerb: true },
  { id: 120, arabic: "رَأَى", phonetic: "ra'ā", french: "voir", category: "verbes", isVerb: true },
  // Adjectifs
  { id: 121, arabic: "كَبِير", phonetic: "kabīr", french: "grand", category: "adjectifs" },
  { id: 122, arabic: "صَغِير", phonetic: "ṣaghīr", french: "petit", category: "adjectifs" },
  { id: 123, arabic: "جَمِيل", phonetic: "jamīl", french: "beau", category: "adjectifs" },
  { id: 124, arabic: "قَبِيح", phonetic: "qabīḥ", french: "laid", category: "adjectifs" },
  { id: 125, arabic: "سَرِيع", phonetic: "sarī'", french: "rapide", category: "adjectifs" },
  { id: 126, arabic: "بَطِيء", phonetic: "baṭī'", french: "lent", category: "adjectifs" },
  { id: 127, arabic: "سَهْل", phonetic: "sahl", french: "facile", category: "adjectifs" },
  { id: 128, arabic: "صَعْب", phonetic: "ṣa'b", french: "difficile", category: "adjectifs" },
  { id: 129, arabic: "جَدِيد", phonetic: "jadīd", french: "nouveau", category: "adjectifs" },
  { id: 130, arabic: "قَدِيم", phonetic: "qadīm", french: "ancien", category: "adjectifs" },
  { id: 131, arabic: "قَوِيّ", phonetic: "qawiyy", french: "fort", category: "adjectifs" },
  { id: 132, arabic: "ضَعِيف", phonetic: "ḍa'īf", french: "faible", category: "adjectifs" },
  // Lieux
  { id: 133, arabic: "مَدْرَسَة", phonetic: "madrasah", french: "école", category: "lieux" },
  { id: 134, arabic: "مَسْجِد", phonetic: "masjid", french: "mosquée", category: "lieux" },
  { id: 135, arabic: "سُوق", phonetic: "sūq", french: "marché", category: "lieux" },
  { id: 136, arabic: "شَارِع", phonetic: "shāri'", french: "rue", category: "lieux" },
  { id: 137, arabic: "مَدِينَة", phonetic: "madīnah", french: "ville", category: "lieux" },
  { id: 138, arabic: "قَرْيَة", phonetic: "qaryah", french: "village", category: "lieux" },
  { id: 139, arabic: "مُسْتَشْفَى", phonetic: "mustashfā", french: "hôpital", category: "lieux" },
  { id: 140, arabic: "مَطْعَم", phonetic: "maṭ'am", french: "restaurant", category: "lieux" },
  { id: 141, arabic: "مَطَار", phonetic: "maṭār", french: "aéroport", category: "lieux" },
  { id: 142, arabic: "حَدِيقَة", phonetic: "ḥadīqah", french: "parc", category: "lieux" },
  // Professions
  { id: 143, arabic: "طَبِيب", phonetic: "ṭabīb", french: "médecin", category: "professions" },
  { id: 144, arabic: "مُعَلِّم", phonetic: "mu'allim", french: "professeur", category: "professions" },
  { id: 145, arabic: "شُرْطِيّ", phonetic: "shurṭiyy", french: "policier", category: "professions" },
  { id: 146, arabic: "مُهَنْدِس", phonetic: "muhandis", french: "ingénieur", category: "professions" },
  { id: 147, arabic: "سَائِق", phonetic: "sā'iq", french: "chauffeur", category: "professions" },
  { id: 148, arabic: "فَلَّاح", phonetic: "fallāḥ", french: "agriculteur", category: "professions" },
  { id: 149, arabic: "طَبَّاخ", phonetic: "ṭabbākh", french: "cuisinier", category: "professions" },
  { id: 150, arabic: "مُحَامِي", phonetic: "muḥāmī", french: "avocat", category: "professions" },
  // Objets
  { id: 151, arabic: "كِتَاب", phonetic: "kitāb", french: "livre", category: "objets" },
  { id: 152, arabic: "قَلَم", phonetic: "qalam", french: "stylo", category: "objets" },
  { id: 153, arabic: "هَاتِف", phonetic: "hātif", french: "téléphone", category: "objets" },
  { id: 154, arabic: "سَيَّارَة", phonetic: "sayyārah", french: "voiture", category: "objets" },
  { id: 155, arabic: "سَاعَة", phonetic: "sā'ah", french: "montre", category: "objets" },
  { id: 156, arabic: "مِفْتَاح", phonetic: "miftāḥ", french: "clé", category: "objets" },
  { id: 157, arabic: "حَقِيبَة", phonetic: "ḥaqībah", french: "sac", category: "objets" },
  { id: 158, arabic: "صُورَة", phonetic: "ṣūrah", french: "photo", category: "objets" },
  { id: 159, arabic: "مِرْآة", phonetic: "mir'āh", french: "miroir", category: "objets" },
  { id: 160, arabic: "شَاشَة", phonetic: "shāshah", french: "écran", category: "objets" },
  // Expressions & salutations
  { id: 161, arabic: "مَرْحَبًا", phonetic: "marḥaban", french: "bonjour", category: "expressions" },
  { id: 162, arabic: "شُكْرًا", phonetic: "shukran", french: "merci", category: "expressions" },
  { id: 163, arabic: "مَعَ السَّلَامَة", phonetic: "ma'a as-salāmah", french: "au revoir", category: "expressions" },
  { id: 164, arabic: "نَعَم", phonetic: "na'am", french: "oui", category: "expressions" },
  { id: 165, arabic: "لَا", phonetic: "lā", french: "non", category: "expressions" },
  { id: 166, arabic: "مِن فَضْلِك", phonetic: "min faḍlik", french: "s'il vous plaît", category: "expressions" },
  { id: 167, arabic: "عَفْوًا", phonetic: "'afwan", french: "pardon", category: "expressions" },
  { id: 168, arabic: "كَيْفَ حَالُك", phonetic: "kayfa ḥāluk", french: "comment vas-tu", category: "expressions" },
  { id: 169, arabic: "اِسْمِي", phonetic: "ismī", french: "je m'appelle", category: "expressions" },
  { id: 170, arabic: "صَبَاح الخَيْر", phonetic: "ṣabāḥ al-khayr", french: "bonjour (matin)", category: "expressions" },
  // Transport
  { id: 171, arabic: "طَائِرَة", phonetic: "ṭā'irah", french: "avion", category: "transport" },
  { id: 172, arabic: "قِطَار", phonetic: "qiṭār", french: "train", category: "transport" },
  { id: 173, arabic: "حَافِلَة", phonetic: "ḥāfilah", french: "bus", category: "transport" },
  { id: 174, arabic: "دَرَّاجَة", phonetic: "darrājah", french: "vélo", category: "transport" },
  { id: 175, arabic: "سَفِينَة", phonetic: "safīnah", french: "bateau", category: "transport" },
  // Météo
  { id: 176, arabic: "مَطَر", phonetic: "maṭar", french: "pluie", category: "météo" },
  { id: 177, arabic: "ثَلْج", phonetic: "thalj", french: "neige", category: "météo" },
  { id: 178, arabic: "سَحَاب", phonetic: "saḥāb", french: "nuage", category: "météo" },
  { id: 179, arabic: "حَرّ", phonetic: "ḥarr", french: "chaud", category: "météo" },
  { id: 180, arabic: "بَرْد", phonetic: "bard", french: "froid", category: "météo" },
  // Émotions
  { id: 181, arabic: "سَعِيد", phonetic: "sa'īd", french: "heureux", category: "émotions" },
  { id: 182, arabic: "حَزِين", phonetic: "ḥazīn", french: "triste", category: "émotions" },
  { id: 183, arabic: "غَاضِب", phonetic: "ghāḍib", french: "en colère", category: "émotions" },
  { id: 184, arabic: "خَائِف", phonetic: "khā'if", french: "effrayé", category: "émotions" },
  { id: 185, arabic: "مُتْعَب", phonetic: "mut'ab", french: "fatigué", category: "émotions" },
  // Autres verbes
  { id: 186, arabic: "سَمِعَ", phonetic: "sami'a", french: "entendre", category: "verbes", isVerb: true },
  { id: 187, arabic: "تَكَلَّمَ", phonetic: "takallama", french: "parler", category: "verbes", isVerb: true },
  { id: 188, arabic: "سَأَلَ", phonetic: "sa'ala", french: "demander", category: "verbes", isVerb: true },
  { id: 189, arabic: "أَجَابَ", phonetic: "ajāba", french: "répondre", category: "verbes", isVerb: true },
  { id: 190, arabic: "دَخَلَ", phonetic: "dakhala", french: "entrer", category: "verbes", isVerb: true },
  { id: 191, arabic: "خَرَجَ", phonetic: "kharaja", french: "sortir", category: "verbes", isVerb: true },
  { id: 192, arabic: "رَجَعَ", phonetic: "raja'a", french: "revenir", category: "verbes", isVerb: true },
  { id: 193, arabic: "أَخَذَ", phonetic: "akhadha", french: "prendre", category: "verbes", isVerb: true },
  { id: 194, arabic: "أَعْطَى", phonetic: "a'ṭā", french: "donner", category: "verbes", isVerb: true },
  { id: 195, arabic: "وَجَدَ", phonetic: "wajada", french: "trouver", category: "verbes", isVerb: true },
  // Divers
  { id: 196, arabic: "صَدِيق", phonetic: "ṣadīq", french: "ami", category: "divers" },
  { id: 197, arabic: "حُبّ", phonetic: "ḥubb", french: "amour", category: "divers" },
  { id: 198, arabic: "حَيَاة", phonetic: "ḥayāh", french: "vie", category: "divers" },
  { id: 199, arabic: "مَوْت", phonetic: "mawt", french: "mort", category: "divers" },
  { id: 200, arabic: "سَلَام", phonetic: "salām", french: "paix", category: "divers" },
];

// Helper functions
export const getWordsByCategory = (category: string): VocabularyWord[] =>
  vocabularyWords.filter((w) => w.category === category);

export const getCategories = (): string[] =>
  [...new Set(vocabularyWords.map((w) => w.category))];

// Catégories de vocabulaire avec icônes
export const vocabularyCategories = [
  { id: "animaux", name: "Animaux", icon: "🐾" },
  { id: "couleurs", name: "Couleurs", icon: "🎨" },
  { id: "nourriture", name: "Nourriture", icon: "🍽️" },
  { id: "famille", name: "Famille", icon: "👨‍👩‍👧" },
  { id: "corps", name: "Corps", icon: "🫀" },
  { id: "maison", name: "Maison", icon: "🏠" },
  { id: "nature", name: "Nature", icon: "🌳" },
  { id: "vêtements", name: "Vêtements", icon: "👕" },
  { id: "nombres", name: "Nombres", icon: "🔢" },
  { id: "temps", name: "Temps", icon: "⏰" },
  { id: "verbes", name: "Verbes", icon: "🏃" },
  { id: "adjectifs", name: "Adjectifs", icon: "✨" },
  { id: "lieux", name: "Lieux", icon: "📍" },
  { id: "professions", name: "Professions", icon: "💼" },
  { id: "objets", name: "Objets", icon: "📦" },
  { id: "expressions", name: "Expressions", icon: "💬" },
  { id: "transport", name: "Transport", icon: "🚗" },
  { id: "météo", name: "Météo", icon: "🌤️" },
  { id: "émotions", name: "Émotions", icon: "😊" },
  { id: "divers", name: "Divers", icon: "📚" },
];

// Email du créateur
export const CREATOR_EMAIL = "creator@arabfacile.com";

export const getRandomWord = (excludeIds: number[] = []): VocabularyWord => {
  const available = vocabularyWords.filter((w) => !excludeIds.includes(w.id));
  return available[Math.floor(Math.random() * available.length)];
};

// Système de "Mot du Jour" basé sur l'année et le jour courant
export const getWordOfTheDay = (): VocabularyWord => {
  const now = new Date();
  const start = new Date(now.getFullYear(), 0, 0);
  const diff = now.getTime() - start.getTime();
  const oneDay = 1000 * 60 * 60 * 24;
  const dayOfYear = Math.floor(diff / oneDay);
  
  // Rotation sur l'ensemble du vocabulaire
  const index = dayOfYear % vocabularyWords.length;
  return vocabularyWords[index];
};

// Système de saison mensuelle
export const getCurrentSeasonMonth = (): { name: string; days: number } => {
  const now = new Date();
  const months = [
    "Janvier", "Février", "Mars", "Avril", "Mai", "Juin",
    "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre"
  ];
  const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
  return { name: months[now.getMonth()], days: daysInMonth };
};

export const getCurrentDayInMonth = (): number => new Date().getDate();
export const getDaysRemainingInMonth = (): number => {
  const now = new Date();
  const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
  return daysInMonth - now.getDate();
};
