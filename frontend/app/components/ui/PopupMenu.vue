<template>
    <div
        ref="wrapperRef"
        class="popup-menu-wrapper">
        <div @click="toggle">
            <slot name="trigger" />
        </div>
        <Teleport to="body">
            <Transition name="popup-menu">
                <div
                    v-if="open"
                    ref="menuRef"
                    class="popup-menu"
                    :style="menuStyle">
                    <button
                        v-for="item in items"
                        :key="item.value"
                        class="popup-menu__item"
                        :class="{
                            'popup-menu__item--active': modelValue === item.value,
                            'popup-menu__item--danger': item.danger,
                        }"
                        :disabled="item.disabled"
                        type="button"
                        @click="onSelect(item)">
                        <Icon
                            v-if="item.icon"
                            :name="item.icon"
                            :size="18" />
                        {{ item.label }}
                    </button>
                </div>
            </Transition>
        </Teleport>
    </div>
</template>

<script lang="ts" setup>
export interface MenuItem {
    label: string;
    value: string | number;
    icon?: string;
    danger?: boolean;
    disabled?: boolean;
}

const props = defineProps<{
    items: MenuItem[];
    modelValue?: unknown;
    placement?: "bottom" | "top";
}>();

const emit = defineEmits<{
    (e: "select", item: MenuItem): void;
}>();

const open = ref(false);
const wrapperRef = ref<HTMLElement | null>(null);
const menuRef = ref<HTMLElement | null>(null);
const menuStyle = ref<Record<string, string | undefined>>({});

function toggle() {
    open.value = !open.value;
}

function onSelect(item: MenuItem) {
    emit("select", item);
    open.value = false;
}

function onOutsideClick(e: MouseEvent) {
    if (!wrapperRef.value?.contains(e.target as Node) && !menuRef.value?.contains(e.target as Node)) {
        open.value = false;
    }
}

watch(open, async (isOpen) => {
    if (!isOpen) return;
    await nextTick();
    if (!wrapperRef.value || !menuRef.value) return;

    const trigger = wrapperRef.value.getBoundingClientRect();
    const menu = menuRef.value.getBoundingClientRect();
    const overflowsRight = trigger.left + menu.width > window.innerWidth;

    const horizontal = overflowsRight
        ? { right: `${window.innerWidth - trigger.right}px` }
        : { left: `${trigger.left}px` };

    const vertical = props.placement === "top"
        ? { bottom: `${window.innerHeight - trigger.top + 4}px` }
        : { top: `${trigger.bottom + 4}px` };

    menuStyle.value = { position: "fixed", ...horizontal, ...vertical };
});

onMounted(() => document.addEventListener("mousedown", onOutsideClick));
onBeforeUnmount(() => document.removeEventListener("mousedown", onOutsideClick));
</script>

<style lang="scss" scoped>
.popup-menu-wrapper {
    position: relative;
    width: fit-content;
}
</style>

<style lang="scss">
.popup-menu {
    width: max-content;
    min-width: 160px;
    background-color: var(--color-background);
    border: 1px solid var(--color-input-border);
    border-radius: 12px;
    padding: 4px;
    z-index: 1000;
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.12);
    max-height: 240px;
    overflow-y: auto;

    &__item {
        display: flex;
        align-items: center;
        gap: 8px;
        width: 100%;
        padding: 8px 12px;
        background: none;
        border: none;
        border-radius: 8px;
        text-align: left;
        font-size: 1rem;
        cursor: pointer;
        color: var(--color-text);
        font-family: inherit;

        &:hover:not(:disabled) {
            background-color: var(--color-ripple);
        }

        &--active {
            color: var(--color-primary);
            background-color: var(--color-ripple);
            font-weight: 600;
        }

        &--danger {
            color: #c62828;

            &:hover:not(:disabled) {
                background-color: color-mix(in srgb, #c62828 10%, transparent);
            }
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
