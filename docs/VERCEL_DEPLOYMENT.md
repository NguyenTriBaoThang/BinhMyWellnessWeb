# Triển khai Preview trên Vercel

Website mới dùng JSON tĩnh, không cần database, environment variables, Gemini, Goong hoặc MapTiler key. Leaflet tải nền OpenStreetMap khi trình duyệt có mạng và giữ attribution; các điểm/tuyến chỉ hiện khi JSON đã có dữ liệu xác minh.

1. Push branch đã review lên GitHub và tạo Preview Deployment từ branch đó.
2. Giữ Framework Preset `Next.js`, Install Command `npm ci`, Build Command `npm run build`, Output Directory mặc định.
3. Không cấu hình `DATABASE_URL`, session secret hay khóa AI cho website này.
4. Mở `/`, `/explore`, `/itinerary`, `/my` và `/editor` ở desktop/mobile. Hiện routing trống nên planner phải giải thích rằng chưa đủ dữ liệu; đây là trạng thái đúng.
5. Không promote Preview thành Production hoặc thay domain khi chưa được yêu cầu.

Mỗi thay đổi nội dung cần sửa JSON trong repository rồi tạo deployment mới. Trình biên tập tại `/editor` chỉ xuất bản sao xuống máy; nó không thay đổi trang đã deploy.
