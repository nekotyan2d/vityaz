<template>
    <nav>
        <h2 class="logo">Витязь</h2>
        <ul>
            <li>
                <NuxtLink :to="{ name: 'home' }"
                    ><Icon
                        size="24"
                        name="material-symbols:home-outline-rounded" />Главная</NuxtLink
                >
            </li>
            <li>
                <NuxtLink :to="{ name: 'employees' }"
                    ><Icon
                        size="24"
                        name="material-symbols:groups-outline-rounded" />Сотрудники</NuxtLink
                >
            </li>
            <li>
                <NuxtLink :to="{ name: 'structure' }"
                    ><Icon
                        size="24"
                        name="material-symbols:account-tree-outline-rounded" />Структура</NuxtLink
                >
            </li>
            <li>
                <NuxtLink :to="{ name: 'journal' }"
                    ><Icon
                        size="24"
                        name="material-symbols:history-rounded" />Журнал</NuxtLink
                >
            </li>
            <li>
                <NuxtLink :to="{ name: 'access-matrix' }"
                    ><Icon
                        size="24"
                        name="material-symbols:grid-on-rounded" />Матрица доступа</NuxtLink
                >
            </li>
        </ul>
        <div class="bottom">
            <UiPopupMenu
                :items="accountMenu"
                placement="top"
                @select="onAccountAction">
                <template #trigger>
                    <button class="account-trigger">
                        <Icon
                            size="24"
                            name="material-symbols:person-outline-rounded" />
                        Аккаунт
                    </button>
                </template>
            </UiPopupMenu>
        </div>
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
nav {
    background-color: var(--color-background-secondary);
    max-width: 250px;
    width: 100%;
    padding: 16px;
    display: flex;
    flex-direction: column;
    overflow-y: auto;

    .logo {
        color: var(--color-primary);
        margin: 0 1rem 1rem;
    }

    ul {
        list-style: none;
        margin: 0;
        padding: 0;
        flex: 1;
    }

    a {
        display: flex;
        align-items: center;
        padding: 0.5rem 1rem;
        gap: 0.5rem;
        color: var(--color-text-secondary);
        border-radius: 16px;
        transition: 0.3s;

        &:hover {
            text-decoration: none;
            background-color: var(--color-ripple);
        }

        &.router-link-exact-active {
            color: var(--color-primary);
            border-radius: 12px;
        }
    }
}

.account-trigger {
    display: flex;
    align-items: center;
    padding: 0.5rem 1rem;
    gap: 0.5rem;
    width: 100%;
    background: none;
    border: none;
    cursor: pointer;
    color: var(--color-text-secondary);
    border-radius: 16px;
    font-size: 1rem;
    font-family: inherit;
    transition: 0.3s;

    &:hover {
        background-color: var(--color-ripple);
    }
}
</style>
