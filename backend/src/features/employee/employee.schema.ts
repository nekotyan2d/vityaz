import type { FastifySchema } from "fastify";
import {
    BanEmployeeRequestSchema,
    CreateEmployeeRequestSchema,
    GetEmployeeByIdResponseSchema,
    GetEmployeesResponseSchema,
} from "./employee.dto";
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

export const CreateEmployeeSchema: FastifySchema = {
    description: "Create employee",
    tags: ["employee"],
    body: CreateEmployeeRequestSchema,
    response: {
        201: GetEmployeeByIdResponseSchema,
    },
};

export const BanEmployeeSchema: FastifySchema = {
    description: "Ban employee",
    tags: ["employee"],
    params: z.object({
        id: z.coerce.number(),
    }),
    body: BanEmployeeRequestSchema,
};
