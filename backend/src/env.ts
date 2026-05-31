import { z } from "zod";
import "dotenv/config";

const envSchema = z.object({
    HOST: z.string().default("0.0.0.0"),
    PORT: z.coerce.number().default(8000),
    FRONTEND_URL: z.string().url().default("http://localhost:3000"),
    DATABASE_URL: z.url(),
    ACCESS_TOKEN_SECRET: z.string().min(1),
    REFRESH_TOKEN_SECRET: z.string().min(1),
    ACCESS_TOKEN_EXPIRES_IN: z.coerce.number().default(15 * 60), // 15 minutes
    REFRESH_TOKEN_EXPIRES_IN: z.coerce.number().default(7 * 24 * 60 * 60), // 7 days
});

export type Env = z.infer<typeof envSchema>;

function validateEnv(): Env {
    const result = envSchema.safeParse(process.env);

    if (!result.success) {
        const properties = z.treeifyError(result.error).properties;

        console.error("Invalid env variables:");
        if (properties) {
            Object.entries(properties!).forEach(([key, error]) => {
                console.error(`- ${key}: ${JSON.stringify(error)}`);
            });
        }

        process.exit(1);
    }

    return result.data;
}

export const env = validateEnv();
