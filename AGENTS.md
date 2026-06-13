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

## Common mistakes to avoid

1. **Admin save 401** — admin routes require JWT. Keep `adminAuth` middleware PASSIVE (call `next()` on failure, don't block). `/api/admin/me` has its own auth check — leave it alone.
2. **Education badge styling** — Don't change `py`, `px`, `rounded-*`, `border-*`, or any visual classes in `admin-content.tsx` unless asked. The user wants them identical to interests.
3. **Stale token redirect loop** — When Supabase is absent, AdminGuard must ALWAYS try dev-login. The `!getToken()` guard causes redirect to `/login` if a stale token exists.
4. **Translation keys** — DB stores slugs (`secondary`, `sport`) without prefix. Frontend adds `education.`/`interest.` prefix via `t()`. Never store Russian/English text in DB.
