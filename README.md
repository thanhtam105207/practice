# 🌸 Mimi – Language Practice

Website/PWA học và luyện ngoại ngữ với **3 môn ngang hàng**: 🇬🇧 English, 🇨🇳 中文 (HSK) và 🇯🇵 日本語 (N5). Có chế độ **Study With Friends**: tài khoản, mã lớp, XP và bảng xếp hạng theo tuần.

> Mimi phát triển từ app ENT303 Study Hub. Toàn bộ chức năng English/ENT303 vẫn được giữ nguyên trong môn English.

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
5. Bạn bè mở web → **Tạo tài khoản** → vào học và cùng xuất hiện trên bảng xếp hạng.

Chi tiết: xem `README-MULTIPLAYER.md`.

> Không bao giờ đưa `service_role` key vào GitHub. Frontend chỉ dùng anon/public key và RLS trong Supabase.
