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
            @ban="openBan"
            @edit="openEdit"
            @access="openAccess" />

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
            v-if="accessTarget"
            :title="`Персональный допуск: ${accessTarget.full_name}`"
            @close="accessTarget = null">
            <div class="access-list">
                <div
                    v-for="item in personalAccesses"
                    :key="item.id"
                    class="access-item">
                    <div class="access-item__main">
                        <span class="access-item__room">{{ item.room_number }}</span>
                        <span class="access-item__sub">{{ item.room_type }}, {{ item.floor_number }} этаж</span>
                        <span
                            v-if="item.note"
                            class="access-item__note">
                            {{ item.note }}
                        </span>
                    </div>
                    <button
                        class="revoke-btn"
                        @click="revokeAccess(item.room_id)">
                        <Icon
                            name="material-symbols:close-rounded"
                            :size="18" />
                    </button>
                </div>
                <p
                    v-if="!personalAccesses.length"
                    class="access-empty">
                    Нет персональных допусков
                </p>
            </div>

            <form
                v-if="showGrantForm"
                class="popup-form"
                style="margin-top: 12px"
                @submit.prevent="submitGrant">
                <UiSelect
                    v-model="grantForm.roomId"
                    :options="availableRoomOptions"
                    placeholder="Помещение" />
                <UiInput
                    v-model="grantForm.note"
                    :schema="schemas.categoryDescription"
                    placeholder="Примечание (необязательно)" />
                <div style="display: flex; gap: 8px">
                    <UiButton
                        variant="default"
                        @click="showGrantForm = false">
                        Отмена
                    </UiButton>
                    <UiButton :disabled="!grantForm.roomId">Выдать</UiButton>
                </div>
            </form>
            <UiButton
                v-else
                style="margin-top: 12px"
                @click="showGrantForm = true">
                Выдать допуск
            </UiButton>
        </PopupWindow>

        <PopupWindow
            v-if="editTarget"
            :title="`Редактировать: ${editTarget.full_name}`"
            @close="editTarget = null">
            <form
                class="popup-form"
                @submit.prevent="submitEdit">
                <UiInput
                    v-model="editForm.fullName"
                    :schema="schemas.fullName"
                    placeholder="ФИО" />
                <UiInput
                    v-model="editForm.email"
                    :schema="schemas.email"
                    type="email"
                    placeholder="Почта" />
                <UiInput
                    v-model="editForm.password"
                    :schema="schemas.passwordOptional"
                    type="password"
                    placeholder="Новый пароль (необязательно)" />
                <UiSelect
                    v-model="editForm.categoryId"
                    :options="categoryOptions"
                    placeholder="Категория" />
                <UiButton :disabled="!!editForm.fullName.error || !!editForm.email.error || !!editForm.password.error">
                    Сохранить
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

type Room = paths["/rooms"]["get"]["responses"]["200"]["content"]["application/json"]["rooms"][number];
type PersonalAccess = paths["/access/personal/{employeeId}"]["get"]["responses"]["200"]["content"]["application/json"]["access"][number];

const showCreate = ref(false);
const showCategories = ref(false);
const categoryFormPopup = ref<{ mode: "create" | "edit"; target?: Category } | null>(null);
const banTarget = ref<Employee | null>(null);
const editTarget = ref<Employee | null>(null);
const accessTarget = ref<Employee | null>(null);
const personalAccesses = ref<PersonalAccess[]>([]);
const rooms = ref<Room[]>([]);
const showGrantForm = ref(false);
const grantForm = ref({
    roomId: "" as number | "",
    note: { value: "", error: undefined as string | undefined },
});

const editForm = ref({
    fullName: { value: "", error: undefined as string | undefined },
    email: { value: "", error: undefined as string | undefined },
    password: { value: "", error: undefined as string | undefined },
    categoryId: "" as number | "",
});

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
    passwordOptional: z.string().min(6, { message: "Минимум 6 символов" }).or(z.literal("")),
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

