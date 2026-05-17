<template>
    <div class="main-layout">
        <Sidebar />
        <main>
            <slot />
        </main>
    </div>
</template>
<style lang="scss" scoped>
.main-layout {
    display: flex;
    height: 100vh;
    height: 100dvh;
}
</style>
