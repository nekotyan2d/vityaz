import type { FastifyInstance } from "fastify";
import type { ZodTypeProvider } from "fastify-type-provider-zod";
import { authenticate } from "@/middleware/authenticate";
import { adminOnly } from "@/middleware/admin-only";
import { AccessService } from "./access.service";
import { AccessRepository } from "./access.repository";
import {
    CheckAccessSchema,
    GetAccessLogSchema,
    GetAccessMatrixSchema,
    GetMyAccessLogSchema,
    GetPersonalAccessSchema,
    GrantPersonalAccessSchema,
    RevokePersonalAccessSchema,
    ToggleMatrixRuleSchema,
} from "./access.schema";
import type { AccessLogFilters, CheckAccessRequest, GrantPersonalAccessRequest, ToggleMatrixRuleRequest } from "./access.dto";

export function registerAccessRoutes(app: FastifyInstance) {
    app.withTypeProvider<ZodTypeProvider>().post(
        "/access/check",
        { preHandler: authenticate, schema: CheckAccessSchema },
        async (request, reply) => {
            try {
                const { qr_token, direction } = request.body as CheckAccessRequest;
                const service = new AccessService(new AccessRepository());
                const result = await service.checkAccess(request.user.employeeId, qr_token, direction);
                return result;
            } catch (error) {
                if (error instanceof Error && error.message === "Room not found") {
                    return reply.status(404).send({ message: "Room not found" });
                }
                return reply.status(500).send({ message: "Internal server error" });
            }
        },
    );

    app.withTypeProvider<ZodTypeProvider>().get(
        "/access/log",
        { preHandler: [authenticate, adminOnly], schema: GetAccessLogSchema },
        async (request, reply) => {
            try {
                const filters = request.query as AccessLogFilters;
                const service = new AccessService(new AccessRepository());
                const log = await service.getAccessLog(filters);
                return { log };
            } catch {
                return reply.status(500).send({ message: "Internal server error" });
            }
        },
    );

    app.withTypeProvider<ZodTypeProvider>().get(
        "/access/log/my",
        { preHandler: authenticate, schema: GetMyAccessLogSchema },
        async (request, reply) => {
            try {
                const filters = request.query as Omit<AccessLogFilters, "employee_id">;
                const service = new AccessService(new AccessRepository());
                const log = await service.getMyAccessLog(request.user.employeeId, filters);
                return { log };
            } catch {
                return reply.status(500).send({ message: "Internal server error" });
            }
        },
    );

    app.withTypeProvider<ZodTypeProvider>().get(
        "/access-matrix",
        { preHandler: [authenticate, adminOnly], schema: GetAccessMatrixSchema },
        async (_request, reply) => {
            try {
                const service = new AccessService(new AccessRepository());
                const rules = await service.getAccessMatrix();
                return { rules };
            } catch {
                return reply.status(500).send({ message: "Internal server error" });
            }
        },
    );

    app.withTypeProvider<ZodTypeProvider>().post(
        "/access-matrix/toggle",
        { preHandler: [authenticate, adminOnly], schema: ToggleMatrixRuleSchema },
        async (request, reply) => {
            try {
                const { category_id, room_type_id } = request.body as ToggleMatrixRuleRequest;
                const service = new AccessService(new AccessRepository());
                const result = await service.toggleMatrixRule(category_id, room_type_id);
                return result;
            } catch {
                return reply.status(500).send({ message: "Internal server error" });
            }
        },
    );

    app.withTypeProvider<ZodTypeProvider>().get(
        "/access/personal/:employeeId",
        { preHandler: [authenticate, adminOnly], schema: GetPersonalAccessSchema },
        async (request, reply) => {
            try {
                const { employeeId } = request.params as { employeeId: number };
                const service = new AccessService(new AccessRepository());
                const access = await service.getPersonalAccess(employeeId);
                return { access };
            } catch {
                return reply.status(500).send({ message: "Internal server error" });
            }
        },
    );

    app.withTypeProvider<ZodTypeProvider>().post(
        "/access/personal",
        { preHandler: [authenticate, adminOnly], schema: GrantPersonalAccessSchema },
        async (request, reply) => {
            try {
                const { employee_id, room_id, note } = request.body as GrantPersonalAccessRequest;
                const service = new AccessService(new AccessRepository());
                await service.grantPersonalAccess(employee_id, room_id, note);
                return reply.status(204).send();
            } catch {
                return reply.status(500).send({ message: "Internal server error" });
            }
        },
    );

    app.withTypeProvider<ZodTypeProvider>().delete(
        "/access/personal/:employeeId/:roomId",
        { preHandler: [authenticate, adminOnly], schema: RevokePersonalAccessSchema },
        async (request, reply) => {
            try {
                const { employeeId, roomId } = request.params as { employeeId: number; roomId: number };
                const service = new AccessService(new AccessRepository());
                await service.revokePersonalAccess(employeeId, roomId);
                return reply.status(204).send();
            } catch (error) {
                if (error instanceof Error && error.message === "Personal access not found") {
                    return reply.status(404).send({ message: "Personal access not found" });
                }
                return reply.status(500).send({ message: "Internal server error" });
            }
        },
    );
}