# SwiftMatch — Dating App

Фронтенд приложения для знакомств на React 18, TypeScript 5, Vite 5, Tailwind CSS 3, shadcn/ui.  
Бэкенд — **Supabase** (аутентификация, база данных, сторадж, realtime).  
Деплой — **Vercel**.

## Tech Stack

| Категория | Технологии |
|-----------|------------|
| Core | React 18, TypeScript 5, Vite 5 |
| Styling | Tailwind CSS 3, shadcn/ui (Radix UI) |
| Animations | Framer Motion 12 |
| State | TanStack React Query 5 |
| Routing | React Router DOM 6 |
| Charts | Recharts 3 |
| Forms | React Hook Form 7 + Zod 4 |
| Backend | Supabase (Auth, PostgreSQL, Storage, Realtime) |
| Testing | Vitest 3, Testing Library |
| Code Quality | ESLint 9, TypeScript strict |

## Features

- **Свайпинг** — просмотр анкет с свайпом влево/вправо, супер-лайк
- **Автопоиск** — алгоритм скоринга совместимости (бусты, интересы, дистанция, циркадные ритмы, тип привязанности)
- **Чаты** — личные сообщения в реальном времени (Supabase Realtime), AI-подсказки, inline-реакции, фильтр сообщений
- **Группы** — 20 категорий, 400+ виртуальных подгрупп
- **Профиль** — галерея фото, stories, visitors, тест привязанности, бусты, титулы
- **Конкурс** — рейтинги, голосование, ежедневные квесты
- **Онбординг** — 5-шаговый мастер заполнения профиля
- **Админ-панель** — дашборд, пользователи, жалобы, контент, фича-флаги, монетизация, рассылки
- **Активность** — лента like/visit/match с премиум-гейтингом
- **i18n** — поддержка русского и английского языков
- **Фильтр контента** — мат, политика, спам, скам, gibberish-детектор
- **Безопасность** — Row Level Security (RLS), авторизация через Supabase Auth

---

## 🚀 Запуск в продакшен (Vercel + Supabase)

### 1. Создать проект Supabase

1. Зарегистрируйтесь на [supabase.com](https://supabase.com)
2. Создайте новый проект
3. Скопируйте `Project URL` и `anon public key` из Settings → API

### 2. Накатить схему базы данных

В панели Supabase откройте **SQL Editor**, вставьте и выполните:

```
supabase/migrations/00001_schema.sql
```

Скрипт создаст все таблицы, индексы, RLS-политики, триггер и вьюху для поиска.

### 3. Настроить Auth

**Email/Password:**
- Authentication → Settings → убедитесь что `Email` провайдер включён

**Google OAuth (опционально):**
- Authentication → Providers → Google
- Укажите `Client ID` и `Client Secret` из Google Cloud Console
- В `Redirect URLs` добавьте: `https://ваш-домен.vercel.app/**`

### 4. Настроить Realtime

- Database → Replication
- Включите публикацию `supabase_realtime`
- Добавьте таблицы: `messages`, `profiles`

### 5. Настроить Storage

- Storage → Create bucket → `photos`
- Public bucket — отметьте `Public bucket`
- Создайте папки внутри: `profiles/`, `gallery/`, `messages/`

Политика доступа (RLS) для Storage:

```sql
create policy "Public can view photos"
on storage.objects for select using (bucket_id = 'photos');

create policy "Authenticated can upload photos"
on storage.objects for insert with check (
  bucket_id = 'photos' and auth.role() = 'authenticated'
);
```

### 6. Задеплоить на Vercel

1. Запушьте проект в GitHub
2. В Vercel: **Add New Project** → выберите репозиторий
3. В `Environment Variables` добавьте:

| Variable | Значение |
|----------|----------|
| `VITE_SUPABASE_URL` | `https://ваш-проект.supabase.co` |
| `VITE_SUPABASE_ANON_KEY` | `anon public key` из Supabase |
| `VITE_APP_NAME` | `SwiftMatch` |

4. Нажмите **Deploy** — Vercel сам выполнит `npm run build` и опубликует

### 7. Готово 🎉

Приложение будет доступно по адресу `https://ваш-проект.vercel.app`.  
Первый зарегистрированный пользователь автоматически получит профиль через триггер `on_auth_user_created`.

---

## Разработка

```bash
# Установка
npm install

# Запуск dev-сервера
npm run dev
# → http://localhost:8080

# Сборка
npm run build

# Тесты
npm test

# Линтинг
npm run lint

# Превью собранного
npm run preview
```

## Environment Variables

Скопируйте `.env.example` в `.env.development`:

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
VITE_APP_NAME=SwiftMatch
```

## Project Structure

```
src/
├── components/
│   ├── layout/        # AppContainer, AppHeader, AdminLayout, BottomNav
│   ├── shared/        # ErrorBoundary, LoadingScreen, CookieConsent, PWA
│   ├── ui/            # 40+ shadcn/ui компонентов
│   ├── dialogs/       # Match, Premium, Filter, Ad, Autosearch
│   ├── sections/      # TopOfWeek, Visitors, Gallery
│   └── navigation/    # AdminSidebar
├── context/           # Auth (Supabase), Language, FeatureFlags
├── hooks/             # useApi, useToast, useMobile, useIdleTimer
├── lib/
│   ├── api.ts         # HTTP-клиент (запасной, для кастомных API)
│   ├── supabase.ts    # Supabase client singleton
│   ├── supabase-hooks.ts     # useRealtimeMessages, useProfile и др.
│   ├── supabase-storage.ts   # Upload/delete фото
│   ├── utils.ts       # cn(), getUserTitles
│   ├── env.ts         # Валидация env-переменных
│   ├── constants.ts   # Константы (интересы, цели, знаки зодиака)
│   └── demo-data.ts   # Мок-данные для разработки
├── pages/             # 33 страницы (Home, Search, Chats, Profile, Admin...)
├── shims/             # Firebase shims → Supabase
├── types/
│   ├── index.ts       # TypeScript интерфейсы приложения
│   └── supabase.ts    # Типы таблиц Supabase (Database)
├── test/              # Unit-тесты (16 тестов)
└── locales/           # i18n (ru, en)

supabase/
└── migrations/
    └── 00001_schema.sql   # Полный DDL базы данных
```

## Database Schema

Таблицы, создаваемые миграцией:

| Таблица | Назначение |
|---------|------------|
| `profiles` | Профили пользователей (синхронизируются с auth.users) |
| `interests` | Справочник интересов |
| `profile_interests` | Связь профиль ↔ интересы (many-to-many) |
| `likes` | Лайки и супер-лайки |
| `matches` | Мэтчи (взаимные лайки) |
| `chats` | Чаты |
| `chat_participants` | Участники чата |
| `messages` | Сообщения (с Realtime) |
| `notifications` | Уведомления |
| `reports` | Жалобы на пользователей |

Все таблицы защищены **Row Level Security (RLS)**.

## API Endpoints (запасные)

Для не-Supabase функциональности можно использовать кастомный API-клиент:

| Метод | Path | Описание |
|-------|------|----------|
| POST | `/auth/login` | Вход по email/пароль |
| POST | `/auth/google` | Вход через Google |
| POST | `/auth/register` | Регистрация |
| GET | `/auth/me` | Текущий пользователь |
| POST | `/upload/profile-photo` | Загрузка фото |

## License

MIT
