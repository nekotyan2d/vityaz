import type { FastifyReply, FastifyRequest } from "fastify";

export async function securityOrAdmin(request: FastifyRequest, reply: FastifyReply) {
    if (request.user?.role !== "admin" && request.user?.role !== "security") {
        return reply.status(403).send({ message: "Forbidden" });
    }
}
