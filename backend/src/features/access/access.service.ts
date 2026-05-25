import { sseService } from "../sse/sse.service";
import type { AccessRepository } from "./access.repository";
import type { AccessLogFilters } from "./access.dto";

export class AccessService {
    constructor(private repository: AccessRepository) {}

    private async detectViolation(employeeId: number, roomId: number, direction: "in" | "out") {
        const last = await this.repository.findLastAccessEvent(employeeId, roomId);

        if (!last) {
            return direction === "out" ? "Выход без входа" : null;
        }

        if (direction === "in" && last.direction === "in" && last.status === "allowed") {
            return "Повторный вход без выхода";
        }

        if (direction === "out" && last.direction === "out") {
            return "Повторный выход без входа";
        }

        return null;
    }

    async checkAccess(employeeId: number, qrToken: string, direction: "in" | "out") {
        const room = await this.repository.findRoomByQrToken(qrToken);
        if (!room) {
            throw new Error("Room not found");
        }

        const employee = await this.repository.findEmployeeById(employeeId);
        if (!employee) {
            throw new Error("Employee not found");
        }

        let status: "allowed" | "denied" | "violation";
        let denyReason: string | undefined;

        const ban = await this.repository.findActiveBan(employeeId);
        if (ban) {
            status = "denied";
            denyReason = "Учётная запись заблокирована";
        } else {
            const violation = await this.detectViolation(employeeId, room.id, direction);
            if (violation) {
                status = "violation";
                denyReason = violation;
            } else {
                const personal = await this.repository.findPersonalAccess(employeeId, room.id);
                if (personal) {
                    status = "allowed";
                } else {
                    const categoryRule = await this.repository.findCategoryAccess(employee.categoryId, room.roomTypeId);
                    status = categoryRule ? "allowed" : "denied";
                    if (!categoryRule) denyReason = "Недостаточно прав";
                }
            }
        }

        await this.repository.createAccessLog({ employeeId, roomId: room.id, direction, status, denyReason });

        sseService.broadcast(room.id, {
            allowed: status === "allowed",
            employeeFullName: employee.fullName,
            room: room.number,
            direction,
        });

        return { status, deny_reason: denyReason ?? null };
    }

    async getAccessLog(filters: AccessLogFilters) {
        return this.repository.findAccessLog(filters);
    }

    async getMyAccessLog(employeeId: number, filters: Omit<AccessLogFilters, "employee_id">) {
        return this.repository.findAccessLog({ ...filters, employee_id: employeeId });
    }

    async getAccessMatrix() {
        return this.repository.findAccessMatrix();
    }

    async toggleMatrixRule(categoryId: number, roomTypeId: number) {
        return this.repository.toggleAccessRule(categoryId, roomTypeId);
    }

    async getPersonalAccess(employeeId: number) {
        return this.repository.findPersonalAccessByEmployee(employeeId);
    }

    async grantPersonalAccess(employeeId: number, roomId: number, note?: string | undefined) {
        await this.repository.grantPersonalAccess(employeeId, roomId, note);
    }

    async revokePersonalAccess(employeeId: number, roomId: number) {
        const result = await this.repository.revokePersonalAccess(employeeId, roomId);
        if (!result) {
            throw new Error("Personal access not found");
        }
    }
}
