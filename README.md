# SwiftMatch1BD

Локальная версия SwiftMatch с **реальной MySQL-БД** через Express API.

- **Бэкенд:** Node.js/Express + MySQL (Laragon)
- **Фронтенд:** React + Vite + Tailwind + WebSocket
- **Порт API:** 3001
- **Порт фронта:** 8081

---

## Быстрый старт

### 1. MySQL (Laragon)

```bash
mysql -u root swiftmatch1bd < database\mysql_schema.sql
mysql -u root swiftmatch1bd < database\demo_data.sql
```

### 2. API сервер

```bash
cd server
npm install
node src/index.js
# → http://localhost:3001
```

### 3. Фронтенд

```bash
npm install
npx vite --port 8081 --host
# → http://localhost:8081
```

Либо одним скриптом: `запуск-всего.bat`

---

## Данные для входа

| Email | Пароль | Роль |
|-------|--------|------|
| `admin@mail.ru` | `admin123` | Админ |
| `demo@mail.ru` | `demo123` | Пользователь (Анна) |

---

## Статус проекта по этапам

### 🔴 Фаза 1 — Core User Flow ✅
*Регистрация → анкета → лайки → мэтч → чат*

| # | Что | Статус |
|---|---|---|
| 1 | `profile-edit.tsx` — сохраняет через `/api/profile/me` с Bearer-токеном | ✅ |
| 2 | `profile.js` — `PUT /api/profile/me` защищён `auth` middleware, использует `req.userId` | ✅ |
| 3 | `user.tsx` — `handleLike` → `POST /api/likes` (реальный API) | ✅ |
| 4 | `user.tsx` — после взаимного лайка создаётся чат (`POST /api/chats`) | ✅ |
| 5 | Photo upload — FormData → `POST /api/upload` → файл в `server/uploads/` | ✅ |
| 6 | `PUT /api/profile/me` — auth middleware (без токена → 401) | ✅ |
| 7 | `onboarding.tsx` — сохраняет в MySQL через API (fallback localStorage) | ✅ |
| 8 | `register.tsx` — сохраняет токен, редирект на `/onboarding` | ✅ |

### 🟠 Фаза 2 — Social Features ✅
*Мэтчи, группы, конкурс, премиум*

| # | Что | Статус |
|---|---|---|
| 9 | `/matches` — страница списка мэтчей через `GET /api/matches` | ✅ |
| 10 | `/premium` — `GET /api/premium/tiers`, `/my`, `POST /api/premium/purchase` | ✅ |
| 11 | Группы: `POST /api/groups` + UI создания на `groups.tsx` | ✅ |
| 12 | Группы: `POST /api/groups/:id/join` + `GET /api/groups/my` | ✅ |
| 13 | Конкурс: `POST /api/contest/vote` + кнопка-сердечко на подиуме | ✅ |
| 14 | Онлайн-статус — зелёная точка в чатах (WebSocket `user:online/offline`) | ✅ |
| 15 | Typing indicator — «печатает…» в чатах (WebSocket `chat:typing`) | ✅ |

### 🟡 Фаза 3 — Admin & Moderation ✅

| # | Что | Статус |
|---|---|---|
| 16 | Email-рассылки — `POST /campaigns` реально шлёт письма через nodemailer/SMTP | ✅ |
| 17 | Push-уведомления — VAPID, `pushManager.subscribe`, `web-push` dispatch | ✅ |
| 18 | Бан пользователя + WS `user:banned` (разлогин забаненного) | ✅ |
| 19 | Real-time модерация запрещённых слов в чатах (REST + WS) | ✅ |
| 20 | История действий (`activity_log`) в админке (вкладка в карточке юзера) | ✅ |
| 21 | Имперсонация — `POST /users/:id/impersonate` + кнопка «Login as User» | ✅ |

### 🟢 Фаза 4 — Monetization (очередь)

| # | Что | Статус |
|---|---|---|
| 22 | Платежный шлюз (Stripe/CloudPayments/ЮKassa) | ⬜ |
| 23 | Премиум-фичи (скрыть лайки/фильтры без подписки) | ⬜ |
| 24 | Рекламные баннеры по фича-флагу `showAds` | ⬜ |

### 🔵 Фаза 5 — Polish & Advanced (очередь)

| # | Что | Статус |
|---|---|---|
| 25 | Геопоиск по радиусу (координаты + `HAVING distance`) | ⬜ |
| 26 | История просмотров — кто смотрел мой профиль | ⬜ |
| 27 | AI-рекомендации (совместимость по interests + zodiac + style) | ⬜ |
| 28 | Сохранение attachment-теста в профиль | ⬜ |
| 29 | Удаление сообщений (`DELETE /api/chats/:id/messages/:msgId`) | ⬜ |
| 30 | Системные уведомления (Service Worker + Notification API) | ⬜ |

