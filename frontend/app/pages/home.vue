<template>
    <div class="page">
        <h2 class="page-title">Главная</h2>

        <div
            v-if="role === 'admin'"
            class="stats">
            <div class="stat-card">
                <span class="stat-card__label">Сотрудников</span>
                <span class="stat-card__value">{{ employeesCount ?? "—" }}</span>
            </div>
            <div class="stat-card">
                <span class="stat-card__label">Помещений</span>
                <span class="stat-card__value">{{ roomsCount ?? "—" }}</span>
            </div>
        </div>

        <section class="journal-section">
            <h3 class="journal-section__title">Журнал посещений</h3>
            <AccessLog :entries="log" />
        </section>
    </div>
</template>

<script lang="ts" setup>
import type { paths } from "@/api/types";

type LogEntry = paths["/access/log"]["get"]["responses"]["200"]["content"]["application/json"]["log"][number];

const api = useApi();
const authStore = useAuthStore();

const employeesCount = ref<number | null>(null);
const roomsCount = ref<number | null>(null);
const log = ref<LogEntry[]>([]);

await authStore.initPromise;

const role = computed(() => authStore.currentUser?.role);

if (role.value === "admin") {
    const [employeesRes, roomsRes, logRes] = await Promise.all([
        api.GET("/employees"),
        api.GET("/rooms"),
        api.GET("/access/log"),
    ]);

    if (employeesRes.data) employeesCount.value = employeesRes.data.employees.length;
    if (roomsRes.data) roomsCount.value = roomsRes.data.rooms.length;
    if (logRes.data) log.value = logRes.data.log;
} else if (role.value === "security") {
    const logRes = await api.GET("/access/log");
    if (logRes.data) log.value = logRes.data.log;
} else {
    const logRes = await api.GET("/access/log/my");
    if (logRes.data) log.value = logRes.data.log;
}
</script>

<style lang="scss" scoped>
.stats {
    display: flex;
    gap: 16px;
    margin-bottom: 32px;
}

.stat-card {
    display: flex;
    flex-direction: column;
    gap: 8px;
    padding: 24px;
    background-color: var(--color-background-secondary);
    border-radius: 16px;
    min-width: 160px;

    &__label {
        font-size: 0.875rem;
        color: var(--color-text-secondary);
    }

    &__value {
        font-size: 2rem;
        font-weight: 700;
        color: var(--color-primary);
    }
}

.journal-section {
    &__title {
        margin-bottom: 12px;
    }
}
</style>
