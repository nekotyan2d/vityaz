<template>
    <div class="page">
        <h2 class="page-title">Журнал посещений</h2>

        <div class="filters">
            <UiSelect
                v-if="isAdminOrSecurity"
                v-model="filters.employeeId"
                :options="employeeOptions"
                placeholder="Все сотрудники" />
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

type LogEntry = paths["/access/log"]["get"]["responses"]["200"]["content"]["application/json"]["log"][number];
type Employee = paths["/employees"]["get"]["responses"]["200"]["content"]["application/json"]["employees"][number];

const api = useApi();
const authStore = useAuthStore();

const log = ref<LogEntry[]>([]);
const employees = ref<Employee[]>([]);

const filters = ref({
    employeeId: "" as number | "",
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

await authStore.initPromise;

const isAdminOrSecurity = computed(() => {
    const role = authStore.currentUser?.role;
    return role === "admin" || role === "security";
});

const employeeOptions = computed(() => [
    { label: "Все сотрудники", value: "" },
    ...employees.value.map((e) => ({ label: e.full_name, value: e.id })),
]);

async function loadLog() {
    const query: Record<string, unknown> = {};
    if (isAdminOrSecurity.value && filters.value.employeeId) query.employee_id = filters.value.employeeId;
    if (filters.value.status) query.status = filters.value.status;
    if (filters.value.dateFrom) query.date_from = new Date(filters.value.dateFrom).toISOString();
    if (filters.value.dateTo) query.date_to = new Date(filters.value.dateTo + "T23:59:59").toISOString();

    if (isAdminOrSecurity.value) {
        const res = await api.GET("/access/log", { params: { query } });
        if (res.data) log.value = res.data.log;
    } else {
        const res = await api.GET("/access/log/my", { params: { query } });
        if (res.data) log.value = res.data.log;
    }
}

if (isAdminOrSecurity.value) {
    const [, employeesRes] = await Promise.all([loadLog(), api.GET("/employees")]);
    if (employeesRes.data) employees.value = employeesRes.data.employees;
} else {
    await loadLog();
}
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
