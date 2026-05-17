import { db } from "@/db/client";
import { employeeCategories, employees } from "@/db/schema";
import { eq } from "drizzle-orm";
import type { EmployeeDTO } from "./employee.dto";

export class EmployeeRepository {
    constructor() {}

    findAll(): Promise<EmployeeDTO[]> {
        const result = db
            .select({
                id: employees.id,
                email: employees.email,
                full_name: employees.fullName,
                category: employeeCategories.name,
                created_at: employees.createdAt,
            })
            .from(employees)
            .innerJoin(employeeCategories, eq(employeeCategories.id, employees.categoryId));
        return result;
    }

    async findById(id: number) {
        const result = await db
            .select({
                id: employees.id,
                email: employees.email,
                full_name: employees.fullName,
                category: employeeCategories.name,
                created_at: employees.createdAt,
            })
            .from(employees)
            .innerJoin(employeeCategories, eq(employeeCategories.id, employees.categoryId))
            .where(eq(employees.id, id));
        return result;
    }

    async create(data: { email: string; fullName: string; categoryId: number; passwordHash: string }) {
        const result = await db
            .insert(employees)
            .values({
                email: data.email,
                fullName: data.fullName,
                categoryId: data.categoryId,
                passwordHash: data.passwordHash,
            })
            .returning({ id: employees.id });
        return result;
    }
}
