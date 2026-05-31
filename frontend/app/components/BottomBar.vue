<template>
    <nav class="bottom-bar">
        <NuxtLink :to="{ name: 'qr' }">
            <Icon
                name="material-symbols:qr-code-scanner-rounded"
                :size="24" />
            <span>QR</span>
        </NuxtLink>
        <NuxtLink :to="{ name: 'log' }">
            <Icon
                name="material-symbols:history-rounded"
                :size="24" />
            <span>Журнал</span>
        </NuxtLink>
        <UiPopupMenu
            class="account-item"
            :items="accountMenu"
            placement="top"
            @select="onAccountAction">
            <template #trigger>
                <button class="account-btn">
                    <Icon
                        name="material-symbols:person-outline-rounded"
                        :size="24" />
                    <span>Аккаунт</span>
                </button>
            </template>
        </UiPopupMenu>
    </nav>
</template>

<script lang="ts" setup>
import type { MenuItem } from "@/components/ui/PopupMenu.vue";

const authStore = useAuthStore();

const accountMenu: MenuItem[] = [
    { label: "Мой аккаунт", value: "account", icon: "material-symbols:person-outline-rounded" },
    { label: "Выйти", value: "logout", icon: "material-symbols:logout-rounded", danger: true },
];

async function onAccountAction(item: MenuItem) {
    if (item.value === "account") {
        navigateTo({ name: "account" });
    } else if (item.value === "logout") {
        await authStore.logout();
        navigateTo({ name: "index" });
    }
}
</script>

<style lang="scss" scoped>
.bottom-bar {
    display: flex;
    align-items: stretch;
    background-color: var(--color-background-secondary);
    border-top: 1px solid var(--color-input-border);
    flex-shrink: 0;

    .account-item {
        flex: 1;
        width: auto;

        :deep(.popup-menu-wrapper) {
            width: 100%;
        }
    }

    a,
    .account-btn {
        flex: 1;
        width: 100%;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        gap: 4px;
        padding: 10px 8px;
        color: var(--color-text-secondary);
        font-size: 0.75rem;
        background: none;
        border: none;
        cursor: pointer;
        font-family: inherit;
        transition: color 0.2s;

        &:hover {
            color: var(--color-text);
            text-decoration: none;
        }

        &.router-link-exact-active {
            color: var(--color-primary);
        }
    }
}
</style>