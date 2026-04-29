# Spec — Информационная система электронной подписки на газеты и журналы

**Дата:** 2026-04-29
**Студент:** Абдуллаев Ильхом, группа 035-22
**Кафедра:** «Конвергенция цифровых технологий», ТУИТ
**Тема:** №29. Создание информационной системы электронной подписки на газеты и журналы
**Тип работы:** Проектная работа-2 (30–40 страниц)

---

## 1. Регламент оформления Word-документа

**Источник правил:** PPTX-презентация `Презентация Проектная работа.pptx` — основной регламент. Дополнительно — `ТРЕБОВАНИЯ__ПРОМТ.md` для усиленных стандартов качества (стиль, ссылки, рисунки), там, где не противоречит PPTX.

**Параметры документа:**
- Формат `.docx`, язык русский.
- Times New Roman, 14 pt, межстрочный 1.5, выравнивание по ширине.
- Поля: левое 30 мм, правое 20 мм, верхнее 25 мм, нижнее 25 мм.
- Нумерация страниц (со «Введения»).
- Объём 30–40 страниц.
- Теоретическая часть ≥11–14 страниц, минимум 3 раздела.

**Структура:**
1. Титульный лист
2. Лист задания
3. Содержание
4. Введение
5. Теоретическая часть (≥3 раздела)
6. Практическая часть
7. Заключение
8. Использованная литература и интернет-ссылки
9. Приложения

**Стандарты качества (из .md):**
- Стиль без AI-клише, без двоеточий и длинных тире как стилистики.
- Английские термины и аббревиатуры раскрываются на русском при первом упоминании.
- Рисунки — по центру, ширина 16 см, подпись снизу TNR 12pt без курсива, формат «Рис. N. Название».
- Таблицы — единое оформление, межстрочный 1.0, по центру, шапка полужирная.
- Ссылки на источники — `[N]` в конце абзацев, каждая в отдельных скобках, не более 6 на абзац.
- Источники не старше 2021 года, ≥3 нормативных акта Республики Узбекистан, раскрытых по сути.

---

## 2. Технологический стек

| Слой | Технология | Обоснование |
|---|---|---|
| Frontend | React 18 + Vite + TypeScript + TailwindCSS + shadcn/ui | Быстрый запуск, современный стек, легковесная сборка |
| Маршрутизация | React Router v6 | Стандарт для SPA |
| Локализация | react-i18next | Поддержка двух языков (ru, uz) |
| Backend | Vercel Serverless Functions (Node.js, TypeScript) | Один репозиторий с фронтом, без отдельного сервера |
| База данных | Neon PostgreSQL (бесплатный план) | Управляемый Postgres, не засыпает данные после деплоя |
| Драйвер БД | `@neondatabase/serverless` | HTTP-драйвер, оптимизирован под Serverless |
| Файлы | Vercel Blob (5 ГБ бесплатно) | Хранение PDF и обложек, прямая загрузка с фронта |
| Аутентификация | JWT (jsonwebtoken) + bcrypt | Самописная авторизация без внешних провайдеров |
| Валидация | zod | Типобезопасные схемы запросов |
| Деплой | Vercel (бесплатный план) | Автодеплой по `git push`, бесплатный домен `*.vercel.app` |

**Запуск локально:** `npm install && npm run dev` (под капотом `vercel dev`).
**Деплой:** `git push` → автосборка на Vercel.

---

## 3. Функциональные роли

- **Гость** — просмотр главной, каталога, карточки издания, регистрация.
- **Читатель (`reader`)** — всё, что гость, плюс оформление подписки, личный кабинет, доступ к PDF номеров активных подписок, история платежей.
- **Администратор (`admin`)** — всё, что читатель, плюс админ-панель: CRUD изданий, загрузка номеров (PDF + обложки), просмотр пользователей, дашборд с метриками.

---

## 4. Архитектура

**Слои:**