const availableRoomOptions = computed(() => {
    const grantedIds = new Set(personalAccesses.value.map((a) => a.room_id));
    return rooms.value
        .filter((r) => !grantedIds.has(r.id))
        .map((r) => ({ label: `${r.number}${r.name ? ` — ${r.name}` : ""}, ${r.floor_number} этаж`, value: r.id }));
});

async function openAccess(employee: Employee) {
    accessTarget.value = employee;
    showGrantForm.value = false;
    grantForm.value = { roomId: "", note: { value: "", error: undefined } };
    await loadPersonalAccesses();
}

async function loadPersonalAccesses() {
    if (!accessTarget.value) return;
    const res = await api.GET("/access/personal/{employeeId}", {
        params: { path: { employeeId: accessTarget.value.id } },
    });
    if (res.data) personalAccesses.value = res.data.access;
}

async function submitGrant() {
    if (!accessTarget.value || !grantForm.value.roomId) return;
    try {
        await api.POST("/access/personal", {
            body: {
                employee_id: accessTarget.value.id,
                room_id: grantForm.value.roomId as number,
                note: grantForm.value.note.value || undefined,
            },
        });
        notifications.add("success", "Допуск выдан");
        showGrantForm.value = false;
        grantForm.value = { roomId: "", note: { value: "", error: undefined } };
        await loadPersonalAccesses();
    } catch (e) {
        notifications.add("error", e instanceof Error ? e.message : "Ошибка");
    }
}

async function revokeAccess(roomId: number) {
    if (!accessTarget.value) return;
    try {
        await api.DELETE("/access/personal/{employeeId}/{roomId}", {
            params: { path: { employeeId: accessTarget.value.id, roomId } },
        });
        notifications.add("success", "Допуск отозван");
        await loadPersonalAccesses();
    } catch (e) {
        notifications.add("error", e instanceof Error ? e.message : "Ошибка");
    }
}

function openEdit(employee: Employee) {
    const cat = categories.value.find((c) => c.name === employee.category);
    editForm.value = {
        fullName: { value: employee.full_name, error: undefined },
        email: { value: employee.email, error: undefined },
        password: { value: "", error: undefined },
        categoryId: cat?.id ?? "",
    };
    editTarget.value = employee;
}

async function submitEdit() {
    if (!editTarget.value) return;
    try {
        const body: { full_name?: string; email?: string; category_id?: number; password?: string } = {};
        if (editForm.value.fullName.value !== editTarget.value.full_name) body.full_name = editForm.value.fullName.value;
        if (editForm.value.email.value !== editTarget.value.email) body.email = editForm.value.email.value;
        if (editForm.value.categoryId !== "") body.category_id = editForm.value.categoryId as number;
        if (editForm.value.password.value) body.password = editForm.value.password.value;

        await api.PATCH("/employees/{id}", {
            params: { path: { id: editTarget.value.id } },
            body,
        });
        notifications.add("success", "Данные сотрудника обновлены");
        editTarget.value = null;
        await loadEmployees();
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

async function loadRooms() {
    const res = await api.GET("/rooms");
    if (res.data) rooms.value = res.data.rooms;
}

await Promise.all([loadEmployees(), loadCategories(), loadRooms()]);
</script>

<style lang="scss" scoped>
.page-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 20px;

    .page-title {
        margin-bottom: 0;
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

.access-list {
    display: flex;
    flex-direction: column;
    gap: 8px;
}

.access-item {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 12px;
    padding: 10px 14px;
    background-color: var(--color-background-secondary);
    border-radius: 12px;

    &__main {
        display: flex;
        flex-direction: column;
        gap: 2px;
    }

    &__room {
        font-weight: 600;
    }

    &__sub {
        font-size: 0.875rem;
        color: var(--color-text-secondary);
    }

    &__note {
        font-size: 0.8125rem;
        color: var(--color-text-secondary);
        font-style: italic;
    }
}

.revoke-btn {
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
        background-color: color-mix(in srgb, #c62828 10%, transparent);
        color: #c62828;
    }
}

.access-empty {
    font-size: 0.875rem;
    color: var(--color-text-secondary);
    margin: 0;
    text-align: center;
    padding: 12px 0;
}
</style>
