<template>
    <div class="page">
        <div class="page-header">
            <h2 class="page-title">Сотрудники</h2>
            <div class="page-header__actions">
                <UiButton
                    variant="default"
                    @click="showCategories = true">
                    Категории
                </UiButton>
                <UiButton @click="showCreate = true">Добавить</UiButton>
            </div>
        </div>

        <EmployeesList
            v-if="employees.length"
            :employees="employees"
            @ban="openBan" />

        <PopupWindow
            v-if="showCategories"
            title="Категории сотрудников"
            @close="showCategories = false">
            <div class="categories">
                <div
                    v-for="cat in categories"
                    :key="cat.id"
                    class="category-item">
                    <div class="category-item__main">
                        <div class="category-item__top">
                            <span class="category-item__name">{{ cat.name }}</span>
                            <span
                                class="category-item__role"
                                :data-role="cat.role">
                                {{ roleLabel(cat.role) }}
                            </span>
                        </div>
                        <span
                            v-if="cat.description"
                            class="category-item__desc">
                            {{ cat.description }}
                        </span>
                    </div>
                    <UiPopupMenu
                        :items="categoryActions"
                        @select="onCategoryAction($event, cat)">
                        <template #trigger>
                            <button class="actions-btn">
                                <Icon
                                    name="material-symbols:more-vert"
                                    :size="20" />
                            </button>
                        </template>
                    </UiPopupMenu>
                </div>
                <UiButton @click="openCategoryCreate">Добавить категорию</UiButton>
            </div>
        </PopupWindow>

        <PopupWindow
            v-if="categoryFormPopup"
            :title="categoryFormPopup.mode === 'create' ? 'Новая категория' : 'Редактировать категорию'"
            @close="categoryFormPopup = null">
            <form
                class="popup-form"
                @submit.prevent="submitCategory">
                <UiInput
                    v-model="categoryForm.name"
                    :schema="schemas.categoryName"
                    placeholder="Название" />
                <UiInput
                    v-model="categoryForm.description"
                    :schema="schemas.categoryDescription"
                    placeholder="Описание (необязательно)" />
                <UiSelect
                    v-model="categoryForm.role"
                    :options="roleOptions"
                    placeholder="Роль" />
                <UiButton :disabled="!!categoryForm.name.error || !categoryForm.name.value || !categoryForm.role">
                    {{ categoryFormPopup.mode === "create" ? "Создать" : "Сохранить" }}
                </UiButton>
            </form>
        </PopupWindow>

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
                    :disabled="
                        !!createForm.fullName.error ||
                        !!createForm.email.error ||
                        !!createForm.password.error ||
                        !createForm.categoryId
                    ">
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
import type { MenuItem } from "@/components/ui/PopupMenu.vue";

type Employee = paths["/employees"]["get"]["responses"]["200"]["content"]["application/json"]["employees"][number];
type Category =
    paths["/dictionary/categories"]["get"]["responses"]["200"]["content"]["application/json"]["categories"][number];

const api = useApi();
const notifications = useNotificationsStore();

const employees = ref<Employee[]>([]);
const categories = ref<Category[]>([]);

const showCreate = ref(false);
const showCategories = ref(false);
const categoryFormPopup = ref<{ mode: "create" | "edit"; target?: Category } | null>(null);
const banTarget = ref<Employee | null>(null);

const categoryForm = ref({
    name: { value: "", error: undefined as string | undefined },
    description: { value: "", error: undefined as string | undefined },
    role: "" as "admin" | "employee" | "security" | "",
});

const roleOptions = [
    { label: "Сотрудник", value: "employee" },
    { label: "Охрана", value: "security" },
    { label: "Администратор", value: "admin" },
];

const categoryActions: MenuItem[] = [
    { label: "Редактировать", value: "edit", icon: "material-symbols:edit-outline-rounded" },
];

