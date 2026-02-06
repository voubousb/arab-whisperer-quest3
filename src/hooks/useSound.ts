import { useRef, useCallback } from 'react';

// Sons d'interface
const CLICK_SOUND = 'https://assets.mixkit.co/active_storage/sfx/2568/2568-preview.mp3';
const SUCCESS_SOUND = 'https://assets.mixkit.co/active_storage/sfx/1435/1435-preview.mp3';
const ERROR_SOUND = 'https://assets.mixkit.co/active_storage/sfx/2955/2955-preview.mp3';
const TROPHY_SOUND = 'https://assets.mixkit.co/active_storage/sfx/2019/2019-preview.mp3';

type SoundType = 'click' | 'success' | 'error' | 'trophy';

const soundUrls: Record<SoundType, string> = {
  click: CLICK_SOUND,
  success: SUCCESS_SOUND,
  error: ERROR_SOUND,
  trophy: TROPHY_SOUND,
};

export const useSound = () => {
  const audioCache = useRef<Map<string, HTMLAudioElement>>(new Map());

  const playSound = useCallback((type: SoundType, volume = 0.3) => {
    const url = soundUrls[type];
    
    let audio = audioCache.current.get(url);
    
    if (!audio) {
      audio = new Audio(url);
      audioCache.current.set(url, audio);
    }
    
    audio.currentTime = 0;
    audio.volume = volume;
    audio.play().catch(() => {
      // Silently fail if autoplay is blocked
    });
  }, []);

  const playClick = useCallback(() => playSound('click', 0.2), [playSound]);
  const playSuccess = useCallback(() => playSound('success', 0.4), [playSound]);
  const playError = useCallback(() => playSound('error', 0.3), [playSound]);
  const playTrophy = useCallback(() => playSound('trophy', 0.5), [playSound]);

  return {
    playSound,
    playClick,
    playSuccess,
    playError,
    playTrophy,
  };
};

// Hook pour la synthèse vocale arabe
export const useArabicSpeech = () => {
  const speak = useCallback((text: string, rate = 0.8) => {
    if ('speechSynthesis' in window) {
      // Annuler toute parole en cours
      window.speechSynthesis.cancel();
      
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'ar-SA'; // Arabe (Arabie Saoudite)
      utterance.rate = rate;
      utterance.pitch = 1;
      utterance.volume = 1;
      
      // Essayer de trouver une voix arabe
      const voices = window.speechSynthesis.getVoices();
      const arabicVoice = voices.find(voice => 
        voice.lang.startsWith('ar') || voice.name.includes('Arabic')
      );
      
      if (arabicVoice) {
        utterance.voice = arabicVoice;
      }
      
      window.speechSynthesis.speak(utterance);
    }
  }, []);

  return { speak };
};
