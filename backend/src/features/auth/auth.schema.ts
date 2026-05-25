import type { FastifySchema } from "fastify";
import { GetMeResponseSchema, LoginRequestBodySchema, RegisterRequestBodySchema, SuccessfulResponse } from "./auth.dto";

export const LoginSchema: FastifySchema = {
    description: "Login",
    tags: ["auth"],
    body: LoginRequestBodySchema,
    response: {
        200: SuccessfulResponse,
    },
};

export const RegisterSchema: FastifySchema = {
    description: "Register",
    tags: ["auth"],
    body: RegisterRequestBodySchema,
    response: {
        200: SuccessfulResponse,
    },
};

export const RefreshSchema: FastifySchema = {
    description: "Refresh access token",
    tags: ["auth"],
    response: {
        200: SuccessfulResponse,
    },
};

export const GetMeSchema: FastifySchema = {
    description: "Get current user",
    tags: ["auth"],
    response: {
        200: GetMeResponseSchema,
    },
};

export const LogoutSchema: FastifySchema = {
    description: "Logout",
    tags: ["auth"],
};
