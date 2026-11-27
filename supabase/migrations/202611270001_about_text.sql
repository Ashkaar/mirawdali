-- Owner-editable "About the tribe" paragraph for the home page, in English and Sorani.
alter table public.archive_settings add column about_en text check (char_length(about_en) <= 4000);
alter table public.archive_settings add column about_ckb text check (char_length(about_ckb) <= 4000);

create function public.archive_about() returns jsonb
language sql stable security definer set search_path = ''
as $$ select jsonb_build_object('en', about_en, 'ckb', about_ckb) from public.archive_settings $$;
revoke execute on function public.archive_about() from public;
grant execute on function public.archive_about() to anon, authenticated;

create function public.set_archive_about(english text, sorani text) returns void
language plpgsql security definer set search_path = ''
as $$
begin
  if not public.is_archive_admin() then raise exception 'Owner access required' using errcode = '42501'; end if;
  update public.archive_settings set about_en = nullif(btrim(english), ''), about_ckb = nullif(btrim(sorani), '');
end;
$$;
revoke execute on function public.set_archive_about(text, text) from public, anon;
grant execute on function public.set_archive_about(text, text) to authenticated;
