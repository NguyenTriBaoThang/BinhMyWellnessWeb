# Hướng dẫn cập nhật nội dung

1. Bổ sung hoặc sửa bản ghi JSON trong `data/`; dùng ID duy nhất và giữ một địa điểm cho một thực thể thật.
2. Ghi `sourceUrl`, phạm vi nguồn, ngày kiểm tra và status riêng cho tên điểm, địa bàn, cổng vào, tọa độ, giờ, giá, vận hành và hoạt động.
3. Dùng `null` khi chưa biết. Không đổi dữ liệu thiếu thành 0 đồng, miễn phí, mở cửa hoặc còn chỗ.
4. Để trải nghiệm vào planner, cần trạng thái xác minh phù hợp, địa bàn `BINH_MY`, tọa độ/cổng vào xác minh, giờ, thời lượng, mùa và trạng thái vận hành. Trẻ em cần chính sách phù hợp tuổi.
5. Thêm route edge cho đúng chiều và phương tiện; ghi nguồn, ngày, distance, duration và GeoJSON reference. Không tự suy ra cạnh ngược.
6. Chạy `npm run test:planner`, `npm run lint`, `npm run typecheck`, `npm run build`. Cập nhật `DATA_GAPS.md` và `TASKS.md`.

## Giá

Giá là VND nguyên, có basis `per_adult`, `per_child` hoặc `per_group`, ngày/nguồn xác minh, điều kiện nhóm/tuổi, sức chứa và nội dung gồm/không gồm. Giá nhóm được cộng đúng một lần. Không dùng giá ước lượng như giá nhà vườn; người dùng có thể tự nhập dự trù và giao diện phải đánh dấu nguồn đó.

## Tọa độ và routing

Chỉ ghim cổng tiếp cận đã xác minh. Địa chỉ hoặc geocoding theo tên chỉ là ứng viên. Geometry phải cùng nguồn/profile/phương tiện với thời lượng và khoảng cách. Tuyến sông cần điểm lên/xuống, dịch vụ, lịch và thời lượng đã xác minh; không dùng cạnh đường bộ để suy ra tuyến thuyền.

Ảnh mới phải tuân theo [IMAGE_POLICY.md](IMAGE_POLICY.md). Bản nháp trong `/editor` chỉ lưu trên thiết bị và tệp tải xuống; nó không chỉnh file JSON đã deploy.
