-- Section admins, direct publishing, and owner-only user management.
--
-- Roles:
--   owner         the single row in archive_admin; full control, users and settings
--   section admin rows in archive_section_admins; manage the tree, gallery or blog

create table public.archive_section_admins (
  user_id uuid not null references auth.users(id) on delete cascade,
  section text not null check (section in ('tree','gallery','blog')),
  granted_at timestamptz not null default now(),
  primary key (user_id, section)
);
alter table public.archive_section_admins enable row level security;
revoke all on public.archive_section_admins from anon, authenticated;

create function public.section_for_kind(entry_kind public.contribution_kind) returns text
language sql immutable set search_path = ''
as $$ select case entry_kind when 'suggestion' then 'tree' when 'photo' then 'gallery' else 'blog' end $$;

create function public.is_section_admin(target_section text) returns boolean
language sql stable security definer set search_path = ''
as $$ select public.is_archive_admin() or exists(
  select 1 from public.archive_section_admins where user_id = auth.uid() and section = target_section) $$;

create function public.is_any_admin() returns boolean
language sql stable security definer set search_path = ''
as $$ select public.is_archive_admin() or exists(
  select 1 from public.archive_section_admins where user_id = auth.uid()) $$;

create function public.my_archive_roles() returns jsonb
language sql stable security definer set search_path = ''
as $$ select jsonb_build_object(
  'owner', public.is_archive_admin(),
  'sections', coalesce((select jsonb_agg(section order by section)
    from public.archive_section_admins where user_id = auth.uid()), '[]'::jsonb)) $$;

-- Policy helpers run as the caller, so signed-out visitors need them too.
revoke execute on function public.section_for_kind(public.contribution_kind), public.is_section_admin(text),
  public.is_any_admin() from public;
grant execute on function public.section_for_kind(public.contribution_kind), public.is_section_admin(text),
  public.is_any_admin() to anon, authenticated;
revoke execute on function public.my_archive_roles() from public, anon;
grant execute on function public.my_archive_roles() to authenticated;

-- Section admins see every contribution in their section.
drop policy contributions_visible on public.contributions;
create policy contributions_visible on public.contributions for select using (
  ((select public.can_read_archive()) and status = 'approved' and kind in ('post','photo'))
  or author_id = (select auth.uid())
  or public.is_section_admin(public.section_for_kind(kind))
);

create function public.admin_list_contributions()
returns table(id uuid, kind public.contribution_kind, status public.contribution_status, title text, body text,
  category public.blog_category, image_path text, member_id uuid, created_at timestamptz, reviewed_at timestamptz,
  applied_at timestamptz, author_email text)
language sql stable security definer set search_path = ''
as $$ select c.id, c.kind, c.status, c.title, c.body, c.category, c.image_path, c.member_id, c.created_at,
    c.reviewed_at, c.applied_at, u.email::text
  from public.contributions c left join auth.users u on u.id = c.author_id
  where public.is_section_admin(public.section_for_kind(c.kind))
  order by c.created_at desc limit 1000 $$;

create function public.set_contribution_status(submission uuid, decision public.contribution_status) returns boolean
language plpgsql security definer set search_path = ''
as $$
declare entry_kind public.contribution_kind;
begin
  select c.kind into entry_kind from public.contributions c where c.id = submission;
  if entry_kind is null then return false; end if;
  if not public.is_section_admin(public.section_for_kind(entry_kind)) then
    raise exception 'Admin access required' using errcode = '42501';
  end if;
  update public.contributions set status = decision,
    reviewed_at = case when decision = 'pending' then null else now() end
    where id = submission and status <> decision;
  return found;
end;
$$;

create or replace function public.review_contribution(submission uuid, decision public.contribution_status) returns boolean
language plpgsql security definer set search_path = ''
as $$
declare entry_kind public.contribution_kind;
begin
  select c.kind into entry_kind from public.contributions c where c.id = submission;
  if entry_kind is null then return false; end if;
  if not public.is_section_admin(public.section_for_kind(entry_kind)) then
    raise exception 'Admin access required' using errcode = '42501';
  end if;
  if decision not in ('approved','rejected') then return false; end if;
  update public.contributions set status = decision, reviewed_at = now()
    where id = submission and status = 'pending';
  return found;
