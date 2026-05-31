<template>
    <Transition name="overlay">
        <div
            v-if="open"
            class="sidebar-overlay"
            @click="$emit('close')" />
    </Transition>
    <nav :class="{ 'nav--open': open, 'nav--user-collapsed': userState === 'collapsed', 'nav--user-expanded': userState === 'expanded' }">
        <div class="logo">
            <Icon
                class="logo-icon"
                name="material-symbols:shield-rounded"
                :size="28" />
            <span class="logo-text">Витязь</span>
        </div>
        <ul>
            <li>
                <NuxtLink :to="{ name: 'home' }">
                    <Icon
                        size="24"
                        name="material-symbols:home-outline-rounded" />
                    <span class="nav-label">Главная</span>
                </NuxtLink>
            </li>
            <li v-if="isAdmin">
                <NuxtLink :to="{ name: 'employees' }">
                    <Icon
                        size="24"
                        name="material-symbols:groups-outline-rounded" />
                    <span class="nav-label">Сотрудники</span>
                </NuxtLink>
            </li>
            <li v-if="isAdmin">
                <NuxtLink :to="{ name: 'structure' }">
                    <Icon
                        size="24"
                        name="material-symbols:account-tree-outline-rounded" />
                    <span class="nav-label">Структура</span>
                </NuxtLink>
            </li>
            <li>
                <NuxtLink :to="{ name: 'journal' }">
                    <Icon
                        size="24"
                        name="material-symbols:history-rounded" />
                    <span class="nav-label">Журнал</span>
                </NuxtLink>
            </li>
            <li v-if="isAdmin">
                <NuxtLink :to="{ name: 'access-matrix' }">
                    <Icon
                        size="24"
                        name="material-symbols:grid-on-outline" />
                    <span class="nav-label">Матрица доступа</span>
                </NuxtLink>
            </li>
        </ul>
        <div class="bottom">
            <button
                class="collapse-btn"
                @click="toggleCollapse">
                <Icon
                    class="chevron-collapse"
                    name="material-symbols:chevron-left-rounded"
                    :size="20" />
                <Icon
                    class="chevron-expand"
                    name="material-symbols:chevron-right-rounded"
                    :size="20" />
            </button>
            <UiPopupMenu
                :items="accountMenu"
                placement="top"
                @select="onAccountAction"
                class="account">
                <template #trigger>
                    <button class="account-trigger">
                        <Icon
                            size="24"
                            name="material-symbols:person-outline-rounded" />
                        <span class="nav-label">Аккаунт</span>
                    </button>
                </template>
            </UiPopupMenu>
        </div>
    </nav>
</template>

<script lang="ts" setup>
import type { MenuItem } from "@/components/ui/PopupMenu.vue";

defineProps<{ open?: boolean }>();
defineEmits<{ (e: "close"): void }>();

const authStore = useAuthStore();
const isAdmin = computed(() => authStore.currentUser?.role === "admin");

const userState = ref<null | "collapsed" | "expanded">(null);
const mediaMatch = ref(false);

onMounted(() => {
    const mq = window.matchMedia("(min-width: 769px) and (max-width: 1100px)");
    mediaMatch.value = mq.matches;
    mq.addEventListener("change", (e) => {
        mediaMatch.value = e.matches;
        userState.value = null;
    });
});

const collapsed = computed(() => {
    if (userState.value === "collapsed") return true;
    if (userState.value === "expanded") return false;
    return mediaMatch.value;
});

function toggleCollapse() {
    userState.value = collapsed.value ? "expanded" : "collapsed";
}

const accountMenu: MenuItem[] = [
    { label: "Мой аккаунт", value: "account", icon: "material-symbols:person-outline-rounded" },
    { label: "Выйти", value: "logout", icon: "material-symbols:logout-rounded", danger: true },
];

async function onAccountAction(item: MenuItem) {
    if (item.value === "account") navigateTo({ name: "account" });
    else if (item.value === "logout") {
        await authStore.logout();
        navigateTo({ name: "index" });
    }
}
</script>

