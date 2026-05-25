import fastify from "fastify";
import fastifySwagger from "@fastify/swagger";
import fastifySwaggerUi from "@fastify/swagger-ui";
import fastifyCookie from "@fastify/cookie";
import fastifyCors from "@fastify/cors";

import { env } from "@/env";
import { jsonSchemaTransform, serializerCompiler, validatorCompiler } from "fastify-type-provider-zod";
import { registerAuthRoutes } from "./features/auth/auth.controller";
import { registerEmployeeRoutes } from "./features/employee/employee.controller";
import { registerBuildingRoutes } from "./features/building/building.controller";
import { registerAccessRoutes } from "./features/access/access.controller";
import { registerSseRoutes } from "./features/sse/sse.controller";
import { injectSecurity } from "./utils/security-injector";

const app = fastify();
const PORT = env.PORT;

app.setValidatorCompiler(validatorCompiler);
app.setSerializerCompiler(serializerCompiler);

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
        components: {
            securitySchemes: {
                bearerAuth: {
                    type: "http",
                    scheme: "bearer",
                    bearerFormat: "JWT",
                },
            },
        },
    },
    transform: jsonSchemaTransform,
});

app.register(fastifySwaggerUi, {
    routePrefix: "/docs",
});

app.register(fastifyCookie);
app.register(fastifyCors, {
    origin: "http://localhost:3000",
    credentials: true,
});

app.after(() => {
    injectSecurity(app);
    registerAuthRoutes(app);
    registerEmployeeRoutes(app);
    registerBuildingRoutes(app);
    registerAccessRoutes(app);
    registerSseRoutes(app);
});

app.listen({ port: PORT }, (err, address) => {
    if (err) {
        console.error("Error starting server:", err);
        process.exit(1);
    }

    console.log(`Server is running at ${address}`);
});

await app.ready();

app.swagger();
