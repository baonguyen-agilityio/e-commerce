import Stripe from "stripe";
import {
  IPaymentGateway,
  PaymentDetails,
  PaymentResult,
} from "../../interfaces/IPaymentGateway";

export class StripePaymentGateway implements IPaymentGateway {
  private stripe: Stripe;

  constructor(secretKey: string) {
    this.stripe = new Stripe(secretKey);
  }
  async processPayment(paymentDetails: PaymentDetails): Promise<PaymentResult> {
    try {
      const paymentIntent = await this.stripe.paymentIntents.create({
        amount: Math.round(paymentDetails.amount * 100),
        currency: paymentDetails.currency,
        description: paymentDetails.description,
        payment_method: paymentDetails.paymentMethodId,
        automatic_payment_methods: {
          enabled: true,
          allow_redirects: "never",
        },
        confirm: true,
      });

      if (paymentIntent.status === "succeeded") {
        return {
          success: true,
          paymentId: paymentIntent.id,
          message: `Payment of ${paymentDetails.currency} ${paymentDetails.amount} processed successfully`,
        };
      }

      return {
        success: false,
        paymentId: paymentIntent.id,
        error: `Payment status: ${paymentIntent.status}`,
      };
    } catch (error) {
      const stripeError = error as Stripe.errors.StripeError;
      return {
        success: false,
        paymentId: "",
        error: stripeError.message || "Payment processing failed",
      };
    }
  }
}
