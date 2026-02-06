import { useRef, useCallback, useEffect } from 'react';

// Sons optimisés pour le jeu
const SOUNDS = {
  click: 'https://assets.mixkit.co/active_storage/sfx/2568/2568-preview.mp3',
  success: 'https://assets.mixkit.co/active_storage/sfx/2000/2000-preview.mp3', // Son de victoire clair
  error: 'https://assets.mixkit.co/active_storage/sfx/2955/2955-preview.mp3',
  trophy: 'https://assets.mixkit.co/active_storage/sfx/2019/2019-preview.mp3',
  countdown: 'https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3', // Ting pour countdown
  gameOver: 'https://assets.mixkit.co/active_storage/sfx/2658/2658-preview.mp3', // Défaite
  correct: 'https://assets.mixkit.co/active_storage/sfx/2018/2018-preview.mp3', // Bonne réponse rapide
  matchFound: 'https://assets.mixkit.co/active_storage/sfx/2013/2013-preview.mp3', // Partie trouvée - fanfare courte
  // searching retiré - son du vent qui dure 55-60 secondes désactivé
  // welcome: 'https://assets.mixkit.co/active_storage/sfx/2017/2017-preview.mp3', // Son d'entrée sur le site - désactivé
};

type SoundType = keyof typeof SOUNDS;

// Flag pour éviter de jouer le son d'entrée plusieurs fois
let hasPlayedWelcome = false;

export const useGameSounds = () => {
  const audioCache = useRef<Map<string, HTMLAudioElement>>(new Map());

  const playSound = useCallback((type: SoundType, volume = 0.4) => {
    const url = SOUNDS[type];
    
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
  const playSuccess = useCallback(() => playSound('success', 0.5), [playSound]);
  const playError = useCallback(() => playSound('error', 0.3), [playSound]);
  const playTrophy = useCallback(() => playSound('trophy', 0.5), [playSound]);
  const playCountdown = useCallback(() => playSound('countdown', 0.6), [playSound]);
  const playGameOver = useCallback(() => playSound('gameOver', 0.4), [playSound]);
  const playCorrect = useCallback(() => playSound('correct', 0.5), [playSound]);
  const playMatchFound = useCallback(() => playSound('matchFound', 0.6), [playSound]);
  // playSearching et playWelcome retirés - sons automatiques désactivés
  // const playWelcome = useCallback(() => playSound('welcome', 0.5), [playSound]);
  
  // Fonction pour jouer le son d'entrée une seule fois - DÉSACTIVÉE
  // const playWelcomeOnce = useCallback(() => {
  //   if (!hasPlayedWelcome) {
  //     hasPlayedWelcome = true;
  //     playWelcome();
  //   }
  // }, [playWelcome]);

  return {
    playSound,
    playClick,
    playSuccess,
    playError,
    playTrophy,
    playCountdown,
    playGameOver,
    playCorrect,
    playMatchFound,
    // playSearching retiré - son du vent désactivé
    // playWelcome retiré - son automatique désactivé
    // playWelcomeOnce retiré - son automatique désactivé
  };
};
