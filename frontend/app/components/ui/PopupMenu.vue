<template>
    <div
        ref="wrapperRef"
        class="popup-menu-wrapper">
        <div @click="toggle">
            <slot name="trigger" />
        </div>
        <Transition name="popup-menu">
            <div
                v-if="open"
                class="popup-menu">
                <button
                    v-for="item in items"
                    :key="item.value"
                    class="popup-menu__item"
                    :class="{ 'popup-menu__item--active': modelValue === item.value }"
                    :disabled="item.disabled"
                    type="button"
                    @click="onSelect(item)">
                    {{ item.label }}
                </button>
            </div>
        </Transition>
    </div>
</template>

<script lang="ts" setup>
export interface MenuItem {
    label: string;
    value: string | number;
    disabled?: boolean;
}

const props = defineProps<{
    items: MenuItem[];
    modelValue?: unknown;
}>();

const emit = defineEmits<{
    (e: "select", item: MenuItem): void;
}>();

const open = ref(false);
const wrapperRef = ref<HTMLElement | null>(null);

function toggle() {
    open.value = !open.value;
}

function onSelect(item: MenuItem) {
    emit("select", item);
    open.value = false;
}

function onOutsideClick(e: MouseEvent) {
    if (!wrapperRef.value?.contains(e.target as Node)) {
        open.value = false;
    }
}

onMounted(() => document.addEventListener("mousedown", onOutsideClick));
onBeforeUnmount(() => document.removeEventListener("mousedown", onOutsideClick));
</script>

<style lang="scss" scoped>
.popup-menu-wrapper {
    position: relative;
    width: 100%;
}

.popup-menu {
    position: absolute;
    top: calc(100% + 4px);
    left: 0;
    width: max-content;
    min-width: 100%;
    background-color: var(--color-background);
    border: 1px solid var(--color-input-border);
    border-radius: 12px;
    padding: 4px;
    z-index: 50;
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.12);
    max-height: 240px;
    overflow-y: auto;

    &__item {
        display: block;
        width: 100%;
        padding: 8px 12px;
        background: none;
        border: none;
        border-radius: 8px;
        text-align: left;
        font-size: 1rem;
        cursor: pointer;
        color: inherit;

        &:hover:not(:disabled) {
            background-color: var(--color-ripple);
        }

        &--active {
            color: var(--color-primary);
            background-color: var(--color-ripple);
            font-weight: 600;
        }

        &:disabled {
            opacity: 0.4;
            cursor: not-allowed;
        }
    }
}

.popup-menu-enter-active,
.popup-menu-leave-active {
    transition:
        opacity 0.15s ease,
        transform 0.15s ease;
}

.popup-menu-enter-from,
.popup-menu-leave-to {
    opacity: 0;
    transform: translateY(-4px);
}
</style>