1. **Клиент (браузер)** — React SPA, JWT в localStorage, прямая загрузка файлов в Vercel Blob.
2. **API (Vercel Serverless Functions)** — папка `/api`, проверка JWT, SQL-запросы в Neon, выдача подписанных URL для Blob.
3. **БД (Neon PostgreSQL)** — таблицы пользователей, изданий, категорий, номеров, подписок, платежей.
4. **Файловое хранилище (Vercel Blob)** — PDF и обложки, доступ по публичному URL, метаданные в БД.

**Поток оформления подписки:**
Клиент → POST /api/subscriptions с JWT → API проверяет токен и валидирует данные → INSERT subscriptions → INSERT payments → возврат `{subscription_id, status, end_date}` → клиент обновляет UI.

**Поток загрузки PDF (админ):**
Админ выбирает файл → запрос подписанного URL у API → прямая загрузка в Blob → отправка метаданных в API → INSERT issues с url из Blob.

---

## 5. Модель данных (ER)

**Таблицы:**

### `users`
- `id` SERIAL PK
- `email` VARCHAR(255) UNIQUE NOT NULL
- `password_hash` VARCHAR(255) NOT NULL
- `full_name` VARCHAR(255) NOT NULL
- `phone` VARCHAR(20)
- `role` VARCHAR(20) NOT NULL DEFAULT 'reader'
- `created_at` TIMESTAMP DEFAULT NOW()

### `categories`
- `id` SERIAL PK
- `slug` VARCHAR(50) UNIQUE NOT NULL
- `name_ru` VARCHAR(100) NOT NULL
- `name_uz` VARCHAR(100) NOT NULL

### `publications`
- `id` SERIAL PK
- `slug` VARCHAR(100) UNIQUE NOT NULL
- `title_ru`, `title_uz` VARCHAR(255) NOT NULL
- `description_ru`, `description_uz` TEXT NOT NULL
- `cover_url` TEXT NOT NULL
- `category_id` INT NOT NULL REFERENCES `categories(id)`
- `type` VARCHAR(20) NOT NULL — `newspaper` или `magazine`
- `price_per_month` INT NOT NULL — в сумах
- `is_published` BOOLEAN NOT NULL DEFAULT TRUE
- `created_at`, `updated_at` TIMESTAMP DEFAULT NOW()

### `issues`
- `id` SERIAL PK
- `publication_id` INT NOT NULL REFERENCES `publications(id) ON DELETE CASCADE`
- `issue_number` INT NOT NULL
- `title_ru`, `title_uz` VARCHAR(255)
- `published_at` DATE NOT NULL
- `pdf_url` TEXT NOT NULL
- `cover_url` TEXT
- `created_at` TIMESTAMP DEFAULT NOW()
- UNIQUE(`publication_id`, `issue_number`)

### `subscriptions`
- `id` SERIAL PK
- `user_id` INT NOT NULL REFERENCES `users(id)`
- `publication_id` INT NOT NULL REFERENCES `publications(id)`
- `period_months` INT NOT NULL
- `start_date`, `end_date` DATE NOT NULL
- `status` VARCHAR(20) NOT NULL — `pending`, `active`, `expired`, `cancelled`
- `total_amount` INT NOT NULL
- `created_at` TIMESTAMP DEFAULT NOW()

### `payments`
- `id` SERIAL PK
- `subscription_id` INT NOT NULL REFERENCES `subscriptions(id)`
- `amount` INT NOT NULL
- `card_last4` VARCHAR(4) NOT NULL
- `status` VARCHAR(20) NOT NULL — `success`, `failed`
- `paid_at` TIMESTAMP DEFAULT NOW()

**Связи:**
- `users` 1—∞ `subscriptions`
- `publications` 1—∞ `subscriptions`
- `publications` 1—∞ `issues`
- `categories` 1—∞ `publications`
- `subscriptions` 1—∞ `payments`

**Индексы:**
- `subscriptions(user_id, status)`
- `issues(publication_id, published_at DESC)`
- `publications(category_id, is_published)`

**Контроль доступа к PDF:** при запросе номера API проверяет наличие активной подписки текущего пользователя на это издание (`status='active' AND end_date >= CURRENT_DATE`). Без активной подписки — 403.

