# Project Notes

## Golden Rule: Never display raw translation keys

Every value displayed to the user MUST be wrapped in `t()`:

- Interests: `{t(interest)}` — key is `"interest.sport"`, displays `"Спорт"` (RU) / `"Sports"` (EN)
- Goals: `{t(profile.datingGoal)}` — key is `"goal.serious_relationship"`, displays `"Серьезные отношения"` / `"Serious relationship"`
- Zodiac: `{t(user.zodiac)}` — key is `"common.zodiac.leo"`, displays `"Лев"` / `"Leo"`
- Education: `{t(profile.education)}` — key is `"education.higher"`, displays `"Высшее"` / `"Higher education"`

## Data format convention

All data stored in DB, localStorage, demo-data, and state MUST use **translation keys**, not Russian or English display strings:

| OK | NOT OK |
|---|---|
| `"interest.photography"` | `"Фотография"` or `"Photography"` |
| `"goal.serious_relationship"` | `"Серьезные отношения"` or `"Serious relationship"` |
| `"common.zodiac.leo"` | `"Лев"` or `"Leo"` |

This ensures:
1. `t()` can always find a translation in any language
2. Comparisons (e.g. autosearch filters) always match regardless of language
3. Adding a new language doesn't require changing data

## Available translation keys

| Prefix | Defined in | Example |
|---|---|---|
| `interest.*` | `constants.ts` → `INTEREST_OPTIONS` | `"interest.sport"` |
| `goal.*` | `constants.ts` → `DATING_GOALS` | `"goal.serious_relationship"` |
| `common.zodiac.*` | `constants.ts` → `ZODIAC_SIGNS` | `"common.zodiac.leo"` |
| `education.*` | `constants.ts` → `EDUCATION_OPTIONS` | `"education.higher"` |
| `circadian.*` | `constants.ts` → `CIRCADIAN_RHYTHM_OPTIONS` | `"circadian.early_bird"` |
| `attach.*` | `attachment-styles.ts` | `"attach.style.secure.label"` |
| `chats.theme.*` | `chats.tsx` → `CHAT_THEMES` | `"chats.theme.romantic"` |

RU translations live in `language-context.tsx` lines 12–931, EN at lines 935–1980.

## CRITICAL: Don't break admin save / auth

- Admin save (`PUT /api/admin/content/:section`) goes through `adminAuth` middleware in `server/src/index.js`
- NEVER add auth checks to admin routes (`/api/admin/*`) — the project uses dev-login auto-auth
- `AdminGuard` in `src/components/shared/admin-guard.tsx` must ALWAYS try `dev-login` when Supabase is absent
- **Do NOT change badge/oval CSS in admin-content.tsx** — the user is very sensitive about this

## Startup

Run `запуск-всего.bat` to start everything:
1. MySQL via Laragon `mysqld.exe`
2. API: `node src/index.js` (port 3001)
3. Frontend: `npx vite --port 8081 --host` (port 8081)

## Session changelog

- LoginPrompt: added "На главную" button (ghost variant with Home icon under "Войти")
- AdminMedia: fixed image preview — added onError fallback to show TypeIcon when image fails to load; added overflow-hidden to container
- Created admin Media Library page and server route with grid preview, upload, delete, search, type tabs, date grouping
- Created admin health endpoint (uptime, error rate, avg latency, DB ping)
- Connected admin pages to real API (Dashboard, Users, Reports, Features, Analytics, Messaging, Monetization)
- Restored Groups tab in bottom nav; removed Notifications from bottom nav
- Fixed education badges to use shared EditableList component (removed separate EducationList)
- Fixed chats.tsx WebSocket integration (import getToken, enabled WS for group chats, safe JWT parsing)
- Fixed profile.tsx joinedGroupNames TDZ (moved to useState + useEffect)
- Created LoginPrompt component with min-h-screen centered layout
- Added LoginPrompt guard on /profile and /chats when no token
- Created POST /api/admin/users (create test user) and POST /api/admin/users/:id/reset-password
- Fixed monetization API (created_at → started_at; removed analytics_events table ref)
- Fixed match-dialog.tsx placeholder image selection by user.gender
- Added /uploads proxy in vite.config.ts

## Roadmap: что нужно доработать

