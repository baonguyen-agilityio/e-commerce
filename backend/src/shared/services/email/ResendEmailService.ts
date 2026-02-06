import { Resend } from "resend";
import { IEmailService, OrderEmailData } from "../../interfaces/IEmailService";
import { renderOrderConfirmationEmail } from "./templates/order-confirmation";
import { loggers } from "@shared/utils/logger";

export class ResendEmailService implements IEmailService {
    private resend: Resend;
    constructor(apiKey: string) {
        this.resend = new Resend(apiKey);
    }

    async sendOrderConfirmation(data: OrderEmailData): Promise<void> {
        if (!data.customer.email) {
            loggers.error('Cannot send email: customer email is missing', null, {
                context: 'ResendEmailService',
                orderId: data.order.orderId
            });
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

            loggers.info('Order confirmation email sent', {
                context: 'ResendEmailService',
                orderId: data.order.orderId,
                email: data.customer.email
            });
        } catch (error) {
            loggers.error('Email sending failed', error, {
                context: 'ResendEmailService',
                orderId: data.order.orderId,
                email: data.customer.email
            });
        }
    }
}
