import { describe, it, expect, vi, beforeEach } from "vitest";
import { EmployeeService } from "../employee.service";
import type { EmployeeRepository } from "../employee.repository";

vi.mock("@/utils/pass", () => ({
    hashPassword: vi.fn(),
}));

vi.mock("@/features/auth/auth.repository", () => ({
    AuthRepository: class {
        revokeAllTokens = vi.fn().mockResolvedValue(undefined);
    },
}));

const fakeEmployee = {
    id: 2,
    email: "emp@test.com",
    full_name: "Иванов Иван Иванович",
    role: "employee" as const,
    category: "Преподаватель",
    created_at: new Date(),
};

const makeRepo = (overrides: Record<string, unknown> = {}) => ({
    findAll: vi.fn().mockResolvedValue([fakeEmployee]),
    findById: vi.fn().mockResolvedValue(fakeEmployee),
    findByEmail: vi.fn().mockResolvedValue(null),
    findActiveBan: vi.fn().mockResolvedValue(null),
    create: vi.fn().mockResolvedValue([{ id: 2 }]),
    createBan: vi.fn().mockResolvedValue(undefined),
    ...overrides,
});

describe("EmployeeService.findAll", () => {
    it("возвращает список сотрудников", async () => {
        const repo = makeRepo();
        const service = new EmployeeService(repo as unknown as EmployeeRepository);

        const result = await service.findAll();

        expect(result).toEqual([fakeEmployee]);
        expect(repo.findAll).toHaveBeenCalledOnce();
    });
});

describe("EmployeeService.findById", () => {
    it("возвращает сотрудника если найден", async () => {
        const repo = makeRepo();
        const service = new EmployeeService(repo as unknown as EmployeeRepository);

        const result = await service.findById(2);

        expect(result).toEqual(fakeEmployee);
    });

    it("возвращает null если не найден", async () => {
        const repo = makeRepo({ findById: vi.fn().mockResolvedValue(null) });
        const service = new EmployeeService(repo as unknown as EmployeeRepository);

        const result = await service.findById(999);

        expect(result).toBeNull();
    });
});

describe("EmployeeService.create", () => {
    beforeEach(() => vi.clearAllMocks());

    it("бросает ошибку если email занят", async () => {
        const repo = makeRepo({ findByEmail: vi.fn().mockResolvedValue({ id: 1 }) });
        const service = new EmployeeService(repo as unknown as EmployeeRepository);

        await expect(
            service.create({ email: "emp@test.com", fullName: "Иванов", categoryId: 2, passwordHash: "h" }),
        ).rejects.toThrow("Email already in use");
    });

    it("создаёт сотрудника если email свободен", async () => {
        const repo = makeRepo();
        const service = new EmployeeService(repo as unknown as EmployeeRepository);

        const result = await service.create({
            email: "new@test.com",
            fullName: "Новый Сотрудник",
            categoryId: 2,
            passwordHash: "hash",
        });

        expect(repo.create).toHaveBeenCalledOnce();
        expect(result).toEqual([{ id: 2 }]);
    });

    it("не вызывает create если email занят", async () => {
        const repo = makeRepo({ findByEmail: vi.fn().mockResolvedValue({ id: 1 }) });
        const service = new EmployeeService(repo as unknown as EmployeeRepository);

        await expect(
            service.create({ email: "emp@test.com", fullName: "Иванов", categoryId: 2, passwordHash: "h" }),
        ).rejects.toThrow();

        expect(repo.create).not.toHaveBeenCalled();
    });
});

describe("EmployeeService.ban", () => {
    beforeEach(() => vi.clearAllMocks());

    it("бросает ошибку если сотрудник не найден", async () => {
        const repo = makeRepo({ findById: vi.fn().mockResolvedValue(null) });
        const service = new EmployeeService(repo as unknown as EmployeeRepository);

        await expect(service.ban(999, "причина", 1)).rejects.toThrow("Employee not found");
    });

    it("бросает ошибку если сотрудник уже забанен", async () => {
        const repo = makeRepo({ findActiveBan: vi.fn().mockResolvedValue({ id: 5 }) });
        const service = new EmployeeService(repo as unknown as EmployeeRepository);

        await expect(service.ban(2, "причина", 1)).rejects.toThrow("Employee is already banned");
    });

    it("создаёт бан и отзывает токены при успехе", async () => {
        const repo = makeRepo();
        const service = new EmployeeService(repo as unknown as EmployeeRepository);

        await service.ban(2, "нарушение", 1);

        expect(repo.createBan).toHaveBeenCalledWith(2, "нарушение", 1);
    });

    it("не создаёт бан если сотрудник не найден", async () => {
        const repo = makeRepo({ findById: vi.fn().mockResolvedValue(null) });
        const service = new EmployeeService(repo as unknown as EmployeeRepository);

        await expect(service.ban(999, "причина", 1)).rejects.toThrow();

        expect(repo.createBan).not.toHaveBeenCalled();
    });
});