### 🔴 Фаза 1 — Core User Flow (базовый сценарий пользователя)
*Без этого новый пользователь не может пройти полный цикл: регистрация → анкета → лайки → мэтч → чат*

| # | Что | Где | Проверка |
|---|---|---|---|
| 1 | **profile-edit.tsx** — сохранять профиль реального пользователя, а не `DEMO_USER_ID = 2` | `profile-edit.tsx:274` | После сохранения `/api/profile/me` возвращает обновлённые данные |
| 2 | **profile-edit.tsx** — добавить `Authorization: Bearer <token>` в PUT-запрос | `profile-edit.tsx:274-289` | PUT `/api/profile/3` без токена — 401 |
| 3 | **user.tsx** — `handleLike` должен вызывать `POST /api/likes`, а не `Math.random()` | `user.tsx:128-133` | После лайка `GET /api/matches` показывает мэтч при взаимности |
| 4 | **user.tsx** — после мэтча создавать чат (`POST /api/chats`) | `user.tsx:130-132` | После лайка в обе стороны появляется чат в `GET /api/chats` |
| 5 | **Profile photo upload** — заменить `FileReader` + data URL на `POST /api/upload` с FormData | `profile-edit.tsx:195-220` | Файл появляется в `server/uploads/` и в `user_photos` в БД |
| 6 | **Открыть эндпоинт** — добавить `auth` middleware на `PUT /api/profile/:id` (сейчас без проверки) | `profile.js:132` | PUT без токена — 401 |
| 7 | **onboarding.tsx** — сохранять в MySQL API, а не только в Supabase | `onboarding.tsx:164-199` | После онбординга `GET /api/profile/me` возвращает заполненную анкету |
| 8 | **register.tsx** — после успешной регистрации сохранять токен и редиректить на онбординг, а не на `/login` | `register.tsx:67-72` | После регистрации пользователь авторизован и попадает на `/onboarding` |

### 🟠 Фаза 2 — Social Features (социальное взаимодействие)
*Лайки, мэтчи, чаты, группы — чтобы приложение стало социальным*

| # | Что | Где | Проверка |
|---|---|---|---|
| 9 | **Страница `/matches`** — добавить роут в `App.tsx`, страницу списка мэтчей через `GET /api/matches` | `App.tsx` + новый файл | `GET /api/matches` возвращает список; по нажатию — переход в чат |
| 10 | **Страница `/premium`** — тарифы, оформление подписки | новый файл | После «оплаты» появляется запись в `subscriptions` |
| 11 | **Группы: создание** — `POST /api/groups` + UI на `groups.tsx` | `groups.js` + `groups.tsx` | После создания группа отображается в `GET /api/groups` |
| 12 | **Группы: вступление** — `POST /api/groups/:id/join` + UI | `groups.js` + `groups.tsx` | После вступления пользователь в `chat_participants` группы |
| 13 | **Конкурс: голосование** — `POST /api/contest/vote` | `contest.js` + `contest.tsx` | Голос сохраняется, счётчик votes растёт |
| 14 | **Онлайн-статус** — отображать зелёную точку в чатах, user.tsx, поиске | Все страницы с аватарками | После коннекта WS — `user:online`, после дисконнекта — `user:offline` |
| 15 | **Typing indicator** — отображать «печатает…» в чате | `chats.tsx`, `chats-chatId.tsx` | При наборе другого участника видно индикатор |

### 🟡 Фаза 3 — Admin & Moderation (админка и модерация)
*Чтобы админ мог реально управлять приложением*

| # | Что | Где | Проверка |
|---|---|---|---|
| 16 | **Email-рассылки** — подключить SendGrid/Resend; при создании кампании реально отправлять письма | `admin/messaging.js:22-38` | После создания кампании письма приходят на email юзеров |
| 17 | **Push-уведомления** — FCM/VAPID key, service worker | новый файл | После отправки кампании пуш приходит в браузер/приложение |
| 18 | **Бан пользователя из админки** — разлогинить забаненного (`is_active = 0` → logout) | `admin/users.js:91-103` | Забаненный пользователь получает 401 на следующем запросе |
| 19 | **Real-time модерация запрещённых слов** — проверять `banned_words` при отправке сообщения | `chats.js` POST message | Сообщение с запрещённым словом отклоняется или маскируется |
| 20 | **История действий пользователя** — вкладка в `admin-users.tsx` с логами из `activity_log` | `admin-users.tsx` | Для выбранного пользователя видны все действия (лайки, просмотры, входы) |
| 21 | **Имперсонация** — кнопка «войти как пользователь» в админке | `admin-users.tsx` | Админ переходит на сайт под юзером, видит его данные |

