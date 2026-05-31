<template>
    <div class="page">
        <h2 class="page-title">Журнал посещений</h2>

        <div class="filters">
            <UiSelect
                v-model="filters.status"
                :options="statusOptions"
                placeholder="Все статусы" />
            <input
                v-model="filters.dateFrom"
                class="date-input"
                type="date" />
            <input
                v-model="filters.dateTo"
                class="date-input"
                type="date" />
            <UiButton
                variant="default"
                @click="loadLog">
                Применить
            </UiButton>
        </div>

        <AccessLog :entries="log" />
    </div>
</template>

<script lang="ts" setup>
import type { paths } from "@/api/types";

definePageMeta({ layout: "employee" });

type LogEntry = paths["/access/log/my"]["get"]["responses"]["200"]["content"]["application/json"]["log"][number];

const api = useApi();

const log = ref<LogEntry[]>([]);

const filters = ref({
    status: "" as "allowed" | "denied" | "violation" | "",
    dateFrom: "",
    dateTo: "",
});

const statusOptions = [
    { label: "Все статусы", value: "" },
    { label: "Разрешён", value: "allowed" },
    { label: "Отказано", value: "denied" },
    { label: "Нарушение", value: "violation" },
];

async function loadLog() {
    const query: Record<string, unknown> = {};
    if (filters.value.status) query.status = filters.value.status;
    if (filters.value.dateFrom) query.date_from = new Date(filters.value.dateFrom).toISOString();
    if (filters.value.dateTo) query.date_to = new Date(filters.value.dateTo + "T23:59:59").toISOString();

    const res = await api.GET("/access/log/my", { params: { query } });
    if (res.data) log.value = res.data.log;
}

await loadLog();
</script>

<style lang="scss" scoped>
.filters {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    align-items: center;
    margin-bottom: 20px;

    .select-wrapper {
        flex: 1;
        min-width: 160px;
        max-width: 240px;
    }
}

.date-input {
    height: 40px;
    padding: 0 0.5rem;
    border: 1px solid var(--color-input-border);
    background-color: var(--color-input-background);
    border-radius: 12px;
    font-size: 1rem;
    color: var(--color-text);
    cursor: pointer;
    outline: none;

    &:focus {
        border-color: var(--color-primary);
    }
}
</style>
