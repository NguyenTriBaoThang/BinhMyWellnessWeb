# Hướng Dẫn Đóng Góp (Contributing Guidelines)

Cảm ơn bạn đã quan tâm và đồng hành phát triển dự án **Bình Mỹ Wellness Web**! Chúng tôi trân trọng mọi đóng góp nhằm xây dựng nền tảng du lịch sinh thái nông nghiệp tốt hơn.

---

## 🛠 1. Môi Trường Phát Triển Cục Bộ

### Yêu cầu tiên quyết:
- **Node.js**: Phiên bản 20.x trở lên.
- **npm**: Đi kèm Node.js.
- **Docker** (Tùy chọn): Nếu muốn chạy cơ sở dữ liệu PostgreSQL cục bộ qua `docker compose`.

### Cài đặt:
```bash
# Clone repository
git clone https://github.com/NguyenTriBaoThang/BinhMyWellnessWeb.git
cd BinhMyWellnessWeb

# Cài đặt các gói phụ thuộc
npm install

# Sinh mã Prisma Client
npm run prisma:generate

# Khởi chạy server phát triển
npm run dev
```

Truy cập: `http://localhost:3000`

---

## 🌿 2. Quy Trình Phát Triển & Nhánh Git

1. **Fork** repository về tài khoản GitHub của bạn (hoặc tạo branch mới nếu có quyền truy cập trực tiếp).
2. Tạo nhánh mới từ `develop` (hoặc `main` nếu làm việc trực tiếp):
   - Tính năng mới: `feature/ten-tinh-nang`
   - Sửa lỗi: `fix/ten-loi`
   - Tài liệu: `docs/ten-tai-lieu`
3. Đặt tiêu đề commit theo quy chuẩn **Conventional Commits**:
   - `feat(booking): bổ sung xác thực mã QR khi khách check-in`
   - `fix(capacity): sửa lỗi tính toán sức chứa ca chiều`
   - `docs(readme): cập nhật hướng dẫn thiết lập cơ sở dữ liệu`

---

## ✅ 3. Kiểm Tra Mã Nguồn Trước Khi Tạo PR

Trước khi đẩy code lên remote và tạo Pull Request, vui lòng chạy kiểm tra cục bộ:
```bash
# Kiểm tra định dạng lint và lỗi cú pháp
npm run lint

# Kiểm tra biên dịch hoàn chỉnh dự án Next.js
npm run build
```

---

## 🚀 4. Tạo Pull Request (PR)

- Đặt tiêu đề PR rõ ràng, tuân thủ conventional commits (ví dụ: `feat(itinerary): thêm tính năng gợi ý chuyến đi`).
- Điền đầy đủ thông tin theo mẫu **Pull Request Template**.
- Đảm bảo toàn bộ các bước kiểm tra tự động trên GitHub Actions (CI Pipeline) đều đạt trạng thái màu xanh (Passing).
