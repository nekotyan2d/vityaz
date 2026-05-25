import z from "zod";

export const CheckAccessRequestSchema = z.object({
    qr_token: z.uuid(),
    direction: z.enum(["in", "out"]),
});

export type CheckAccessRequest = z.infer<typeof CheckAccessRequestSchema>;

export const CheckAccessResponseSchema = z.object({
    status: z.enum(["allowed", "denied", "violation"]),
    deny_reason: z.string().nullable(),
});

export const AccessLogEntry = z.object({
    id: z.number(),
    employee_name: z.string(),
    room_number: z.string(),
    floor_number: z.number(),
    direction: z.enum(["in", "out"]),
    status: z.enum(["allowed", "denied", "violation"]),
    deny_reason: z.string().nullable(),
    created_at: z.date(),
});

export const GetAccessLogResponseSchema = z.object({
    log: z.array(AccessLogEntry),
});

export const AccessMatrixRule = z.object({
    id: z.number(),
    category_id: z.number(),
    category: z.string(),
    room_type_id: z.number(),
    room_type: z.string(),
});

export const GetAccessMatrixResponseSchema = z.object({
    rules: z.array(AccessMatrixRule),
});

export const ToggleMatrixRuleRequestSchema = z.object({
    category_id: z.number().int().positive(),
    room_type_id: z.number().int().positive(),
});

export type ToggleMatrixRuleRequest = z.infer<typeof ToggleMatrixRuleRequestSchema>;

export const ToggleMatrixRuleResponseSchema = z.object({
    added: z.boolean(),
});

export const PersonalAccessEntry = z.object({
    id: z.number(),
    room_id: z.number(),
    room_number: z.string(),
    room_type: z.string(),
    floor_number: z.number(),
    note: z.string().nullable(),
    granted_at: z.date(),
});

export const GetPersonalAccessResponseSchema = z.object({
    access: z.array(PersonalAccessEntry),
});

export const GrantPersonalAccessRequestSchema = z.object({
    employee_id: z.number().int().positive(),
    room_id: z.number().int().positive(),
    note: z.string().max(255).optional(),
});

export type GrantPersonalAccessRequest = z.infer<typeof GrantPersonalAccessRequestSchema>;

export const AccessLogFiltersSchema = z.object({
    employee_id: z.coerce.number().optional(),
    room_id: z.coerce.number().optional(),
    status: z.enum(["allowed", "denied", "violation"]).optional(),
    date_from: z.coerce.date().optional(),
    date_to: z.coerce.date().optional(),
});

export type AccessLogFilters = z.infer<typeof AccessLogFiltersSchema>;
