import { Resend } from "resend";
import { IEmailService, OrderEmailData } from "../../interfaces/IEmailService";
import { renderOrderConfirmationEmail } from "./templates/order-confirmation";

export class ResendEmailService implements IEmailService {
    private resend: Resend;
    constructor(apiKey: string) {
        this.resend = new Resend(apiKey);
    }

    async sendOrderConfirmation(data: OrderEmailData): Promise<void> {
        if (!data.customer.email) {
            console.error('Cannot send email: customer email is missing');
            return;
        }

        const { html, subject } = renderOrderConfirmationEmail(data);
        try {
            await this.resend.emails.send({
                from: process.env.EMAIL_FROM || 'onboarding@resend.dev',
                to: data.customer.email,
                subject,
                html,
            });
        } catch (error) {
            console.error('Email sending failed:', error);
        }
    }
}
