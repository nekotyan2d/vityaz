import type { FastifySchema } from "fastify";
import {
    CreateFloorRequestSchema,
    CreateRoomRequestSchema,
    FloorResponseSchema,
    GetFloorsResponseSchema,
    GetRoomsResponseSchema,
    RoomResponseSchema,
    UpdateFloorRequestSchema,
    UpdateRoomRequestSchema,
} from "./building.dto";
import z from "zod";

const IdParam = z.object({ id: z.coerce.number() });

export const GetFloorsSchema: FastifySchema = {
    description: "Get all floors",
    tags: ["building"],
    response: { 200: GetFloorsResponseSchema },
};

export const CreateFloorSchema: FastifySchema = {
    description: "Create floor",
    tags: ["building"],
    body: CreateFloorRequestSchema,
    response: { 201: FloorResponseSchema },
};

export const UpdateFloorSchema: FastifySchema = {
    description: "Update floor",
    tags: ["building"],
    params: IdParam,
    body: UpdateFloorRequestSchema,
    response: { 200: FloorResponseSchema },
};

export const GetRoomsSchema: FastifySchema = {
    description: "Get all rooms",
    tags: ["building"],
    response: { 200: GetRoomsResponseSchema },
};

export const CreateRoomSchema: FastifySchema = {
    description: "Create room",
    tags: ["building"],
    body: CreateRoomRequestSchema,
    response: { 201: RoomResponseSchema },
};

export const UpdateRoomSchema: FastifySchema = {
    description: "Update room",
    tags: ["building"],
    params: IdParam,
    body: UpdateRoomRequestSchema,
    response: { 200: RoomResponseSchema },
};

export const GetRoomQrSchema: FastifySchema = {
    description: "Get room QR code",
    tags: ["building"],
    params: IdParam,
};
