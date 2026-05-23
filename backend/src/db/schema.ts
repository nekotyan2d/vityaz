import { pgTable, serial, varchar, integer, timestamp, uuid, pgEnum, uniqueIndex, index } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

export const employeeRoleEnum = pgEnum("employee_role", ["admin", "employee"]);

export const accessDirectionEnum = pgEnum("access_direction", ["in", "out"]);

export const accessStatusEnum = pgEnum("access_status", ["allowed", "denied", "violation"]);

export const employeeCategories = pgTable("employee_categories", {
    id: serial("id").primaryKey(),
    name: varchar("name", { length: 100 }).notNull().unique(),
    description: varchar("description", { length: 255 }),
    createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const roomTypes = pgTable("room_types", {
    id: serial("id").primaryKey(),
    name: varchar("name", { length: 100 }).notNull().unique(),
    description: varchar("description", { length: 255 }),
    createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const floors = pgTable("floors", {
    id: serial("id").primaryKey(),
    number: integer("number").notNull().unique(),
    description: varchar("description", { length: 255 }),
});

export const rooms = pgTable("rooms", {
    id: serial("id").primaryKey(),
    floorId: integer("floor_id")
        .notNull()
        .references(() => floors.id),
    roomTypeId: integer("room_type_id")
        .notNull()
        .references(() => roomTypes.id),
    number: varchar("number", { length: 20 }).notNull(),
    name: varchar("name", { length: 255 }),
    qrToken: uuid("qr_token").notNull().unique().defaultRandom(),
    createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const employees = pgTable("employees", {
    id: serial("id").primaryKey(),
    email: varchar("email", { length: 255 }).notNull().unique(),
    fullName: varchar("full_name", { length: 255 }).notNull(),
    categoryId: integer("category_id")
        .notNull()
        .references(() => employeeCategories.id),
    role: employeeRoleEnum("role").notNull().default("employee"),
    passwordHash: varchar("password_hash", { length: 255 }).notNull(),
    createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const employeesBans = pgTable("employees_bans", {
    id: serial("id").primaryKey(),
    employeeId: integer("employee_id")
        .notNull()
        .references(() => employees.id),
    reason: varchar("reason", { length: 255 }).notNull(),
    bannedBy: integer("banned_by")
        .notNull()
        .references(() => employees.id),
    createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const refreshTokens = pgTable(
    "refresh_tokens",
    {
        id: serial("id").primaryKey(),
        employeeId: integer("employee_id")
            .notNull()
            .references(() => employees.id),
        token: varchar("token", { length: 512 }).notNull().unique(),
        expiresAt: timestamp("expires_at").notNull(),
        createdAt: timestamp("created_at").notNull().defaultNow(),
        revokedAt: timestamp("revoked_at"),
    },
    (table) => ({
        tokenIdx: index("refresh_tokens_token_idx").on(table.token),
        employeeIdx: index("refresh_tokens_employee_id_idx").on(table.employeeId),
    }),
);

export const categoryAccessRules = pgTable(
    "category_access_rules",
    {
        id: serial("id").primaryKey(),
        categoryId: integer("category_id")
            .notNull()
            .references(() => employeeCategories.id),
        roomTypeId: integer("room_type_id")
            .notNull()
            .references(() => roomTypes.id),
        createdAt: timestamp("created_at").notNull().defaultNow(),
    },
    (table) => ({
        uniqueCategoryRoomType: uniqueIndex("category_access_rules_unique").on(table.categoryId, table.roomTypeId),
    }),
);

export const personalAccess = pgTable(
    "personal_access",
    {
        id: serial("id").primaryKey(),
        employeeId: integer("employee_id")
            .notNull()
            .references(() => employees.id),
        roomId: integer("room_id")
            .notNull()
            .references(() => rooms.id),
        grantedAt: timestamp("granted_at").notNull().defaultNow(),
        note: varchar("note", { length: 255 }),
    },
    (table) => ({
        uniqueEmployeeRoom: uniqueIndex("personal_access_unique").on(table.employeeId, table.roomId),
    }),
);

export const accessLog = pgTable("access_log", {
    id: serial("id").primaryKey(),
    employeeId: integer("employee_id")
        .notNull()
        .references(() => employees.id),
    roomId: integer("room_id")
        .notNull()
        .references(() => rooms.id),
    direction: accessDirectionEnum("direction").notNull(),
    status: accessStatusEnum("status").notNull(),
    denyReason: varchar("deny_reason", { length: 255 }),
    createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const employeeCategoriesRelations = relations(employeeCategories, ({ many }) => ({
    employees: many(employees),
    categoryAccessRules: many(categoryAccessRules),
}));

export const roomTypesRelations = relations(roomTypes, ({ many }) => ({
    rooms: many(rooms),
    categoryAccessRules: many(categoryAccessRules),
}));

export const floorsRelations = relations(floors, ({ many }) => ({
    rooms: many(rooms),
}));

export const roomsRelations = relations(rooms, ({ one, many }) => ({
    floor: one(floors, {
        fields: [rooms.floorId],
        references: [floors.id],
    }),
    roomType: one(roomTypes, {
        fields: [rooms.roomTypeId],
        references: [roomTypes.id],
    }),
    personalAccess: many(personalAccess),
    accessLog: many(accessLog),
}));

export const employeesRelations = relations(employees, ({ one, many }) => ({
    category: one(employeeCategories, {
        fields: [employees.categoryId],
        references: [employeeCategories.id],
    }),
    bans: many(employeesBans, { relationName: "bannedEmployee" }),
    issuedBans: many(employeesBans, { relationName: "banIssuer" }),
    personalAccess: many(personalAccess),
    accessLog: many(accessLog),
    refreshTokens: many(refreshTokens),
}));

export const employeesBansRelations = relations(employeesBans, ({ one }) => ({
    employee: one(employees, {
        fields: [employeesBans.employeeId],
        references: [employees.id],
        relationName: "bannedEmployee",
    }),
    bannedByEmployee: one(employees, {
        fields: [employeesBans.bannedBy],
        references: [employees.id],
        relationName: "banIssuer",
    }),
}));

export const refreshTokensRelations = relations(refreshTokens, ({ one }) => ({
    employee: one(employees, {
        fields: [refreshTokens.employeeId],
        references: [employees.id],
    }),
}));

export const categoryAccessRulesRelations = relations(categoryAccessRules, ({ one }) => ({
    category: one(employeeCategories, {
        fields: [categoryAccessRules.categoryId],
        references: [employeeCategories.id],
    }),
    roomType: one(roomTypes, {
        fields: [categoryAccessRules.roomTypeId],
        references: [roomTypes.id],
    }),
}));

export const personalAccessRelations = relations(personalAccess, ({ one }) => ({
    employee: one(employees, {
        fields: [personalAccess.employeeId],
        references: [employees.id],
    }),
    room: one(rooms, {
        fields: [personalAccess.roomId],
        references: [rooms.id],
    }),
}));

export const accessLogRelations = relations(accessLog, ({ one }) => ({
    employee: one(employees, {
        fields: [accessLog.employeeId],
        references: [employees.id],
    }),
    room: one(rooms, {
        fields: [accessLog.roomId],
        references: [rooms.id],
    }),
}));