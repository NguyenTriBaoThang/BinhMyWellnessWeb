# Quy chuẩn Phân nhánh Git (Git Branching Strategy)

Dự án **Bình Mỹ Wellness Web** áp dụng mô hình phân nhánh tiêu chuẩn nhằm đảm bảo tính ổn định của mã nguồn, hỗ trợ kiểm thử tự động (CI/CD) và triển khai liền mạch.

---

## 🌳 Các Nhánh Chính (Core Branches)

1. **`main`**:
   - Nhánh sản phẩm ổn định nhất (Production-ready).
   - Được bảo vệ (Protected Branch): Không commit trực tiếp, bắt buộc phải thông qua Pull Request (PR) được kiểm tra CI pass.
   - Luôn sẵn sàng triển khai lên môi trường sản xuất (Vercel / Docker).

2. **`develop`**:
   - Nhánh tích hợp các tính năng chuẩn bị cho đợt phát hành tiếp theo.
   - Toàn bộ các nhánh tính năng (`feature/*`) và sửa lỗi (`fix/*`) sẽ được hợp nhất vào đây trước khi đưa lên `main`.

---

## 🌿 Các Nhánh Hỗ Trợ (Supporting Branches)

- **`feature/<ten-tinh-nang>`**:
  - Dùng để phát triển tính năng mới.
  - Ví dụ: `feature/booking-vnpay`, `feature/realtime-map-marker`.
- **`fix/<ten-loi>`**:
  - Dùng để sửa lỗi phát sinh từ môi trường thử nghiệm hoặc production.
  - Ví dụ: `fix/capacity-overflow`, `fix/login-session-cookie`.
- **`docs/<noi-dung>`**:
  - Dùng để cập nhật tài liệu kỹ thuật, hướng dẫn sử dụng hoặc mô tả kiến trúc.
  - Ví dụ: `docs/architecture-update`, `docs/api-specification`.
- **`refactor/<ten-module>`**:
  - Tối ưu hóa mã nguồn, tái cấu trúc logic mà không làm thay đổi hành vi người dùng.

---

## 📝 Quy Chuẩn Đặt Tên Commit (Conventional Commits)

Các commit bắt buộc phải tuân thủ chuẩn quy ước để đảm bảo commitlint và GitHub Actions kiểm duyệt thành công:

- `feat:` Thêm tính năng mới cho người dùng.
- `fix:` Sửa lỗi hệ thống.
- `docs:` Cập nhật tài liệu kỹ thuật.
- `style:` Thay đổi định dạng giao diện, CSS/Tailwind (không ảnh hưởng logic code).
- `refactor:` Tái cấu trúc mã nguồn.
- `perf:` Cải thiện hiệu năng xử lý.
- `test:` Bổ sung hoặc chỉnh sửa bộ test tự động.
- `chore:` Thay đổi cấu hình công cụ, quản lý gói phụ thuộc (npm packages).

**Ví dụ**:
```bash
git checkout -b feature/interactive-river-map
git commit -m "feat(map): tích hợp sơ đồ tương tác bờ sông Sài Gòn"
git push origin feature/interactive-river-map
```
