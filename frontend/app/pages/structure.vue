<template>
    <div class="page">
        <h2 class="page-title">Структура здания</h2>

        <div class="layout">
            <div class="sidebar">
                <section class="section">
                    <div class="section__header">
                        <h3 class="section__title">Этажи</h3>
                        <UiButton @click="openFloorCreate">Добавить</UiButton>
                    </div>
                    <div class="list">
                        <div
                            v-for="floor in floors"
                            :key="floor.id"
                            class="list-item">
                            <div class="list-item__main">
                                <span class="list-item__title">{{ floor.number }} этаж</span>
                                <span
                                    v-if="floor.description"
                                    class="list-item__sub">
                                    {{ floor.description }}
                                </span>
                            </div>
                            <UiPopupMenu
                                :items="editActions"
                                @select="onFloorAction($event, floor)">
                                <template #trigger>
                                    <button class="actions-btn">
                                        <Icon
                                            name="material-symbols:more-vert"
                                            :size="20" />
                                    </button>
                                </template>
                            </UiPopupMenu>
                        </div>
                    </div>
                </section>

                <section class="section">
                    <div class="section__header">
                        <h3 class="section__title">Типы помещений</h3>
                        <UiButton @click="openRoomTypeCreate">Добавить</UiButton>
                    </div>
                    <div class="list">
                        <div
                            v-for="rt in roomTypes"
                            :key="rt.id"
                            class="list-item">
                            <div class="list-item__main">
                                <span class="list-item__title">{{ rt.name }}</span>
                                <span
                                    v-if="rt.description"
                                    class="list-item__sub">
                                    {{ rt.description }}
                                </span>
                            </div>
                            <UiPopupMenu
                                :items="editActions"
                                @select="onRoomTypeAction($event, rt)">
                                <template #trigger>
                                    <button class="actions-btn">
                                        <Icon
                                            name="material-symbols:more-vert"
                                            :size="20" />
                                    </button>
                                </template>
                            </UiPopupMenu>
                        </div>
                    </div>
                </section>
            </div>

            <section class="section">
                <div class="section__header">
                    <h3 class="section__title">Помещения</h3>
                    <UiButton @click="openRoomCreate">Добавить</UiButton>
                </div>
                <div class="list">
                    <div
                        v-for="room in rooms"
                        :key="room.id"
                        class="list-item">
                        <div class="list-item__main">
                            <span class="list-item__title">{{ room.number }}</span>
                            <span
                                v-if="room.name"
                                class="list-item__name">
                                {{ room.name }}
                            </span>
                            <span class="list-item__sub">{{ room.room_type }}, {{ room.floor_number }} этаж</span>
                        </div>
                        <UiPopupMenu
                            :items="roomActions"
                            @select="onRoomAction($event, room)">
                            <template #trigger>
                                <button class="actions-btn">
                                    <Icon
                                        name="material-symbols:more-vert"
                                        :size="20" />
                                </button>
                            </template>
                        </UiPopupMenu>
                    </div>
                </div>
            </section>
        </div>

        <PopupWindow
            v-if="floorPopup"
            :title="floorPopup.mode === 'create' ? 'Новый этаж' : 'Редактировать этаж'"
            @close="floorPopup = null">
            <form
                class="popup-form"
                @submit.prevent="submitFloor">
                <UiInput
                    v-model="floorForm.number"
                    :schema="schemas.floorNumber"
                    placeholder="Номер этажа"
                    type="number" />
                <UiInput
                    v-model="floorForm.description"
                    :schema="schemas.description"
                    placeholder="Описание (необязательно)" />
                <UiButton :disabled="!!floorForm.number.error || !floorForm.number.value">
                    {{ floorPopup.mode === "create" ? "Создать" : "Сохранить" }}
                </UiButton>
            </form>
        </PopupWindow>

        <PopupWindow
            v-if="roomTypePopup"
            :title="roomTypePopup.mode === 'create' ? 'Новый тип помещения' : 'Редактировать тип помещения'"
            @close="roomTypePopup = null">
            <form
                class="popup-form"
                @submit.prevent="submitRoomType">
                <UiInput
                    v-model="roomTypeForm.name"
                    :schema="schemas.name"
                    placeholder="Название" />
                <UiInput
                    v-model="roomTypeForm.description"
                    :schema="schemas.description"
                    placeholder="Описание (необязательно)" />
                <UiButton :disabled="!!roomTypeForm.name.error || !roomTypeForm.name.value">
                    {{ roomTypePopup.mode === "create" ? "Создать" : "Сохранить" }}
                </UiButton>
            </form>
        </PopupWindow>

        <PopupWindow
            v-if="roomPopup"
            :title="roomPopup.mode === 'create' ? 'Новое помещение' : 'Редактировать помещение'"
            @close="roomPopup = null">
            <form
                class="popup-form"
                @submit.prevent="submitRoom">
                <UiSelect
                    v-model="roomForm.floor_id"
                    :options="floorOptions"
                    placeholder="Этаж" />
                <UiSelect
                    v-model="roomForm.room_type_id"
                    :options="roomTypeOptions"
                    placeholder="Тип помещения" />
                <UiInput
                    v-model="roomForm.number"
                    :schema="schemas.roomNumber"
                    placeholder="Номер помещения" />
                <UiInput
                    v-model="roomForm.name"
                    :schema="schemas.description"
                    placeholder="Название (необязательно)" />
                <UiButton
                    :disabled="
                        !roomForm.floor_id ||
                        !roomForm.room_type_id ||
                        !!roomForm.number.error ||
                        !roomForm.number.value
                    ">
                    {{ roomPopup.mode === "create" ? "Создать" : "Сохранить" }}
                </UiButton>
            </form>
        </PopupWindow>
    </div>
