import { motion } from "framer-motion";

interface RankBadgeProps {
  rankName: string;
  size?: "sm" | "md" | "lg";
}

// Composant pour afficher les badges de rang visuellement
export const RankBadge = ({ rankName, size = "md" }: RankBadgeProps) => {
  const sizes = {
    sm: "w-6 h-6",
    md: "w-10 h-10",
    lg: "w-14 h-14",
  };

  const getRankVisual = () => {
    // Bronze - Barres marron
    if (rankName.includes("Bronze")) {
      const level = rankName.includes("III") ? 3 : rankName.includes("II") ? 2 : 1;
      return (
        <div className="flex gap-0.5 items-end justify-center h-full">
          {[...Array(level)].map((_, i) => (
            <motion.div
              key={i}
              initial={{ scaleY: 0 }}
              animate={{ scaleY: 1 }}
              transition={{ delay: i * 0.1 }}
              className="w-2 bg-gradient-to-t from-amber-800 to-amber-600 rounded-t-sm"
              style={{ height: `${60 + i * 15}%` }}
            />
          ))}
        </div>
      );
    }

    // Argent - Barres argentées
    if (rankName.includes("Argent")) {
      const level = rankName.includes("III") ? 3 : rankName.includes("II") ? 2 : 1;
      return (
        <div className="flex gap-0.5 items-end justify-center h-full">
          {[...Array(level)].map((_, i) => (
            <motion.div
              key={i}
              initial={{ scaleY: 0 }}
              animate={{ scaleY: 1 }}
              transition={{ delay: i * 0.1 }}
              className="w-2 bg-gradient-to-t from-slate-500 to-slate-300 rounded-t-sm"
              style={{ height: `${60 + i * 15}%` }}
            />
          ))}
        </div>
      );
    }

    // Or - Barres dorées avec éclat
    if (rankName.includes("Or")) {
      const level = rankName.includes("III") ? 3 : rankName.includes("II") ? 2 : 1;
      return (
        <div className="flex gap-0.5 items-end justify-center h-full relative">
          {[...Array(level)].map((_, i) => (
            <motion.div
              key={i}
              initial={{ scaleY: 0 }}
              animate={{ scaleY: 1 }}
              transition={{ delay: i * 0.1 }}
              className="w-2 bg-gradient-to-t from-yellow-600 to-yellow-400 rounded-t-sm shadow-lg"
              style={{ 
                height: `${60 + i * 15}%`,
                boxShadow: "0 0 10px rgba(234, 179, 8, 0.5)"
              }}
            />
          ))}
        </div>
      );
    }

    // Diamant - Cristaux
    if (rankName.includes("Diamant")) {
      const level = rankName.includes("III") ? 3 : rankName.includes("II") ? 2 : 1;
      return (
        <div className="flex gap-1 items-center justify-center h-full">
          {[...Array(level)].map((_, i) => (
            <motion.div
              key={i}
              initial={{ scale: 0, rotate: -45 }}
              animate={{ scale: 1, rotate: 45 }}
              transition={{ delay: i * 0.1, type: "spring" }}
              className="w-3 h-3 bg-gradient-to-br from-cyan-300 to-cyan-500 shadow-lg"
              style={{ 
                clipPath: "polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)",
                boxShadow: "0 0 15px rgba(6, 182, 212, 0.6)"
              }}
            />
          ))}
        </div>
      );
    }

    // Maître - Couronne
    if (rankName === "Maître") {
      return (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="flex items-center justify-center h-full"
        >
          <div className="relative">
            <div className="text-2xl">👑</div>
            <motion.div
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="absolute inset-0 blur-sm text-2xl"
            >
              👑
            </motion.div>
          </div>
        </motion.div>
      );
    }

    // Grand Maître - Trophée brillant
    if (rankName === "Grand Maître") {
      return (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="flex items-center justify-center h-full"
        >
          <div className="relative">
            <div className="text-2xl">🏆</div>
            <motion.div
              animate={{ 
                opacity: [0.3, 0.8, 0.3],
                scale: [1, 1.2, 1]
              }}
              transition={{ duration: 1.5, repeat: Infinity }}
              className="absolute inset-0 blur-md text-2xl"
            >
              🏆
            </motion.div>
          </div>
        </motion.div>
      );
    }

    // Légende - Étoile arc-en-ciel
    if (rankName === "Légende") {
      return (
        <motion.div
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: "spring" }}
          className="flex items-center justify-center h-full"
        >
          <div className="relative">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
              className="text-3xl"
              style={{
                background: "linear-gradient(135deg, #ff6b6b, #feca57, #48dbfb, #ff9ff3)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                filter: "drop-shadow(0 0 10px rgba(255,107,107,0.5))"
              }}
            >
              ⭐
            </motion.div>
          </div>
        </motion.div>
      );
    }

    return <span className="text-xl">🎖️</span>;
  };

  return (
    <div className={`${sizes[size]} flex items-center justify-center`}>
      {getRankVisual()}
    </div>
  );
};
