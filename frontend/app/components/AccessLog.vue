<template>
    <div class="access-log">
        <div
            v-if="entries.length === 0"
            class="access-log__empty">
            Нет записей
        </div>
        <div
            v-for="entry in entries"
            :key="entry.id"
            class="access-log__entry"
            :data-status="entry.status">
            <Icon
                class="access-log__icon"
                :name="statusIcon(entry.status)"
                :size="20" />
            <div class="access-log__main">
                <span class="access-log__name">{{ entry.employee_name }}</span>
                <span class="access-log__room">{{ entry.room_number }}, этаж {{ entry.floor_number }}</span>
            </div>
            <div class="access-log__meta">
                <span class="access-log__direction">{{ entry.direction === "in" ? "вход" : "выход" }}</span>
                <span class="access-log__time">{{ formatTime(entry.created_at) }}</span>
            </div>
        </div>
    </div>
</template>

<script lang="ts" setup>
import type { paths } from "@/api/types";

type LogEntry = paths["/access/log"]["get"]["responses"]["200"]["content"]["application/json"]["log"][number];

defineProps<{
    entries: LogEntry[];
}>();

function statusIcon(status: string) {
    if (status === "allowed") return "material-symbols:check-circle-rounded";
    if (status === "violation") return "material-symbols:warning-rounded";
    return "material-symbols:cancel-rounded";
}

function formatTime(iso: string) {
    return new Date(iso).toLocaleString("ru-RU", {
        day: "2-digit",
        month: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
    });
}
</script>

<style lang="scss" scoped>
.access-log {
    display: flex;
    flex-direction: column;
    gap: 8px;

    &__empty {
        color: var(--color-text-secondary);
        font-size: 0.875rem;
    }

    &__entry {
        display: flex;
        align-items: center;
        gap: 12px;
        padding: 12px 16px;
        background-color: var(--color-background-secondary);
        border-radius: 12px;
    }

    &__icon {
        flex-shrink: 0;

        .access-log__entry[data-status="allowed"] & {
            color: #4caf50;
        }

        .access-log__entry[data-status="denied"] & {
            color: #f44336;
        }

        .access-log__entry[data-status="violation"] & {
            color: #ff9800;
        }
    }

    &__main {
        display: flex;
        flex-direction: column;
        gap: 2px;
        flex: 1;
        min-width: 0;
    }

    &__name {
        font-weight: 600;
    }

    &__room {
        font-size: 0.875rem;
        color: var(--color-text-secondary);
    }

    &__meta {
        display: flex;
        flex-direction: column;
        align-items: flex-end;
        gap: 2px;
    }

    &__direction {
        font-size: 0.75rem;
        font-weight: 600;
        text-transform: uppercase;
        color: var(--color-text-secondary);
    }

    &__time {
        font-size: 0.75rem;
        color: var(--color-text-secondary);
    }
}
</style>