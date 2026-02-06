import { motion } from "framer-motion";
import { ReactNode } from "react";

interface MenuCardProps {
  title: string;
  description: string;
  icon: ReactNode;
  variant: "gold" | "emerald" | "coral";
  onClick: () => void;
  delay?: number;
}

export const MenuCard = ({ title, description, icon, variant, onClick, delay = 0 }: MenuCardProps) => {
  const variants = {
    gold: "btn-gold",
    emerald: "btn-emerald",
    coral: "btn-coral",
  };

  const glowVariants = {
    gold: "group-hover:shadow-[0_0_60px_20px_hsl(45_100%_50%/0.2)]",
    emerald: "group-hover:shadow-[0_0_60px_20px_hsl(160_60%_45%/0.2)]",
    coral: "group-hover:shadow-[0_0_60px_20px_hsl(350_80%_60%/0.2)]",
  };

  return (
    <motion.button
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.5, ease: "easeOut" }}
      whileHover={{ scale: 1.03 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className={`group relative w-full max-w-sm ${variants[variant]} flex flex-col items-center gap-4 py-8 transition-all duration-500 ${glowVariants[variant]}`}
    >
      {/* Icône animée */}
      <motion.div
        className="text-5xl"
        animate={{ y: [0, -5, 0] }}
        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
      >
        {icon}
      </motion.div>
      
      {/* Titre */}
      <h3 className="text-2xl font-bold">{title}</h3>
      
      {/* Description */}
      <p className="text-sm opacity-80 px-4">{description}</p>

      {/* Effet de brillance au hover */}
      <div className="absolute inset-0 rounded-xl overflow-hidden pointer-events-none">
        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
        </div>
      </div>
    </motion.button>
  );
};
