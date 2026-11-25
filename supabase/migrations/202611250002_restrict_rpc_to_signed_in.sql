-- Supabase grants EXECUTE on new public functions to anon by default, so
-- revoking from PUBLIC alone leaves these callable by signed-out visitors.
revoke execute on function public.review_contribution(uuid,public.contribution_status) from anon;
revoke execute on function public.save_member(uuid,text,text,text,smallint,smallint,text,uuid[],uuid[],uuid) from anon;
revoke execute on function public.my_archive_submissions() from anon;
revoke execute on function public.set_archive_visibility(boolean) from anon;
