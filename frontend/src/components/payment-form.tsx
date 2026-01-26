import { useState } from "react";
import { useStripe, useElements, CardElement } from "@stripe/react-stripe-js";
import { StripeCardElementChangeEvent } from "@stripe/stripe-js";
import { Button } from "@/components/ui/button";
import { ShieldCheck, CreditCard, Lock, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface PaymentFormProps {
  onSuccess: (paymentMethodId: string) => Promise<void>;
  amount: number;
  isPending: boolean;
}

export function PaymentForm({
  onSuccess,
  amount,
  isPending,
}: PaymentFormProps) {
  const stripe = useStripe();
  const elements = useElements();
  const [isProcessing, setIsProcessing] = useState(false);
  const [cardComplete, setCardComplete] = useState(false);
  const [cardError, setCardError] = useState<string | null>(null);

  const handleCardChange = (event: StripeCardElementChangeEvent) => {
    setCardComplete(event.complete);
    setCardError(event.error ? event.error.message : null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements || !cardComplete) return;

    setIsProcessing(true);

    try {
      const cardElement = elements.getElement(CardElement);
      if (!cardElement) throw new Error("Card element not found");

      const { error, paymentMethod } = await stripe.createPaymentMethod({
        type: "card",
        card: cardElement,
      });

      if (error) {
        toast.error(error.message);
        return;
      }

      await onSuccess(paymentMethod.id);
    } catch (error: unknown) {
      const message =
        error instanceof Error
          ? error.message
          : "An error occurred during payment";
      toast.error(message);
    } finally {
      setIsProcessing(false);
    }
  };

  const isDisabled = !stripe || isProcessing || isPending || !cardComplete;

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-2">
        <label className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] ml-1">
          Secure Payment Details
        </label>
        <div
          className={cn(
            "p-4 bg-secondary/10 rounded-[1.5rem] border-2 transition-all duration-300",
            cardError
              ? "border-red-500/50 bg-red-500/5"
              : "border-border/50 focus-within:border-primary/50 focus-within:bg-secondary/20",
          )}
        >
          <CardElement
            onChange={handleCardChange}
            options={{
              hidePostalCode: true,
              style: {
                base: {
                  fontSize: "16px",
                  color: "#1a1a1a",
                  fontFamily: "var(--font-heading), system-ui, sans-serif",
                  fontSmoothing: "antialiased",
                  "::placeholder": {
                    color: "#aab7c4",
                    fontWeight: "500",
                  },
                },
                invalid: {
                  color: "#ef4444",
                  iconColor: "#ef4444",
                },
              },
            }}
          />
        </div>
        {cardError && (
          <div className="flex items-center gap-1.5 text-red-500 mt-2 ml-1 animate-in fade-in slide-in-from-top-1">
            <AlertCircle className="h-3 w-3" />
            <span className="text-[10px] font-bold">{cardError}</span>
          </div>
        )}
      </div>

      <div className="space-y-5">
        <Button
          type="submit"
          disabled={isDisabled}
          className={cn(
            "w-full h-14 text-lg font-black rounded-2xl transition-all duration-300 ease-out",
            "bg-primary hover:bg-primary/95 text-primary-foreground shadow-xl shadow-primary/20",
            "active:scale-[0.98] disabled:opacity-50 disabled:grayscale disabled:scale-100 disabled:shadow-none",
          )}
        >
          {isProcessing || isPending ? (
            <span className="flex items-center gap-3">
              <span className="h-5 w-5 border-2 border-primary-foreground/30 border-t-primary-foreground animate-spin rounded-full" />
              Verifying...
            </span>
          ) : (
            <span className="flex items-center gap-2">
              <Lock className="h-5 w-5 fill-current/10" />
              Authorize Charge
            </span>
          )}
        </Button>

        <div className="pt-4 border-t border-border/40">
          <div className="flex items-center justify-center gap-6 opacity-40 hover:opacity-100 transition-opacity duration-300">
            <svg
              className="h-5 w-auto"
              viewBox="0 0 48 48"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M15.34 32h3.32l2.08-12.75h-3.32L15.34 32zM32.06 19.39c-.77-.32-1.98-.67-3.48-.67-3.84 0-6.55 2.04-6.57 4.97-.02 2.16 1.93 3.36 3.41 4.08 1.52.74 2.03 1.22 2.02 1.88-.02 1.02-1.22 1.48-2.35 1.48-1.57 0-2.41-.24-3.69-.81l-.52-.25-.56 3.48c.95.44 2.68.82 4.49.82 4.08 0 6.74-2.01 6.77-5.13.02-1.71-1.02-3.02-3.26-4.09-1.36-.69-2.2-1.15-2.2-1.85.01-.63.7-.1-.28 1.25.02s1.43-.3 1.95-.3c1.17 0 2.05.26 2.68.53l.32.16.59-3.59zM42.53 19.25h-2.58c-.8 0-1.39.23-1.74.96l-4.94 11.79h3.48l.69-1.92h4.25l.4 1.92h3.06L42.53 19.25zm-3.09 7.3l2.03-5.59 1.16 5.59h-3.19zM10.74 19.25L7.49 28.01l-.35-1.75c-.6-2.04-2.48-4.25-4.63-5.38L2.5 20.8l.06.12 5.09 11.08h3.51l5.22-12.75h-3.64l.05-.12z"
                fill="#1434CB"
              />
            </svg>
            <svg
              className="h-6 w-auto"
              viewBox="0 0 32 32"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <rect width="32" height="20" rx="3" fill="white" />
              <circle cx="12" cy="10" r="7" fill="#EB001B" fillOpacity="0.8" />
              <circle cx="20" cy="10" r="7" fill="#F79E1B" fillOpacity="0.8" />
            </svg>
            <div className="h-4 w-px bg-border/40" />
            <div className="flex items-center gap-1.5 text-[9px] font-black text-muted-foreground uppercase tracking-widest whitespace-nowrap">
              <ShieldCheck className="h-3.5 w-3.5 text-primary/60" />
              Secure 256-bit SSL
            </div>
          </div>
        </div>
      </div>
    </form>
  );
}
