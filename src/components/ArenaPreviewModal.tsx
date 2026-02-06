import { motion, AnimatePresence } from "framer-motion";
import { X, ArrowLeft } from "lucide-react";
import { Arena } from "@/data/arenas";
import { Button } from "@/components/ui/button";

interface ArenaPreviewModalProps {
  arena: Arena | null;
  onClose: () => void;
}

export const ArenaPreviewModal = ({ arena, onClose }: ArenaPreviewModalProps) => {
  if (!arena) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.8, opacity: 0 }}
          className="relative max-w-4xl w-full"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Bouton retour en haut */}
          <div className="absolute -top-14 left-0 right-0 flex justify-between items-center">
            <Button
              variant="ghost"
              onClick={onClose}
              className="text-white/80 hover:text-white hover:bg-white/10"
            >
              <ArrowLeft className="w-5 h-5 mr-2" />
              Retour
            </Button>
            <button
              onClick={onClose}
              className="text-white/80 hover:text-white p-2"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
          
          {/* Image de l'arène */}
          <div className="relative rounded-2xl overflow-hidden shadow-2xl">
            <img 
              src={arena.image} 
              alt={arena.name} 
              className="w-full h-auto"
            />
            
            {/* Overlay avec informations - titre plus haut */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent" />
            
            <div className="absolute top-6 left-0 right-0 text-center">
              <h2 className="text-4xl font-bold text-white mb-2 drop-shadow-lg">{arena.name}</h2>
              {arena.nameAr && (
                <p className="font-arabic text-3xl text-primary drop-shadow-lg" dir="rtl">
                  {arena.nameAr}
                </p>
              )}
            </div>
            
            <div className="absolute bottom-6 left-0 right-0 text-center">
              <p className="text-white/90 text-lg">
                {arena.isTraining 
                  ? "Mode Entraînement (pas de trophées)" 
                  : `${arena.minTrophies}${arena.maxTrophies === Infinity ? "+" : ` - ${arena.maxTrophies}`} trophées`
                }
              </p>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};
