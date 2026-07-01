create or replace function public.increment_template_stats(
  p_template_id uuid,
  p_field text
)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if p_field = 'views' then
    update landing_page_templates
    set views_count = views_count + 1, updated_at = now()
    where id = p_template_id and is_published = true;
  elsif p_field = 'downloads' then
    update landing_page_templates
    set downloads_count = downloads_count + 1, updated_at = now()
    where id = p_template_id and is_published = true;
  else
    raise exception 'invalid field: %', p_field;
  end if;
end;
$$;

grant execute on function public.increment_template_stats(uuid, text) to authenticated;
grant execute on function public.increment_template_stats(uuid, text) to anon;
grant execute on function public.increment_template_stats(uuid, text) to service_role;