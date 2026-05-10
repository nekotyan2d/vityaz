import { z } from "zod";

const envSchema = z.object({
    PORT: z.coerce.number().default(8000),
});

export type Env = z.infer<typeof envSchema>;

function validateEnv(): Env {
    const result = envSchema.safeParse(process.env);

    if (!result.success) {
        const errors = z.treeifyError(result.error).errors;

        console.error("Invalid env variables:");
        Object.entries(errors).forEach(([key, error]) => {
            console.error(`- ${key}: ${error}`);
        });
        process.exit(1);
    }

    return result.data;
}

export const env = validateEnv();
