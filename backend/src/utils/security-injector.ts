import { authenticate } from "@/middleware/authenticate";
import type { FastifyInstance } from "fastify";

export function injectSecurity(app: FastifyInstance) {
    app.addHook("onRoute", (routeOptions) => {
        const handlers = [routeOptions.preHandler, routeOptions.preValidation].flat().filter(Boolean);

        const hasAuth = handlers.includes(authenticate);

        if (hasAuth) {
            routeOptions.schema ??= {};
            routeOptions.schema.security ??= [{ bearerAuth: [] }];
        }
    });
}
