import z from "zod";

export const Floor = z.object({
    id: z.number(),
    number: z.number(),
    description: z.string().nullable(),
});

export type FloorDTO = z.infer<typeof Floor>;

export const Room = z.object({
    id: z.number(),
    number: z.string(),
    name: z.string().nullable(),
    floor_number: z.number(),
    room_type: z.string(),
    qr_token: z.string(),
    created_at: z.date(),
});

export type RoomDTO = z.infer<typeof Room>;

export const GetFloorsResponseSchema = z.object({
    floors: z.array(Floor),
});

export const GetRoomsResponseSchema = z.object({
    rooms: z.array(Room),
});

export const FloorResponseSchema = z.object({
    floor: Floor,
});

export const RoomResponseSchema = z.object({
    room: Room,
});

export const CreateFloorRequestSchema = z.object({
    number: z.number().int().positive(),
    description: z.string().max(255).optional(),
});

export type CreateFloorRequest = z.infer<typeof CreateFloorRequestSchema>;

export const UpdateFloorRequestSchema = z.object({
    number: z.number().int().positive().optional(),
    description: z.string().max(255).optional(),
});

export type UpdateFloorRequest = z.infer<typeof UpdateFloorRequestSchema>;

export const CreateRoomRequestSchema = z.object({
    floor_id: z.number().int().positive(),
    room_type_id: z.number().int().positive(),
    number: z.string().min(1).max(20),
    name: z.string().max(255).optional(),
});

export type CreateRoomRequest = z.infer<typeof CreateRoomRequestSchema>;

export const UpdateRoomRequestSchema = z.object({
    floor_id: z.number().int().positive().optional(),
    room_type_id: z.number().int().positive().optional(),
    number: z.string().min(1).max(20).optional(),
    name: z.string().max(255).optional(),
});

export type UpdateRoomRequest = z.infer<typeof UpdateRoomRequestSchema>;
