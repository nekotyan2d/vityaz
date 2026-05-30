<template>
    <button
        :disabled="props.disabled"
        :data-variant="props.variant ?? 'default'">
        <slot />
    </button>
</template>
<script lang="ts" setup>
const props = defineProps<{
    disabled?: boolean;
    variant?: "default" | "danger";
}>();
</script>
<style lang="scss" scoped>
button {
    padding: 0.5rem 1rem;
    background-color: var(--color-primary);
    color: #fff;
    border: none;
    border-radius: 24px;
    cursor: pointer;
    font-weight: bold;
    width: fit-content;
    font-family: inherit;

    &[data-variant="danger"] {
        background-color: #c62828;
    }

    &:disabled {
        opacity: 0.6;
        cursor: not-allowed;
    }
}
</style>