end;
$$;

create function public.publish_contribution(entry_kind public.contribution_kind, entry_title text, entry_body text,
  entry_category public.blog_category, entry_image text) returns uuid
language plpgsql security definer set search_path = ''
as $$
declare saved_id uuid;
begin
  if entry_kind not in ('post','photo') then raise exception 'Unsupported kind' using errcode = '22023'; end if;
  if not public.is_section_admin(public.section_for_kind(entry_kind)) then
    raise exception 'Admin access required' using errcode = '42501';
  end if;
  insert into public.contributions(author_id, kind, status, title, body, category, image_path, reviewed_at)
    values (auth.uid(), entry_kind, 'approved', entry_title, entry_body,
      case when entry_kind = 'post' then entry_category end,
      case when entry_kind = 'photo' then entry_image end, now())
    returning id into saved_id;
  return saved_id;
end;
$$;

create function public.update_contribution(target uuid, entry_title text, entry_body text,
  entry_category public.blog_category) returns boolean
language plpgsql security definer set search_path = ''
as $$
declare entry_kind public.contribution_kind;
begin
  select c.kind into entry_kind from public.contributions c where c.id = target;
  if entry_kind is null then return false; end if;
  if not public.is_section_admin(public.section_for_kind(entry_kind)) then
    raise exception 'Admin access required' using errcode = '42501';
  end if;
  update public.contributions set title = entry_title, body = entry_body,
    category = case when kind = 'post' then coalesce(entry_category, category) end
    where id = target;
  return found;
end;
$$;

-- Returns the deleted entry's image path so the app can remove the file.
create function public.delete_contribution(target uuid) returns text
language plpgsql security definer set search_path = ''
as $$
declare entry_kind public.contribution_kind; removed_image text;
begin
  select c.kind into entry_kind from public.contributions c where c.id = target;
  if entry_kind is null then return null; end if;
  if not public.is_section_admin(public.section_for_kind(entry_kind)) then
    raise exception 'Admin access required' using errcode = '42501';
  end if;
  delete from public.contributions where id = target returning image_path into removed_image;
  return removed_image;
end;
$$;

create or replace function public.save_member(target uuid, english_name text, sorani_name text, member_gender text,
  born smallint, died smallint, photo text, parent_ids uuid[], partner_ids uuid[], source_suggestion uuid) returns uuid
language plpgsql security definer set search_path = ''
as $$
declare saved_id uuid;
begin
  if not public.is_section_admin('tree') then raise exception 'Admin access required' using errcode = '42501'; end if;
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

create function public.delete_member(target uuid) returns text
language plpgsql security definer set search_path = ''
as $$
declare removed_photo text;
begin
  if not public.is_section_admin('tree') then raise exception 'Admin access required' using errcode = '42501'; end if;
  delete from public.members where id = target returning photo_path into removed_photo;
  return removed_photo;
end;
$$;

-- Suggestions that were approved but need no tree change can be marked done.
create function public.mark_suggestion_applied(target uuid) returns boolean
language plpgsql security definer set search_path = ''
as $$
begin
  if not public.is_section_admin('tree') then raise exception 'Admin access required' using errcode = '42501'; end if;
  update public.contributions set applied_at = now()
    where id = target and kind = 'suggestion' and status = 'approved' and applied_at is null;
  return found;
end;
$$;

-- Owner-only user management.
create function public.admin_list_users()
returns table(id uuid, email text, provider text, created_at timestamptz, last_sign_in_at timestamptz,
  confirmed boolean, blocked boolean, is_owner boolean, sections text[], submissions bigint)
language sql stable security definer set search_path = ''
as $$ select u.id, u.email::text, coalesce(u.raw_app_meta_data->>'provider', 'email'), u.created_at,
    u.last_sign_in_at, u.email_confirmed_at is not null, coalesce(u.banned_until > now(), false),
    exists(select 1 from public.archive_admin a where a.user_id = u.id),
    array(select s.section from public.archive_section_admins s where s.user_id = u.id order by s.section),
    (select count(*) from public.contributions c where c.author_id = u.id)
  from auth.users u
  where public.is_archive_admin()
  order by u.created_at $$;

