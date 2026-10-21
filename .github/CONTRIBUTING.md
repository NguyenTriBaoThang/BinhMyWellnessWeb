# Hướng dẫn đóng góp

Yêu cầu Node.js 20+. Cài dependencies bằng `npm ci`; không cần Docker hoặc database.

Trước pull request, chạy:

```bash
npm run test:planner
npm run lint
npm run typecheck
npm run build
```

Nếu đổi dữ liệu địa điểm, cập nhật nguồn, ngày/status xác minh và `DATA_GAPS.md`. Không thêm ảnh vào `public/` nếu chưa có quyền xuất bản được ghi trong manifest. Không dùng dữ liệu fixture làm nội dung website.
