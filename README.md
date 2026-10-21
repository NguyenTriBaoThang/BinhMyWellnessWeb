# Bình Mỹ Du Ký Website

Website khám phá Bình Mỹ theo sở thích, thời gian và ngân sách. Nội dung được đóng gói từ JSON trong repository; ứng dụng không cần đăng nhập, cơ sở dữ liệu, Gemini hay khóa API.

## Chạy và kiểm tra

Yêu cầu Node.js 20 trở lên.

```bash
npm ci
npm run dev
npm run test:planner
npm run lint
npm run typecheck
npm run build
```

Mở `http://localhost:3000`. Website không cần tệp `.env`; `.env.example` chỉ ghi rõ điều này. Tệp `.env` cục bộ không được dùng bởi ứng dụng.

## Trang

- `/`: giới thiệu bốn danh mục và các địa điểm có nguồn.
- `/explore`: tìm kiếm không phân biệt dấu, lọc và chuyển danh sách/bản đồ.
- `/experiences/[slug]`: hoạt động, dữ liệu còn thiếu, nguồn và ngày kiểm tra.
- `/itinerary`: planner xác định, bản đồ, lựa chọn, chỉnh sửa, lưu, xuất, in và liên kết chia sẻ.
- `/my`: yêu thích, hành trình trên thiết bị, nhập/xuất bản sao và gợi ý theo sở thích.
- `/editor`: sửa bản sao JSON trên thiết bị, kiểm tra và xuất tệp.

## Dữ liệu và giới hạn

Các file nội dung nằm trong `data/`. Chỉ dữ liệu có nguồn, phạm vi xác minh và trạng thái phù hợp mới được coi là xác minh. Địa điểm thiếu tọa độ, giờ, thời lượng, hoạt động hiện tại hoặc đường đi vẫn được đọc trong danh sách nhưng không được tự đưa vào tuyến. Bản đồ chỉ ghim tọa độ đã xác minh; thiếu GeoJSON thì không vẽ đường thẳng thay cho đường giao thông.

Hiện chưa có điểm nào đủ dữ liệu vận hành và routing để lập tuyến thực tế. Xem [DATA_GAPS.md](DATA_GAPS.md). Chín ảnh nghiên cứu và các ảnh cũ đang được giữ ngoài `public/`; không ảnh nào được phép xuất bản. Xem [docs/IMAGE_POLICY.md](docs/IMAGE_POLICY.md).

Hành trình, yêu thích, dấu tự đánh dấu và bản nháp chỉ lưu trong localStorage của trình duyệt. Không có đồng bộ giữa thiết bị, đặt chỗ, giữ sức chứa, thanh toán, đánh giá hay xác nhận từ nhà vườn. Nút chia sẻ chỉ chứa mã địa điểm và lựa chọn công khai, không chứa ngân sách hoặc thông tin cá nhân.

## Cập nhật nội dung

Sửa JSON trong `data/`, cập nhật nguồn và `DATA_GAPS.md`, rồi chạy `npm run build`. Có thể dùng `/editor` để sửa/xuất bản nháp; thay đổi trên trang biên tập không đăng công khai và không ghi vào Vercel. Để cập nhật website, đưa JSON đã duyệt vào repository rồi redeploy.

Chỉ thêm tọa độ khi xác minh đúng cổng tiếp cận; chỉ thêm giờ/giá/hoạt động khi có nguồn và ngày kiểm tra. Routing phải là cạnh có hướng với đúng phương tiện, geometry, khoảng cách, thời lượng và nguồn. Xem [docs/CONTENT_GUIDE.md](docs/CONTENT_GUIDE.md).

## Triển khai Vercel

Kết nối repository với Vercel, giữ Framework Preset là Next.js, Build Command `npm run build`, Install Command `npm ci`, rồi tạo Preview Deployment. Không cần environment variables. Xem [docs/VERCEL_DEPLOYMENT.md](docs/VERCEL_DEPLOYMENT.md). Chưa có production deployment hoặc database nào được thay đổi trong lần triển khai này.

## Kiến trúc và tiến độ

Xem [ARCHITECTURE.md](ARCHITECTURE.md), [TASKS.md](TASKS.md), [DATA_GAPS.md](DATA_GAPS.md) và [docs/IMPLEMENTATION_TASKS.md](docs/IMPLEMENTATION_TASKS.md). Mã đăng nhập/API/Prisma cũ được giữ trong `legacy/` để tra cứu; không nằm trong route, build hay runtime mới. Database cũ không bị kết nối, sửa, migration, reset hoặc xóa.
