import type { FastifySchema } from "fastify";
import {
    Category,
    CreateCategoryRequestSchema,
    CreateRoomTypeRequestSchema,
    RoomType,
    UpdateCategoryRequestSchema,
    UpdateRoomTypeRequestSchema,
} from "./dictionary.dto";
import z from "zod";

export const GetCategoriesSchema: FastifySchema = {
    description: "Get all employee categories",
    tags: ["dictionary"],
    response: {
        200: z.object({ categories: z.array(Category) }),
    },
};

export const CreateCategorySchema: FastifySchema = {
    description: "Create employee category",
    tags: ["dictionary"],
    body: CreateCategoryRequestSchema,
    response: {
        201: z.object({ category: Category }),
    },
};

export const UpdateCategorySchema: FastifySchema = {
    description: "Update employee category",
    tags: ["dictionary"],
    params: z.object({ id: z.coerce.number() }),
    body: UpdateCategoryRequestSchema,
    response: {
        200: z.object({ category: Category }),
    },
};

export const GetRoomTypesSchema: FastifySchema = {
    description: "Get all room types",
    tags: ["dictionary"],
    response: {
        200: z.object({ roomTypes: z.array(RoomType) }),
    },
};

export const CreateRoomTypeSchema: FastifySchema = {
    description: "Create room type",
    tags: ["dictionary"],
    body: CreateRoomTypeRequestSchema,
    response: {
        201: z.object({ roomType: RoomType }),
    },
};

export const UpdateRoomTypeSchema: FastifySchema = {
    description: "Update room type",
    tags: ["dictionary"],
    params: z.object({ id: z.coerce.number() }),
    body: UpdateRoomTypeRequestSchema,
    response: {
        200: z.object({ roomType: RoomType }),
    },
};
