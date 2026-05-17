<template>
    <h2>Войти</h2>
    <form @submit.prevent="onSubmit">
        <UiInput
            :schema="schemas.email"
            v-model="models.email"
            type="email"
            placeholder="Почта" />
        <UiInput
            :schema="schemas.password"
            v-model="models.password"
            placeholder="Пароль"
            type="password" />
        <div class="auth-switch">
            Нет аккаунта?
            <NuxtLink :to="{ name: 'register' }">Зарегистрироваться</NuxtLink>
        </div>
        <UiButton :disabled="!!models.email.error || !!models.password.error">Войти</UiButton>
    </form>
</template>
<script lang="ts" setup>
import z from "zod";

definePageMeta({
    layout: "auth",
});

const authStore = useAuthStore();

const models = ref({
    email: {
        value: "",
        error: undefined,
    },
    password: {
        value: "",
        error: undefined,
    },
});

const schemas = {
    email: z.email({ message: "Некорректный email" }),
    password: z.string().min(6, { message: "Пароль должен быть не менее 6 символов" }),
};

async function onSubmit() {
    if (models.value.email.error || models.value.password.error) {
        return;
    }

    try {
        await authStore.login({ email: models.value.email.value, password: models.value.password.value });
        navigateTo({ name: "home" });
    } catch (error) {
        console.error(error);
    }
}
</script>
