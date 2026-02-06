import { useCallback, useRef } from 'react';
import { toTtsTextWithOptions, type TtsOptions } from '@/lib/arabicTts';
import { supabase } from '@/integrations/supabase/client';

// Génère une clé unique pour l'audio basée sur le texte arabe
const getAudioKey = (text: string): string => {
  // Nettoyer le texte pour créer une clé de fichier valide
  const cleanText = text.replace(/[^\u0600-\u06FF]/g, ''); // Garder uniquement l'arabe
  // Utiliser un hash simple basé sur le texte complet
  const hash = Array.from(text).reduce((acc, char) => {
    return ((acc << 5) - acc) + char.charCodeAt(0);
  }, 0);
  return `${cleanText.slice(0, 10)}_${Math.abs(hash)}.mp3`;
};

export const useElevenLabsSpeech = () => {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const isLoadingRef = useRef(false);
  const audioCacheRef = useRef<Map<string, string>>(new Map());

  const speak = useCallback(async (text: string, options: TtsOptions = {}) => {
    // Si c'est un verbe, on veut conserver la voyelle finale
    const ttsText = toTtsTextWithOptions(text, { 
      ...options, 
      mode: options.isVerb ? 'normalized' : (options.mode ?? 'safe'),
      isVerb: options.isVerb 
    });

    // Éviter les appels multiples
    if (isLoadingRef.current) return;
    
    // Arrêter l'audio en cours
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }

    isLoadingRef.current = true;
    const audioKey = getAudioKey(ttsText);

    try {
      // 1. Vérifier le cache mémoire
      if (audioCacheRef.current.has(audioKey)) {
        const cachedUrl = audioCacheRef.current.get(audioKey)!;
        audioRef.current = new Audio(cachedUrl);
        audioRef.current.volume = 0.9;
        await audioRef.current.play();
        isLoadingRef.current = false;
        return;
      }

      // 2. Vérifier dans Supabase Storage
      const { data: storageData } = supabase.storage
        .from('arabic-audio')
        .getPublicUrl(audioKey);

      // Tester si le fichier existe vraiment (avec fetch HEAD)
      const headResponse = await fetch(storageData.publicUrl, { method: 'HEAD' });
      
      if (headResponse.ok) {
        // Le fichier existe dans storage, l'utiliser
        audioCacheRef.current.set(audioKey, storageData.publicUrl);
        audioRef.current = new Audio(storageData.publicUrl);
        audioRef.current.volume = 0.9;
        await audioRef.current.play();
        isLoadingRef.current = false;
        return;
      }

      // 3. Fallback: générer via Azure TTS (temps réel)
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/azure-tts`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
            Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
          },
          body: JSON.stringify({ text: ttsText, ssmlMode: 'safe' }),
        }
      );

      if (!response.ok) {
        throw new Error(`TTS request failed: ${response.status}`);
      }

      const audioBlob = await response.blob();
      const audioUrl = URL.createObjectURL(audioBlob);
      
      audioRef.current = new Audio(audioUrl);
      audioRef.current.volume = 0.9;
      
      audioRef.current.onended = () => {
        URL.revokeObjectURL(audioUrl);
        audioRef.current = null;
      };
      
      await audioRef.current.play();
    } catch (error) {
      console.error("TTS error:", error);
      // Fallback vers la synthèse vocale native
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(ttsText);
        utterance.lang = 'ar-SA';
        utterance.rate = 0.8;
        window.speechSynthesis.speak(utterance);
      }
    } finally {
      isLoadingRef.current = false;
    }
  }, []);

  const stop = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
  }, []);

  return { speak, stop };
};
