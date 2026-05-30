<template>
    <div class="page">
        <div class="page-header">
            <h2 class="page-title">Сотрудники</h2>
            <UiButton @click="showCreate = true">Добавить</UiButton>
        </div>

        <EmployeesList
            v-if="employees.length"
            :employees="employees"
            @ban="openBan" />

        <PopupWindow
            v-if="showCreate"
            title="Новый сотрудник"
            @close="closeCreate">
            <form
                class="popup-form"
                @submit.prevent="submitCreate">
                <UiInput
                    v-model="createForm.fullName"
                    :schema="schemas.fullName"
                    placeholder="ФИО" />
                <UiInput
                    v-model="createForm.email"
                    :schema="schemas.email"
                    type="email"
                    placeholder="Почта" />
                <UiInput
                    v-model="createForm.password"
                    :schema="schemas.password"
                    type="password"
                    placeholder="Пароль" />
                <UiSelect
                    v-model="createForm.categoryId"
                    :options="categoryOptions"
                    placeholder="Категория" />
                <UiButton
                    :disabled="!!createForm.fullName.error || !!createForm.email.error || !!createForm.password.error || !createForm.categoryId">
                    Создать
                </UiButton>
            </form>
        </PopupWindow>

        <PopupWindow
            v-if="banTarget"
            :title="`Заблокировать: ${banTarget.full_name}`"
            @close="closeBan">
            <form
                class="popup-form"
                @submit.prevent="submitBan">
                <UiInput
                    v-model="banReason"
                    :schema="schemas.reason"
                    placeholder="Причина блокировки" />
                <UiButton :disabled="!!banReason.error || !banReason.value">Заблокировать</UiButton>
            </form>
        </PopupWindow>
    </div>
</template>

<script lang="ts" setup>
import z from "zod";
import type { paths } from "@/api/types";

type Employee = paths["/employees"]["get"]["responses"]["200"]["content"]["application/json"]["employees"][number];
type Category = paths["/dictionary/categories"]["get"]["responses"]["200"]["content"]["application/json"]["categories"][number];

const api = useApi();
const notifications = useNotificationsStore();

const employees = ref<Employee[]>([]);
const categories = ref<Category[]>([]);

const showCreate = ref(false);
const banTarget = ref<Employee | null>(null);

const schemas = {
    fullName: z.string().regex(/^[А-ЯЁ][а-яё]+ [А-ЯЁ][а-яё]+ [А-ЯЁ][а-яё]+$/, "ФИО должно быть в формате Фамилия Имя Отчество, каждое слово должно начинаться с заглавной буквы и состоять из русских букв"),
    email: z.email({ message: "Некорректный email" }),
    password: z.string().min(6, { message: "Минимум 6 символов" }),
    reason: z.string().min(1, { message: "Укажите причину" }).max(255),
};

const createForm = ref({
    fullName: { value: "", error: undefined as string | undefined },
    email: { value: "", error: undefined as string | undefined },
    password: { value: "", error: undefined as string | undefined },
    categoryId: "" as number | "",
});

const banReason = ref({ value: "", error: undefined as string | undefined });

async function loadEmployees() {
    const res = await api.GET("/employees");
    if (res.data) employees.value = res.data.employees;
}

async function loadCategories() {
    const res = await api.GET("/dictionary/categories");
    if (res.data) categories.value = res.data.categories;
}

const categoryOptions = computed(() =>
    categories.value.map((c) => ({ label: c.name, value: c.id })),
);

function openBan(employee: Employee) {
    banTarget.value = employee;
    banReason.value = { value: "", error: undefined };
}

function closeBan() {
    banTarget.value = null;
}

function closeCreate() {
    showCreate.value = false;
    createForm.value = {
        fullName: { value: "", error: undefined },
        email: { value: "", error: undefined },
        password: { value: "", error: undefined },
        categoryId: "",
    };
}

async function submitCreate() {
    if (!createForm.value.categoryId) return;

    try {
        await api.POST("/employees", {
            body: {
                full_name: createForm.value.fullName.value,
                email: createForm.value.email.value,
                password: createForm.value.password.value,
                category_id: createForm.value.categoryId as number,
            },
        });
        notifications.add("success", "Сотрудник успешно создан");
        closeCreate();
        await loadEmployees();
    } catch (e) {
        notifications.add("error", e instanceof Error ? e.message : "Не удалось создать сотрудника");
    }
}

async function submitBan() {
    if (!banTarget.value) return;

    try {
        await api.POST("/employees/{id}/ban", {
            params: { path: { id: banTarget.value.id } },
            body: { reason: banReason.value.value },
        });
        notifications.add("success", `${banTarget.value.full_name} заблокирован`);
        closeBan();
        await loadEmployees();
    } catch (e) {
        notifications.add("error", e instanceof Error ? e.message : "Не удалось заблокировать сотрудника");
    }
}

await Promise.all([loadEmployees(), loadCategories()]);
</script>

<style lang="scss" scoped>
.page-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 20px;

    .page-title {
        margin: 0;
    }
}

.popup-form {
    display: flex;
    flex-direction: column;
    gap: 12px;
}

</style>
