import { hashPassword } from "@/utils/pass";
import { db } from "./client";
import { categoryAccessRules, employeeCategories, employees, roomTypes } from "./schema";

async function main() {
    console.log("🌱 Seeding database...");

    // Категории сотрудников
    await db
        .insert(employeeCategories)
        .values([
            { id: 1, name: "Администрация", description: "Ректорат и административный персонал", role: "admin" },
            { id: 2, name: "Преподаватель", description: "Профессорско-преподавательский состав" },
            { id: 3, name: "Аспирант", description: "Аспиранты и научные сотрудники" },
            { id: 4, name: "Студент", description: "Студенты очной и заочной формы" },
            { id: 5, name: "Охрана", description: "Служба безопасности университета", role: "security" },
            { id: 6, name: "Технический персонал", description: "Обслуживающий и технический персонал" },
            { id: 7, name: "Гость", description: "Пользователь без назначенной роли — ограниченный доступ" },
        ])
        .onConflictDoNothing();

    // Типы помещений
    await db
        .insert(roomTypes)
        .values([
            { id: 1, name: "Аудитория", description: "Учебная аудитория для занятий" },
            { id: 2, name: "Лаборатория", description: "Научная или учебная лаборатория" },
            { id: 3, name: "Кафедра", description: "Помещение кафедры или деканата" },
            { id: 4, name: "Серверная", description: "Серверное и сетевое оборудование" },
            { id: 5, name: "Библиотека", description: "Библиотека и читальный зал" },
            { id: 6, name: "Спортзал", description: "Спортивные залы и раздевалки" },
            { id: 7, name: "Пост охраны", description: "Контрольно-пропускной пункт" },
            { id: 8, name: "Склад", description: "Складские и подсобные помещения" },
        ])
        .onConflictDoNothing();

    // Администратор системы
    await db
        .insert(employees)
        .values([
            {
                id: 1,
                email: "admin@vityaz.local",
                fullName: "Админов Админ Админович",
                passwordHash: await hashPassword("admin123"),
                categoryId: 1,
            },
        ])
        .onConflictDoNothing();

    // Матрица доступа по умолчанию
    await db
        .insert(categoryAccessRules)
        .values([
            // Администрация (1) — все помещения
            { categoryId: 1, roomTypeId: 1 },
            { categoryId: 1, roomTypeId: 2 },
            { categoryId: 1, roomTypeId: 3 },
            { categoryId: 1, roomTypeId: 4 },
            { categoryId: 1, roomTypeId: 5 },
            { categoryId: 1, roomTypeId: 6 },
            { categoryId: 1, roomTypeId: 7 },
            { categoryId: 1, roomTypeId: 8 },
            // Преподаватель (2) — аудитории, лаборатории, кафедры, библиотека
            { categoryId: 2, roomTypeId: 1 },
            { categoryId: 2, roomTypeId: 2 },
            { categoryId: 2, roomTypeId: 3 },
            { categoryId: 2, roomTypeId: 5 },
            // Аспирант (3) — аудитории, лаборатории, библиотека
            { categoryId: 3, roomTypeId: 1 },
            { categoryId: 3, roomTypeId: 2 },
            { categoryId: 3, roomTypeId: 5 },
            // Студент (4) — аудитории, библиотека, спортзал
            { categoryId: 4, roomTypeId: 1 },
            { categoryId: 4, roomTypeId: 5 },
            { categoryId: 4, roomTypeId: 6 },
            // Охрана (5) — все помещения
            { categoryId: 5, roomTypeId: 1 },
            { categoryId: 5, roomTypeId: 2 },
            { categoryId: 5, roomTypeId: 3 },
            { categoryId: 5, roomTypeId: 4 },
            { categoryId: 5, roomTypeId: 5 },
            { categoryId: 5, roomTypeId: 6 },
            { categoryId: 5, roomTypeId: 7 },
            { categoryId: 5, roomTypeId: 8 },
            // Технический персонал (6) — лаборатории, серверная, склад
            { categoryId: 6, roomTypeId: 2 },
            { categoryId: 6, roomTypeId: 4 },
            { categoryId: 6, roomTypeId: 8 },
            // Гость (7) — без доступа к помещениям (только через персональный допуск)
        ])
        .onConflictDoNothing();

    console.log("⚡ Database seeded successfully");
    process.exit(0);
}

main().catch((err) => {
    console.error("❌ Seed failed:", err);
    process.exit(1);
});