</template>

<script lang="ts" setup>
import z from "zod";
import type { paths } from "@/api/types";
import type { MenuItem } from "@/components/ui/PopupMenu.vue";

type Floor = paths["/floors"]["get"]["responses"]["200"]["content"]["application/json"]["floors"][number];
type Room = paths["/rooms"]["get"]["responses"]["200"]["content"]["application/json"]["rooms"][number];
type RoomType =
    paths["/dictionary/room-types"]["get"]["responses"]["200"]["content"]["application/json"]["roomTypes"][number];

const API_BASE_URL = "http://localhost:8000";

const api = useApi();
const notifications = useNotificationsStore();

const floors = ref<Floor[]>([]);
const rooms = ref<Room[]>([]);
const roomTypes = ref<RoomType[]>([]);

const floorPopup = ref<{ mode: "create" | "edit"; target?: Floor } | null>(null);
const roomTypePopup = ref<{ mode: "create" | "edit"; target?: RoomType } | null>(null);
const roomPopup = ref<{ mode: "create" | "edit"; target?: Room } | null>(null);

const floorForm = ref({
    number: { value: "", error: undefined as string | undefined },
    description: { value: "", error: undefined as string | undefined },
});

const roomTypeForm = ref({
    name: { value: "", error: undefined as string | undefined },
    description: { value: "", error: undefined as string | undefined },
});

const roomForm = ref({
    floor_id: "" as number | "",
    room_type_id: "" as number | "",
    number: { value: "", error: undefined as string | undefined },
    name: { value: "", error: undefined as string | undefined },
});

const schemas = {
    floorNumber: z.coerce.number().int().min(1, "Минимум 1").max(999, "Максимум 999"),
    name: z.string().min(1, "Обязательное поле").max(100),
    description: z.string().optional(),
    roomNumber: z.string().min(1, "Обязательное поле").max(20),
};

const editActions: MenuItem[] = [
    { label: "Редактировать", value: "edit", icon: "material-symbols:edit-outline-rounded" },
];

const roomActions: MenuItem[] = [
    { label: "Редактировать", value: "edit", icon: "material-symbols:edit-outline-rounded" },
    { label: "Скачать QR", value: "qr", icon: "material-symbols:qr-code-2-rounded" },
];

const floorOptions = computed(() =>
    [...floors.value].sort((a, b) => a.number - b.number).map((f) => ({ label: `${f.number} этаж`, value: f.id })),
);

const roomTypeOptions = computed(() => roomTypes.value.map((rt) => ({ label: rt.name, value: rt.id })));

function openFloorCreate() {
    floorForm.value = { number: { value: "", error: undefined }, description: { value: "", error: undefined } };
    floorPopup.value = { mode: "create" };
}

function openFloorEdit(floor: Floor) {
    floorForm.value = {
        number: { value: String(floor.number), error: undefined },
        description: { value: floor.description ?? "", error: undefined },
    };
    floorPopup.value = { mode: "edit", target: floor };
}

function openRoomTypeCreate() {
    roomTypeForm.value = { name: { value: "", error: undefined }, description: { value: "", error: undefined } };
    roomTypePopup.value = { mode: "create" };
}

function openRoomTypeEdit(rt: RoomType) {
    roomTypeForm.value = {
        name: { value: rt.name, error: undefined },
        description: { value: rt.description ?? "", error: undefined },
    };
    roomTypePopup.value = { mode: "edit", target: rt };
}

function openRoomCreate() {
    roomForm.value = {
        floor_id: "",
        room_type_id: "",
        number: { value: "", error: undefined },
        name: { value: "", error: undefined },
    };
    roomPopup.value = { mode: "create" };
}

function openRoomEdit(room: Room) {
    const floor = floors.value.find((f) => f.number === room.floor_number);
    const roomType = roomTypes.value.find((rt) => rt.name === room.room_type);
    roomForm.value = {
        floor_id: floor?.id ?? "",
        room_type_id: roomType?.id ?? "",
        number: { value: room.number, error: undefined },
        name: { value: room.name ?? "", error: undefined },
    };
    roomPopup.value = { mode: "edit", target: room };
}

function onFloorAction(item: MenuItem, floor: Floor) {
    if (item.value === "edit") openFloorEdit(floor);
}

function onRoomTypeAction(item: MenuItem, rt: RoomType) {
    if (item.value === "edit") openRoomTypeEdit(rt);
}

