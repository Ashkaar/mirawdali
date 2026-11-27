-- Remove partner links that duplicate a parent/child link, and stop new ones.
delete from public.partners p using public.parents x
  where (x.child_id = p.first_id and x.parent_id = p.second_id) or (x.child_id = p.second_id and x.parent_id = p.first_id);

create function public.partners_not_parent_child() returns trigger
language plpgsql set search_path = ''
as $$
begin
  if exists(select 1 from public.parents x where (x.child_id = new.first_id and x.parent_id = new.second_id)
      or (x.child_id = new.second_id and x.parent_id = new.first_id)) then
    raise exception 'A parent or child cannot also be a partner' using errcode = '23514';
  end if;
  return new;
end;
$$;
create trigger partners_not_parent_child before insert or update on public.partners
  for each row execute function public.partners_not_parent_child();

create function public.parents_not_partners() returns trigger
language plpgsql set search_path = ''
as $$
begin
  if exists(select 1 from public.partners p where (p.first_id = least(new.child_id, new.parent_id) and p.second_id = greatest(new.child_id, new.parent_id))) then
    raise exception 'A parent or child cannot also be a partner' using errcode = '23514';
  end if;
  return new;
end;
$$;
create trigger parents_not_partners before insert or update on public.parents
  for each row execute function public.parents_not_partners();

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
