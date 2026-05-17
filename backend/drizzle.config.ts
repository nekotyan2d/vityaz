import "dotenv/config";
import { defineConfig } from "drizzle-kit";
import { env } from "./src/env";

console.log("Using database URL:", env.DATABASE_URL);

export default defineConfig({
    out: "./drizzle",
    schema: "./src/db/schema.ts",
    dialect: "postgresql",
    dbCredentials: {
        url: env.DATABASE_URL,
    },
});
