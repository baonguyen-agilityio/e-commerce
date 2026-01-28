export interface PaymentResult {
  success: boolean;
  paymentId: string;
  message?: string;
  error?: string;
}

export interface PaymentDetails {
  amount: number;
  currency: string;
  description: string;
  paymentMethodId: string;
}
export interface IPaymentGateway {
  processPayment(paymentDetails: PaymentDetails): Promise<PaymentResult>;
}
