import type { FastifyReply, FastifyRequest } from "fastify";

export async function adminOnly(request: FastifyRequest, reply: FastifyReply) {
    if (request.user?.role !== "admin") {
        return reply.status(403).send({ message: "Forbidden" });
    }
}
