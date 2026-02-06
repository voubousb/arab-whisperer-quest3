// Helpers to improve Arabic Text-to-Speech reliability.
// Goals:
// - Always speak Arabic script (not phonetic Latin)
// - Force letter *names* when a single letter is provided
// - Improve end-of-word articulation (e.g., azraq -> أَزْرَقْ)
// - Ta marbouta (ة) at end of utterance -> soft "h" (هْ)

const SUKOON = "\u0652";
const SHADDA = "\u0651";

// Nettoyage non-destructif: on retire uniquement les caractères invisibles / de mise en forme.
// Important: on NE supprime PAS hamza/shadda/madd/harakat.
export function sanitizeArabic(input: string): string {
  return (input ?? "")
    .replace(/[\r\n\t]+/g, " ")
    // Tatweel
    .replace(/\u0640/g, "")
    // Zero-width + BOM
    .replace(/[\u200B-\u200D\uFEFF]/g, "")
    // Bidi marks / isolates
    .replace(/[\u200E\u200F\u202A-\u202E\u2066-\u2069]/g, "")
    // Normaliser espaces
    .replace(/\s+/g, " ")
    .trim();
}

// Arabic harakat + common diacritics
const DIACRITICS_RE = /[\u064B-\u0652\u0670]/;

// Basic Arabic letters block (hamza..ya)
const ARABIC_LETTER_RE = /[\u0621-\u064A]/;

// Prefer Arabic letter names with harakat (no tanwin).
// NOTE: For ج we force "dj" via دْجِيم to match the app's phonetic rule.
export const ARABIC_LETTER_NAME_BY_CHAR: Record<string, string> = {
  "ا": "أَلِف",
  "ب": "بَاء",
  "ت": "تَاء",
  "ث": "ثَاء",
  "ج": "جِيم",
  "ح": "حَاء",
  "خ": "خَاء",
  "د": "دَال",
  "ذ": "ذَال",
  // Azure prononce parfois "رَاء/فَاء" de manière bizarre (genre "raf/faak").
  // On privilégie ici la forme pédagogique courte.
  "ر": "رَا",
  "ز": "زَاي",
  "س": "سِين",
  "ش": "شِين",
  "ص": "صَاد",
  "ض": "ضَاد",
  "ط": "طَاء",
  "ظ": "ظَاء",
  "ع": "عَيْن",
  "غ": "غَيْن",
  "ف": "فَا",
  "ق": "قَاف",
  "ك": "كَاف",
  "ل": "لَام",
  "م": "مِيم",
  "ن": "نُون",
  "ه": "هَاء",
  "و": "وَاو",
  "ي": "يَاء",
 };

const isDiacritic = (ch: string) => DIACRITICS_RE.test(ch);
const isArabicLetter = (ch: string) => ARABIC_LETTER_RE.test(ch);

// Harakat qu'on veut retirer en fin de mot (sauf verbes)
const FINAL_SHORT_VOWELS_RE = /[\u064B-\u0650]/; // tanwin + fatha/damma/kasra

export type TtsOptions = {
  /** true => on conserve la voyelle finale (utile pour les verbes) */
  isVerb?: boolean;
  /** safe => on lit exactement l'arabe fourni; normalized => applique les règles de fermeture (sukoon/ة) */
  mode?: "safe" | "normalized";
};

// Letters where adding a final sukoon is usually not helpful.
const FINAL_SKIP_SUKOON = new Set([
  "ا",
  "و",
  "ي",
  "ى",
  "ء",
  "آ",
  "أ",
  "إ",
  "ؤ",
  "ئ",
 ]);

/**
 * Normalizes Arabic to make TTS pronounce endings more clearly.
 * - Converts final ta marbouta to هْ BUT keeps the vowel before it (fatha/kasra/damma)
 * - Adds a final sukoon when the last Arabic consonant has no haraka
 */
export function normalizeArabicForTTS(input: string, options: TtsOptions = {}): string {
  let text = sanitizeArabic(input);
  if (!text) return text;

  // 1) If the utterance ends with ta marbouta, force a soft "h" BUT KEEP the vowel before it
  // E.g., "عَشَرَة" → "عَشَرَهْ" (not "عَشَرْهْ")
  // We need to preserve the vowel on the letter before the ta marbouta
  text = text.replace(/ة(?=[^\u0621-\u064A]*$)/u, `ه${SUKOON}`);

  // 2) Add a final sukoon if the last Arabic letter lacks harakat.
  const chars = Array.from(text);

  // Find trailing suffix (spaces/punct/diacritics) so we can insert before it.
  let end = chars.length - 1;
  while (end >= 0 && !isArabicLetter(chars[end])) {
    end -= 1;
  }
  if (end < 0) return text;

  const lastLetterIdx = end;
  const lastLetter = chars[lastLetterIdx];

  // If last letter is هْ (from ta marbouta replacement), we're done - don't touch it
  // The replacement already added sukoon
  if (lastLetter === "ه" && lastLetterIdx + 1 < chars.length && chars[lastLetterIdx + 1] === SUKOON) {
    return chars.join("");
  }

  // If last letter is a long vowel/hamza form, do not force sukoon.
  if (FINAL_SKIP_SUKOON.has(lastLetter)) return text;

  // Collect diacritics right after the last letter (if any)
  let after = lastLetterIdx + 1;
  while (after < chars.length && isDiacritic(chars[after])) {
    after += 1;
  }

  const diacritics = chars.slice(lastLetterIdx + 1, after);
  const hasSukoon = diacritics.includes(SUKOON);

  // Noms/adjectifs: on veut *pas* de voyelle finale -> remplace (fatha/damma/kasra/tanwin) par sukoon.
  // MAIS si le mot contient ta marbouta, on ne touche pas à la lettre avant le ta marbouta
  // Verbes: on conserve la voyelle finale si elle est présente.
  if (!options.isVerb) {
    // Check if we just converted a ta marbouta (search for هْ pattern)
    const hasTaMarbouta = text.includes(`ه${SUKOON}`);
    
    if (hasTaMarbouta) {
      // Don't remove the vowel before the ta marbouta, it's already handled
      return chars.join("");
    }
    
    const kept = diacritics.filter((d) => !FINAL_SHORT_VOWELS_RE.test(d));
    chars.splice(lastLetterIdx + 1, diacritics.length, ...kept);

    const hasSukoonAfterKeep = kept.includes(SUKOON);
    if (!hasSukoonAfterKeep) {
      chars.splice(lastLetterIdx + 1 + kept.length, 0, SUKOON);
    }
    return chars.join("");
  }

  // Verbe: si pas de diacritique final, on ajoute un sukoon pour bien fermer.
  if (!hasSukoon && diacritics.length === 0) {
    chars.splice(lastLetterIdx + 1, 0, SUKOON);
  }
  return chars.join("");
}

/**
 * Returns the best text to send to TTS.
 * - If it's a single Arabic letter, speak the letter name (ألف، باء…)
 * - Otherwise, normalize Arabic for better endings
 */
export function toTtsText(input: string): string {
  return toTtsTextWithOptions(input, { mode: "safe" });
}

export function toTtsTextWithOptions(input: string, options: TtsOptions = {}): string {
  const mode = options.mode ?? "safe";
  const text = sanitizeArabic(input);
  if (!text) return text;
  if (text.length === 1 && ARABIC_LETTER_NAME_BY_CHAR[text]) {
    return ARABIC_LETTER_NAME_BY_CHAR[text];
  }

  if (mode === "safe") return text;
  return normalizeArabicForTTS(text, options);
}
