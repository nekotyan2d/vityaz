<template>
    <div class="notifications">
        <TransitionGroup name="notification">
            <div
                v-for="n in store.items"
                :key="n.id"
                class="notification"
                :data-type="n.type">
                <Icon
                    :name="icons[n.type]"
                    :size="24" />
                <span class="notification__message">{{ n.message }}</span>
                <button
                    class="notification__close"
                    @click="store.remove(n.id)">
                    <Icon
                        name="mdi:close"
                        :size="24" />
                </button>
            </div>
        </TransitionGroup>
    </div>
</template>

<script lang="ts" setup>
const store = useNotificationsStore();

const icons = {
    error: "material-symbols:error-outline-rounded",
    success: "material-symbols:check-circle-outline-rounded",
    info: "material-symbols:info-outline-rounded",
};
</script>

<style lang="scss" scoped>
.notifications {
    position: fixed;
    top: 24px;
    right: 24px;
    z-index: 200;
    display: flex;
    flex-direction: column;
    gap: 10px;
    width: 320px;
}

.notification {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    padding: 14px 16px;
    border-radius: 12px;
    border-left: 4px solid transparent;
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.12);

    &[data-type="error"] {
        --notification-color: #c62828;
    }

    &[data-type="success"] {
        --notification-color: #2e7d32;
    }

    &[data-type="info"] {
        --notification-color: #1565c0;
    }

    color: var(--notification-color);
    background-color: color-mix(in srgb, var(--notification-color) 8%, white);

    :deep(svg:first-child) {
        align-self: flex-start;
        flex-shrink: 0;
        margin-top: 1px;
    }

    &__message {
        font-size: 0.875rem;
        line-height: 1.4;
        flex: 1;
    }

    &__close {
        background: none;
        border: none;
        cursor: pointer;
        color: inherit;
        display: flex;
        align-items: center;
        flex-shrink: 0;
        padding: 4px;
        border-radius: 100%;

        &:hover {
            background-color: color-mix(in srgb, var(--notification-color) 15%, white);
        }
    }
}

.notification-enter-active,
.notification-leave-active {
    transition: all 0.25s ease;
}

.notification-enter-from {
    opacity: 0;
    transform: translateX(40px);
}

.notification-leave-to {
    opacity: 0;
    transform: translateX(40px);
}
</style>
