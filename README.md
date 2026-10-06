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
