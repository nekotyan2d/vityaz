import { randomBytes } from "crypto";
import { comparePassword, hashPassword } from "@/utils/pass";
import type { AuthRepository } from "./auth.repository";
import { generateAccessToken } from "@/utils/jwt";
import type { LoginServiceResponse, RefreshServiceResponse, RegisterServiceResponse } from "./auth.dto";
import { env } from "@/env";
import { EmployeeService } from "../employee/employee.service";
import { EmployeeRepository } from "../employee/employee.repository";

export class AuthService {
    constructor(private repository: AuthRepository) {
        this.repository = repository;
    }

    async login(email: string, password: string) {
        const results = await this.repository.findUserByEmail(email);
        if (results.length === 0) {
            throw new Error("Invalid email or password");
        }

        const user = results[0]!;

        const bans = await this.repository.findActiveBan(user.id);
        if (bans.length > 0) {
            throw new Error("Учётная запись заблокирована");
        }

        const isValid = await comparePassword(password, user.passwordHash);
        if (!isValid) {
            throw new Error("Invalid email or password");
        }

        const accessToken = generateAccessToken(user.id, user.role);
        const refreshToken = randomBytes(64).toString("hex");

        await this.repository.createToken(user.id, refreshToken);

        return {
            access_token: accessToken,
            refresh_token: refreshToken,
            access_token_expires_in: env.ACCESS_TOKEN_EXPIRES_IN,
            refresh_token_expires_in: env.REFRESH_TOKEN_EXPIRES_IN,
        } satisfies LoginServiceResponse;
    }

    async register(email: string, fullName: string, password: string) {
        const hashedPassword = await hashPassword(password);
        const employee = await new EmployeeService(new EmployeeRepository()).create({
            email,
            fullName,
            categoryId: 7,
            passwordHash: hashedPassword,
        });

        if (!employee || employee.length === 0) {
            throw new Error("Failed to create user");
        }

        const accessToken = generateAccessToken(employee[0]!.id, "employee");
        const refreshToken = randomBytes(64).toString("hex");

        await this.repository.createToken(employee[0]!.id, refreshToken);

        return {
            access_token: accessToken,
            refresh_token: refreshToken,
            access_token_expires_in: env.ACCESS_TOKEN_EXPIRES_IN,
            refresh_token_expires_in: env.REFRESH_TOKEN_EXPIRES_IN,
        } satisfies RegisterServiceResponse;
    }

    async getMe(employeeId: number) {
        const result = await new EmployeeService(new EmployeeRepository()).findById(employeeId);
        return result;
    }

    async refresh(refreshToken: string) {
        const tokens = await this.repository.findToken(refreshToken);
        if (tokens.length === 0) {
            throw new Error("Invalid refresh token");
        }

        const tokenData = tokens[0]!;

        const userResults = await this.repository.findUserById(tokenData.employeeId);
        if (userResults.length === 0) {
            throw new Error("Employee not found");
        }

        const user = userResults[0]!;

        const bans = await this.repository.findActiveBan(user.id);
        if (bans.length > 0) {
            await this.repository.revokeToken(refreshToken);
            throw new Error("Учётная запись заблокирована");
        }

        const accessToken = generateAccessToken(user.id, user.role);
        const newRefreshToken = randomBytes(64).toString("hex");

        await this.repository.revokeToken(refreshToken);
        await this.repository.createToken(user.id, newRefreshToken);

        return {
            access_token: accessToken,
            refresh_token: newRefreshToken,
            access_token_expires_in: env.ACCESS_TOKEN_EXPIRES_IN,
            refresh_token_expires_in: env.REFRESH_TOKEN_EXPIRES_IN,
        } satisfies RefreshServiceResponse;
    }

    async logout(refreshToken: string) {
        await this.repository.revokeToken(refreshToken);
    }

    async revokeAllTokens(employeeId: number) {
        await this.repository.revokeAllTokens(employeeId);
    }
}
