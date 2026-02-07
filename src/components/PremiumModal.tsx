import React, { useState } from "react";
import { loadStripe } from "@stripe/stripe-js";
import { Button } from "@/components/ui/button";

interface PremiumModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PremiumModal: React.FC<PremiumModalProps> = ({ isOpen, onClose }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubscribe = async () => {
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/create-checkout-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ priceId: "premium_monthly" }),
      });

      if (!res.ok) {
        throw new Error(`Échec création session: ${res.status}`);
      }

      const data = await res.json();
      const sessionId = data.sessionId;

      const stripeKey = import.meta.env.VITE_STRIPE_PK as string | undefined;
      if (!stripeKey) throw new Error("VITE_STRIPE_PK non configurée");

      const stripe = await loadStripe(stripeKey);
      if (!stripe) throw new Error("Impossible d'initialiser Stripe");

      await stripe.redirectToCheckout({ sessionId });
    } catch (err: any) {
      console.error(err);
      setError(err?.message || "Erreur lors de la création du paiement");
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/60" onClick={onClose} />
      <div className="relative z-10 w-full max-w-md p-6 bg-card rounded-xl">
        <h3 className="text-2xl font-bold mb-2">Abonnement Premium</h3>
        <p className="text-sm text-muted-foreground mb-4">Accède à des fonctionnalités premium et supprime les limitations.</p>

        <div className="mb-4">
          <div className="flex items-baseline justify-between">
            <div>
              <div className="text-lg font-semibold">Premium Mensuel</div>
              <div className="text-sm text-muted-foreground">Accès illimité, nouvelle banque de mots</div>
            </div>
            <div className="text-2xl font-bold">€4.99</div>
          </div>
        </div>

        {error && <div className="text-sm text-red-400 mb-3">{error}</div>}

        <div className="flex gap-3">
          <Button className="flex-1" onClick={handleSubscribe} disabled={loading}>
            {loading ? "Redirection…" : "S'abonner"}
          </Button>
          <Button variant="ghost" onClick={onClose} disabled={loading}>
            Annuler
          </Button>
        </div>
      </div>
    </div>
  );
};

export default PremiumModal;
