import z from "zod";

export const Employee = z.object({
    id: z.number(),
    full_name: z.string(),
    email: z.email(),
    category: z.string(),
    created_at: z.date(),
});

export type EmployeeDTO = z.infer<typeof Employee>;

export const GetEmployeesResponseSchema = z.object({
    employees: z.array(Employee),
});

export const GetEmployeeByIdResponseSchema = z.object({
    employee: Employee,
});
