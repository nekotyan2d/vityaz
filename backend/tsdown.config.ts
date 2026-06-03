import { defineConfig } from "tsdown";

export default defineConfig({
    entry: ["src/index.ts", "src/db/migrate.ts"],

    alias: {
        "@": "./src",
    },
});
