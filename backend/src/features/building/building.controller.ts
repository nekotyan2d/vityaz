import type { FastifyInstance } from "fastify";
import type { ZodTypeProvider } from "fastify-type-provider-zod";
import { authenticate } from "@/middleware/authenticate";
import { adminOnly } from "@/middleware/admin-only";
import { BuildingService } from "./building.service";
import { BuildingRepository } from "./building.repository";
import {
    CreateFloorSchema,
    CreateRoomSchema,
    GetFloorsSchema,
    GetRoomQrSchema,
    GetRoomsSchema,
    UpdateFloorSchema,
    UpdateRoomSchema,
} from "./building.schema";
import type { CreateFloorRequest, CreateRoomRequest, UpdateFloorRequest, UpdateRoomRequest } from "./building.dto";

export function registerBuildingRoutes(app: FastifyInstance) {
    app.withTypeProvider<ZodTypeProvider>().get(
        "/floors",
        { preHandler: [authenticate, adminOnly], schema: GetFloorsSchema },
        async (_request, reply) => {
            try {
                const service = new BuildingService(new BuildingRepository());
                const floors = await service.findAllFloors();
                return { floors };
            } catch {
                return reply.status(500).send({ message: "Internal server error" });
            }
        },
    );

    app.withTypeProvider<ZodTypeProvider>().post(
        "/floors",
        { preHandler: [authenticate, adminOnly], schema: CreateFloorSchema },
        async (request, reply) => {
            try {
                const body = request.body as CreateFloorRequest;
                const service = new BuildingService(new BuildingRepository());
                const floor = await service.createFloor({ number: body.number, description: body.description });
                return reply.status(201).send({ floor });
            } catch {
                return reply.status(500).send({ message: "Internal server error" });
            }
        },
    );

    app.withTypeProvider<ZodTypeProvider>().patch(
        "/floors/:id",
        { preHandler: [authenticate, adminOnly], schema: UpdateFloorSchema },
        async (request, reply) => {
            try {
                const { id } = request.params as { id: number };
                const body = request.body as UpdateFloorRequest;
                const service = new BuildingService(new BuildingRepository());
                const floor = await service.updateFloor(id, body);
                return { floor };
            } catch (error) {
                if (error instanceof Error && error.message === "Floor not found") {
                    return reply.status(404).send({ message: "Floor not found" });
                }
                return reply.status(500).send({ message: "Internal server error" });
            }
        },
    );

    app.withTypeProvider<ZodTypeProvider>().get(
        "/rooms",
        { preHandler: [authenticate, adminOnly], schema: GetRoomsSchema },
        async (_request, reply) => {
            try {
                const service = new BuildingService(new BuildingRepository());
                const rooms = await service.findAllRooms();
                return { rooms };
            } catch {
                return reply.status(500).send({ message: "Internal server error" });
            }
        },
    );

    app.withTypeProvider<ZodTypeProvider>().post(
        "/rooms",
        { preHandler: [authenticate, adminOnly], schema: CreateRoomSchema },
        async (request, reply) => {
            try {
                const body = request.body as CreateRoomRequest;
                const service = new BuildingService(new BuildingRepository());
                const room = await service.createRoom({
                    floorId: body.floor_id,
                    roomTypeId: body.room_type_id,
                    number: body.number,
                    name: body.name,
                });
                return reply.status(201).send({ room });
            } catch {
                return reply.status(500).send({ message: "Internal server error" });
            }
        },
    );

    app.withTypeProvider<ZodTypeProvider>().patch(
        "/rooms/:id",
        { preHandler: [authenticate, adminOnly], schema: UpdateRoomSchema },
        async (request, reply) => {
            try {
                const { id } = request.params as { id: number };
                const body = request.body as UpdateRoomRequest;
                const service = new BuildingService(new BuildingRepository());
                const room = await service.updateRoom(id, {
                    floorId: body.floor_id,
                    roomTypeId: body.room_type_id,
                    number: body.number,
                    name: body.name,
                });
                return { room };
            } catch (error) {
                if (error instanceof Error && error.message === "Room not found") {
                    return reply.status(404).send({ message: "Room not found" });
                }
                return reply.status(500).send({ message: "Internal server error" });
            }
        },
    );

    app.withTypeProvider<ZodTypeProvider>().get(
        "/rooms/:id/qr",
        { preHandler: [authenticate, adminOnly], schema: GetRoomQrSchema },
        async (request, reply) => {
            try {
                const { id } = request.params as { id: number };
                const service = new BuildingService(new BuildingRepository());
                const buffer = await service.generateQr(id);
                return reply.header("Content-Type", "image/png").send(buffer);
            } catch (error) {
                if (error instanceof Error && error.message === "Room not found") {
                    return reply.status(404).send({ message: "Room not found" });
                }
                return reply.status(500).send({ message: "Internal server error" });
            }
        },
    );
}
