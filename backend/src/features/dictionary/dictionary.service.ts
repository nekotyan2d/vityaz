import type { DictionaryRepository } from "./dictionary.repository";

export class DictionaryService {
    constructor(private repository: DictionaryRepository) {}

    findAllCategories() {
        return this.repository.findAllCategories();
    }

    createCategory(data: { name: string; description?: string }) {
        return this.repository.createCategory(data);
    }

    async updateCategory(id: number, data: { name?: string; description?: string }) {
        const result = await this.repository.updateCategory(id, data);
        if (!result) throw new Error("Category not found");
        return result;
    }

    findAllRoomTypes() {
        return this.repository.findAllRoomTypes();
    }

    createRoomType(data: { name: string; description?: string }) {
        return this.repository.createRoomType(data);
    }

    async updateRoomType(id: number, data: { name?: string; description?: string }) {
        const result = await this.repository.updateRoomType(id, data);
        if (!result) throw new Error("Room type not found");
        return result;
    }
}
