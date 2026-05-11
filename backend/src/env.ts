import { z } from "zod";
import "dotenv/config";

const envSchema = z.object({
    PORT: z.coerce.number().default(8000),
    DATABASE_URL: z.url(),
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
