import { hashPassword } from "@/utils/pass";
import { db } from "./client";
import { employeeCategories, employees } from "./schema";

async function main() {
    console.log("🌱 Seeding database...");
    await db
        .insert(employeeCategories)
        .values([
            { name: "guest", description: "Гость", id: 1 },
            { name: "admin", description: "Администратор", id: 2 },
        ])
        .onConflictDoNothing();

    await db.insert(employees).values([
        {
            id: 1,
            email: "admin@example.com",
            fullName: "Админов Админ Админович",
            passwordHash: await hashPassword("admin123"),
            categoryId: 2,
        },
    ]);
}

main().then(() => {
    console.log("⚡ Database seeded successfully");
    process.exit(0);
});
