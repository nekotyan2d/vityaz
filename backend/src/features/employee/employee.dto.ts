import z from "zod";

export const Employee = z.object({
    id: z.number(),
    full_name: z.string(),
    email: z.email(),
    category: z.string(),
    role: z.enum(["admin", "employee", "security"]),
    created_at: z.date(),
});

export type EmployeeDTO = z.infer<typeof Employee>;

export const GetEmployeesResponseSchema = z.object({
    employees: z.array(Employee),
});

export const GetEmployeeByIdResponseSchema = z.object({
    employee: Employee,
});

export const CreateEmployeeRequestSchema = z.object({
    email: z.email(),
    full_name: z.string().min(2),
    password: z.string().min(6),
    category_id: z.number().int().positive(),
});

export type CreateEmployeeRequest = z.infer<typeof CreateEmployeeRequestSchema>;

export const BanEmployeeRequestSchema = z.object({
    reason: z.string().min(1).max(255),
});

export type BanEmployeeRequest = z.infer<typeof BanEmployeeRequestSchema>;
