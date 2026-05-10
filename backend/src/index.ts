import fastify from "fastify";
import fastifySwagger from "@fastify/swagger";
import fastifySwaggerUi from "@fastify/swagger-ui";

import { env } from "./env";

const app = fastify();
const PORT = env.PORT;

app.register(fastifySwagger, {
    openapi: {
        openapi: "3.0.0",
        info: {
            title: "Vityaz API",
            description: "API for Vityaz system",
            version: "1.0.0",
        },
        servers: [
            {
                url: `http://localhost:${PORT}`,
                description: "Local development server",
            },
        ],
    },
});

app.register(fastifySwaggerUi, {
    routePrefix: "/docs",
});

app.get("/", () => {
    return {
        message: "Hello, World!",
    };
});

app.listen({ port: PORT }, (err, address) => {
    if (err) {
        console.error("Error starting server:", err);
        process.exit(1);
    }

    app.swagger();

    console.log(`Server is running at ${address}`);
});
