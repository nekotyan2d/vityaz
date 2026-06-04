import type { FastifyInstance } from "fastify";
import z from "zod";
import { env } from "@/env";
import { BuildingService } from "../building/building.service";
import { BuildingRepository } from "../building/building.repository";
import { sseService } from "./sse.service";

export function registerSseRoutes(app: FastifyInstance) {
    app.get(
        "/sse/:roomId",
        {
            schema: {
                description: "SSE stream for door display",
                tags: ["sse"],
                params: z.object({ roomId: z.coerce.number() }),
            },
        },
        async (request, reply) => {
            const { roomId } = request.params as { roomId: number };

            const room = await new BuildingService(new BuildingRepository()).findRoomById(roomId);

            reply.raw.writeHead(200, {
                "Content-Type": "text/event-stream",
                "Cache-Control": "no-cache",
                "Connection": "keep-alive",
                "X-Accel-Buffering": "no",
                "Access-Control-Allow-Origin": env.FRONTEND_URL,
                "Access-Control-Allow-Credentials": "true",
            });

            if (room) {
                const roomInfo = JSON.stringify({
                    number: room.number,
                    name: room.name,
                    type: room.room_type,
                });
                reply.raw.write(`event: room-info\ndata: ${roomInfo}\n\n`);
            }

            sseService.subscribe(roomId, reply.raw);

            request.socket.on("close", () => {
                sseService.unsubscribe(roomId, reply.raw);
            });

            reply.hijack();
        },
    );
}
