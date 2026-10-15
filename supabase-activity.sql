-- Chạy 1 lần trong Supabase → SQL Editor. Chạy lại nhiều lần cũng an toàn.
-- Sau khi chạy: mọi tài khoản đã đăng nhập xem được danh sách thành viên + nhật ký hoạt động của lớp.

-- 1) Danh sách thành viên (trước đây chỉ host xem được)
create or replace function public.get_students()
returns table(user_id uuid, display_name text, registered_at timestamptz, last_active timestamptz, total_xp bigint)
language plpgsql security definer set search_path=public as $$
begin
  if auth.uid() is null then raise exception 'not_authenticated'; end if;
  return query
  select p.id, p.display_name, u.created_at, max(e.created_at), coalesce(sum(e.xp),0)::bigint
  from profiles p
  join auth.users u on u.id=p.id
  left join study_events e on e.user_id=p.id
  group by p.id, p.display_name, u.created_at
  order by u.created_at desc;
end $$;
grant execute on function public.get_students() to authenticated;

-- 2) Nhật ký hoạt động: ai, làm gì, lúc nào, được bao nhiêu XP
create or replace function public.get_activity(p_limit int default 500)
returns table(display_name text, kind text, xp integer, created_at timestamptz)
language plpgsql security definer set search_path=public as $$
begin
  if auth.uid() is null then raise exception 'not_authenticated'; end if;
  return query
  select p.display_name, e.kind, e.xp, e.created_at
  from study_events e join profiles p on p.id=e.user_id
  order by e.created_at desc
  limit least(greatest(coalesce(p_limit,500),1),1000);
end $$;
grant execute on function public.get_activity(int) to authenticated;
