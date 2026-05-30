<template>
    <h2>Регистрация</h2>
    <form @submit.prevent="onSubmit">
        <UiInput
            :schema="schemas.fullName"
            v-model="models.fullName"
            placeholder="ФИО"
            type="text" />
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
            Есть аккаунт?
            <NuxtLink :to="{ name: 'index' }">Войти</NuxtLink>
        </div>
        <UiButton :disabled="!!models.fullName.error || !!models.email.error || !!models.password.error">Зарегистрироваться</UiButton>
    </form>
</template>
<script lang="ts" setup>
import z from "zod";

definePageMeta({
    layout: "auth",
});

const authStore = useAuthStore();

const models = ref({
    fullName: {
        value: "",
        error: undefined,
    },
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
    fullName: z
        .string()
        .regex(
            /^[А-ЯЁ][а-яё]+ [А-ЯЁ][а-яё]+ [А-ЯЁ][а-яё]+$/,
            "ФИО должно быть в формате Фамилия Имя Отчество, каждое слово должно начинаться с заглавной буквы и состоять из русских букв",
        ),

    email: z.email({ message: "Некорректный email" }),
    password: z.string().min(6, { message: "Пароль должен быть не менее 6 символов" }),
};

async function onSubmit() {
    if (models.value.fullName.error || models.value.email.error || models.value.password.error) {
        return;
    }

    try {
        await authStore.register({
            email: models.value.email.value,
            fullName: models.value.fullName.value,
            password: models.value.password.value,
        });
        navigateTo({ name: "home" });
    } catch (error) {
        console.error(error);
    }
}
</script>
