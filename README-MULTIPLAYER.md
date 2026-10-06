# 🐩 ENT303 Study With Friends — bật học chung + leaderboard

Bản này giữ toàn bộ chế độ học offline của ENT303. Muốn bật tài khoản, XP và bảng xếp hạng chung thì nối Supabase.

## 1) Tạo project Supabase
1. Vào https://supabase.com/ và tạo project.
2. Mở **SQL Editor** → dán toàn bộ `supabase-schema.sql` → Run.
3. Vào **Project Settings → API** lấy **Project URL** và **anon public key**.
4. Mở `supabase-config.js` và thay:
   - `YOUR-PROJECT.supabase.co`
   - `YOUR_SUPABASE_ANON_PUBLIC_KEY`
5. Push các file lên GitHub Pages.

> Anon key có thể xuất hiện trong frontend; thứ bảo vệ dữ liệu là Row Level Security (RLS). Không đưa service_role key vào GitHub.

## 2) Auth
App dùng Email + Password. Nếu Supabase yêu cầu xác nhận email, người dùng phải bấm link trong email trước khi đăng nhập.

## 3) Mã lớp
Mặc định là `ENT303-2026`. Bạn bè dùng cùng mã lớp sẽ nằm trong cùng leaderboard. Có thể đổi giá trị mặc định trong `supabase-schema.sql`/giao diện nếu muốn tạo lớp khác.

## 4) XP tuần
- Học/đánh dấu từ: +2 XP
- Đúng grammar: +3 XP (hook sẵn cho các quiz có gọi `ent303AwardXP('grammar_correct')`)
- Hoàn thành quiz ≥80%: +25 XP
- Quiz 100%: +50 XP
- Hoàn thành lesson: +20 XP
- Giới hạn server: tối đa 300 XP/ngày/người để tránh spam.

Leaderboard tính theo tuần bắt đầu từ thứ Hai theo múi giờ Việt Nam (Asia/Ho_Chi_Minh).

## 5) Lưu ý
GitHub Pages vẫn là frontend static. Supabase mới là nơi lưu tài khoản và XP chung. Dữ liệu học chi tiết (flashcard, folder, ảnh profile) vẫn có thể nằm local trên từng thiết bị và backup JSON vẫn hoạt động.
