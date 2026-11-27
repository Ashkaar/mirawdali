-- Per-item visibility for members, photos and stories:
--   public  anyone (subject to the archive-wide browsing setting)
--   users   signed-in accounts only
--   private the owner only (not section admins)

alter table public.members add column visibility text not null default 'public' check (visibility in ('public','users','private'));
alter table public.contributions add column visibility text not null default 'public' check (visibility in ('public','users','private'));
grant select (visibility) on public.contributions to anon, authenticated;

create function public.can_see(level text) returns boolean
language sql stable security definer set search_path = ''
as $$ select public.is_archive_admin() or case level
  when 'public' then public.can_read_archive()
  when 'users' then auth.uid() is not null
  else false end $$;
revoke execute on function public.can_see(text) from public;
grant execute on function public.can_see(text) to anon, authenticated;

-- Only the owner may create, change or remove anything private, whichever function is used.
create function public.guard_private() returns trigger
language plpgsql set search_path = ''
as $$
begin
  if ((tg_op <> 'INSERT' and old.visibility = 'private') or (tg_op <> 'DELETE' and new.visibility = 'private'))
     and auth.uid() is not null and not public.is_archive_admin() then
    raise exception 'Only the owner can manage private items' using errcode = '42501';
  end if;
  return coalesce(new, old);
end;
$$;
create trigger members_guard_private before insert or update or delete on public.members
  for each row execute function public.guard_private();
create trigger contributions_guard_private before insert or update or delete on public.contributions
  for each row execute function public.guard_private();

-- Reading. Relationship rows show only when both people are visible (the subqueries apply members' own policy).
drop policy members_read on public.members;
create policy members_read on public.members for select using (public.can_see(visibility));
drop policy parents_read on public.parents;
create policy parents_read on public.parents for select using (
  exists(select 1 from public.members m where m.id = child_id) and exists(select 1 from public.members m where m.id = parent_id));
drop policy partners_read on public.partners;
create policy partners_read on public.partners for select using (
  exists(select 1 from public.members m where m.id = first_id) and exists(select 1 from public.members m where m.id = second_id));
drop policy contributions_visible on public.contributions;
create policy contributions_visible on public.contributions for select using (
  (status = 'approved' and kind in ('post','photo') and public.can_see(visibility))
  or author_id = (select auth.uid())
  or (public.is_section_admin(public.section_for_kind(kind)) and (visibility <> 'private' or (select public.is_archive_admin())))
);

-- Photo files follow the visibility of the member or entry that uses them.
drop policy archive_photo_read on storage.objects;
create policy archive_photo_read on storage.objects for select to anon, authenticated
  using (bucket_id = 'archive-photos' and (
    (select public.is_archive_admin())
    or (storage.foldername(name))[1] = (select auth.uid())::text
    or exists (select 1 from public.members m where m.photo_path = name)
    or exists (select 1 from public.contributions c where c.image_path = name)
  ));

drop function public.admin_list_contributions();
create function public.admin_list_contributions()
returns table(id uuid, kind public.contribution_kind, status public.contribution_status, title text, body text,
  category public.blog_category, image_path text, member_id uuid, created_at timestamptz, reviewed_at timestamptz,
  applied_at timestamptz, author_email text, visibility text)
language sql stable security definer set search_path = ''
as $$ select c.id, c.kind, c.status, c.title, c.body, c.category, c.image_path, c.member_id, c.created_at,
    c.reviewed_at, c.applied_at, u.email::text, c.visibility
  from public.contributions c left join auth.users u on u.id = c.author_id
  where public.is_section_admin(public.section_for_kind(c.kind))
    and (c.visibility <> 'private' or public.is_archive_admin())
  order by c.created_at desc limit 1000 $$;
revoke execute on function public.admin_list_contributions() from public, anon;
grant execute on function public.admin_list_contributions() to authenticated;

drop function public.publish_contribution(public.contribution_kind,text,text,public.blog_category,text);
create function public.publish_contribution(entry_kind public.contribution_kind, entry_title text, entry_body text,
  entry_category public.blog_category, entry_image text, entry_visibility text default 'public') returns uuid
language plpgsql security definer set search_path = ''
as $$
declare saved_id uuid;
begin
  if entry_kind not in ('post','photo') then raise exception 'Unsupported kind' using errcode = '22023'; end if;
  if not public.is_section_admin(public.section_for_kind(entry_kind)) then
    raise exception 'Admin access required' using errcode = '42501';
  end if;
  insert into public.contributions(author_id, kind, status, title, body, category, image_path, reviewed_at, visibility)
    values (auth.uid(), entry_kind, 'approved', entry_title, entry_body,
      case when entry_kind = 'post' then entry_category end,
      case when entry_kind = 'photo' then entry_image end, now(), coalesce(entry_visibility, 'public'))
    returning id into saved_id;
  return saved_id;
end;
$$;

drop function public.update_contribution(uuid,text,text,public.blog_category);
create function public.update_contribution(target uuid, entry_title text, entry_body text,
  entry_category public.blog_category, entry_visibility text default null) returns boolean
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
    category = case when kind = 'post' then coalesce(entry_category, category) end,
    visibility = coalesce(entry_visibility, visibility)
    where id = target;
  return found;
end;
$$;

drop function public.save_member(uuid,text,text,text,smallint,smallint,text,uuid[],uuid[],uuid);
create function public.save_member(target uuid, english_name text, sorani_name text, member_gender text,
  born smallint, died smallint, photo text, parent_ids uuid[], partner_ids uuid[], source_suggestion uuid,
  member_visibility text default null) returns uuid
language plpgsql security definer set search_path = ''
as $$
declare saved_id uuid;
begin
  if not public.is_section_admin('tree') then raise exception 'Admin access required' using errcode = '42501'; end if;
  perform pg_advisory_xact_lock(317624);
  if target is null then
    insert into public.members(name_en,name_ckb,gender,birth_year,death_year,photo_path,visibility)
      values (english_name,sorani_name,member_gender,born,died,photo,coalesce(member_visibility,'public')) returning id into saved_id;
  else
    update public.members set name_en=english_name,name_ckb=sorani_name,gender=member_gender,
      birth_year=born,death_year=died,photo_path=coalesce(photo,photo_path),visibility=coalesce(member_visibility,visibility)
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
  -- Clear both lists before re-adding, so someone can move from partner to parent in one save.
  delete from public.parents where child_id = saved_id;
  delete from public.partners where first_id = saved_id or second_id = saved_id;
  insert into public.parents(child_id,parent_id)
    select distinct saved_id, p from unnest(parent_ids) as p;
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

revoke execute on function
  public.publish_contribution(public.contribution_kind,text,text,public.blog_category,text,text),
  public.update_contribution(uuid,text,text,public.blog_category,text),
  public.save_member(uuid,text,text,text,smallint,smallint,text,uuid[],uuid[],uuid,text)
from public, anon;
grant execute on function
  public.publish_contribution(public.contribution_kind,text,text,public.blog_category,text,text),
  public.update_contribution(uuid,text,text,public.blog_category,text),
  public.save_member(uuid,text,text,text,smallint,smallint,text,uuid[],uuid[],uuid,text)
to authenticated;
