-- Chạy 1 lần trong Supabase -> SQL Editor (chạy lại nhiều lần cũng an toàn).
-- Lưu mỗi lần một người làm xong một bài quiz: ai, lúc nào, dạng quiz, Unit, đúng bao nhiêu câu.

create table if not exists public.quiz_attempts(
  id bigserial primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  kind text not null,
  unit text,
  score int not null,
  total int not null,
  created_at timestamptz not null default now()
);
create index if not exists quiz_attempts_created_idx on public.quiz_attempts(created_at desc);
alter table public.quiz_attempts enable row level security;
-- Không mở quyền đọc/ghi trực tiếp: mọi thao tác đi qua 2 hàm bên dưới.

create or replace function public.log_quiz_attempt(p_kind text, p_unit text, p_score int, p_total int)
returns void language plpgsql security definer set search_path=public as $$
begin
  if auth.uid() is null then raise exception 'not_authenticated'; end if;
  if p_kind not in ('slide','slide_en','fast','listen','grammar') then raise exception 'bad_kind'; end if;
  if p_total < 1 or p_total > 300 or p_score < 0 or p_score > p_total then raise exception 'bad_score'; end if;
  insert into quiz_attempts(user_id,kind,unit,score,total) values (auth.uid(),p_kind,left(coalesce(p_unit,''),80),p_score,p_total);
end $$;
grant execute on function public.log_quiz_attempt(text,text,int,int) to authenticated;

create or replace function public.get_quiz_history(p_limit int default 300)
returns table(display_name text, kind text, unit text, score int, total int, created_at timestamptz)
language plpgsql security definer set search_path=public as $$
begin
  if auth.uid() is null then raise exception 'not_authenticated'; end if;
  return query
  select p.display_name, a.kind, a.unit, a.score, a.total, a.created_at
  from quiz_attempts a join profiles p on p.id=a.user_id
  order by a.created_at desc
  limit least(greatest(coalesce(p_limit,300),1),1000);
end $$;
grant execute on function public.get_quiz_history(int) to authenticated;
