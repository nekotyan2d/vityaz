import type { FastifyInstance } from "fastify";
import z from "zod";
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
        (request, reply) => {
            const { roomId } = request.params as { roomId: number };

            reply.raw.writeHead(200, {
                "Content-Type": "text/event-stream",
                "Cache-Control": "no-cache",
                "Connection": "keep-alive",
                "X-Accel-Buffering": "no",
            });
            reply.raw.write(": connected\n\n");

            sseService.subscribe(roomId, reply.raw);

            request.socket.on("close", () => {
                sseService.unsubscribe(roomId, reply.raw);
            });

            reply.hijack();
        },
    );
}
