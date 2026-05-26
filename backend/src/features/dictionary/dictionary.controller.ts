import type { FastifyInstance } from "fastify";
import type { ZodTypeProvider } from "fastify-type-provider-zod";
import { authenticate } from "@/middleware/authenticate";
import { adminOnly } from "@/middleware/admin-only";
import { DictionaryService } from "./dictionary.service";
import { DictionaryRepository } from "./dictionary.repository";
import {
    CreateCategorySchema,
    CreateRoomTypeSchema,
    GetCategoriesSchema,
    GetRoomTypesSchema,
    UpdateCategorySchema,
    UpdateRoomTypeSchema,
} from "./dictionary.schema";
import type { CreateCategoryRequest, CreateRoomTypeRequest, UpdateCategoryRequest, UpdateRoomTypeRequest } from "./dictionary.dto";

export function registerDictionaryRoutes(app: FastifyInstance) {
    app.withTypeProvider<ZodTypeProvider>().get(
        "/dictionary/categories",
        { preHandler: [authenticate, adminOnly], schema: GetCategoriesSchema },
        async (_request, reply) => {
            try {
                const service = new DictionaryService(new DictionaryRepository());
                const categories = await service.findAllCategories();
                return { categories };
            } catch {
                return reply.status(500).send({ message: "Internal server error" });
            }
        },
    );

    app.withTypeProvider<ZodTypeProvider>().post(
        "/dictionary/categories",
        { preHandler: [authenticate, adminOnly], schema: CreateCategorySchema },
        async (request, reply) => {
            try {
                const body = request.body as CreateCategoryRequest;
                const service = new DictionaryService(new DictionaryRepository());
                const category = await service.createCategory(body);
                return reply.status(201).send({ category });
            } catch {
                return reply.status(500).send({ message: "Internal server error" });
            }
        },
    );

    app.withTypeProvider<ZodTypeProvider>().patch(
        "/dictionary/categories/:id",
        { preHandler: [authenticate, adminOnly], schema: UpdateCategorySchema },
        async (request, reply) => {
            try {
                const { id } = request.params as { id: number };
                const body = request.body as UpdateCategoryRequest;
                const service = new DictionaryService(new DictionaryRepository());
                const category = await service.updateCategory(id, body);
                return { category };
            } catch (error) {
                if (error instanceof Error && error.message === "Category not found") {
                    return reply.status(404).send({ message: "Category not found" });
                }
                return reply.status(500).send({ message: "Internal server error" });
            }
        },
    );

    app.withTypeProvider<ZodTypeProvider>().get(
        "/dictionary/room-types",
        { preHandler: [authenticate, adminOnly], schema: GetRoomTypesSchema },
        async (_request, reply) => {
            try {
                const service = new DictionaryService(new DictionaryRepository());
                const roomTypes = await service.findAllRoomTypes();
                return { roomTypes };
            } catch {
                return reply.status(500).send({ message: "Internal server error" });
            }
        },
    );

    app.withTypeProvider<ZodTypeProvider>().post(
        "/dictionary/room-types",
        { preHandler: [authenticate, adminOnly], schema: CreateRoomTypeSchema },
        async (request, reply) => {
            try {
                const body = request.body as CreateRoomTypeRequest;
                const service = new DictionaryService(new DictionaryRepository());
                const roomType = await service.createRoomType(body);
                return reply.status(201).send({ roomType });
            } catch {
                return reply.status(500).send({ message: "Internal server error" });
            }
        },
    );

    app.withTypeProvider<ZodTypeProvider>().patch(
        "/dictionary/room-types/:id",
        { preHandler: [authenticate, adminOnly], schema: UpdateRoomTypeSchema },
        async (request, reply) => {
            try {
                const { id } = request.params as { id: number };
                const body = request.body as UpdateRoomTypeRequest;
                const service = new DictionaryService(new DictionaryRepository());
                const roomType = await service.updateRoomType(id, body);
                return { roomType };
            } catch (error) {
                if (error instanceof Error && error.message === "Room type not found") {
                    return reply.status(404).send({ message: "Room type not found" });
                }
                return reply.status(500).send({ message: "Internal server error" });
            }
        },
    );
}
