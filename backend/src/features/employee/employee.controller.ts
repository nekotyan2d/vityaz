import type { FastifyInstance } from "fastify";
import type { ZodTypeProvider } from "fastify-type-provider-zod";
import { GetEmployeeByIdSchema, GetEmployeesSchema } from "./employee.schema";
import { authenticate } from "@/middleware/authenticate";
import { EmployeeService } from "./employee.service";
import { EmployeeRepository } from "./employee.repository";

export function registerEmployeeRoutes(app: FastifyInstance) {
    app.withTypeProvider<ZodTypeProvider>().get(
        "/employees",
        {
            preHandler: authenticate,
            schema: GetEmployeesSchema,
        },
        async (request, reply) => {
            try {
                const employeeService = new EmployeeService(new EmployeeRepository());
                return await employeeService.findAll();
            } catch (error) {
                // TODO: сделать нормальную обработку ошибок
                return reply.status(500).send({ message: "Internal server error" });
            }
        },
    );

    app.withTypeProvider<ZodTypeProvider>().get(
        "/employees/:id",
        {
            preHandler: authenticate,
            schema: GetEmployeeByIdSchema,
        },
        async (request, reply) => {
            try {
                const { id } = request.params as { id: number };
                const employeeService = new EmployeeService(new EmployeeRepository());
                return await employeeService.findById(id);
            } catch (error) {
                return reply.status(500).send({ message: "Internal server error" });
            }
        },
    );
}
