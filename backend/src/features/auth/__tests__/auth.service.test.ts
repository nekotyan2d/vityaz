import { describe, it, expect, vi, beforeEach } from "vitest";
import { AuthService } from "../auth.service";
import type { AuthRepository } from "../auth.repository";

vi.mock("@/utils/pass", () => ({
    comparePassword: vi.fn(),
    hashPassword: vi.fn(),
}));

vi.mock("@/utils/jwt", () => ({
    generateAccessToken: vi.fn().mockReturnValue("mock_access_token"),
}));

vi.mock("@/env", () => ({
    env: {
        ACCESS_TOKEN_EXPIRES_IN: 900,
        REFRESH_TOKEN_EXPIRES_IN: 604800,
    },
}));

// Мокаем EmployeeService/EmployeeRepository, используемые в register/getMe
vi.mock("@/features/employee/employee.service", () => ({
    EmployeeService: vi.fn().mockImplementation(() => ({
        create: vi.fn(),
        findById: vi.fn(),
    })),
}));
vi.mock("@/features/employee/employee.repository", () => ({
    EmployeeRepository: vi.fn(),
}));

import { comparePassword } from "@/utils/pass";

const makeRepo = (overrides: Record<string, unknown> = {}) => ({
    findUserByEmail: vi.fn(),
    findUserById: vi.fn(),
    findActiveBan: vi.fn().mockResolvedValue([]),
    createToken: vi.fn().mockResolvedValue(undefined),
    findToken: vi.fn(),
    revokeToken: vi.fn().mockResolvedValue(undefined),
    revokeAllTokens: vi.fn().mockResolvedValue(undefined),
    ...overrides,
});

const fakeUser = { id: 1, email: "user@test.com", role: "employee" as const, passwordHash: "hash" };
const fakeToken = { id: 1, employeeId: 1, token: "hashed", expiresAt: new Date(), createdAt: new Date(), revokedAt: null };

describe("AuthService.login", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("бросает ошибку если пользователь не найден", async () => {
        const repo = makeRepo({ findUserByEmail: vi.fn().mockResolvedValue([]) });
        const service = new AuthService(repo as unknown as AuthRepository);

        await expect(service.login("x@x.com", "pass")).rejects.toThrow("Invalid email or password");
    });

    it("бросает ошибку 'заблокирована' если есть активный бан", async () => {
        const repo = makeRepo({
            findUserByEmail: vi.fn().mockResolvedValue([fakeUser]),
            findActiveBan: vi.fn().mockResolvedValue([{ id: 1 }]),
        });
        const service = new AuthService(repo as unknown as AuthRepository);

        await expect(service.login("user@test.com", "pass")).rejects.toThrow("Учётная запись заблокирована");
    });

    it("бросает ошибку если пароль неверный", async () => {
        vi.mocked(comparePassword).mockResolvedValue(false);
        const repo = makeRepo({ findUserByEmail: vi.fn().mockResolvedValue([fakeUser]) });
        const service = new AuthService(repo as unknown as AuthRepository);

        await expect(service.login("user@test.com", "wrong")).rejects.toThrow("Invalid email or password");
    });

    it("возвращает токены при успешном входе", async () => {
        vi.mocked(comparePassword).mockResolvedValue(true);
        const repo = makeRepo({ findUserByEmail: vi.fn().mockResolvedValue([fakeUser]) });
        const service = new AuthService(repo as unknown as AuthRepository);

        const result = await service.login("user@test.com", "correct");

        expect(result.access_token).toBe("mock_access_token");
        expect(result.refresh_token).toHaveLength(128); // randomBytes(64).toString("hex")
        expect(repo.createToken).toHaveBeenCalledOnce();
    });

    it("проверяет бан ДО проверки пароля", async () => {
        const repo = makeRepo({
            findUserByEmail: vi.fn().mockResolvedValue([fakeUser]),
            findActiveBan: vi.fn().mockResolvedValue([{ id: 1 }]),
        });
        const service = new AuthService(repo as unknown as AuthRepository);

        await expect(service.login("user@test.com", "any")).rejects.toThrow("Учётная запись заблокирована");
        expect(comparePassword).not.toHaveBeenCalled();
    });
});

describe("AuthService.refresh", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("бросает ошибку если токен не найден", async () => {
        const repo = makeRepo({ findToken: vi.fn().mockResolvedValue([]) });
        const service = new AuthService(repo as unknown as AuthRepository);

        await expect(service.refresh("invalid_token")).rejects.toThrow("Invalid refresh token");
    });

    it("отзывает токен и бросает ошибку если сотрудник забанен", async () => {
        const repo = makeRepo({
            findToken: vi.fn().mockResolvedValue([fakeToken]),
            findUserById: vi.fn().mockResolvedValue([fakeUser]),
            findActiveBan: vi.fn().mockResolvedValue([{ id: 1 }]),
        });
        const service = new AuthService(repo as unknown as AuthRepository);

        await expect(service.refresh("token")).rejects.toThrow("Учётная запись заблокирована");
        expect(repo.revokeToken).toHaveBeenCalledOnce();
    });

    it("ротирует токены при успешном обновлении", async () => {
        const repo = makeRepo({
            findToken: vi.fn().mockResolvedValue([fakeToken]),
            findUserById: vi.fn().mockResolvedValue([fakeUser]),
        });
        const service = new AuthService(repo as unknown as AuthRepository);

        const result = await service.refresh("token");

        expect(result.access_token).toBe("mock_access_token");
        expect(repo.revokeToken).toHaveBeenCalledOnce();
        expect(repo.createToken).toHaveBeenCalledOnce();
    });
});

describe("AuthService.logout", () => {
    it("отзывает refresh-токен", async () => {
        const repo = makeRepo();
        const service = new AuthService(repo as unknown as AuthRepository);

        await service.logout("some_token");

        expect(repo.revokeToken).toHaveBeenCalledWith("some_token");
    });
});
