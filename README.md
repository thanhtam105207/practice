# 🐩 ENT303 - Top Notch 3 Study Hub v5

Website/PWA học **Vocabulary + Grammar + Quiz** cho Top Notch 3, nay có thêm chế độ **Study With Friends**: tài khoản, mã lớp, XP và bảng xếp hạng theo tuần.

## Chế độ offline
- Học từ vựng, flashcard, quiz, nghe/chép.
- Ngữ pháp Units 1–10 + formula/examples/rules.
- Grammar quiz: multiple choice, fill, reorder; 10 câu/lượt, random.
- Folder từ vựng + grammar.
- Streak theo múi giờ Việt Nam `Asia/Ho_Chi_Minh`.
- Backup/restore JSON.
- Poodle UI, quote, sound/confetti feedback.

## 🏆 Chế độ học chung
Frontend vẫn chạy trên GitHub Pages, còn tài khoản + XP + leaderboard dùng Supabase.

### Cài 1 lần
1. Tạo project Supabase.
2. Mở SQL Editor và chạy `supabase-schema.sql`.
3. Mở `supabase-config.js`, thay `YOUR-PROJECT...` và `YOUR_SUPABASE_ANON_PUBLIC_KEY` bằng Project URL + anon public key.
4. Push repo lên GitHub Pages.
5. Bạn bè mở web → **Tạo tài khoản** → nhập cùng mã lớp (mặc định `ENT303-2026`).

Chi tiết: xem `README-MULTIPLAYER.md`.

> Không bao giờ đưa `service_role` key vào GitHub. Frontend chỉ dùng anon/public key và RLS trong Supabase.


## V6 — Host, nội dung chung và Quiz cộng đồng
Sau khi chạy lại `supabase-schema.sql`, tài khoản có role `host` sẽ thấy nút 👑 Host.

### Cấp quyền Host cho tài khoản của bạn
1. Tạo/đăng nhập tài khoản của bạn trong app.
2. Vào Supabase → SQL Editor.
3. Tìm user của bạn trong Authentication → Users để lấy UUID, rồi chạy:

```sql
insert into public.app_roles(user_id, role)
values ('UUID_CUA_BAN', 'host')
on conflict (user_id) do update set role='host';
```

Host có thể đăng thông báo, thêm từ vựng chung và duyệt câu hỏi học viên. Học viên có thể tự tạo câu hỏi; chỉ câu hỏi được Host duyệt mới vào Quiz cộng đồng.

### Đồng bộ từ vựng chung
Từ Host được tải từ Supabase. Nếu tài khoản học viên đã có một từ trùng theo cách viết (không phân biệt hoa/thường), app giữ bản cá nhân và không chèn bản Host vào tài khoản đó. Vì vậy Host có thể cập nhật nội dung chung mà không phá dữ liệu riêng của học viên.


## V7 Host setup
- Host username: `phamthithanhtam`
- Host PIN: `2007`
- Create the account once from the app's “Tạo tài khoản” screen. The app automatically calls `claim_host_account` after successful authentication and grants the Host role server-side.
- In Supabase Authentication → Providers → Email, turn off email confirmation because this app uses a username + 4-digit PIN flow.


## V8 changes
- Account moved to bottom navigation after Add.
- Account menu includes theme, install, guide and notifications.
- Host can globally edit vocabulary and image content through Supabase overrides.
- Added top announcement strip and improved authentication icon.
- Host claim RPC for phamthithanhtam / PIN 2007.
