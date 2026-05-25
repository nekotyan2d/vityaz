import { createHash } from "crypto";
import { db } from "@/db/client";
import { employees, employeesBans, refreshTokens } from "@/db/schema";
import { env } from "@/env";
import { and, eq, isNull, gt } from "drizzle-orm";

function hashToken(token: string): string {
    return createHash("sha256").update(token).digest("hex");
}

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

    async findActiveBan(employeeId: number) {
        return db
            .select({ id: employeesBans.id })
            .from(employeesBans)
            .where(eq(employeesBans.employeeId, employeeId))
            .limit(1);
    }

    async createToken(employeeId: number, refreshToken: string) {
        await db.insert(refreshTokens).values({
            employeeId,
            token: hashToken(refreshToken),
            expiresAt: new Date(Date.now() + env.REFRESH_TOKEN_EXPIRES_IN * 1000),
        });
    }

    async findToken(token: string) {
        return db
            .select()
            .from(refreshTokens)
            .where(
                and(
                    eq(refreshTokens.token, hashToken(token)),
                    isNull(refreshTokens.revokedAt),
                    gt(refreshTokens.expiresAt, new Date()),
                ),
            );
    }

    async revokeToken(token: string) {
        await db
            .update(refreshTokens)
            .set({ revokedAt: new Date() })
            .where(eq(refreshTokens.token, hashToken(token)));
    }

    async revokeAllTokens(employeeId: number) {
        await db
            .update(refreshTokens)
            .set({ revokedAt: new Date() })
            .where(and(eq(refreshTokens.employeeId, employeeId), isNull(refreshTokens.revokedAt)));
    }
}