create function public.admin_set_user_sections(target uuid, new_sections text[]) returns void
language plpgsql security definer set search_path = ''
as $$
begin
  if not public.is_archive_admin() then raise exception 'Owner access required' using errcode = '42501'; end if;
  if not exists(select 1 from auth.users where id = target) then raise exception 'Unknown user'; end if;
  delete from public.archive_section_admins where user_id = target;
  insert into public.archive_section_admins(user_id, section)
    select distinct target, s from unnest(coalesce(new_sections, '{}')) as s;
end;
$$;

create function public.admin_set_user_blocked(target uuid, should_block boolean) returns void
language plpgsql security definer set search_path = ''
as $$
begin
  if not public.is_archive_admin() then raise exception 'Owner access required' using errcode = '42501'; end if;
  if exists(select 1 from public.archive_admin where user_id = target) then
    raise exception 'The owner cannot be blocked' using errcode = '22023';
  end if;
  update auth.users set banned_until = case when should_block then now() + interval '100 years' end
    where id = target;
  if should_block then
    delete from public.archive_section_admins where user_id = target;
    delete from auth.sessions where user_id = target;
  end if;
end;
$$;

-- Returns image paths of the user's deleted contributions so the app can remove the files.
create function public.admin_delete_user(target uuid) returns text[]
language plpgsql security definer set search_path = ''
as $$
declare images text[];
begin
  if not public.is_archive_admin() then raise exception 'Owner access required' using errcode = '42501'; end if;
  if exists(select 1 from public.archive_admin where user_id = target) then
    raise exception 'The owner cannot be deleted' using errcode = '22023';
  end if;
  select coalesce(array_agg(image_path) filter (where image_path is not null), '{}') into images
    from public.contributions where author_id = target;
  delete from auth.users where id = target;
  return images;
end;
$$;

revoke execute on function
  public.admin_list_contributions(),
  public.set_contribution_status(uuid,public.contribution_status),
  public.publish_contribution(public.contribution_kind,text,text,public.blog_category,text),
  public.update_contribution(uuid,text,text,public.blog_category),
  public.delete_contribution(uuid),
  public.delete_member(uuid),
  public.mark_suggestion_applied(uuid),
  public.admin_list_users(),
  public.admin_set_user_sections(uuid,text[]),
  public.admin_set_user_blocked(uuid,boolean),
  public.admin_delete_user(uuid)
from public, anon;
grant execute on function
  public.admin_list_contributions(),
  public.set_contribution_status(uuid,public.contribution_status),
  public.publish_contribution(public.contribution_kind,text,text,public.blog_category,text),
  public.update_contribution(uuid,text,text,public.blog_category),
  public.delete_contribution(uuid),
  public.delete_member(uuid),
  public.mark_suggestion_applied(uuid),
  public.admin_list_users(),
  public.admin_set_user_sections(uuid,text[]),
  public.admin_set_user_blocked(uuid,boolean),
  public.admin_delete_user(uuid)
to authenticated;

-- Photos: section admins can see the images in their section and clean up unreferenced files.
drop policy archive_photo_read on storage.objects;
create policy archive_photo_read on storage.objects for select to anon, authenticated
  using (bucket_id = 'archive-photos' and (
    (select public.is_archive_admin())
    or (storage.foldername(name))[1] = (select auth.uid())::text
    or exists (select 1 from public.members m where m.photo_path = name
      and ((select public.can_read_archive()) or (select public.is_section_admin('tree'))))
    or exists (select 1 from public.contributions c where c.image_path = name and (
      (c.status = 'approved' and c.kind = 'photo' and (select public.can_read_archive()))
      or public.is_section_admin(public.section_for_kind(c.kind))))
  ));
drop policy archive_photo_cleanup on storage.objects;
create policy archive_photo_cleanup on storage.objects for delete to authenticated
  using (bucket_id = 'archive-photos'
    and ((storage.foldername(name))[1] = (select auth.uid())::text or (select public.is_any_admin()))
    and not exists(select 1 from public.members m where m.photo_path = name)
    and not exists(select 1 from public.contributions c where c.image_path = name));
