import type { EmployeeRepository } from "./employee.repository";

export class EmployeeService {
    constructor(private repository: EmployeeRepository) {
        this.repository = repository;
    }

    async findAll() {
        const result = await this.repository.findAll();
        return result;
    }

    async findById(id: number) {
        const result = await this.repository.findById(id);
        return result[0] || null;
    }

    async create(data: { email: string; fullName: string; categoryId: number; passwordHash: string }) {
        const result = await this.repository.create(data);
        return result;
    }
}
