create table public.archive_settings (
  singleton boolean primary key default true check (singleton),
  public_read boolean not null default true
);
insert into public.archive_settings default values;

create table public.archive_admin (
  singleton boolean primary key default true check (singleton),
  user_id uuid not null references auth.users(id) on delete restrict
);

create function public.is_archive_admin() returns boolean
language sql stable security definer set search_path = ''
as $$ select exists(select 1 from public.archive_admin where user_id = auth.uid()) $$;

create function public.can_read_archive() returns boolean
language sql stable security definer set search_path = ''
as $$ select auth.uid() is not null or coalesce((select public_read from public.archive_settings), false) $$;
revoke execute on function public.is_archive_admin(), public.can_read_archive() from public;
grant execute on function public.is_archive_admin(), public.can_read_archive() to anon, authenticated;

create table public.members (
  id uuid primary key default gen_random_uuid(),
  name_en text check (char_length(name_en) between 1 and 140),
  name_ckb text check (char_length(name_ckb) between 1 and 140),
  gender text not null check (gender in ('female','male','other','unspecified')),
  birth_year smallint check (birth_year between 1 and 9999),
  death_year smallint check (death_year between 1 and 9999),
  photo_path text unique,
  check (coalesce(name_en,name_ckb) is not null),
  check (death_year >= birth_year)
);
create table public.parents (
  child_id uuid not null references public.members(id) on delete cascade,
  parent_id uuid not null references public.members(id) on delete cascade,
  primary key(child_id,parent_id),
  check(child_id <> parent_id)
);
create index parents_parent_idx on public.parents(parent_id);
create table public.partners (
  first_id uuid not null references public.members(id) on delete cascade,
  second_id uuid not null references public.members(id) on delete cascade,
  primary key(first_id,second_id),
  check(first_id < second_id)
);
create index partners_second_idx on public.partners(second_id);

create type public.contribution_kind as enum ('post','photo','suggestion');
create type public.contribution_status as enum ('pending','approved','rejected');
create type public.blog_category as enum ('memories','history','news');
create table public.contributions (
  id uuid primary key default gen_random_uuid(),
  author_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  kind public.contribution_kind not null,
  status public.contribution_status not null default 'pending',
  title text not null check (char_length(btrim(title)) between 1 and 150),
  body text not null check (char_length(body) <= 12000),
  category public.blog_category,
  image_path text unique,
  member_id uuid references public.members(id) on delete set null,
  created_at timestamptz not null default now(),
  reviewed_at timestamptz,
  applied_at timestamptz,
  check ((kind = 'post') = (category is not null)),
  check ((kind = 'photo') = (image_path is not null)),
  check (member_id is null or kind = 'suggestion'),
  check (kind = 'photo' or char_length(btrim(body)) > 0),
  check (image_path is null or image_path like (author_id::text || '/%'))
);
create index contributions_visibility_idx on public.contributions(kind,status,created_at desc);
create index contributions_author_idx on public.contributions(author_id,created_at desc);

alter table public.archive_admin enable row level security;
alter table public.archive_settings enable row level security;
alter table public.members enable row level security;
alter table public.parents enable row level security;
alter table public.partners enable row level security;
alter table public.contributions enable row level security;

revoke all on public.archive_admin, public.archive_settings, public.members, public.parents, public.partners, public.contributions from anon, authenticated;
grant select on public.members, public.parents, public.partners to anon, authenticated;
grant select (id,kind,status,title,body,category,image_path,member_id,created_at,reviewed_at,applied_at) on public.contributions to anon, authenticated;
grant insert (kind,title,body,category,image_path,member_id) on public.contributions to authenticated;

create policy members_read on public.members for select using ((select public.can_read_archive()));
create policy parents_read on public.parents for select using ((select public.can_read_archive()));
create policy partners_read on public.partners for select using ((select public.can_read_archive()));
create policy contributions_visible on public.contributions for select using (
  ((select public.can_read_archive()) and status = 'approved' and kind in ('post','photo'))
  or author_id = (select auth.uid())
  or (select public.is_archive_admin())
);
create policy contributions_submit on public.contributions for insert to authenticated with check (
  author_id = (select auth.uid()) and status = 'pending'
);

create function public.review_contribution(submission uuid, decision public.contribution_status) returns boolean
language plpgsql security definer set search_path = ''
as $$
begin
  if not public.is_archive_admin() then raise exception 'Admin access required' using errcode = '42501'; end if;
  if decision not in ('approved','rejected') then return false; end if;
  update public.contributions set status = decision, reviewed_at = now()
    where id = submission and status = 'pending';
  return found;
