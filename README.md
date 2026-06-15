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

## Ченджлог

### Фаза 1 — Core User Flow ✅ (июнь 2026)
- **profile-edit:** сохраняет через `/api/profile/me` с Bearer-токеном (вместо `DEMO_USER_ID=2`)
- **server:** `PUT /api/profile/me` защищён `auth` middleware, использует `req.userId`
- **user.tsx:** `handleLike` → `POST /api/likes` + при мэтче `POST /api/chats`
- **onboarding:** сохраняет в MySQL API, если нет Supabase — в localStorage
- **register:** сохраняет токен, редирект на `/onboarding`

### Предыдущие изменения
- LoginPrompt: добавлена кнопка «На главную»
- Admin Media: страница с загрузкой/удалением/превью/поиском/фильтром по типу
- Admin Health: endpoint с аптаймом, ошибками, задержкой, DB ping
- Все 8 админ-страниц подключены к реальному API
- Groups в нижнем меню, Notifications — нет
- Education badges: общий `EditableList` вместо отдельного `EducationList`
- Chats: WebSocket integration (send/receive/typing), group chats
- Profile: исправлен TDZ `joinedGroupNames`, LoginPrompt guard
- Admin: кнопки «Создать пользователя» и «Сбросить пароль»
- Admin Users: создание тестового пользователя, сброс пароля
- Monetization API: `created_at` → `started_at`
- Match-dialog: выбор изображения по `user.gender`
- Vite proxy: `/uploads` → `localhost:3001`

---

## Roadmap

### 🔴 Фаза 2 — Social Features (очередь)
- [ ] Страница `/matches` (список мэтчей через `GET /api/matches`)
- [ ] Страница `/premium` (тарифы + подписка)
- [ ] Группы: создание (`POST /api/groups`) + вступление (`POST /api/groups/:id/join`)
- [ ] Конкурс: голосование (`POST /api/contest/vote`)
- [ ] Онлайн-статус (зелёная точка в UI)
- [ ] Typing indicator («печатает…» в чате)

### 🟡 Фаза 3 — Admin & Moderation
- [ ] Email-рассылки через SendGrid/Resend
- [ ] Push-уведомления (FCM/VAPID)
- [ ] Бан + авто-разлогин забаненного
- [ ] Real-time проверка запрещённых слов в чатах
- [ ] История действий пользователя в админке
- [ ] Имперсонация (войти как пользователь)

### 🟢 Фаза 4 — Monetization
- [ ] Платёжный шлюз (Stripe/CloudPayments/ЮKassa)
- [ ] Премиум-фичи (лайки/суперлайки/фильтры за подпиской)
- [ ] Рекламные баннеры по фича-флагу `showAds`

### 🔵 Фаза 5 — Polish
- [ ] Геопоиск по радиусу (координаты + `HAVING distance`)
- [ ] История просмотров (кто смотрел профиль)
- [ ] AI-рекомендации (совместимость по interests + zodiac + attachment style)
- [ ] Сохранение результатов attachment-теста в профиль
- [ ] Удаление сообщений
- [ ] Системные уведомления (Service Worker + Notification API)

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
