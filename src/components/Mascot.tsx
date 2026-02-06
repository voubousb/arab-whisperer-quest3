import { motion } from "framer-motion";
import mascotImage from "@/assets/mascot-hero.png";

interface MascotProps {
  className?: string;
  size?: "sm" | "md" | "lg";
}

export const Mascot = ({ className = "", size = "md" }: MascotProps) => {
  const sizes = {
    sm: "w-24 h-24",
    md: "w-40 h-40",
    lg: "w-64 h-64",
  };

  return (
    <motion.div
      className={`${sizes[size]} ${className} relative`}
      animate={{ y: [0, -10, 0] }}
      transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
    >
      <motion.img
        src={mascotImage}
        alt="Arab.facile mascotte"
        className="w-full h-full object-contain drop-shadow-2xl"
        animate={{ 
          filter: [
            "drop-shadow(0 0 20px hsl(45 100% 50% / 0.3))",
            "drop-shadow(0 0 40px hsl(45 100% 50% / 0.6))",
            "drop-shadow(0 0 20px hsl(45 100% 50% / 0.3))"
          ]
        }}
        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
      />
      
      {/* Particules décoratives */}
      <motion.div
        className="absolute -top-2 -right-2 w-3 h-3 rounded-full bg-primary"
        animate={{ 
          scale: [1, 1.5, 1],
          opacity: [0.5, 1, 0.5]
        }}
        transition={{ duration: 2, repeat: Infinity }}
      />
      <motion.div
        className="absolute -bottom-1 -left-1 w-2 h-2 rounded-full bg-secondary"
        animate={{ 
          scale: [1, 1.3, 1],
          opacity: [0.5, 1, 0.5]
        }}
        transition={{ duration: 1.5, repeat: Infinity, delay: 0.5 }}
      />
      <motion.div
        className="absolute top-1/2 -right-4 w-2 h-2 rounded-full bg-primary"
        animate={{ 
          scale: [1, 1.4, 1],
          opacity: [0.3, 0.8, 0.3]
        }}
        transition={{ duration: 2.5, repeat: Infinity, delay: 1 }}
      />
    </motion.div>
  );
};
