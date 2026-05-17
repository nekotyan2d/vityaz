import { verifyAccessToken } from "@/utils/jwt";
import type { FastifyReply, FastifyRequest } from "fastify";

export async function authenticate(request: FastifyRequest, reply: FastifyReply) {
    const accessToken = request.cookies.access_token;

    if (!accessToken) {
        return reply.status(401).send({ message: "Unauthorized" });
    }

    const payload = verifyAccessToken(accessToken);

    if (!payload) {
        return reply.status(401).send({ message: "Unauthorized" });
    }

    request.user = payload as { id: number };
}
