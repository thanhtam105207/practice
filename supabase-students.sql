-- Chạy 1 lần trong Supabase → SQL Editor (sau supabase-schema.sql và supabase-host.sql)
-- Chỉ host (is_host()) mới xem được danh sách học viên. Người khác gọi sẽ bị từ chối ở server.
create or replace function public.get_students()
returns table(user_id uuid, display_name text, registered_at timestamptz, last_active timestamptz, total_xp bigint)
language plpgsql security definer set search_path=public as $$
begin
  if not public.is_host() then raise exception 'not_host'; end if;
  return query
  select p.id, p.display_name, u.created_at, max(e.created_at), coalesce(sum(e.xp),0)::bigint
  from profiles p
  join auth.users u on u.id=p.id
  left join study_events e on e.user_id=p.id
  group by p.id, p.display_name, u.created_at
  order by u.created_at desc;
end $$;
grant execute on function public.get_students() to authenticated;
