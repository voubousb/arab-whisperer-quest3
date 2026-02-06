import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import type { AudioItem } from "./types";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  item: AudioItem;
  onRegenerate: () => void;
};

export function AudioDebugDialog({ open, onOpenChange, item, onRegenerate }: Props) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Debug TTS</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="rounded-lg border bg-muted p-3">
            <div className="text-sm text-muted-foreground">Unité</div>
            <div className="font-arabic text-2xl" dir="rtl">
              {item.arabic}
            </div>
          </div>

          {item.publicUrl && (
            <div className="space-y-2">
              <div className="text-sm font-medium">MP3</div>
              <a className="text-sm underline break-all" href={item.publicUrl} target="_blank" rel="noreferrer">
                {item.publicUrl}
              </a>
            </div>
          )}

          {item.debug ? (
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div className="rounded-md border bg-background p-2">
                  <div className="text-muted-foreground">voiceName</div>
                  <div className="font-mono break-all">{item.debug.voiceName}</div>
                </div>
                <div className="rounded-md border bg-background p-2">
                  <div className="text-muted-foreground">locale</div>
                  <div className="font-mono">{item.debug.locale}</div>
                </div>
                <div className="rounded-md border bg-background p-2">
                  <div className="text-muted-foreground">outputFormat</div>
                  <div className="font-mono break-all">{item.debug.outputFormat}</div>
                </div>
                <div className="rounded-md border bg-background p-2">
                  <div className="text-muted-foreground">ssmlMode</div>
                  <div className="font-mono">{item.debug.ssmlMode}</div>
                </div>
                <div className="rounded-md border bg-background p-2">
                  <div className="text-muted-foreground">rate</div>
                  <div className="font-mono">{item.debug.rate}</div>
                </div>
                <div className="rounded-md border bg-background p-2">
                  <div className="text-muted-foreground">pitch</div>
                  <div className="font-mono">{item.debug.pitch}</div>
                </div>
              </div>

              <div className="space-y-2">
                <div className="text-sm font-medium">textOriginal</div>
                <pre className="text-xs whitespace-pre-wrap rounded-md border bg-background p-3">
                  {item.debug.textOriginal}
                </pre>
              </div>

              <div className="space-y-2">
                <div className="text-sm font-medium">textSanitized</div>
                <pre className="text-xs whitespace-pre-wrap rounded-md border bg-background p-3">
                  {item.debug.textSanitized}
                </pre>
              </div>

              <div className="space-y-2">
                <div className="text-sm font-medium">SSML final envoyé</div>
                <pre className="text-xs whitespace-pre-wrap rounded-md border bg-background p-3 max-h-64 overflow-auto">
                  {item.debug.ssml}
                </pre>
              </div>
            </div>
          ) : (
            <div className="text-sm text-muted-foreground">
              Aucun payload debug reçu (relance une génération avec debug activé).
            </div>
          )}

          <div className="flex gap-2 justify-end">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Fermer
            </Button>
            <Button onClick={onRegenerate}>Regenerate same input</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
