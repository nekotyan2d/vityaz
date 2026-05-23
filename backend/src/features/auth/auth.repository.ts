import { db } from "@/db/client";
import { employees, refreshTokens } from "@/db/schema";
import { env } from "@/env";
import { and, eq, isNull, gt } from "drizzle-orm";

export class AuthRepository {
    constructor() {}

    async findUserByEmail(email: string) {
        return db
            .select({
                id: employees.id,
                email: employees.email,
                role: employees.role,
                passwordHash: employees.passwordHash,
            })
            .from(employees)
            .where(eq(employees.email, email));
    }

    async findUserById(id: number) {
        return db
            .select({
                id: employees.id,
                email: employees.email,
                role: employees.role,
                passwordHash: employees.passwordHash,
            })
            .from(employees)
            .where(eq(employees.id, id));
    }

    async createToken(employeeId: number, refreshToken: string) {
        await db.insert(refreshTokens).values({
            employeeId,
            token: refreshToken,
            expiresAt: new Date(Date.now() + env.REFRESH_TOKEN_EXPIRES_IN * 1000),
        });
    }

    async findToken(token: string) {
        return db
            .select()
            .from(refreshTokens)
            .where(
                and(
                    eq(refreshTokens.token, token),
                    isNull(refreshTokens.revokedAt),
                    gt(refreshTokens.expiresAt, new Date()),
                ),
            );
    }

    async revokeToken(token: string) {
        await db
            .update(refreshTokens)
            .set({ revokedAt: new Date() })
            .where(eq(refreshTokens.token, token));
    }

    async revokeAllTokens(employeeId: number) {
        await db
            .update(refreshTokens)
            .set({ revokedAt: new Date() })
            .where(and(eq(refreshTokens.employeeId, employeeId), isNull(refreshTokens.revokedAt)));
    }
}