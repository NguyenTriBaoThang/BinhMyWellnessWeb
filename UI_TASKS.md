# Tiến độ nâng cấp giao diện Bình Mỹ Du Ký

Phạm vi: nâng cấp UI/UX và frontend theo `PROMPT-THIET-KE-LAI.md`; giữ nguyên dữ liệu JSON và chức năng hiện có. Không dùng ảnh nghiên cứu khi quyền xuất bản chưa được xác nhận, không thêm ảnh giả địa điểm, API hay database.

| Task | Trạng thái | Nội dung / ghi chú |
| --- | --- | --- |
| T01 | DONE | Rà soát trang chủ, khám phá, chi tiết, lập hành trình, đã lưu và dữ liệu. Phát hiện khám phá chưa có chủ đề bốn mùa; ảnh showcase bị gán chung nhiều địa điểm; trang chi tiết có giờ và hướng dẫn đường đi viết cứng. |
| T02 | DONE | Thêm biến màu chủ đề bốn mùa; thống nhất bóng card/hover 220 ms; header sticky có bóng khi cuộn; nhãn navigation rõ và giữ 4 mục mobile. Be Vietnam Pro tiếp tục là font chung. |
| T03 | DONE | Tạo hero 2 cột, thông điệp mới, bốn thẻ chủ đề, địa điểm nổi bật, 3 bước và tư liệu nghề đan lục bình. Dùng hình vector trừu tượng thay ảnh showcase chưa rõ nguồn/quyền. |
| T04 | DONE | Thêm 4 tab Xuân/Hạ/Thu/Đông, banner và hoạt động ưu tiên; tab mùa được lưu trong URL. Bộ lọc phụ, tìm kiếm và chuyển danh sách/bản đồ được giữ; mùa không khẳng định mùa vụ. Typecheck và lint đạt. |
| T05 | DONE | Card 4:3 có lưu yêu thích, giá/thời lượng có điều kiện; trang chi tiết có 4 tab, lightbox, nguồn và CTA. Gỡ dữ kiện giờ/đường đi viết cứng. Lint/typecheck đạt. |
| T06 | DONE | Bố cục form/map/timeline; thông báo nguyên nhân khi thiếu lịch/vị trí/tuyến; đổi thứ tự điểm dừng có kiểm tra lại tính khả thi; chỉnh sửa hành trình đã lưu theo cùng mã chuyến; chỉ lưu/tải/in phương án có thật. Typecheck đạt, lint không lỗi ở lượt trước các tinh chỉnh accessibility cuối. |
| T07 | DONE | Trang “Đã lưu” có nhóm điều khiển truy cập được, vùng nội dung có nhãn, vùng chạm tối thiểu và khoảng đệm cho điều hướng mobile. Lưu/mở lại/chỉnh sửa/xuất/nhập/xóa tiếp tục dùng localStorage; trang chi tiết có dấu trải nghiệm cá nhân. |
| T08 | DONE | Tab mùa/chi tiết dùng phím mũi tên và trạng thái ARIA; form có nhãn; thông báo có live region; lightbox hỗ trợ Escape/mũi tên, giữ và trả focus; giảm chuyển động; khoảng đệm thanh mobile; lọc giá/thời lượng chỉ dựa dữ liệu đã xác minh. Build production thành công. |

## Giới hạn dữ liệu và ảnh

- Các ảnh trong manifest hiện chưa có quyền xuất bản. Bốn ảnh showcase không có metadata đã được chuyển khỏi `public/images/` tới `research-assets/unverified/assets/showcase/` và không dùng trong giao diện.
- Component chi tiết cũ chưa dùng được lưu tại `legacy/ui/PlaceDetailClient-unverified.tsx`; route chi tiết hiện dùng component mới.
- Dữ liệu hiện thiếu tọa độ, giờ hoạt động, giá và thời lượng đã xác minh. Giao diện không tự điền hoặc suy diễn các dữ kiện này.
- Có thể hoàn tất bố cục minh họa bằng hình khối/vector trừu tượng; để trưng bày ảnh thật trong bản công khai cần ảnh đã được cấp quyền và metadata tương ứng.

## Kiểm tra

Kết quả kiểm tra:

- `npm run typecheck` — đạt.
- `npm run lint` — đạt, không có cảnh báo.
- `npm run test:planner` — đạt 9/9.
- `npm run build` — đạt; tiền kiểm tra ảnh và Next.js sinh đủ 14/14 trang tĩnh.
- HTTP production local — 200 cho `/`, `/explore?season=autumn`, `/itinerary?season=summer`, `/my`, trang chi tiết địa điểm và `/sources`.
- `git diff --check` — đạt.

Các breakpoint responsive đã được rà soát trong mã Tailwind (mobile, sm, md, lg). Môi trường hiện không có công cụ điều khiển trình duyệt/chụp screenshot, nên chưa thực hiện kiểm tra trực quan pixel-by-pixel trên viewport.