<style lang="scss" scoped>
nav {
    background-color: var(--color-background-secondary);
    width: 250px;
    padding: 16px;
    display: flex;
    flex-direction: column;
    overflow-y: auto;
    overflow-x: hidden;
    flex-shrink: 0;
    transition: width 0.25s ease;

    &.nav--user-collapsed {
        width: 68px;
        padding-inline: 8px;
    }
}

@media (min-width: 769px) and (max-width: 1100px) {
    nav:not(.nav--user-expanded) {
        width: 68px;
        padding-inline: 8px;
    }
}

.logo {
    color: var(--color-primary);
    margin: 0 1rem 1rem;
    font-size: 1.25rem;
    font-weight: 700;
    height: 32px;
    display: flex;
    align-items: center;
    white-space: nowrap;
    overflow: hidden;
}

.logo-icon {
    display: none;
    flex-shrink: 0;
}

.chevron-expand {
    display: none;
}

ul {
    list-style: none;
    margin: 0;
    padding: 0;
    flex: 1;
}

a,
.account-trigger {
    display: flex;
    align-items: center;
    padding: 0.5rem;
    gap: 0.5rem;
    color: var(--color-text-secondary);
    border-radius: 16px;
    transition:
        background-color 0.2s,
        color 0.2s;
    white-space: nowrap;
    overflow: hidden;
    width: 100%;

    &:hover {
        text-decoration: none;
        background-color: var(--color-ripple);
    }

    &.router-link-exact-active {
        color: var(--color-primary);
        border-radius: 12px;
    }
}
.account {
    width: 100%;
}
.account-trigger {
    background: none;
    border: none;
    cursor: pointer;
    font-size: 1rem;
    font-family: inherit;
}

.nav-label {
    transition:
        opacity 0.2s ease,
        max-width 0.25s ease;
    max-width: 200px;
    opacity: 1;
    overflow: hidden;
}

@mixin collapsed {
    .logo { margin-inline: 0; justify-content: center; }
    .logo-text { display: none; }
    .logo-icon { display: block; }
    .nav-label { max-width: 0; opacity: 0; }
    a, .account-trigger { justify-content: center; padding: 0.5rem; gap: 0; }
    .collapse-btn { align-self: center; }
    .chevron-collapse { display: none; }
    .chevron-expand { display: block; }
}

.nav--user-collapsed {
    @include collapsed;
}

@media (min-width: 769px) and (max-width: 1100px) {
    nav:not(.nav--user-expanded) {
        @include collapsed;
    }
}

.bottom {
    display: flex;
    flex-direction: column;
    gap: 4px;
    align-items: center;
}

.collapse-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 6px;
    background: none;
    border: none;
    cursor: pointer;
    color: var(--color-text-secondary);
    border-radius: 8px;
    transition: 0.2s;
    align-self: flex-end;

    &:hover {
        background-color: var(--color-ripple);
        color: var(--color-text);
    }
}

.sidebar-overlay {
    display: none;
}

@media (max-width: 768px) {
    nav {
        position: fixed;
        top: 0;
        left: 0;
        height: 100%;
        width: 280px;
        z-index: 200;
        transform: translateX(-100%);
        transition: transform 0.25s ease;

        &.nav--open {
            transform: translateX(0);
        }

        &.nav--collapsed {
            width: 280px;
        }

        .nav-label {
            max-width: 200px;
            opacity: 1;
        }

        .collapse-btn {
            display: none;
        }
    }

    .sidebar-overlay {
        display: block;
        position: fixed;
        inset: 0;
        background-color: rgba(0, 0, 0, 0.4);
        z-index: 199;
    }
}

.overlay-enter-active,
.overlay-leave-active {
    transition: opacity 0.25s ease;
}

.overlay-enter-from,
.overlay-leave-to {
    opacity: 0;
}
</style>
