import { useState } from "react";
import { Check, X, RefreshCw, Play, Volume2, Loader2, Bug } from "lucide-react";
import type { AudioItem } from "./types";
import { AudioDebugDialog } from "./AudioDebugDialog";

interface AudioItemCardProps {
  item: AudioItem;
  onGenerate: () => void;
  onPlay: () => void;
}

export function AudioItemCard({ item, onGenerate, onPlay }: AudioItemCardProps) {
  const [debugOpen, setDebugOpen] = useState(false);

  return (
    <div
      className={`p-3 rounded-lg border transition-all ${
        item.exists
          ? "bg-primary/10 border-primary/30"
          : item.error
            ? "bg-destructive/10 border-destructive/30"
            : "bg-muted border-border"
      }`}
    >
      <p className="font-arabic text-2xl text-center mb-2" dir="rtl">
        {item.arabic}
      </p>

      <div className="flex justify-center gap-2 items-center">
        {item.generating ? (
          <Loader2 className="w-4 h-4 animate-spin text-primary" />
        ) : item.exists ? (
          <>
            <Check className="w-4 h-4 text-primary" />
            <button onClick={onPlay} aria-label="Lire l'audio">
              <Play className="w-4 h-4 text-primary hover:text-primary/80" />
            </button>
            <button onClick={onGenerate} aria-label="Régénérer (overwrite)">
              <RefreshCw className="w-4 h-4 text-muted-foreground hover:text-foreground" />
            </button>
          </>
        ) : item.error ? (
          <>
            <X className="w-4 h-4 text-destructive" />
            <button onClick={onGenerate} aria-label="Relancer la génération">
              <RefreshCw className="w-4 h-4 text-muted-foreground hover:text-foreground" />
            </button>
          </>
        ) : (
          <button onClick={onGenerate} aria-label="Générer l'audio">
            <Volume2 className="w-4 h-4 text-muted-foreground hover:text-primary" />
          </button>
        )}

        {(item.debug || item.publicUrl) && (
          <button onClick={() => setDebugOpen(true)} aria-label="Ouvrir le debug">
            <Bug className="w-4 h-4 text-muted-foreground hover:text-foreground" />
          </button>
        )}
      </div>

      <AudioDebugDialog open={debugOpen} onOpenChange={setDebugOpen} item={item} onRegenerate={onGenerate} />
    </div>
  );
}
