import { db } from "@/db/client";
import { floors, rooms, roomTypes } from "@/db/schema";
import { eq } from "drizzle-orm";
import type { FloorDTO, RoomDTO } from "./building.dto";

export class BuildingRepository {
    constructor() {}

    async findAllFloors(): Promise<FloorDTO[]> {
        return db.select().from(floors).orderBy(floors.number);
    }

    async findFloorById(id: number): Promise<FloorDTO | null> {
        const result = await db.select().from(floors).where(eq(floors.id, id)).limit(1);
        return result[0] ?? null;
    }

    async createFloor(data: { number: number; description?: string | undefined }) {
        const result = await db
            .insert(floors)
            .values({ number: data.number, description: data.description })
            .returning();
        return result[0]!;
    }

    async updateFloor(id: number, data: { number?: number | undefined; description?: string | undefined }) {
        const result = await db.update(floors).set(data).where(eq(floors.id, id)).returning();
        return result[0] ?? null;
    }

    async findAllRooms(): Promise<RoomDTO[]> {
        return db
            .select({
                id: rooms.id,
                number: rooms.number,
                name: rooms.name,
                floor_number: floors.number,
                room_type: roomTypes.name,
                qr_token: rooms.qrToken,
                created_at: rooms.createdAt,
            })
            .from(rooms)
            .innerJoin(floors, eq(floors.id, rooms.floorId))
            .innerJoin(roomTypes, eq(roomTypes.id, rooms.roomTypeId))
            .orderBy(floors.number, rooms.number);
    }

    async findRoomById(id: number): Promise<RoomDTO | null> {
        const result = await db
            .select({
                id: rooms.id,
                number: rooms.number,
                name: rooms.name,
                floor_number: floors.number,
                room_type: roomTypes.name,
                qr_token: rooms.qrToken,
                created_at: rooms.createdAt,
            })
            .from(rooms)
            .innerJoin(floors, eq(floors.id, rooms.floorId))
            .innerJoin(roomTypes, eq(roomTypes.id, rooms.roomTypeId))
            .where(eq(rooms.id, id))
            .limit(1);
        return result[0] ?? null;
    }

    async findRoomRawById(id: number) {
        const result = await db.select().from(rooms).where(eq(rooms.id, id)).limit(1);
        return result[0] ?? null;
    }

    async createRoom(data: { floorId: number; roomTypeId: number; number: string; name?: string | undefined }) {
        const result = await db
            .insert(rooms)
            .values({
                floorId: data.floorId,
                roomTypeId: data.roomTypeId,
                number: data.number,
                name: data.name,
            })
            .returning({ id: rooms.id });
        return result[0]!;
    }

    async updateRoom(id: number, data: { floorId?: number | undefined; roomTypeId?: number | undefined; number?: string | undefined; name?: string | undefined }) {
        const result = await db.update(rooms).set(data).where(eq(rooms.id, id)).returning({ id: rooms.id });
        return result[0] ?? null;
    }
}
