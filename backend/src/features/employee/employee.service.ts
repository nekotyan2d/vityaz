import { hashPassword } from "@/utils/pass";
import { AuthRepository } from "../auth/auth.repository";
import type { EmployeeRepository } from "./employee.repository";

export class EmployeeService {
    constructor(private repository: EmployeeRepository) {
        this.repository = repository;
    }

    async findAll() {
        return this.repository.findAll();
    }

    async findById(id: number) {
        return this.repository.findById(id);
    }

    async create(data: {
        email: string;
        fullName: string;
        categoryId: number;
        passwordHash: string;
    }) {
        const existing = await this.repository.findByEmail(data.email);
        if (existing) {
            throw new Error("Email already in use");
        }
        return this.repository.create(data);
    }

    async ban(employeeId: number, reason: string, bannedBy: number) {
        const employee = await this.repository.findById(employeeId);
        if (!employee) {
            throw new Error("Employee not found");
        }

        const existingBan = await this.repository.findActiveBan(employeeId);
        if (existingBan) {
            throw new Error("Employee is already banned");
        }

        await this.repository.createBan(employeeId, reason, bannedBy);
        await new AuthRepository().revokeAllTokens(employeeId);
    }
}
