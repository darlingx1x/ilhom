# Vatan Press — Электронная подписка на газеты и журналы

Информационная система для оформления и чтения электронных подписок на узбекские издания. Проектная работа-2 кафедры «Конвергенция цифровых технологий», ТУИТ.

## Технологии

- React 18 + Vite + TypeScript + TailwindCSS
- React Router 6, react-i18next (ru, uz)
- Vercel Serverless Functions (Node.js)
- Neon PostgreSQL (`@neondatabase/serverless`)
- Vercel Blob (PDF-номера, обложки)
- JWT + bcrypt, валидация zod

## Локальный запуск

```bash
cp .env.example .env
npm install
npm run dev
```

Откройте http://localhost:5173.

## Структура

```
api/           Vercel Serverless Functions (auth, каталог, подписки, админка)
src/           Фронтенд React-приложение
  pages/       Страницы по роутам
  components/  ui/, layout/, catalog/, admin/
  lib/         api, auth, i18n, format
  locales/     ru.json, uz.json
db/            schema.sql, seed.sql, migrate.ts
docs/          Спецификации и скриншоты
```

## Деплой

`git push` в подключённый Vercel-репозиторий. Переменные окружения настраиваются в Vercel UI (DATABASE_URL, JWT_SECRET, BLOB_READ_WRITE_TOKEN).