function onRoomAction(item: MenuItem, room: Room) {
    if (item.value === "edit") openRoomEdit(room);
    if (item.value === "qr") downloadQr(room);
}

async function downloadQr(room: Room) {
    try {
        const response = await fetch(`${API_BASE_URL}/rooms/${room.id}/qr`, { credentials: "include" });
        if (!response.ok) throw new Error();
        const blob = await response.blob();
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `qr-${room.number}.png`;
        a.click();
        URL.revokeObjectURL(url);
    } catch {
        notifications.add("error", "Не удалось загрузить QR-код");
    }
}

async function submitFloor() {
    const number = Number(floorForm.value.number.value);
    const description = floorForm.value.description.value || undefined;
    try {
        if (floorPopup.value?.mode === "create") {
            await api.POST("/floors", { body: { number, description } });
            notifications.add("success", `${number} этаж добавлен`);
        } else {
            const id = floorPopup.value!.target!.id;
            await api.PATCH("/floors/{id}", { params: { path: { id } }, body: { number, description } });
            notifications.add("success", "Этаж обновлён");
        }
        floorPopup.value = null;
        await loadFloors();
    } catch (e) {
        notifications.add("error", e instanceof Error ? e.message : "Ошибка");
    }
}

async function submitRoomType() {
    const name = roomTypeForm.value.name.value;
    const description = roomTypeForm.value.description.value || undefined;
    try {
        if (roomTypePopup.value?.mode === "create") {
            await api.POST("/dictionary/room-types", { body: { name, description } });
            notifications.add("success", `Тип "${name}" добавлен`);
        } else {
            const id = roomTypePopup.value!.target!.id;
            await api.PATCH("/dictionary/room-types/{id}", { params: { path: { id } }, body: { name, description } });
            notifications.add("success", "Тип помещения обновлён");
        }
        roomTypePopup.value = null;
        await loadRoomTypes();
    } catch (e) {
        notifications.add("error", e instanceof Error ? e.message : "Ошибка");
    }
}

async function submitRoom() {
    if (!roomForm.value.floor_id || !roomForm.value.room_type_id) return;
    const body = {
        floor_id: roomForm.value.floor_id as number,
        room_type_id: roomForm.value.room_type_id as number,
        number: roomForm.value.number.value,
        name: roomForm.value.name.value || undefined,
    };
    try {
        if (roomPopup.value?.mode === "create") {
            await api.POST("/rooms", { body });
            notifications.add("success", `Помещение ${body.number} добавлено`);
        } else {
            const id = roomPopup.value!.target!.id;
            await api.PATCH("/rooms/{id}", { params: { path: { id } }, body });
            notifications.add("success", "Помещение обновлено");
        }
        roomPopup.value = null;
        await loadRooms();
    } catch (e) {
        notifications.add("error", e instanceof Error ? e.message : "Ошибка");
    }
}

async function loadFloors() {
    const res = await api.GET("/floors");
    if (res.data) floors.value = [...res.data.floors].sort((a, b) => a.number - b.number);
}

async function loadRooms() {
    const res = await api.GET("/rooms");
    if (res.data) rooms.value = res.data.rooms;
}

async function loadRoomTypes() {
    const res = await api.GET("/dictionary/room-types");
    if (res.data) roomTypes.value = res.data.roomTypes;
}

await Promise.all([loadFloors(), loadRooms(), loadRoomTypes()]);
</script>

<style lang="scss" scoped>
.layout {
    display: grid;
    grid-template-columns: 1fr 2fr;
    gap: 24px;
    align-items: start;

    @media (max-width: 768px) {
        grid-template-columns: 1fr;
    }
}

.sidebar {
    display: flex;
    flex-direction: column;
    gap: 24px;
}

.section {
    &__header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 12px 0;
        position: sticky;
        top: 0;
        background-color: var(--color-background);
        z-index: 10;
    }

    &__title {
        margin: 0;
    }
}

.list {
    display: flex;
    flex-direction: column;
    gap: 8px;
}

.list-item {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    padding: 12px 16px;
    background-color: var(--color-background-secondary);
    border-radius: 12px;
    gap: 12px;

    &__main {
        display: flex;
        flex-direction: column;
        gap: 4px;
        min-width: 0;
        padding-top: 2px;
    }

    &__title {
        font-weight: 600;
        line-height: 1.3;
    }

    &__name {
        font-weight: 400;
        font-size: 0.875rem;
        color: var(--color-text-secondary);
        word-break: break-word;
    }

    &__sub {
        font-size: 0.875rem;
        color: var(--color-text-secondary);
    }
}

.actions-btn {
    background: none;
    border: none;
    cursor: pointer;
    color: var(--color-text-secondary);
    display: flex;
    align-items: center;
    padding: 4px;
    border-radius: 100%;
    flex-shrink: 0;
    transition: 0.2s;

    &:hover {
        background-color: var(--color-ripple);
        color: var(--color-text);
    }
}

.popup-form {
    display: flex;
    flex-direction: column;
    gap: 12px;
}
</style>
