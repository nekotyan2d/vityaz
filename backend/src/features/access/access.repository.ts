import { db } from "@/db/client";
import { accessLog, categoryAccessRules, employeeCategories, employees, employeesBans, floors, personalAccess, rooms, roomTypes } from "@/db/schema";
import { and, desc, eq, gte, lte } from "drizzle-orm";
import type { AccessLogFilters } from "./access.dto";

export class AccessRepository {
    constructor() {}

    async findRoomByQrToken(qrToken: string) {
        const result = await db
            .select({ id: rooms.id, number: rooms.number, roomTypeId: rooms.roomTypeId })
            .from(rooms)
            .where(eq(rooms.qrToken, qrToken))
            .limit(1);
        return result[0] ?? null;
    }

    async findEmployeeById(id: number) {
        const result = await db
            .select({ id: employees.id, fullName: employees.fullName, categoryId: employees.categoryId })
            .from(employees)
            .where(eq(employees.id, id))
            .limit(1);
        return result[0] ?? null;
    }

    async findActiveBan(employeeId: number) {
        const result = await db
            .select({ id: employeesBans.id })
            .from(employeesBans)
            .where(eq(employeesBans.employeeId, employeeId))
            .limit(1);
        return result[0] ?? null;
    }

    async findLastAccessEvent(employeeId: number, roomId: number) {
        const result = await db
            .select({ direction: accessLog.direction, status: accessLog.status })
            .from(accessLog)
            .where(and(eq(accessLog.employeeId, employeeId), eq(accessLog.roomId, roomId)))
            .orderBy(desc(accessLog.createdAt))
            .limit(1);
        return result[0] ?? null;
    }

    async findPersonalAccess(employeeId: number, roomId: number) {
        const result = await db
            .select({ id: personalAccess.id })
            .from(personalAccess)
            .where(and(eq(personalAccess.employeeId, employeeId), eq(personalAccess.roomId, roomId)))
            .limit(1);
        return result[0] ?? null;
    }

    async findCategoryAccess(categoryId: number, roomTypeId: number) {
        const result = await db
            .select({ id: categoryAccessRules.id })
            .from(categoryAccessRules)
            .where(
                and(
                    eq(categoryAccessRules.categoryId, categoryId),
                    eq(categoryAccessRules.roomTypeId, roomTypeId),
                ),
            )
            .limit(1);
        return result[0] ?? null;
    }

    async createAccessLog(data: {
        employeeId: number;
        roomId: number;
        direction: "in" | "out";
        status: "allowed" | "denied" | "violation";
        denyReason?: string | undefined;
    }) {
        await db.insert(accessLog).values(data);
    }

    async findAccessLog(filters: AccessLogFilters) {
        return db
            .select({
                id: accessLog.id,
                employee_name: employees.fullName,
                room_number: rooms.number,
                floor_number: floors.number,
                direction: accessLog.direction,
                status: accessLog.status,
                deny_reason: accessLog.denyReason,
                created_at: accessLog.createdAt,
            })
            .from(accessLog)
            .innerJoin(employees, eq(employees.id, accessLog.employeeId))
            .innerJoin(rooms, eq(rooms.id, accessLog.roomId))
            .innerJoin(floors, eq(floors.id, rooms.floorId))
            .where(
                and(
                    filters.employee_id !== undefined ? eq(accessLog.employeeId, filters.employee_id) : undefined,
                    filters.room_id !== undefined ? eq(accessLog.roomId, filters.room_id) : undefined,
                    filters.status !== undefined ? eq(accessLog.status, filters.status) : undefined,
                    filters.date_from !== undefined ? gte(accessLog.createdAt, filters.date_from) : undefined,
                    filters.date_to !== undefined ? lte(accessLog.createdAt, filters.date_to) : undefined,
                ),
            )
            .orderBy(desc(accessLog.createdAt));
    }

    async findAccessMatrix() {
        return db
            .select({
                id: categoryAccessRules.id,
                category_id: categoryAccessRules.categoryId,
                category: employeeCategories.name,
                room_type_id: categoryAccessRules.roomTypeId,
                room_type: roomTypes.name,
            })
            .from(categoryAccessRules)
            .innerJoin(employeeCategories, eq(employeeCategories.id, categoryAccessRules.categoryId))
            .innerJoin(roomTypes, eq(roomTypes.id, categoryAccessRules.roomTypeId))
            .orderBy(categoryAccessRules.categoryId, categoryAccessRules.roomTypeId);
    }

    async toggleAccessRule(categoryId: number, roomTypeId: number) {
        const existing = await db
            .select({ id: categoryAccessRules.id })
            .from(categoryAccessRules)
            .where(
                and(
                    eq(categoryAccessRules.categoryId, categoryId),
                    eq(categoryAccessRules.roomTypeId, roomTypeId),
                ),
            )
            .limit(1);

        if (existing[0]) {
            await db.delete(categoryAccessRules).where(eq(categoryAccessRules.id, existing[0].id));
            return { added: false };
        } else {
            await db.insert(categoryAccessRules).values({ categoryId, roomTypeId });
            return { added: true };
        }
    }

    async findPersonalAccessByEmployee(employeeId: number) {
        return db
            .select({
                id: personalAccess.id,
                room_id: personalAccess.roomId,
                room_number: rooms.number,
                room_type: roomTypes.name,
                floor_number: floors.number,
                note: personalAccess.note,
                granted_at: personalAccess.grantedAt,
            })
            .from(personalAccess)
            .innerJoin(rooms, eq(rooms.id, personalAccess.roomId))
            .innerJoin(roomTypes, eq(roomTypes.id, rooms.roomTypeId))
            .innerJoin(floors, eq(floors.id, rooms.floorId))
            .where(eq(personalAccess.employeeId, employeeId));
    }

    async grantPersonalAccess(employeeId: number, roomId: number, note?: string | undefined) {
        await db.insert(personalAccess).values({ employeeId, roomId, note });
    }

    async revokePersonalAccess(employeeId: number, roomId: number) {
        const result = await db
            .delete(personalAccess)
            .where(and(eq(personalAccess.employeeId, employeeId), eq(personalAccess.roomId, roomId)))
            .returning({ id: personalAccess.id });
        return result[0] ?? null;
    }
}
