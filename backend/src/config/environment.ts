import { z } from 'zod';

const envSchema = z.object({
    NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
    PORT: z.string().default('3000').transform(Number),
    API_VERSION: z.string().default('v1'),

    DB_HOST: z.string().min(1, 'DB_HOST is required'),
    DB_PORT: z.string().transform(Number),
    DB_USERNAME: z.string().min(1, 'DB_USERNAME is required'),
    DB_PASSWORD: z.string().min(1, 'DB_PASSWORD is required'),
    DB_NAME: z.string().min(1, 'DB_NAME is required'),

    CLERK_PUBLISHABLE_KEY: z.string().min(1, 'CLERK_PUBLISHABLE_KEY is required'),
    CLERK_SECRET_KEY: z.string().min(1, 'CLERK_SECRET_KEY is required'),

    STRIPE_SECRET_KEY: z.string().min(1, 'STRIPE_SECRET_KEY is required'),
    STRIPE_PUBLISHABLE_KEY: z.string().min(1, 'STRIPE_PUBLISHABLE_KEY is required'),

    RESEND_API_KEY: z.string().min(1, 'RESEND_API_KEY is required'),

    ALLOWED_ORIGINS: z.string().transform(val => val.split(',').map(s => s.trim())),

    EMAIL_FROM: z.string().email().optional().default('onboarding@resend.dev'),
});

export type Env = z.infer<typeof envSchema>;

export function validateEnv(): Env {
    try {
        return envSchema.parse(process.env);
    } catch (error) {
        if (error instanceof z.ZodError) {
            console.error('Environment validation failed:');
            error.issues.forEach((issue) => {
                console.error(`  - ${issue.path.join('.')}: ${issue.message}`);
            });
            console.error('\nPlease check your .env file and ensure all required variables are set.');
        }
        process.exit(1);
    }
}

export const env = validateEnv();
