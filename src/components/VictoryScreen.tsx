import { motion } from "framer-motion";
import { Trophy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useSound } from "@/hooks/useSound";
import victoryImage from "@/assets/victory-burst.jpg";
import defeatImage from "@/assets/defeat-fade.jpg";

interface VictoryScreenProps {
  won: boolean;
  playerScore: number;
  opponentScore: number;
  trophiesChange: number;
  totalTrophies: number;
  onPlayAgain: () => void;
  onBackToMenu: () => void;
}

export const VictoryScreen = ({
  won,
  playerScore,
  opponentScore,
  trophiesChange,
  totalTrophies,
  onPlayAgain,
  onBackToMenu,
}: VictoryScreenProps) => {
  const { playClick } = useSound();

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{
        backgroundImage: `url(${won ? victoryImage : defeatImage})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      {/* Overlay */}
      <div className={`absolute inset-0 ${won ? "bg-black/50" : "bg-black/70"}`} />
      
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.2, type: "spring" }}
        className="relative z-10 card-glass p-8 max-w-md w-full mx-4 text-center space-y-6"
      >
        {/* Titre */}
        <motion.h2
          initial={{ y: -20 }}
          animate={{ y: 0 }}
          className={`text-4xl font-bold ${won ? "text-secondary" : "text-accent"}`}
        >
          {won ? "Victoire !" : "Défaite"}
        </motion.h2>

        {/* Score */}
        <div className="flex items-center justify-center gap-8">
          <div className="text-center">
            <p className="text-sm text-muted-foreground">Toi</p>
            <p className={`text-5xl font-bold ${won ? "text-secondary" : "text-foreground"}`}>
              {playerScore}
            </p>
          </div>
          
          <div className="text-2xl text-muted-foreground">-</div>
          
          <div className="text-center">
            <p className="text-sm text-muted-foreground">Adversaire</p>
            <p className={`text-5xl font-bold ${!won ? "text-accent" : "text-foreground"}`}>
              {opponentScore}
            </p>
          </div>
        </div>

        {/* Trophées */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.4, type: "spring" }}
          className="space-y-2"
        >
          <div className="flex items-center justify-center gap-2">
            <Trophy className="w-6 h-6 text-primary" />
            <span className={`text-2xl font-bold ${trophiesChange >= 0 ? "text-secondary" : "text-accent"}`}>
              {trophiesChange >= 0 ? "+" : ""}{trophiesChange}
            </span>
          </div>
          
          <p className="text-muted-foreground">
            Total : <span className="font-bold text-primary">{totalTrophies}</span> trophées
          </p>
        </motion.div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center pt-4">
          <Button
            onClick={() => {
              playClick();
              onPlayAgain();
            }}
            className="btn-violet"
          >
            Rejouer
          </Button>
          <Button
            onClick={() => {
              playClick();
              onBackToMenu();
            }}
            variant="outline"
          >
            Retour au menu
          </Button>
        </div>
      </motion.div>
    </motion.div>
  );
};
