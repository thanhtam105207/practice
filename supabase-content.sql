-- Chạy 1 lần trong Supabase → SQL Editor (sau supabase-schema.sql và supabase-host.sql). Chạy lại nhiều lần vẫn an toàn.
-- Mỗi nội dung host thêm = 1 dòng riêng (không ghi đè nhau như host_content cũ), người học nhận ngay qua Realtime.
create table if not exists public.host_items (
  id uuid primary key default gen_random_uuid(),
  lang text not null check (lang in ('en','zh','ja')),
  kind text not null,                       -- vocab | exercise | note | file | custom
  folder text not null default '',          -- tên bài/nhóm (English: số Unit)
  data jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists host_items_lang_time on public.host_items(lang, created_at);
alter table public.host_items enable row level security;
drop policy if exists hi_sel on public.host_items; create policy hi_sel on public.host_items for select to anon, authenticated using (true);
drop policy if exists hi_ins on public.host_items; create policy hi_ins on public.host_items for insert to authenticated with check (public.is_host());
drop policy if exists hi_upd on public.host_items; create policy hi_upd on public.host_items for update to authenticated using (public.is_host()) with check (public.is_host());
drop policy if exists hi_del on public.host_items; create policy hi_del on public.host_items for delete to authenticated using (public.is_host());
do $$ begin alter publication supabase_realtime add table public.host_items; exception when duplicate_object then null; end $$;

-- Kho file (ảnh, âm thanh, PDF…) do host tải lên: ai cũng xem được, chỉ host được ghi/xóa
insert into storage.buckets (id, name, public) values ('host-media','host-media',true) on conflict (id) do nothing;
drop policy if exists hm_sel on storage.objects; create policy hm_sel on storage.objects for select using (bucket_id='host-media');
drop policy if exists hm_ins on storage.objects; create policy hm_ins on storage.objects for insert to authenticated with check (bucket_id='host-media' and public.is_host());
drop policy if exists hm_upd on storage.objects; create policy hm_upd on storage.objects for update to authenticated using (bucket_id='host-media' and public.is_host());
drop policy if exists hm_del on storage.objects; create policy hm_del on storage.objects for delete to authenticated using (bucket_id='host-media' and public.is_host());
