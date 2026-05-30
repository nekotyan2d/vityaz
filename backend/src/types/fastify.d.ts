import "fastify";

declare module "fastify" {
    interface FastifyRequest {
        user: {
            employeeId: number;
            role: "admin" | "employee" | "security";
        };
    }
}
