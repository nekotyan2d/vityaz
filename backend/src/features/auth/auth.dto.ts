import z from "zod";
import { Employee } from "../employee/employee.dto";

const AuthResponseSchema = z.object({
    access_token: z.string(),
    refresh_token: z.string(),
    access_token_expires_in: z.number(),
    refresh_token_expires_in: z.number(),
});

export const SuccessfulResponse = z.object({
    ok: z.literal(true),
});

export const GetMeResponseSchema = z.object({
    employee: Employee,
});

export type GetMeResponse = z.infer<typeof GetMeResponseSchema>;

export type LoginServiceResponse = z.infer<typeof AuthResponseSchema>;
export type RegisterServiceResponse = z.infer<typeof AuthResponseSchema>;
export type RefreshServiceResponse = z.infer<typeof AuthResponseSchema>;

export const LoginRequestBodySchema = z.object({
    email: z.email(),
    password: z.string(),
});

export const RegisterRequestBodySchema = z.object({
    email: z.email(),
    full_name: z.string().regex(/^[А-ЯЁ][а-яё]+ [А-ЯЁ][а-яё]+ [А-ЯЁ][а-яё]+$/, "ФИО должно быть в формате Фамилия Имя Отчество"),
    password: z.string().min(6),
});

export type LoginRequestBody = z.infer<typeof LoginRequestBodySchema>;
export type RegisterRequestBody = z.infer<typeof RegisterRequestBodySchema>;