### 🟢 Фаза 4 — Monetization (монетизация)
*Чтобы приложение зарабатывало*

| # | Что | Где | Проверка |
|---|---|---|---|
| 22 | **Платёжный шлюз** — интеграция Stripe/CloudPayments/ЮKassa | новый файл + `monetization.js` | После оплаты — `subscriptions.is_active = 1` |
| 23 | **Премиум-фичи** — скрывать лайки/суперлайки/фильтры за подпиской | `search.tsx`, `user.tsx` | Без подписки кнопка лайка ведёт на `/premium` |
| 24 | **Реклама** — показать/скрыть рекламные баннеры по фича-флагу `showAds` | `Home.tsx`, `activity.tsx` | При `showAds = true` показывается AdDialog |

### 🔵 Фаза 5 — Polish & Advanced (полировка и продвинутые фичи)
*То, что отличает хорошее приложение от великого*

| # | Что | Где | Проверка |
|---|---|---|---|
| 25 | **Геопоиск по радиусу** — добавить координаты в профиль, `HAVING distance < ?` | `profile.js` + `search.tsx` | Поиск возвращает пользователей в заданном радиусе |
| 26 | **История просмотров** — кто смотрел мой профиль | `profile.js` + новая страница | В активности видны просмотры других пользователей |
| 27 | **AI-рекомендации** — алгоритм совместимости (interests + zodiac + attachment style) | `profile.js` | Порядок результатов поиска учитывает совместимость |
| 28 | **Attachment test** — сохранять результат в профиль (`PUT /api/profile/:id` с attachment_style) | `profile-attachment-test.tsx` | После теста `attachment_style` заполнен в БД |
| 29 | **Удаление сообщений** — `DELETE /api/chats/:id/messages/:msgId` | `chats.js` + UI | Своё сообщение можно удалить, в чате появляется «сообщение удалено» |
| 30 | **Уведомления в браузере** — Service Worker + Notification API | `public/sw.js` | При новом лайке/сообщении приходит системное уведомление |

### Статус проекта (сводка)

```
Сервер:    ████████████████░  94% (31 из 33 роутов работают с реальной БД)
Фронтенд:  █████████████░░░░  78% (25 из 32 страниц подключены к API)
UI/UX:     ██████████████░░░  82% (все страницы отрендерены, есть i18n, темы)
Админка:   ████████████████░  90% (все страницы на реальных данных, кроме рассылок)
Реальность:████████████░░░░░  70% (данные сохраняются, но нет платёжек и пуша)
```

### Как проверять после каждого изменения

```bash
# 1. Линтер
npx tsc --noEmit    # TypeScript errors
npx eslint src/     # Code style

# 2. API тест (через curl или браузер)
curl -s http://localhost:3001/api/admin/health | ConvertFrom-Json | Format-Table

# 3. Фронтенд
npx vite --port 8081 --host   # Dev server
# Проверить страницу в браузере, открыть F12 → Console (нет ошибок) + Network (статус 200)

# 4. База данных
mysql -u root -e "USE swiftmatch; SELECT COUNT(*) as users FROM users;"

# 5. WebSocket
# Открыть две вкладки, залогиниться разными пользователями
# Вкладка 1: написать сообщение → вкладка 2: получить real-time
```

## Common mistakes to avoid

1. **Admin save 401** — admin routes require JWT. Keep `adminAuth` middleware PASSIVE (call `next()` on failure, don't block). `/api/admin/me` has its own auth check — leave it alone.
2. **Education badge styling** — Use `EditableList` (same as interests), NEVER a separate `EducationList`. The user wants them identical to interests. Don't change `py`, `px`, `rounded-*`, `border-*` classes.
3. **Stale token redirect loop** — When Supabase is absent, AdminGuard must ALWAYS try dev-login. The `!getToken()` guard causes redirect to `/login` if a stale token exists.
4. **Translation keys** — DB stores slugs (`secondary`, `sport`) without prefix. Frontend adds `education.`/`interest.` prefix via `t()`. Never store Russian/English text in DB.
