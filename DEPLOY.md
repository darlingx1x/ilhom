# Деплой Vatan Press на Vercel

Репозиторий: https://github.com/darlingx1x/ilhom — `main`.

## Вариант 1 — через Vercel Dashboard (без CLI, рекомендуется)

1. Открой https://vercel.com/new
2. Войди через GitHub под аккаунтом, к которому привязан `darlingx1x/ilhom`
3. Кнопка **Import Git Repository**, выбери `darlingx1x/ilhom`
4. На экране настроек проекта Vercel сам подхватит `vercel.json` (Vite + Node 20). Менять ничего не надо
5. Раскрой **Environment Variables** и добавь три ключа из `.env.local`:
   - `DATABASE_URL` — Neon Postgres URL
   - `JWT_SECRET` — секрет JWT
   - `BLOB_READ_WRITE_TOKEN` — токен Vercel Blob
   Поставь Production / Preview / Development галочки на все три
6. **Deploy**. Через 1–2 минуты получишь URL вида `ilhom-xxxx.vercel.app`

После первого деплоя любой `git push origin main` будет автоматически собирать и публиковать новую версию.

## Вариант 2 — через Vercel CLI

```bash
# Установка
npm install -g vercel

# Логин (откроет браузер)
vercel login

# Привязка локальной папки к проекту на Vercel
cd /Users/bobursuleymanov/Downloads/ilhom
vercel link

# Перенос env-переменных из .env.local в Vercel
vercel env add DATABASE_URL production
vercel env add JWT_SECRET production
vercel env add BLOB_READ_WRITE_TOKEN production
# (повторить для preview / development если нужно)

# Превью-деплой
vercel

# Production-деплой
vercel --prod
```

## Вариант 3 — auto-import через Vercel CLI без UI

```bash
npm install -g vercel
vercel login
cd /Users/bobursuleymanov/Downloads/ilhom

# Одна команда, она спросит подтверждения и зальёт переменные из .env.local
vercel --prod
```

CLI автоматически предложит создать проект, привязать его к репозиторию, и при первом деплое прочитает env-переменные. Подтверди дефолты.

## После деплоя

- Открой `https://<твой-URL>/api/health` — должен вернуться `{"ok": true, "service": "vatan-press"}`.
- Открой `https://<твой-URL>/api/categories` — должен вернуть 7 категорий из Neon.
- Открой `https://<твой-URL>/login`, зайди под `admin@news.uz / admin123` — должен показаться дашборд.

## Проверка БД

Если на странице `/admin` дашборд показывает нули — значит `DATABASE_URL` не доехал до Vercel. Проверь:

```bash
vercel env pull .env.production.local
diff .env.local .env.production.local
```

## Какой URL передать преподавателю

После деплоя Vercel выдаёт три URL:
- Production (`ilhom.vercel.app`) — стабильный, для защиты
- Preview (`ilhom-git-main-...vercel.app`) — для каждого коммита
- Latest (`ilhom-<hash>.vercel.app`) — конкретный деплой

Используй production-URL.
