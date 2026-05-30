<template>
    <div class="main-layout">
        <Sidebar />
        <main>
            <slot />
        </main>
    </div>
</template>
<style lang="scss">
.main-layout {
    display: flex;
    height: 100vh;
    height: 100dvh;
    overflow: hidden;

    main {
        flex: 1;
        overflow-y: auto;
        min-height: 0;
    }

    .page {
        padding: 24px;
    }
}
</style>
