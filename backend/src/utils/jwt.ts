import { env } from "@/env";
import jwt, { type Secret, type SignOptions } from "jsonwebtoken";

export type AccessTokenPayload = {
    employeeId: number;
    role: "admin" | "employee";
};

export function generateAccessToken(employeeId: number, role: "admin" | "employee") {
    return jwt.sign(
        { employeeId, role } satisfies AccessTokenPayload,
        env.ACCESS_TOKEN_SECRET as Secret,
        { expiresIn: env.ACCESS_TOKEN_EXPIRES_IN } as SignOptions,
    );
}

export function generateRefreshToken(employeeId: number) {
    return jwt.sign(
        { employeeId },
        env.REFRESH_TOKEN_SECRET as Secret,
        { expiresIn: env.REFRESH_TOKEN_EXPIRES_IN } as SignOptions,
    );
}

export function verifyAccessToken(token: string): AccessTokenPayload | null {
    try {
        return jwt.verify(token, env.ACCESS_TOKEN_SECRET as Secret) as AccessTokenPayload;
    } catch {
        return null;
    }
}

export function verifyRefreshToken(token: string) {
    try {
        return jwt.verify(token, env.REFRESH_TOKEN_SECRET as Secret);
    } catch {
        return null;
    }
}