import { env } from "@/env";
import jwt, { type Secret, type SignOptions } from "jsonwebtoken";

export type AccessTokenPayload = {
    employeeId: number;
    role: "admin" | "employee" | "security";
};

export function generateAccessToken(employeeId: number, role: "admin" | "employee" | "security") {
    return jwt.sign(
        { employeeId, role } satisfies AccessTokenPayload,
        env.ACCESS_TOKEN_SECRET as Secret,
        { expiresIn: env.ACCESS_TOKEN_EXPIRES_IN } as SignOptions,
    );
}

export function verifyAccessToken(token: string): AccessTokenPayload | null {
    try {
        return jwt.verify(token, env.ACCESS_TOKEN_SECRET as Secret) as AccessTokenPayload;
    } catch {
        return null;
    }
}
