import { env } from "@/env";
import jwt, { type Secret, type SignOptions } from "jsonwebtoken";

export function generateAccessToken(employeeId: number) {
    return jwt.sign(
        {
            id: employeeId,
        },
        env.ACCESS_TOKEN_SECRET as Secret,
        {
            expiresIn: env.ACCESS_TOKEN_EXPIRES_IN,
        } as SignOptions,
    );
}

export function generateRefreshToken(employeeId: number) {
    return jwt.sign(
        {
            id: employeeId,
        },
        env.REFRESH_TOKEN_SECRET as Secret,
        {
            expiresIn: env.REFRESH_TOKEN_EXPIRES_IN,
        } as SignOptions,
    );
}

export function verifyAccessToken(token: string) {
    try {
        return jwt.verify(token, env.ACCESS_TOKEN_SECRET as Secret);
    } catch (err) {
        return null;
    }
}

export function verifyRefreshToken(token: string) {
    try {
        return jwt.verify(token, env.REFRESH_TOKEN_SECRET as Secret);
    } catch (err) {
        return null;
    }
}
