import type { FastifyInstance } from "fastify";
import type { ZodTypeProvider } from "fastify-type-provider-zod";
import { BanEmployeeSchema, CreateEmployeeSchema, GetEmployeeByIdSchema, GetEmployeesSchema } from "./employee.schema";
import { authenticate } from "@/middleware/authenticate";
import { adminOnly } from "@/middleware/admin-only";
import { EmployeeService } from "./employee.service";
import { EmployeeRepository } from "./employee.repository";
import { hashPassword } from "@/utils/pass";
import type { BanEmployeeRequest, CreateEmployeeRequest } from "./employee.dto";

export function registerEmployeeRoutes(app: FastifyInstance) {
    app.withTypeProvider<ZodTypeProvider>().get(
        "/employees",
        {
            preHandler: [authenticate, adminOnly],
            schema: GetEmployeesSchema,
        },
        async (_request, reply) => {
            try {
                const employeeService = new EmployeeService(new EmployeeRepository());
                const employees = await employeeService.findAll();
                return { employees };
            } catch (error) {
                return reply.status(500).send({ message: "Internal server error" });
            }
        },
    );

    app.withTypeProvider<ZodTypeProvider>().get(
        "/employees/:id",
        {
            preHandler: [authenticate, adminOnly],
            schema: GetEmployeeByIdSchema,
        },
        async (request, reply) => {
            try {
                const { id } = request.params as { id: number };
                const employeeService = new EmployeeService(new EmployeeRepository());
                const employee = await employeeService.findById(id);
                if (!employee) {
                    return reply.status(404).send({ message: "Employee not found" });
                }
                return { employee };
            } catch (error) {
                return reply.status(500).send({ message: "Internal server error" });
            }
        },
    );

    app.withTypeProvider<ZodTypeProvider>().post(
        "/employees",
        {
            preHandler: [authenticate, adminOnly],
            schema: CreateEmployeeSchema,
        },
        async (request, reply) => {
            try {
                const { email, full_name, password, category_id, role } = request.body as CreateEmployeeRequest;
                const passwordHash = await hashPassword(password);

                const employeeService = new EmployeeService(new EmployeeRepository());
                const result = await employeeService.create({
                    email,
                    fullName: full_name,
                    categoryId: category_id,
                    passwordHash,
                    role,
                });

                if (!result || result.length === 0) {
                    return reply.status(500).send({ message: "Failed to create employee" });
                }

                const employee = await employeeService.findById(result[0]!.id);
                return reply.status(201).send({ employee });
            } catch (error) {
                if (error instanceof Error && error.message === "Email already in use") {
                    return reply.status(409).send({ message: "Email already in use" });
                }
                return reply.status(500).send({ message: "Internal server error" });
            }
        },
    );

    app.withTypeProvider<ZodTypeProvider>().post(
        "/employees/:id/ban",
        {
            preHandler: [authenticate, adminOnly],
            schema: BanEmployeeSchema,
        },
        async (request, reply) => {
            try {
                const { id } = request.params as { id: number };
                const { reason } = request.body as BanEmployeeRequest;

                const employeeService = new EmployeeService(new EmployeeRepository());
                await employeeService.ban(id, reason, request.user.employeeId);

                return reply.status(204).send();
            } catch (error) {
                if (error instanceof Error && error.message === "Employee not found") {
                    return reply.status(404).send({ message: "Employee not found" });
                }
                if (error instanceof Error && error.message === "Employee is already banned") {
                    return reply.status(400).send({ message: "Employee is already banned" });
                }
                return reply.status(500).send({ message: "Internal server error" });
            }
        },
    );
}
