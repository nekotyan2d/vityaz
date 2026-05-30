<template>
    <UiPopupMenu
        :items="options"
        :model-value="model"
        @select="model = $event.value">
        <template #trigger>
            <div
                class="select-trigger"
                :data-placeholder="model === undefined || model === null || model === ''">
                <span>{{ selectedLabel }}</span>
                <Icon
                    name="material-symbols:keyboard-arrow-down-rounded"
                    :size="20" />
            </div>
        </template>
    </UiPopupMenu>
</template>

<script lang="ts" setup>
import type { MenuItem } from "./PopupMenu.vue";

const props = defineProps<{
    options: MenuItem[];
    placeholder?: string;
}>();

const model = defineModel<string | number | "">({ default: "" });

const selectedLabel = computed(() => {
    const found = props.options.find((o) => o.value === model.value);
    return found?.label ?? props.placeholder ?? "Выберите...";
});
</script>

<style lang="scss" scoped>
.select-trigger {
    display: flex;
    align-items: center;
    justify-content: space-between;
    width: 100%;
    height: 40px;
    padding: 0 0.5rem;
    border: 1px solid var(--color-input-border);
    background-color: var(--color-input-background);
    border-radius: 12px;
    font-size: 1rem;
    cursor: pointer;
    user-select: none;

    &[data-placeholder="true"] span {
        color: var(--color-input-placeholder);
    }
}
</style>
