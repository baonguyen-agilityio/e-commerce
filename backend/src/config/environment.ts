import "dotenv/config";
import { z } from "zod";

const envSchema = z
  .object({
    NODE_ENV: z
      .enum(["development", "production", "test"])
      .default("development"),
    PORT: z.string().default("3000").transform(Number),
    API_VERSION: z.string().default("v1"),

    DATABASE_URL: z.string().url("DATABASE_URL must be a valid URL").optional(),
    DB_HOST: z.string().optional(),
    DB_PORT: z
      .string()
      .optional()
      .refine(
        (val) => val === undefined || /^\d+$/.test(val),
        "DB_PORT must be a number",
      )
      .transform((val) => (val ? Number(val) : undefined)),
    DB_USERNAME: z.string().optional(),
    DB_PASSWORD: z.string().optional(),
    DB_NAME: z.string().optional(),
    DB_SSL: z
      .enum(["true", "false"])
      .optional()
      .default("false")
      .transform((val) => val === "true"),

    CLERK_PUBLISHABLE_KEY: z
      .string()
      .min(1, "CLERK_PUBLISHABLE_KEY is required"),
    CLERK_SECRET_KEY: z.string().min(1, "CLERK_SECRET_KEY is required"),

    STRIPE_SECRET_KEY: z.string().min(1, "STRIPE_SECRET_KEY is required"),
    STRIPE_PUBLISHABLE_KEY: z
      .string()
      .min(1, "STRIPE_PUBLISHABLE_KEY is required"),

    RESEND_API_KEY: z.string().min(1, "RESEND_API_KEY is required"),

    ALLOWED_ORIGINS: z
      .string()
      .transform((val) => val.split(",").map((s) => s.trim())),

    EMAIL_FROM: z.string().email().optional().default("onboarding@resend.dev"),
  })
  .superRefine((data, ctx) => {
    const hasDatabaseUrl = Boolean(data.DATABASE_URL);
    const hasDiscreteDbConfig = Boolean(
      data.DB_HOST &&
      typeof data.DB_PORT === "number" &&
      data.DB_USERNAME &&
      data.DB_PASSWORD &&
      data.DB_NAME,
    );

    if (!hasDatabaseUrl && !hasDiscreteDbConfig) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["DATABASE_URL"],
        message:
          "Provide DATABASE_URL or all DB_HOST, DB_PORT, DB_USERNAME, DB_PASSWORD, DB_NAME",
      });
    }
  });

export type Env = z.infer<typeof envSchema>;

export function validateEnv(): Env {
  try {
    return envSchema.parse(process.env);
  } catch (error) {
    if (error instanceof z.ZodError) {
      console.error("Environment validation failed:");
      error.issues.forEach((issue) => {
        console.error(`  - ${issue.path.join(".")}: ${issue.message}`);
      });
      console.error(
        "\nPlease check your .env file and ensure all required variables are set.",
      );
    }
    process.exit(1);
  }
}

export const env = validateEnv();
