-- The club waitlist: an email, when it came in, and which page it came from.
-- Written by the site through the REST API with the publishable (anon) key. Row-level security lets
-- anyone add a row and nobody read, change or delete one; only the service role, which the site never
-- uses, can see the list.

create table if not exists public.club_waitlist (
  id bigint generated always as identity primary key,
  email text not null check (char_length(email) between 3 and 254 and email ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$'),
  source text not null default '/' check (char_length(source) <= 64),
  created_at timestamptz not null default now()
);

-- One row per address, whatever its case, so signing up twice changes nothing.
create unique index if not exists club_waitlist_email_key on public.club_waitlist (lower(email));

alter table public.club_waitlist enable row level security;

drop policy if exists "Anyone can join the club waitlist" on public.club_waitlist;
create policy "Anyone can join the club waitlist"
  on public.club_waitlist
  for insert
  to anon, authenticated
  with check (true);

-- Insert only, at the privilege level too: no select, update or delete for the public roles.
revoke all on public.club_waitlist from anon, authenticated;
grant insert (email, source) on public.club_waitlist to anon, authenticated;
