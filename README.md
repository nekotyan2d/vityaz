# Витязь

Система контроля доступа на основе QR-кодов. Позволяет управлять доступом сотрудников в помещения без специализированного оборудования — роль считывателя выполняет браузер смартфона.

## Возможности

- Сканирование QR-кода помещения с мгновенным результатом
- Управление сотрудниками: создание, редактирование, блокировка
- Матрица доступа по категориям сотрудников и типам помещений
- Персональные допуски поверх категориальных правил
- Журнал посещений с фиксацией нарушений
- Экран у двери с событиями в реальном времени через SSE
- Три роли: администратор, охрана, сотрудник

## Стек

**Backend** — Node.js 24, Fastify 5, TypeScript, PostgreSQL, Drizzle ORM, JWT (httpOnly cookies)

**Frontend** — Nuxt 4, Vue 3, Pinia, TypeScript, SCSS

**Инфраструктура** — Docker, Docker Compose, Docker Swarm, Traefik

## Быстрый старт

```bash
git clone <url>
cd vityaz
cp .env.example .env
docker compose up --build
```

Веб-интерфейс: `http://localhost:3000`

Учётная запись по умолчанию:

| Email              | Пароль   | Роль          |
| ------------------ | -------- | ------------- |
| admin@vityaz.local | admin123 | Администратор |

## Разработка

**Backend:**

```bash
cd backend
pnpm install
pnpm dev          # запуск с hot-reload
pnpm test         # тесты
pnpm db:generate  # сгенерировать миграцию после изменения схемы
```

**Frontend:**

```bash
cd frontend
pnpm install
pnpm dev       # запуск на localhost:3000
pnpm gen:api   # обновить типы из OpenAPI (требует запущенного бэкенда)
```

## Переменные окружения

### Локальная разработка (`.env`)

| Переменная             | Обязательная | По умолчанию            |
| ---------------------- | ------------ | ----------------------- |
| `POSTGRES_PASSWORD`    | ✓            | —                       |
| `ACCESS_TOKEN_SECRET`  | ✓            | —                       |
| `REFRESH_TOKEN_SECRET` | ✓            | —                       |
| `POSTGRES_USER`        |              | `vityaz`                |
| `POSTGRES_DB`          |              | `vityaz`                |
| `NUXT_PUBLIC_API_URL`  |              | `http://localhost:8000` |
| `FRONTEND_URL`         |              | `http://localhost:3000` |

### Production (дополнительно)

| Переменная              | Описание                                                   |
| ----------------------- | ---------------------------------------------------------- |
| `COOKIE_DOMAIN`         | Домен для cookie, например `.vityaz.example.com`           |
| `NUXT_INTERNAL_API_URL` | Внутренний URL API для SSR, например `http://backend:8000` |

## Структура

```
vityaz/
├── backend/          # Fastify API
│   ├── src/
│   │   ├── features/ # Модули: auth, employee, building, access, sse
│   │   ├── db/       # Схема, миграции, seed
│   │   └── middleware/
│   └── drizzle/      # SQL-миграции
├── frontend/         # Nuxt 4
│   └── app/
│       ├── pages/
│       ├── components/
│       ├── stores/
│       └── middleware/
└── docker-compose.yml
```

## API документация

Swagger UI доступен по адресу `http://localhost:8000/docs` после запуска бэкенда.

## Экран у двери

Страница `/sse/:roomId` предназначена для постоянного отображения на устройстве у входа. Не требует авторизации. `roomId` — числовой ID помещения из базы данных.

## Тесты

```bash
cd backend
pnpm test
```

32 модульных теста для `AuthService`, `EmployeeService`, `BuildingService`.
