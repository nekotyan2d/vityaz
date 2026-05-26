import { db } from "@/db/client";
import { employeeCategories, roomTypes } from "@/db/schema";
import { eq } from "drizzle-orm";
import type { CategoryDTO, RoomTypeDTO } from "./dictionary.dto";

export class DictionaryRepository {
    findAllCategories(): Promise<CategoryDTO[]> {
        return db
            .select({
                id: employeeCategories.id,
                name: employeeCategories.name,
                description: employeeCategories.description,
                created_at: employeeCategories.createdAt,
            })
            .from(employeeCategories);
    }

    async createCategory(data: { name: string; description?: string }): Promise<CategoryDTO> {
        const result = await db
            .insert(employeeCategories)
            .values({ name: data.name, description: data.description })
            .returning({
                id: employeeCategories.id,
                name: employeeCategories.name,
                description: employeeCategories.description,
                created_at: employeeCategories.createdAt,
            });
        return result[0]!;
    }

    async updateCategory(id: number, data: { name?: string; description?: string }): Promise<CategoryDTO | null> {
        const result = await db
            .update(employeeCategories)
            .set({ ...(data.name && { name: data.name }), ...(data.description !== undefined && { description: data.description }) })
            .where(eq(employeeCategories.id, id))
            .returning({
                id: employeeCategories.id,
                name: employeeCategories.name,
                description: employeeCategories.description,
                created_at: employeeCategories.createdAt,
            });
        return result[0] ?? null;
    }

    findAllRoomTypes(): Promise<RoomTypeDTO[]> {
        return db
            .select({
                id: roomTypes.id,
                name: roomTypes.name,
                description: roomTypes.description,
                created_at: roomTypes.createdAt,
            })
            .from(roomTypes);
    }

    async createRoomType(data: { name: string; description?: string }): Promise<RoomTypeDTO> {
        const result = await db
            .insert(roomTypes)
            .values({ name: data.name, description: data.description })
            .returning({
                id: roomTypes.id,
                name: roomTypes.name,
                description: roomTypes.description,
                created_at: roomTypes.createdAt,
            });
        return result[0]!;
    }

    async updateRoomType(id: number, data: { name?: string; description?: string }): Promise<RoomTypeDTO | null> {
        const result = await db
            .update(roomTypes)
            .set({ ...(data.name && { name: data.name }), ...(data.description !== undefined && { description: data.description }) })
            .where(eq(roomTypes.id, id))
            .returning({
                id: roomTypes.id,
                name: roomTypes.name,
                description: roomTypes.description,
                created_at: roomTypes.createdAt,
            });
        return result[0] ?? null;
    }
}