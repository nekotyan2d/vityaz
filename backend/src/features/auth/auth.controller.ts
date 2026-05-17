import type { FastifyInstance } from "fastify";
import { GetMeSchema, LoginSchema, RefreshSchema, RegisterSchema } from "./auth.schema";
import { authenticate } from "@/middleware/authenticate";
import type { LoginRequestBody, RegisterRequestBody } from "./auth.dto";
import { AuthService } from "./auth.service";
import { AuthRepository } from "./auth.repository";
import type { ZodTypeProvider } from "fastify-type-provider-zod";

const authCookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    path: "/",
};

export function registerAuthRoutes(app: FastifyInstance) {
    app.withTypeProvider<ZodTypeProvider>().post(
        "/auth/login",
        {
            schema: LoginSchema,
        },
        async (request, reply) => {
            try {
                const { email, password } = request.body as LoginRequestBody;

                const authService = new AuthService(new AuthRepository());
                const result = await authService.login(email, password);
                return reply
                    .setCookie("access_token", result.access_token, {
                        ...authCookieOptions,
                        maxAge: result.access_token_expires_in,
                    })
                    .setCookie("refresh_token", result.refresh_token, {
                        ...authCookieOptions,
                        maxAge: result.refresh_token_expires_in,
                    })
                    .send({
                        ok: true,
                    });
            } catch (error) {
                // TODO: сделать нормальную обработку ошибок
                return reply.status(401).send({ message: "Invalid email or password" });
            }
        },
    );

    app.withTypeProvider<ZodTypeProvider>().post(
        "/auth/register",
        {
            schema: RegisterSchema,
        },
        async (request, reply) => {
            try {
                const { email, full_name, password } = request.body as RegisterRequestBody;

                const authService = new AuthService(new AuthRepository());
                const result = await authService.register(email, full_name, password);
                return reply
                    .setCookie("access_token", result.access_token, {
                        ...authCookieOptions,
                        maxAge: result.access_token_expires_in,
                    })
                    .setCookie("refresh_token", result.refresh_token, {
                        ...authCookieOptions,
                        maxAge: result.refresh_token_expires_in,
                    })
                    .send({
                        ok: true,
                    });
            } catch (error) {
                // TODO: сделать нормальную обработку ошибок
                return reply.status(400).send({ message: "Error occurred while registering user" });
            }
        },
    );

    app.withTypeProvider<ZodTypeProvider>().post(
        "/auth/refresh",
        {
            schema: RefreshSchema,
        },
        async (request, reply) => {
            try {
                const refresh_token = request.cookies.refresh_token;

                if (!refresh_token) {
                    return reply.status(401).send({ message: "Unauthorized" });
                }

                const authService = new AuthService(new AuthRepository());
                const result = await authService.refresh(refresh_token);
                return reply
                    .setCookie("access_token", result.access_token, {
                        ...authCookieOptions,
                        maxAge: result.access_token_expires_in,
                    })
                    .setCookie("refresh_token", result.refresh_token, {
                        ...authCookieOptions,
                        maxAge: result.refresh_token_expires_in,
                    })
                    .send({
                        ok: true,
                    });
            } catch (error) {
                // TODO: сделать нормальную обработку ошибок
                return reply.status(401).send({ message: "Invalid refresh token" });
            }
        },
    );

    app.withTypeProvider<ZodTypeProvider>().get(
        "/auth/me",
        {
            preHandler: authenticate,
            schema: GetMeSchema,
        },
        async (request, reply) => {
            try {
                const authService = new AuthService(new AuthRepository());
                const employee = await authService.getMe(request.user.id);
                return {
                    employee,
                };
            } catch (error) {
                // TODO: сделать нормальную обработку ошибок
                return reply.status(404).send({ message: "User not found" });
            }
        },
    );
}