end;
$$;
revoke execute on function public.review_contribution(uuid,public.contribution_status) from public;
grant execute on function public.review_contribution(uuid,public.contribution_status) to authenticated;

create function public.save_member(target uuid, english_name text, sorani_name text, member_gender text,
  born smallint, died smallint, photo text, parent_ids uuid[], partner_ids uuid[], source_suggestion uuid) returns uuid
language plpgsql security definer set search_path = ''
as $$
declare saved_id uuid;
begin
  if not public.is_archive_admin() then raise exception 'Admin access required' using errcode = '42501'; end if;
  perform pg_advisory_xact_lock(317624);
  if target is null then
    insert into public.members(name_en,name_ckb,gender,birth_year,death_year,photo_path)
      values (english_name,sorani_name,member_gender,born,died,photo) returning id into saved_id;
  else
    update public.members set name_en=english_name,name_ckb=sorani_name,gender=member_gender,
      birth_year=born,death_year=died,photo_path=coalesce(photo,photo_path)
      where id = target returning id into saved_id;
    if saved_id is null then raise exception 'Unknown member'; end if;
  end if;
  if exists (
    with recursive ancestors(id) as (
      select unnest(parent_ids)
      union
      select p.parent_id from ancestors a join public.parents p on p.child_id = a.id
    ) select 1 from ancestors where id = saved_id
  ) then raise exception 'A person cannot be their own ancestor' using errcode = '23514'; end if;
  delete from public.parents where child_id = saved_id;
  insert into public.parents(child_id,parent_id)
    select distinct saved_id, p from unnest(parent_ids) as p;
  delete from public.partners where first_id = saved_id or second_id = saved_id;
  insert into public.partners(first_id,second_id)
    select distinct least(saved_id,p), greatest(saved_id,p) from unnest(partner_ids) as p;
  if source_suggestion is not null then
    update public.contributions set applied_at = now()
      where id = source_suggestion and kind = 'suggestion' and status = 'approved' and applied_at is null;
    if not found then raise exception 'Suggestion is unavailable'; end if;
  end if;
  return saved_id;
end;
$$;
revoke execute on function public.save_member(uuid,text,text,text,smallint,smallint,text,uuid[],uuid[],uuid) from public;
grant execute on function public.save_member(uuid,text,text,text,smallint,smallint,text,uuid[],uuid[],uuid) to authenticated;

insert into storage.buckets(id,name,public,file_size_limit,allowed_mime_types)
values ('archive-photos','archive-photos',false,3145728,array['image/webp']);

create policy archive_photo_upload on storage.objects for insert to authenticated
  with check (bucket_id = 'archive-photos' and (storage.foldername(name))[1] = (select auth.uid())::text);
create policy archive_photo_read on storage.objects for select to anon, authenticated
  using (bucket_id = 'archive-photos' and (
    (select public.is_archive_admin())
    or (storage.foldername(name))[1] = (select auth.uid())::text
    or exists (select 1 from public.members m where m.photo_path = name and (select public.can_read_archive()))
    or exists (select 1 from public.contributions c where c.image_path = name and c.status = 'approved'
      and c.kind = 'photo' and (select public.can_read_archive()))
  ));
create policy archive_photo_cleanup on storage.objects for delete to authenticated
  using (bucket_id = 'archive-photos' and (storage.foldername(name))[1] = (select auth.uid())::text
    and not exists(select 1 from public.members m where m.photo_path = name)
    and not exists(select 1 from public.contributions c where c.image_path = name));

create function public.my_archive_submissions()
returns table(id uuid,kind public.contribution_kind,status public.contribution_status,title text,created_at timestamptz)
language sql stable security definer set search_path = ''
as $$ select c.id,c.kind,c.status,c.title,c.created_at from public.contributions c
  where c.author_id = auth.uid() order by c.created_at desc limit 50 $$;
revoke execute on function public.my_archive_submissions() from public;
grant execute on function public.my_archive_submissions() to authenticated;

create function public.set_archive_visibility(visible_to_guests boolean) returns void
language plpgsql security definer set search_path = ''
as $$
begin
  if not public.is_archive_admin() then raise exception 'Admin access required' using errcode = '42501'; end if;
  update public.archive_settings set public_read = visible_to_guests;
end;
$$;
revoke execute on function public.set_archive_visibility(boolean) from public;
grant execute on function public.set_archive_visibility(boolean) to authenticated;

create function public.archive_is_public() returns boolean
language sql stable security definer set search_path = ''
as $$ select coalesce((select public_read from public.archive_settings), false) $$;
revoke execute on function public.archive_is_public() from public;
grant execute on function public.archive_is_public() to anon, authenticated;
