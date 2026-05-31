<template>
    <button
        class="checkbox"
        :class="{ 'checkbox--checked': model }"
        :disabled="disabled"
        type="button"
        @click="model = !model">
        <Icon
            v-if="model"
            name="material-symbols:check-rounded"
            :size="16" />
    </button>
</template>

<script lang="ts" setup>
const model = defineModel<boolean>({ required: true });

defineProps<{
    disabled?: boolean;
}>();
</script>

<style lang="scss" scoped>
.checkbox {
    width: 22px;
    height: 22px;
    border-radius: 6px;
    border: 2px solid var(--color-input-border);
    background-color: transparent;
    cursor: pointer;
    transition: border-color 0.15s;
    flex-shrink: 0;
    display: inline-flex;
    align-items: center;
    justify-content: center;

    &--checked {
        border-color: var(--color-primary);
        background-color: var(--color-primary);
        color: #fff;
    }

    &:not(:disabled):hover {
        border-color: var(--color-primary);
    }

    &:disabled {
        opacity: 0.5;
        cursor: not-allowed;
    }
}
</style>
