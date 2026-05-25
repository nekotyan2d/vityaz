import type { FastifySchema } from "fastify";
import {
    AccessLogFiltersSchema,
    CheckAccessRequestSchema,
    CheckAccessResponseSchema,
    GetAccessLogResponseSchema,
    GetAccessMatrixResponseSchema,
    GetPersonalAccessResponseSchema,
    GrantPersonalAccessRequestSchema,
    ToggleMatrixRuleRequestSchema,
    ToggleMatrixRuleResponseSchema,
} from "./access.dto";
import z from "zod";

export const CheckAccessSchema: FastifySchema = {
    description: "Check room access by QR token",
    tags: ["access"],
    body: CheckAccessRequestSchema,
    response: { 200: CheckAccessResponseSchema },
};

export const GetAccessLogSchema: FastifySchema = {
    description: "Get access log (admin)",
    tags: ["access"],
    querystring: AccessLogFiltersSchema,
    response: { 200: GetAccessLogResponseSchema },
};

export const GetMyAccessLogSchema: FastifySchema = {
    description: "Get my access log",
    tags: ["access"],
    querystring: AccessLogFiltersSchema.omit({ employee_id: true }),
    response: { 200: GetAccessLogResponseSchema },
};

export const GetAccessMatrixSchema: FastifySchema = {
    description: "Get access matrix",
    tags: ["access"],
    response: { 200: GetAccessMatrixResponseSchema },
};

export const ToggleMatrixRuleSchema: FastifySchema = {
    description: "Toggle access matrix rule",
    tags: ["access"],
    body: ToggleMatrixRuleRequestSchema,
    response: { 200: ToggleMatrixRuleResponseSchema },
};

export const GetPersonalAccessSchema: FastifySchema = {
    description: "Get personal access for employee",
    tags: ["access"],
    params: z.object({ employeeId: z.coerce.number() }),
    response: { 200: GetPersonalAccessResponseSchema },
};

export const GrantPersonalAccessSchema: FastifySchema = {
    description: "Grant personal access",
    tags: ["access"],
    body: GrantPersonalAccessRequestSchema,
};

export const RevokePersonalAccessSchema: FastifySchema = {
    description: "Revoke personal access",
    tags: ["access"],
    params: z.object({
        employeeId: z.coerce.number(),
        roomId: z.coerce.number(),
    }),
};