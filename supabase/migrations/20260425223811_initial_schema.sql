create extension if not exists pgcrypto;

do $$
begin
  create type public.notification_channel as enum ('telegram', 'email');
exception
  when duplicate_object then null;
end $$;

do $$
begin
  create type public.notification_status as enum ('pending', 'sent', 'failed');
exception
  when duplicate_object then null;
end $$;

do $$
begin
  create type public.live_request_status as enum ('pending', 'completed', 'failed');
exception
  when duplicate_object then null;
end $$;

create table public.days (
  -- Why: the web navigates by Madrid civil date, so this table intentionally uses the ISO date as its stable anchor.
  date date primary key,
  sunset_at timestamptz not null,
  best_photo_id uuid,
  weather_summary jsonb,
  note text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.photos (
  id uuid primary key default gen_random_uuid(),
  day_date date not null references public.days(date) on delete cascade,
  captured_at timestamptz not null,
  storage_path text not null,
  score real not null,
  score_components jsonb not null default '{}'::jsonb,
  exif jsonb,
  width integer not null,
  height integer not null,
  is_best_of_day boolean not null default false,
  created_at timestamptz not null default now(),
  constraint photos_storage_path_not_empty check (length(btrim(storage_path)) > 0),
  constraint photos_dimensions_positive check (width > 0 and height > 0)
);

alter table public.days
  add constraint days_best_photo_id_fkey
  foreign key (best_photo_id)
  references public.photos(id)
  on delete set null
  deferrable initially deferred;

create table public.notifications (
  id uuid primary key default gen_random_uuid(),
  day_date date not null references public.days(date) on delete cascade,
  photo_id uuid not null references public.photos(id) on delete cascade,
  channel public.notification_channel not null,
  status public.notification_status not null default 'pending',
  error text,
  sent_at timestamptz,
  created_at timestamptz not null default now()
);

create table public.live_requests (
  id uuid primary key default gen_random_uuid(),
  requested_at timestamptz not null default now(),
  status public.live_request_status not null default 'pending',
  photo_id uuid references public.photos(id) on delete set null,
  latency_ms integer,
  constraint live_requests_latency_non_negative check (latency_ms is null or latency_ms >= 0)
);

create index photos_day_date_idx on public.photos(day_date);
create index photos_captured_at_idx on public.photos(captured_at);
create index photos_is_best_of_day_true_idx on public.photos(is_best_of_day) where is_best_of_day = true;
-- Why: this preserves the single chosen photo invariant while keeping the denormalized flag fast to query.
create unique index photos_one_best_per_day_idx on public.photos(day_date) where is_best_of_day = true;
create index notifications_day_date_idx on public.notifications(day_date);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger days_set_updated_at
before update on public.days
for each row
execute function public.set_updated_at();

alter table public.days enable row level security;
alter table public.photos enable row level security;
alter table public.notifications enable row level security;
alter table public.live_requests enable row level security;

create policy "days are readable by visitors"
on public.days
for select
to anon
using (true);

create policy "days are readable by authenticated users"
on public.days
for select
to authenticated
using (true);

create policy "service role can manage days"
on public.days
for all
to service_role
using (true)
with check (true);

create policy "best photos are readable by visitors"
on public.photos
for select
to anon
using (is_best_of_day = true);

create policy "photos are readable by authenticated users"
on public.photos
for select
to authenticated
using (true);

create policy "service role can manage photos"
on public.photos
for all
to service_role
using (true)
with check (true);

create policy "service role can manage notifications"
on public.notifications
for all
to service_role
using (true)
with check (true);

create policy "service role can manage live requests"
on public.live_requests
for all
to service_role
using (true)
with check (true);

insert into storage.buckets (id, name, public)
values
  ('sunsets-raw', 'sunsets-raw', false),
  ('sunsets-best', 'sunsets-best', true)
on conflict (id) do update
set public = excluded.public;

create policy "service role can manage sunset objects"
on storage.objects
for all
to service_role
using (bucket_id in ('sunsets-raw', 'sunsets-best'))
with check (bucket_id in ('sunsets-raw', 'sunsets-best'));

-- Why: only polished best-of-day assets are meant to be served publicly by the gift web app.
create policy "best sunset objects are publicly readable"
on storage.objects
for select
to anon, authenticated
using (bucket_id = 'sunsets-best');