---

## Ченджлог

### Фаза 3 — Admin & Moderation ✅ (`d2b33f2`)
- Push: `push_subscriptions` table, `POST /api/push/subscribe`, `DELETE /api/push/subscribe`
- Push: `sendPushToUser()` / `sendPushToAll()` через `web-push`
- Push: кампании с `channel='push'` теперь реально отправляют push-уведомления
- Push: settings.tsx подписывается/отписывается через `pushManager.subscribe`
- Banned words: новый хелпер `server/src/banned-words.js` (кэширование 60s)
- Banned words: проверка в `POST /api/chats/:chatId/messages` + в WebSocket `chat:message`
- Banned words: при нарушении WS шлёт `chat:error`, REST → 403
- Email: `nodemailer` в зависимостях; `sendEmails()` рассылает через SMTP (из .env)
- Email: `POST /api/admin/campaigns` реально отправляет письма + трекает `delivered`
- Activity: `GET /api/admin/users/:id/activity` — логи `activity_log` для юзера
- Activity: вкладка «Activity» в карточке пользователя админки
- Impersonation: `POST /api/admin/users/:id/impersonate` (1h JWT с `impersonator`)
- Impersonation: кнопка «Login as User» в меню и «Login» в карточке
- Ban: при бане WS шлёт `user:banned` — принудительный разлогин

### Фаза 2 — Social Features ✅ (`54841fa`)
- Страница `/matches` (matches.tsx): `GET /api/matches`, пустое состояние, навигация
- Premium: `GET /api/premium/tiers`, `/premium/my`, `POST /api/premium/purchase`
- Groups: `POST /api/groups`, `POST /api/groups/:id/join`, `GET /api/groups/my`
- Groups UI: реальное создание через API, вкладка «Мои группы» из БД
- Contest: `POST /api/contest/vote`, сердечко на каждой записи подиума
- Nav: добавлен таб Matches (Heart) в bottom-nav
- i18n: `nav.matches`, `matches.*`, `profile.years_old`

### Фаза 1 — Core User Flow ✅ (`3b9af28`)
- `profile-edit`: сохраняет через `/api/profile/me` с Bearer-токеном
- `profile.js`: `PUT /api/profile/me` защищён `auth` middleware
- `user.tsx`: `handleLike` → `POST /api/likes` + при мэтче `POST /api/chats`
- `onboarding`: сохраняет в MySQL API, fallback localStorage
- `register`: сохраняет токен, редирект на `/onboarding`

### Предыдущие изменения
- LoginPrompt: добавлена кнопка «На главную», fallback иконки при ошибке загрузки
- Admin Media Library: загрузка/удаление/превью/поиск/фильтр по типу/дате
- Admin Health endpoint: uptime, error rate, avg latency, DB ping
- Все 8 админ-страниц подключены к реальному API
- Groups в нижнем меню, Notifications — нет
- Education: общий `EditableList` вместо отдельного `EducationList`
- Chats: WebSocket (send/receive/typing), group chats
- Profile: исправлен TDZ `joinedGroupNames`, LoginPrompt guard
- Admin: кнопки «Создать пользователя» и «Сбросить пароль»
- Admin Users: создание тестового пользователя, сброс пароля
- Monetization API: `created_at` → `started_at`
- Match-dialog: выбор изображения по `user.gender`
- Vite proxy: `/uploads` → `localhost:3001`
- `README.md`: полный статус по 5 фазам (30 задач)

---

## Структура

| Папка | Назначение |
|-------|------------|
| `server/` | Express API, WebSocket, MySQL |
| `server/src/routes/` | 11 роутов (auth, profile, social, chats, groups, contest, upload, reports, notifications, activity) |
| `server/src/routes/admin/` | 8 админ-роутов (dashboard, users, analytics, reports, content, features, messaging, monetization, media) |
| `server/src/ws.js` | Socket.IO (чат, уведомления, онлайн-статус) |
| `src/` | Frontend: 35 страниц, 30+ компонентов |
| `src/pages/` | Все страницы, lazy-loaded |
| `src/components/` | UI-kit (shadcn/ui), layout, shared, dialogs, sections |
| `database/` | `mysql_schema.sql` + `demo_data.sql` |

## Настройка .env

```
PORT=3001
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=
DB_NAME=swiftmatch1bd
JWT_SECRET=change-me-in-production
```
