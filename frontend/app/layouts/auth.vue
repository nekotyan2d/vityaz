<template>
    <div class="auth-layout">
        <div class="hero">
            <div class="hero__content">
                <h1 class="hero__title">Витязь</h1>
                <p class="hero__subtitle">Контроль доступа</p>
            </div>
        </div>
        <div class="auth">
            <slot />
        </div>
    </div>
</template>
<style lang="scss">
.auth-layout {
    display: flex;
    height: 100vh;
    height: 100dvh;
    .hero {
        flex: 1;
        display: flex;
        align-items: center;
        justify-content: center;
        background: linear-gradient(145deg, #fff 0%, #e7f3e7 100%);

        &__content {
            text-align: center;
        }
        &__title {
            margin-bottom: 0.5rem;
            color: var(--color-primary);
        }
        &__subtitle {
            margin-top: 0.5rem;
        }
    }

    .auth {
        max-width: 400px;
        width: 100%;
        margin: 0 auto;
        padding: 2rem;
        display: flex;
        flex-direction: column;
        justify-content: center;

        form {
            display: flex;
            flex-direction: column;
            gap: 1rem;

            .auth-switch {
                text-align: center;
                font-size: 0.9rem;

                a {
                    color: var(--color-primary);
                    font-weight: bold;
                }
            }

            button {
                margin: 0 auto;
            }
        }
    }
}
</style>
