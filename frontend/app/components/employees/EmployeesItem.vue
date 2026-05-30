<template>
    <div class="employee">
        <div class="employee__main">
            <span class="employee__name">{{ employee.full_name }}</span>
            <span class="employee__email">{{ employee.email }}</span>
        </div>
        <div class="employee__meta">
            <span class="employee__category">{{ employee.category }}</span>
            <UiPopupMenu
                :items="actions"
                @select="onAction">
                <template #trigger>
                    <button class="employee__actions">
                        <Icon
                            name="material-symbols:more-vert"
                            :size="20" />
                    </button>
                </template>
            </UiPopupMenu>
        </div>
    </div>
</template>

<script lang="ts" setup>
import type { paths } from "@/api/types";
import type { MenuItem } from "@/components/ui/PopupMenu.vue";

type Employee = paths["/employees/{id}"]["get"]["responses"]["200"]["content"]["application/json"]["employee"];

const props = defineProps<{
    employee: Employee;
}>();

const emit = defineEmits<{
    (e: "ban", employee: Employee): void;
}>();

const actions: MenuItem[] = [
    { label: "Заблокировать", value: "ban", icon: "material-symbols:person-off-outline-rounded" },
];

function onAction(item: MenuItem) {
    if (item.value === "ban") {
        emit("ban", props.employee);
    }
}
</script>

<style lang="scss" scoped>
.employee {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 12px 16px;
    background-color: var(--color-background-secondary);
    border-radius: 12px;
    gap: 16px;

    &__main {
        display: flex;
        flex-direction: column;
        gap: 2px;
    }

    &__name {
        font-weight: 600;
    }

    &__email {
        font-size: 0.875rem;
        color: var(--color-text-secondary);
    }

    &__meta {
        display: flex;
        align-items: center;
        gap: 12px;
    }

    &__category {
        font-size: 0.875rem;
        color: var(--color-text-secondary);
    }

    &__actions {
        background: none;
        border: none;
        cursor: pointer;
        color: var(--color-text-secondary);
        display: flex;
        align-items: center;
        padding: 4px;
        border-radius: 100%;
        transition: 0.2s;

        &:hover {
            background-color: var(--color-ripple);
            color: var(--color-text);
        }
    }
}
</style>
