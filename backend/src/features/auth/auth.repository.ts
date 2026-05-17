import { db } from "@/db/client";
import { employees, refreshTokens } from "@/db/schema";
import { env } from "@/env";
import { eq } from "drizzle-orm";

export class AuthRepository {
    constructor() {}

    async findUserByEmail(email: string) {
        const user = await db
            .select({
                id: employees.id,
                email: employees.email,
                passwordHash: employees.passwordHash,
            })
            .from(employees)
            .where(eq(employees.email, email));
        return user;
    }

    async createToken(employeeId: number, refreshToken: string) {
        await db.insert(refreshTokens).values({
            employeeId: employeeId,
            token: refreshToken,
            expiresAt: new Date(Date.now() + env.REFRESH_TOKEN_EXPIRES_IN * 1000),
        });
    }

    async findToken(token: string) {
        const result = await db.select().from(refreshTokens).where(eq(refreshTokens.token, token));
        return result;
    }

    async deleteToken(token: string) {
        await db.delete(refreshTokens).where(eq(refreshTokens.token, token));
    }
}
