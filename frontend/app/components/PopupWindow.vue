<template>
    <div class="popup-window-backdrop">
        <div class="popup-window">
            <div class="content">
                <header class="title">
                    <h3>{{ $props.title }}</h3>
                    <button
                        class="close"
                        @click="$emit('close')">
                        <Icon
                            name="mdi:close"
                            :size="32" />
                    </button>
                </header>
                <slot />
            </div>
        </div>
    </div>
</template>
<script lang="ts" setup>
defineProps<{
    title: string;
}>();

defineEmits<{
    (e: "close"): void;
}>();
</script>

<style lang="scss" scoped>
.popup-window-backdrop {
    position: fixed;
    inset: 0;
    background-color: rgba(0, 0, 0, 0.4);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 100;
}

.popup-window {
    background-color: var(--color-background);
    border-radius: 20px;
    width: 100%;
    max-width: 480px;
    padding: 24px;

    .content {
        display: flex;
        flex-direction: column;
        gap: 20px;
    }

    .title {
        display: flex;
        align-items: center;
        justify-content: space-between;

        h3 {
            margin: 0;
        }

        .close {
            background: none;
            border: none;
            cursor: pointer;
            color: var(--color-text-secondary);
            display: flex;
            align-items: center;
            padding: 4px;
            border-radius: 100%;
            height: 32px;
            width: 32px;
            transition: 0.3s;

            &:hover {
                background-color: var(--color-ripple);
            }
        }
    }
}
</style>