---

## 6. Экраны и роуты

**Публичные:**
1. `/` — Главная (Hero, популярные издания, CTA)
2. `/catalog` — Каталог (фильтры, поиск, сортировка, пагинация)
3. `/publications/:slug` — Карточка издания (выбор срока, кнопка «Подписаться», превью номеров)
4. `/login` — Вход
5. `/register` — Регистрация

**Личный кабинет (`reader`):**
6. `/account` — Профиль
7. `/account/subscriptions` — Мои подписки
8. `/account/subscriptions/:id` — Детали + архив номеров со скачиванием PDF
9. `/account/payments` — История платежей
10. `/checkout/:publicationId` — Оформление подписки (имитация оплаты)

**Админка (`admin`):**
11. `/admin` — Дашборд с метриками
12. `/admin/publications` — Список изданий
13. `/admin/publications/new` и `/admin/publications/:id/edit` — Форма
14. `/admin/publications/:id/issues` — Управление номерами + загрузка PDF
15. `/admin/users` — Список пользователей

**Защита роутов:** `<ProtectedRoute>` (требует JWT), `<AdminRoute>` (требует роль admin).

---

## 7. API-эндпоинты

**Auth:**
- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/auth/me`

**Каталог (публичный):**
- `GET /api/categories`
- `GET /api/publications?category=&type=&q=&sort=&page=`
- `GET /api/publications/:slug`

**Подписки (требует JWT):**
- `GET /api/subscriptions` — мои
- `GET /api/subscriptions/:id`
- `POST /api/subscriptions`
- `POST /api/subscriptions/:id/renew`
- `POST /api/subscriptions/:id/cancel`

**Платежи:**
- `GET /api/payments`

**Админ (требует роль admin):**
- `POST /api/admin/publications`
- `PATCH /api/admin/publications/:id`
- `DELETE /api/admin/publications/:id`
- `POST /api/admin/issues`
- `DELETE /api/admin/issues/:id`
- `POST /api/admin/blob/upload-url`
- `GET /api/admin/stats`
- `GET /api/admin/users`

---

## 8. Аутентификация и безопасность

- JWT в localStorage, payload `{user_id, role, exp}`, срок жизни 30 дней, секрет в `JWT_SECRET`.
- bcrypt для паролей, salt rounds = 10.
- Middleware `withAuth(handler, { role? })` для защищённых эндпоинтов.
- Валидация через zod.
- CORS не нужен (фронт и API на одном домене).
- Имитация оплаты — валидация формата карты (Luhn), CVV, срока. Любая корректно сформированная карта проходит.

---

## 9. Визуальный язык

- **Палитра:** фон #FAF8F4 (бумажный), акцент #B8252C (тёмно-красный газетный), текст #1A1A1A.
- **Типографика:** заголовки `Playfair Display` (засечный, газетный), текст `Inter` (sans-serif).
- **Сетка:** max-width 1280 px, карточки изданий в 4 колонки (lg) / 2 (md) / 1 (sm).
- **Компоненты:** shadcn/ui (Button, Card, Dialog, Tabs, Input, Select) + кастомные «газетные» карточки.
- **Финальные детали** — через `frontend-design` skill в новом терминале.

---

## 10. Локализация

- `react-i18next` + `src/locales/ru.json` + `src/locales/uz.json`.
- Контент в БД — двуязычные колонки (`title_ru`/`title_uz`, `name_ru`/`name_uz` и т.д.).
- Переключатель в шапке, выбор сохраняется в localStorage, дефолт `ru`.

---

## 11. Seed-данные

- 7 категорий: Газеты, Журналы, Бизнес, Наука, Культура, Детские, Спорт.
- 12 изданий (микс узнаваемых газет и журналов, обложки сгенерированные или с открытых источников).
- 3–6 номеров на издание с демо-PDF.
- 1 учётка админа: `admin@news.uz / admin123`.
- 2–3 учётки читателей с заполненными подписками для красивых скриншотов.

---

## 12. Структура репозитория

```
ilhom/
├── api/
│   ├── _lib/{db.ts, auth.ts, validate.ts, blob.ts}
│   ├── auth/{register, login, me}.ts
│   ├── publications/{index, [slug]}.ts
│   ├── subscriptions/{index, [id], renew, cancel}.ts
│   ├── payments/index.ts
│   └── admin/{publications, issues, stats, users, blob}.ts
├── src/
│   ├── pages/
│   ├── components/{ui/, layout/, catalog/, admin/}
│   ├── lib/{api.ts, auth.ts, i18n.ts, format.ts}
│   ├── locales/{ru.json, uz.json}
│   ├── App.tsx, main.tsx, router.tsx
├── db/{schema.sql, seed.sql, migrate.ts}
├── public/
├── docs/
│   ├── architecture.png
│   ├── er-diagram.png
│   └── superpowers/specs/2026-04-29-news-subscription-design.md
├── package.json, vite.config.ts, tailwind.config.ts, vercel.json, .env.example, README.md
```

---

## 13. План скриншотов для Word-документа

14 рисунков для практической части:
1. Главная страница
2. Каталог с фильтрами
3. Каталог с поиском
4. Карточка издания
5. Регистрация и Вход (две формы)
6. Личный кабинет — профиль
7. Мои подписки
8. Детали подписки с архивом номеров
9. Оформление подписки (имитация оплаты)
10. История платежей
11. Админ-дашборд
12. Список изданий в админке
13. Форма добавления / редактирования издания
14. Управление номерами и загрузка PDF

---

## 14. План работы

1. **Этап 1 — scaffold проекта.** Vite + Tailwind + TypeScript, базовая структура, env-переменные.
2. **Этап 2 — БД.** Создание Neon-проекта, миграции, seed-данные.
3. **Этап 3 — API.** Серверлесс-функции, аутентификация, эндпоинты каталога, подписок, платежей, админки.
4. **Этап 4 — фронтенд (frontend-design skill).** Дизайн-система, главный layout, страницы каталога и карточки издания.
5. **Этап 5 — фронтенд (продолжение).** Личный кабинет, оформление подписки, чтение номеров.
6. **Этап 6 — админка.** CRUD изданий, загрузка номеров через Vercel Blob.
7. **Этап 7 — локализация.** Все строки в i18n, тестирование переключения.
8. **Этап 8 — деплой на Vercel.** Подключение Neon и Blob, проверка прод-окружения.
9. **Этап 9 — скриншоты.** Прохождение всех 14 экранов, сохранение PNG в `docs/screens/`.
10. **Этап 10 — Word-документ.** Сборка `.docx` по PPTX-регламенту, вставка скриншотов, формул, ER-диаграммы, архитектурной схемы, списка литературы.

---

## 15. Источники для списка литературы (стартовый список, дополним)

**Нормативные акты Республики Узбекистан:**
1. Закон РУз №541 от 15.01.2007 «О средствах массовой информации» (действующая редакция).
2. Закон РУз №ЗРУ-560 от 24.04.2019 «О связи».
3. Постановление Президента РУз №ПП-3832 от 20.06.2018 «О мерах по дальнейшему совершенствованию информационной сферы».
4. Указ Президента РУз №УП-6079 от 05.10.2020 «Об утверждении Стратегии «Цифровой Узбекистан — 2030».

**Технические:**
5. PostgreSQL Documentation, версия 16, postgresql.org/docs (дата обращения 2026-04-29).
6. React Documentation, react.dev (дата обращения 2026-04-29).
7. MDN Web Docs, developer.mozilla.org (дата обращения 2026-04-29).
8. Vercel Documentation, vercel.com/docs.
9. Neon Documentation, neon.tech/docs.

**Литература (после 2021):**
10. Орлов С. А. «Технологии разработки программного обеспечения», Питер, 2022.
11. Колисниченко Д. Н. «PostgreSQL. Основы», БХВ-Петербург, 2023.

(Список будет расширен в процессе написания работы до 20–25 источников.)
