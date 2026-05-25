import QRCode from "qrcode";
import type { BuildingRepository } from "./building.repository";

export class BuildingService {
    constructor(private repository: BuildingRepository) {}

    async findAllFloors() {
        return this.repository.findAllFloors();
    }

    async findFloorById(id: number) {
        return this.repository.findFloorById(id);
    }

    async createFloor(data: { number: number; description?: string | undefined }) {
        return this.repository.createFloor(data);
    }

    async updateFloor(id: number, data: { number?: number | undefined; description?: string | undefined }) {
        const floor = await this.repository.findFloorById(id);
        if (!floor) {
            throw new Error("Floor not found");
        }
        return this.repository.updateFloor(id, data);
    }

    async findAllRooms() {
        return this.repository.findAllRooms();
    }

    async findRoomById(id: number) {
        return this.repository.findRoomById(id);
    }

    async createRoom(data: { floorId: number; roomTypeId: number; number: string; name?: string | undefined }) {
        const result = await this.repository.createRoom(data);
        return this.repository.findRoomById(result.id);
    }

    async updateRoom(id: number, data: { floorId?: number | undefined; roomTypeId?: number | undefined; number?: string | undefined; name?: string | undefined }) {
        const room = await this.repository.findRoomRawById(id);
        if (!room) {
            throw new Error("Room not found");
        }
        await this.repository.updateRoom(id, data);
        return this.repository.findRoomById(id);
    }

    async generateQr(id: number): Promise<Buffer> {
        const room = await this.repository.findRoomRawById(id);
        if (!room) {
            throw new Error("Room not found");
        }
        return QRCode.toBuffer(room.qrToken);
    }
}
