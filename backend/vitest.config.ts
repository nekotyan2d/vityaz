import { defineConfig } from "vitest/config";
import { resolve } from "path";

const __dirname = import.meta.dirname;

export default defineConfig({
    test: {
        environment: "node",
    },
    resolve: {
        alias: {
            "@": resolve(__dirname, "./src"),
        },
    },
});