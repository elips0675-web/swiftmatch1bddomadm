-- SwiftMatch Supabase Schema
-- Run this in your Supabase project SQL Editor

-- 1. PROFILES
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  name text not null,
  age int not null check (age >= 16 and age <= 120),
  bio text,
  avatar_url text,
  photos text[] not null default '{}',
  gender text check (gender in ('male', 'female', 'other')),
  looking_for text check (looking_for in ('male', 'female', 'both')),
  goal text,
  height int check (height >= 100 and height <= 250),
  city text,
  lat float,
  lng float,
  zodiac text,
  circadian text check (circadian in ('lark', 'owl', 'flexible')),
  attachment_style text check (attachment_style in ('secure', 'anxious', 'avoidant')),
  super_likes int not null default 0,
  boost_until timestamptz,
  online boolean not null default false,
  last_seen timestamptz not null default now()
);

create index if not exists idx_profiles_city on profiles(city);
create index if not exists idx_profiles_age on profiles(age);
create index if not exists idx_profiles_online on profiles(online);

-- 2. INTERESTS (seed data)
create table if not exists public.interests (
  id int primary key generated always as identity,
  name_ru text not null,
  name_en text not null,
  category text not null
);

-- 3. PROFILE INTERESTS (many-to-many)
create table if not exists public.profile_interests (
  profile_id uuid not null references profiles(id) on delete cascade,
  interest_id int not null references interests(id) on delete cascade,
  primary key (profile_id, interest_id)
);

-- 4. LIKES
create table if not exists public.likes (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  from_profile_id uuid not null references profiles(id) on delete cascade,
  to_profile_id uuid not null references profiles(id) on delete cascade,
  type text not null check (type in ('like', 'super_like')),
  unique(from_profile_id, to_profile_id)
);

create index if not exists idx_likes_to on likes(to_profile_id);
create index if not exists idx_likes_from on likes(from_profile_id);

-- 5. MATCHES
create table if not exists public.matches (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  user1_id uuid not null references profiles(id) on delete cascade,
  user2_id uuid not null references profiles(id) on delete cascade,
  matched boolean not null default true,
  unique(user1_id, user2_id)
);

create index if not exists idx_matches_user1 on matches(user1_id);
create index if not exists idx_matches_user2 on matches(user2_id);

-- 6. CHATS
create table if not exists public.chats (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  last_message text,
  last_sender_id uuid references profiles(id)
);

-- 7. CHAT PARTICIPANTS
create table if not exists public.chat_participants (
  chat_id uuid not null references chats(id) on delete cascade,
  profile_id uuid not null references profiles(id) on delete cascade,
  joined_at timestamptz not null default now(),
  primary key (chat_id, profile_id)
);

create index if not exists idx_chat_participants_profile on chat_participants(profile_id);

-- 8. MESSAGES
create table if not exists public.messages (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  chat_id uuid not null references chats(id) on delete cascade,
  sender_id uuid not null references profiles(id),
  text text not null,
  reply_to uuid references messages(id)
);

create index if not exists idx_messages_chat on messages(chat_id);

-- 9. NOTIFICATIONS
create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  profile_id uuid not null references profiles(id) on delete cascade,
  type text not null,
  payload jsonb not null default '{}',
  read boolean not null default false
);

create index if not exists idx_notifications_profile on notifications(profile_id);

-- 10. REPORTS
create table if not exists public.reports (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  reporter_id uuid not null references profiles(id),
  reported_id uuid not null references profiles(id),
  reason text not null,
  description text,
  status text not null default 'pending' check (status in ('pending', 'resolved', 'dismissed'))
);

-- VIEW: user_search (for swiping with precomputed data)
create or replace view public.user_search as
select
  p.id,
  p.name,
  p.age,
  p.avatar_url,
  p.bio,
  p.city,
  p.goal,
  p.zodiac,
  coalesce(
    array_agg(i.name_ru) filter (where i.name_ru is not null),
    '{}'::text[]
  ) as interests,
  p.online,
  p.last_seen
from profiles p
left join profile_interests pi on pi.profile_id = p.id
left join interests i on i.id = pi.interest_id
group by p.id;

-- Enable Row Level Security
alter table profiles enable row level security;
alter table likes enable row level security;
alter table matches enable row level security;
alter table chats enable row level security;
alter table chat_participants enable row level security;
alter table messages enable row level security;
alter table notifications enable row level security;
alter table reports enable row level security;
alter table profile_interests enable row level security;

-- RLS POLICIES
-- Profiles: everyone can read, only owner can update
create policy profiles_select on profiles for select using (true);
create policy profiles_update on profiles for update using (auth.uid() = id);
create policy profiles_insert on profiles for insert with check (auth.uid() = id);

-- Likes: authenticated users can read/write
create policy likes_select on likes for select using (auth.role() = 'authenticated');
create policy likes_insert on likes for insert with check (auth.uid() = from_profile_id);

-- Matches: only participants can see
create policy matches_select on matches for select using (auth.uid() = user1_id or auth.uid() = user2_id);

-- Chats: participants only
create policy chats_select on chats for select using (
  exists (select 1 from chat_participants where chat_id = id and profile_id = auth.uid())
);

-- Messages: chat participants only
create policy messages_select on messages for select using (
  exists (select 1 from chat_participants where chat_id = messages.chat_id and profile_id = auth.uid())
);
create policy messages_insert on messages for insert with check (
  exists (select 1 from chat_participants where chat_id = messages.chat_id and profile_id = auth.uid())
);

-- Notifications: owner only
create policy notifications_select on notifications for select using (auth.uid() = profile_id);
create policy notifications_update on notifications for update using (auth.uid() = profile_id);

-- Enable Realtime for chats and messages
alter publication supabase_realtime add table messages;
alter publication supabase_realtime add table profiles;

-- FUNCTIONS
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, name, age, lat, lng)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'name', split_part(new.email, '@', 1)),
    extract(year from age(now(), coalesce((new.raw_user_meta_data ->> 'birthday')::date, '2000-01-01'::date)))::int,
    55.7558,
    37.6176
  );
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
