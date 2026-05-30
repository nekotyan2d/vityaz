<template>
    <div class="page">
        <h2 class="page-title">Аккаунт</h2>

        <div
            v-if="user"
            class="account">
            <div class="account__card">
                <div class="account__avatar">
                    {{ initials }}
                </div>
                <div class="account__info">
                    <span class="account__name">{{ user.full_name }}</span>
                    <span class="account__email">{{ user.email }}</span>
                </div>
            </div>

            <div class="account__details">
                <div class="account__row">
                    <span class="account__label">Категория</span>
                    <span class="account__value">{{ user.category }}</span>
                </div>
                <div class="account__row">
                    <span class="account__label">Роль</span>
                    <span
                        class="account__role"
                        :data-role="user.role">
                        {{ roleLabel }}
                    </span>
                </div>
                <div class="account__row">
                    <span class="account__label">Дата регистрации</span>
                    <span class="account__value">{{ formatDate(user.created_at) }}</span>
                </div>
            </div>

            <UiButton
                class="account__logout"
                variant="danger"
                @click="onLogout">
                Выйти из аккаунта
            </UiButton>
        </div>
    </div>
</template>

<script lang="ts" setup>
const authStore = useAuthStore();
const notifications = useNotificationsStore();

const user = computed(() => authStore.currentUser);

const initials = computed(() => {
    if (!user.value) return "";
    return user.value.full_name
        .split(" ")
        .slice(0, 2)
        .map((w) => w[0])
        .join("");
});

const roleLabel = computed(() => {
    if (user.value?.role === "admin") return "Администратор";
    if (user.value?.role === "security") return "Охрана";
    return "Сотрудник";
});

function formatDate(iso: string) {
    return new Date(iso).toLocaleDateString("ru-RU", {
        day: "2-digit",
        month: "long",
        year: "numeric",
    });
}

async function onLogout() {
    try {
        await authStore.logout();
        navigateTo({ name: "index" });
    } catch {
        notifications.add("error", "Не удалось выйти из аккаунта");
    }
}
</script>

<style lang="scss" scoped>
.account {
    display: flex;
    flex-direction: column;
    gap: 16px;
    max-width: 480px;

    &__card {
        display: flex;
        align-items: center;
        gap: 16px;
        padding: 20px;
        background-color: var(--color-background-secondary);
        border-radius: 16px;
    }

    &__avatar {
        width: 56px;
        height: 56px;
        border-radius: 50%;
        background-color: var(--color-primary);
        color: #fff;
        font-size: 1.25rem;
        font-weight: 700;
        display: flex;
        align-items: center;
        justify-content: center;
        flex-shrink: 0;
    }

    &__info {
        display: flex;
        flex-direction: column;
        gap: 2px;
        overflow: hidden;
    }

    &__name {
        font-weight: 600;
        font-size: 1rem;
    }

    &__email {
        font-size: 0.875rem;
        color: var(--color-text-secondary);
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
    }

    &__details {
        display: flex;
        flex-direction: column;
        background-color: var(--color-background-secondary);
        border-radius: 16px;
        overflow: hidden;
    }

    &__row {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 14px 20px;

        &:not(:last-child) {
            border-bottom: 1px solid var(--color-ripple);
        }
    }

    &__label {
        font-size: 0.875rem;
        color: var(--color-text-secondary);
    }

    &__value {
        font-size: 0.875rem;
        font-weight: 500;
    }

    &__role {
        font-size: 0.75rem;
        font-weight: 600;
        padding: 2px 10px;
        border-radius: 24px;
        background-color: var(--color-ripple);

        &[data-role="admin"] {
            background-color: var(--color-primary);
            color: #fff;
        }

        &[data-role="security"] {
            background-color: #1565c0;
            color: #fff;
        }
    }

    &__logout {
        align-self: flex-start;
    }
}
</style>
