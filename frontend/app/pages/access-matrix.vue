<template>
    <div class="page">
        <h2 class="page-title">Матрица доступа</h2>

        <div
            class="matrix"
            :style="{ gridTemplateColumns: `180px repeat(${roomTypes.length}, 1fr)` }">
            <div class="matrix__corner">Категория</div>
            <div
                v-for="rt in roomTypes"
                :key="rt.id"
                class="matrix__col-label">
                {{ rt.name }}
            </div>
            <template
                v-for="cat in categories"
                :key="cat.id">
                <div class="matrix__row-label">{{ cat.name }}</div>
                <div
                    v-for="rt in roomTypes"
                    :key="rt.id"
                    class="matrix__cell">
                    <UiCheckbox
                        :model-value="isActive(cat.id, rt.id)"
                        :disabled="toggling.has(`${cat.id}:${rt.id}`)"
                        @update:model-value="toggle(cat.id, rt.id)" />
                </div>
            </template>
        </div>
    </div>
</template>

<script lang="ts" setup>
import type { paths } from "@/api/types";

type Category = paths["/dictionary/categories"]["get"]["responses"]["200"]["content"]["application/json"]["categories"][number];
type RoomType = paths["/dictionary/room-types"]["get"]["responses"]["200"]["content"]["application/json"]["roomTypes"][number];
type Rule = paths["/access-matrix"]["get"]["responses"]["200"]["content"]["application/json"]["rules"][number];

const api = useApi();
const notifications = useNotificationsStore();

const categories = ref<Category[]>([]);
const roomTypes = ref<RoomType[]>([]);
const rules = ref<Rule[]>([]);
const toggling = ref(new Set<string>());

const activeSet = computed(() => new Set(rules.value.map((r) => `${r.category_id}:${r.room_type_id}`)));

function isActive(categoryId: number, roomTypeId: number) {
    return activeSet.value.has(`${categoryId}:${roomTypeId}`);
}

async function toggle(categoryId: number, roomTypeId: number) {
    const key = `${categoryId}:${roomTypeId}`;
    toggling.value = new Set(toggling.value).add(key);
    try {
        await api.POST("/access-matrix/toggle", {
            body: { category_id: categoryId, room_type_id: roomTypeId },
        });
        const res = await api.GET("/access-matrix");
        if (res.data) rules.value = res.data.rules;
    } catch (e) {
        notifications.add("error", e instanceof Error ? e.message : "Ошибка");
    } finally {
        const next = new Set(toggling.value);
        next.delete(key);
        toggling.value = next;
    }
}

const [catsRes, typesRes, matrixRes] = await Promise.all([
    api.GET("/dictionary/categories"),
    api.GET("/dictionary/room-types"),
    api.GET("/access-matrix"),
]);
if (catsRes.data) categories.value = catsRes.data.categories;
if (typesRes.data) roomTypes.value = typesRes.data.roomTypes;
if (matrixRes.data) rules.value = matrixRes.data.rules;
</script>

<style lang="scss" scoped>
.matrix {
    display: grid;
    overflow: auto;
    border-radius: 16px;
    background-color: var(--color-background-secondary);

    &__corner,
    &__col-label,
    &__row-label,
    &__cell {
        padding: 12px 16px;
        display: flex;
        align-items: center;
    }

    &__corner {
        font-weight: 600;
        font-size: 0.8125rem;
        color: var(--color-text-secondary);
        text-transform: uppercase;
        letter-spacing: 0.04em;
        border-bottom: 2px solid var(--color-input-border);
    }

    &__col-label {
        justify-content: center;
        font-weight: 600;
        font-size: 0.875rem;
        text-align: center;
        border-left: 1px solid var(--color-input-border);
        border-bottom: 2px solid var(--color-input-border);
    }

    &__row-label {
        font-weight: 500;
        border-top: 1px solid var(--color-input-border);
    }

    &__cell {
        justify-content: center;
        border-left: 1px solid var(--color-input-border);
        border-top: 1px solid var(--color-input-border);
        background-color: var(--color-background);
    }

}
</style>
