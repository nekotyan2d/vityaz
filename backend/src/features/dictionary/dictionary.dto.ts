import z from "zod";

export const Category = z.object({
    id: z.number(),
    name: z.string(),
    description: z.string().nullable(),
    created_at: z.date(),
});

export type CategoryDTO = z.infer<typeof Category>;

export const RoomType = z.object({
    id: z.number(),
    name: z.string(),
    description: z.string().nullable(),
    created_at: z.date(),
});

export type RoomTypeDTO = z.infer<typeof RoomType>;

export const CreateCategoryRequestSchema = z.object({
    name: z.string().min(1).max(100),
    description: z.string().max(255).optional(),
});

export type CreateCategoryRequest = z.infer<typeof CreateCategoryRequestSchema>;

export const UpdateCategoryRequestSchema = z.object({
    name: z.string().min(1).max(100).optional(),
    description: z.string().max(255).optional(),
});

export type UpdateCategoryRequest = z.infer<typeof UpdateCategoryRequestSchema>;

export const CreateRoomTypeRequestSchema = z.object({
    name: z.string().min(1).max(100),
    description: z.string().max(255).optional(),
});

export type CreateRoomTypeRequest = z.infer<typeof CreateRoomTypeRequestSchema>;

export const UpdateRoomTypeRequestSchema = z.object({
    name: z.string().min(1).max(100).optional(),
    description: z.string().max(255).optional(),
});

export type UpdateRoomTypeRequest = z.infer<typeof UpdateRoomTypeRequestSchema>;
