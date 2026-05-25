import { db } from "@/db/client";
import { employeeCategories, employees, employeesBans } from "@/db/schema";
import { eq } from "drizzle-orm";
import type { EmployeeDTO } from "./employee.dto";

export class EmployeeRepository {
    constructor() {}

    findAll(): Promise<EmployeeDTO[]> {
        return db
            .select({
                id: employees.id,
                email: employees.email,
                full_name: employees.fullName,
                role: employees.role,
                category: employeeCategories.name,
                created_at: employees.createdAt,
            })
            .from(employees)
            .innerJoin(employeeCategories, eq(employeeCategories.id, employees.categoryId));
    }

    async findById(id: number): Promise<EmployeeDTO | null> {
        const result = await db
            .select({
                id: employees.id,
                email: employees.email,
                full_name: employees.fullName,
                role: employees.role,
                category: employeeCategories.name,
                created_at: employees.createdAt,
            })
            .from(employees)
            .innerJoin(employeeCategories, eq(employeeCategories.id, employees.categoryId))
            .where(eq(employees.id, id));
        return result[0] ?? null;
    }

    async findByEmail(email: string) {
        const result = await db
            .select({ id: employees.id })
            .from(employees)
            .where(eq(employees.email, email))
            .limit(1);
        return result[0] ?? null;
    }

    async findActiveBan(employeeId: number) {
        const result = await db
            .select({ id: employeesBans.id })
            .from(employeesBans)
            .where(eq(employeesBans.employeeId, employeeId))
            .limit(1);
        return result[0] ?? null;
    }

    async create(data: {
        email: string;
        fullName: string;
        categoryId: number;
        passwordHash: string;
        role?: "admin" | "employee";
    }) {
        const result = await db
            .insert(employees)
            .values({
                email: data.email,
                fullName: data.fullName,
                categoryId: data.categoryId,
                passwordHash: data.passwordHash,
                role: data.role ?? "employee",
            })
            .returning({ id: employees.id });
        return result;
    }

    async createBan(employeeId: number, reason: string, bannedBy: number) {
        await db.insert(employeesBans).values({ employeeId, reason, bannedBy });
    }
}