const schemas = {
    fullName: z
        .string()
        .regex(
            /^[А-ЯЁ][а-яё]+ [А-ЯЁ][а-яё]+ [А-ЯЁ][а-яё]+$/,
            "ФИО должно быть в формате Фамилия Имя Отчество, каждое слово должно начинаться с заглавной буквы и состоять из русских букв",
        ),
    email: z.email({ message: "Некорректный email" }),
    password: z.string().min(6, { message: "Минимум 6 символов" }),
    reason: z.string().min(1, { message: "Укажите причину" }).max(255),
    categoryName: z.string().min(1, "Обязательное поле").max(100),
    categoryDescription: z.string().optional(),
};

const createForm = ref({
    fullName: { value: "", error: undefined as string | undefined },
    email: { value: "", error: undefined as string | undefined },
    password: { value: "", error: undefined as string | undefined },
    categoryId: "" as number | "",
});

const banReason = ref({ value: "", error: undefined as string | undefined });

function roleLabel(role: string) {
    if (role === "admin") return "Администратор";
    if (role === "security") return "Охрана";
    return "Сотрудник";
}

async function loadEmployees() {
    const res = await api.GET("/employees");
    if (res.data) employees.value = res.data.employees;
}

async function loadCategories() {
    const res = await api.GET("/dictionary/categories");
    if (res.data) categories.value = res.data.categories;
}

const categoryOptions = computed(() => categories.value.map((c) => ({ label: c.name, value: c.id })));

function openCategoryCreate() {
    categoryForm.value = {
        name: { value: "", error: undefined },
        description: { value: "", error: undefined },
        role: "",
    };
    categoryFormPopup.value = { mode: "create" };
}

function openCategoryEdit(cat: Category) {
    categoryForm.value = {
        name: { value: cat.name, error: undefined },
        description: { value: cat.description ?? "", error: undefined },
        role: cat.role,
    };
    categoryFormPopup.value = { mode: "edit", target: cat };
}

function onCategoryAction(item: MenuItem, cat: Category) {
    if (item.value === "edit") openCategoryEdit(cat);
}

async function submitCategory() {
    if (!categoryForm.value.role) return;

    const body = {
        name: categoryForm.value.name.value,
        description: categoryForm.value.description.value || undefined,
        role: categoryForm.value.role as "admin" | "employee" | "security",
    };

    try {
        if (categoryFormPopup.value?.mode === "create") {
            await api.POST("/dictionary/categories", { body });
            notifications.add("success", `Категория "${body.name}" создана`);
        } else {
            const id = categoryFormPopup.value!.target!.id;
            await api.PATCH("/dictionary/categories/{id}", { params: { path: { id } }, body });
            notifications.add("success", "Категория обновлена");
        }
        categoryFormPopup.value = null;
        await loadCategories();
    } catch (e) {
        notifications.add("error", e instanceof Error ? e.message : "Ошибка");
    }
}

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

    &__actions {
        display: flex;
        gap: 8px;
    }
}

.categories {
    display: flex;
    flex-direction: column;
    gap: 8px;
}

.category-item {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 12px;
    padding: 12px 16px;
    background-color: var(--color-background-secondary);
    border-radius: 12px;

    &__main {
        display: flex;
        flex-direction: column;
        gap: 4px;
        padding-top: 2px;
    }

    &__top {
        display: flex;
        align-items: center;
        gap: 8px;
    }

    &__name {
        font-weight: 600;
    }

    &__role {
        font-size: 0.75rem;
        font-weight: 600;
        padding: 2px 8px;
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

    &__desc {
        font-size: 0.875rem;
        color: var(--color-text-secondary);
    }
}

.actions-btn {
    background: none;
    border: none;
    cursor: pointer;
    color: var(--color-text-secondary);
    display: flex;
    align-items: center;
    padding: 4px;
    border-radius: 8px;
    flex-shrink: 0;
    transition: 0.2s;

    &:hover {
        background-color: var(--color-ripple);
        color: var(--color-text);
    }
}

.popup-form {
    display: flex;
    flex-direction: column;
    gap: 12px;
}
</style>
