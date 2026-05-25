import { describe, it, expect, vi, beforeEach } from "vitest";
import { BuildingService } from "../building.service";
import type { BuildingRepository } from "../building.repository";

vi.mock("qrcode", () => ({
    default: {
        toBuffer: vi.fn().mockResolvedValue(Buffer.from("png_data")),
    },
}));

const fakeFloor = { id: 1, number: 1, description: "Первый этаж" };
const fakeRoom = {
    id: 1,
    number: "101",
    name: "Аудитория 101",
    floor_number: 1,
    room_type: "Аудитория",
    qr_token: "550e8400-e29b-41d4-a716-446655440000",
    created_at: new Date(),
};
const fakeRoomRaw = {
    id: 1,
    floorId: 1,
    roomTypeId: 1,
    number: "101",
    name: "Аудитория 101",
    qrToken: "550e8400-e29b-41d4-a716-446655440000",
    createdAt: new Date(),
};

const makeRepo = (overrides: Record<string, unknown> = {}) => ({
    findAllFloors: vi.fn().mockResolvedValue([fakeFloor]),
    findFloorById: vi.fn().mockResolvedValue(fakeFloor),
    createFloor: vi.fn().mockResolvedValue(fakeFloor),
    updateFloor: vi.fn().mockResolvedValue(fakeFloor),
    findAllRooms: vi.fn().mockResolvedValue([fakeRoom]),
    findRoomById: vi.fn().mockResolvedValue(fakeRoom),
    findRoomRawById: vi.fn().mockResolvedValue(fakeRoomRaw),
    createRoom: vi.fn().mockResolvedValue({ id: 1 }),
    updateRoom: vi.fn().mockResolvedValue({ id: 1 }),
    ...overrides,
});

describe("BuildingService — этажи", () => {
    beforeEach(() => vi.clearAllMocks());

    it("findAllFloors возвращает список этажей", async () => {
        const repo = makeRepo();
        const service = new BuildingService(repo as unknown as BuildingRepository);

        const result = await service.findAllFloors();

        expect(result).toEqual([fakeFloor]);
    });

    it("createFloor делегирует в репозиторий", async () => {
        const repo = makeRepo();
        const service = new BuildingService(repo as unknown as BuildingRepository);

        const result = await service.createFloor({ number: 1 });

        expect(repo.createFloor).toHaveBeenCalledWith({ number: 1 });
        expect(result).toEqual(fakeFloor);
    });

    it("updateFloor бросает ошибку если этаж не найден", async () => {
        const repo = makeRepo({ findFloorById: vi.fn().mockResolvedValue(null) });
        const service = new BuildingService(repo as unknown as BuildingRepository);

        await expect(service.updateFloor(99, { number: 2 })).rejects.toThrow("Floor not found");
    });

    it("updateFloor не вызывает update если этаж не найден", async () => {
        const repo = makeRepo({ findFloorById: vi.fn().mockResolvedValue(null) });
        const service = new BuildingService(repo as unknown as BuildingRepository);

        await expect(service.updateFloor(99, { number: 2 })).rejects.toThrow();

        expect(repo.updateFloor).not.toHaveBeenCalled();
    });

    it("updateFloor обновляет этаж если найден", async () => {
        const repo = makeRepo();
        const service = new BuildingService(repo as unknown as BuildingRepository);

        const result = await service.updateFloor(1, { description: "Обновлено" });

        expect(repo.updateFloor).toHaveBeenCalledWith(1, { description: "Обновлено" });
        expect(result).toEqual(fakeFloor);
    });
});

describe("BuildingService — помещения", () => {
    beforeEach(() => vi.clearAllMocks());

    it("findAllRooms возвращает список помещений", async () => {
        const repo = makeRepo();
        const service = new BuildingService(repo as unknown as BuildingRepository);

        const result = await service.findAllRooms();

        expect(result).toEqual([fakeRoom]);
    });

    it("createRoom создаёт и возвращает полное помещение", async () => {
        const repo = makeRepo();
        const service = new BuildingService(repo as unknown as BuildingRepository);

        const result = await service.createRoom({ floorId: 1, roomTypeId: 1, number: "101" });

        expect(repo.createRoom).toHaveBeenCalledOnce();
        expect(repo.findRoomById).toHaveBeenCalledWith(1);
        expect(result).toEqual(fakeRoom);
    });

    it("updateRoom бросает ошибку если помещение не найдено", async () => {
        const repo = makeRepo({ findRoomRawById: vi.fn().mockResolvedValue(null) });
        const service = new BuildingService(repo as unknown as BuildingRepository);

        await expect(service.updateRoom(99, { number: "202" })).rejects.toThrow("Room not found");
    });

    it("updateRoom не вызывает update если помещение не найдено", async () => {
        const repo = makeRepo({ findRoomRawById: vi.fn().mockResolvedValue(null) });
        const service = new BuildingService(repo as unknown as BuildingRepository);

        await expect(service.updateRoom(99, {})).rejects.toThrow();

        expect(repo.updateRoom).not.toHaveBeenCalled();
    });

    it("updateRoom обновляет и возвращает актуальное помещение", async () => {
        const repo = makeRepo();
        const service = new BuildingService(repo as unknown as BuildingRepository);

        const result = await service.updateRoom(1, { name: "Новое название" });

        expect(repo.updateRoom).toHaveBeenCalledWith(1, { name: "Новое название" });
        expect(repo.findRoomById).toHaveBeenCalledWith(1);
        expect(result).toEqual(fakeRoom);
    });
});

describe("BuildingService.generateQr", () => {
    beforeEach(() => vi.clearAllMocks());

    it("бросает ошибку если помещение не найдено", async () => {
        const repo = makeRepo({ findRoomRawById: vi.fn().mockResolvedValue(null) });
        const service = new BuildingService(repo as unknown as BuildingRepository);

        await expect(service.generateQr(99)).rejects.toThrow("Room not found");
    });

    it("возвращает PNG-буфер для найденного помещения", async () => {
        const repo = makeRepo();
        const service = new BuildingService(repo as unknown as BuildingRepository);

        const result = await service.generateQr(1);

        expect(Buffer.isBuffer(result)).toBe(true);
    });

    it("генерирует QR из qrToken, а не из id помещения", async () => {
        const QRCode = await import("qrcode");
        const repo = makeRepo();
        const service = new BuildingService(repo as unknown as BuildingRepository);

        await service.generateQr(1);

        expect(QRCode.default.toBuffer).toHaveBeenCalledWith(fakeRoomRaw.qrToken);
        expect(QRCode.default.toBuffer).not.toHaveBeenCalledWith(fakeRoomRaw.id);
    });
});
