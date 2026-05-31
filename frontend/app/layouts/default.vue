<template>
    <div class="main-layout">
        <Sidebar
            :open="sidebarOpen"
            @close="sidebarOpen = false" />
        <div class="layout-body">
            <header class="mobile-header">
                <button
                    class="mobile-header__burger"
                    @click="sidebarOpen = true">
                    <Icon
                        name="material-symbols:menu-rounded"
                        :size="24" />
                </button>
                <span class="mobile-header__logo">Витязь</span>
            </header>
            <main>
                <slot />
            </main>
        </div>
    </div>
</template>

<script lang="ts" setup>
const sidebarOpen = ref(false);
const route = useRoute();
watch(() => route.path, () => { sidebarOpen.value = false; });
</script>

<style lang="scss">
.main-layout {
    height: 100vh;
    height: 100dvh;
    overflow: hidden;
    display: flex;
}

.layout-body {
    flex: 1;
    min-width: 0;
    display: flex;
    flex-direction: column;
    overflow: hidden;

    > main {
        flex: 1;
        overflow-y: auto;
        min-height: 0;
    }
}

.main-layout .page {
    padding: 24px;
}

.mobile-header {
    display: none;
    align-items: center;
    gap: 12px;
    padding: 12px 16px;
    background-color: var(--color-background-secondary);
    border-bottom: 1px solid var(--color-input-border);
    flex-shrink: 0;

    &__burger {
        background: none;
        border: none;
        cursor: pointer;
        color: var(--color-text);
        display: flex;
        align-items: center;
        padding: 4px;
        border-radius: 8px;

        &:hover {
            background-color: var(--color-ripple);
        }
    }

    &__logo {
        font-size: 1.125rem;
        font-weight: 700;
        color: var(--color-primary);
    }
}

@media (max-width: 768px) {
    .mobile-header {
        display: flex;
    }
}
</style>
