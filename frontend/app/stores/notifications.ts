import { defineStore } from "pinia";

type NotificationType = "error" | "success" | "info";

interface Notification {
    id: number;
    type: NotificationType;
    message: string;
}

let nextId = 0;
const DISMISS_DELAY = 4000;

export const useNotificationsStore = defineStore("notifications", () => {
    const items = ref<Notification[]>([]);

    function add(type: NotificationType, message: string) {
        const id = nextId++;
        items.value.push({ id, type, message });
        setTimeout(() => remove(id), DISMISS_DELAY);
    }

    function remove(id: number) {
        items.value = items.value.filter((n) => n.id !== id);
    }

    return { items, add, remove };
});
