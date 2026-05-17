import type { FastifySchema } from "fastify";
import { GetEmployeeByIdResponseSchema, GetEmployeesResponseSchema } from "./employee.dto";
import z from "zod";

export const GetEmployeesSchema: FastifySchema = {
    description: "Get all employees",
    tags: ["employee"],
    response: {
        200: GetEmployeesResponseSchema,
    },
};

export const GetEmployeeByIdSchema: FastifySchema = {
    description: "Get employee by id",
    tags: ["employee"],
    params: z.object({
        id: z.coerce.number(),
    }),
    response: {
        200: GetEmployeeByIdResponseSchema,
    },
};
