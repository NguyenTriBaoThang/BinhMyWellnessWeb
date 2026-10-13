# Bình Mỹ Wellness Web (Bản Nâng Cấp Next.js + TypeScript + PostgreSQL)

Nền tảng kết nối du lịch nông nghiệp, sinh thái miệt vườn ven sông Sài Gòn tại **Xã Bình Mỹ, Huyện Củ Chi, TP. Hồ Chí Minh**.

---

## 🚀 Công Nghệ Sử Dụng (Tech Stack)

- **Frontend & Backend**: **Next.js 14 (App Router) + TypeScript**
- **Giao diện (UI)**: **Tailwind CSS** (bảng màu sông nước `river`, nông trại `forest`, cây trái `orchard`, thiết kế Glassmorphism, Responsive)
- **Cơ sở dữ liệu (Database)**: **PostgreSQL** kết hợp **Prisma ORM** (kèm Docker Compose và Seed Script tự động)
- **Bảo mật & Xác thực**: Session Cookie HTTP-only, mã hóa mật khẩu bằng `bcryptjs`
- **Biểu tượng (Icons)**: Lucide React

---

## 👥 Danh Sách Tài Khoản Phân Quyền (3 Roles)

Hệ thống đã thiết lập sẵn 3 tài khoản tương ứng với 3 vai trò theo yêu cầu:

| Vai trò | Email đăng nhập | Mật khẩu mặc định | Trang quản lý chính |
| :--- | :--- | :--- | :--- |
| **Khách hàng** (Customer) | `baothang@gmail.com` | `password@123` | `/customer` |
| **Chủ nhà vườn** (Provider) | `nhavuona@gmail.com` | `password@123` | `/provider` |
| **Ban quản trị** (Admin) | `binhmy@admin.com` | `password@123` | `/admin` |

> 💡 **Thanh chuyển vai trò 1-chạm (Role Switcher Bar)**: Ở đầu trang web luôn có thanh công cụ chuyển đổi nhanh giữa 3 tài khoản chỉ với 1 click chuột mà không cần gõ lại mật khẩu, cực kỳ thuận tiện cho việc trình diễn và kiểm thử.

---

## 🌟 Các Hợp Phần & Tính Năng Nổi Bật

1. **Khám Phá Bình Mỹ 365 Ngày**:
   - Dòng thời gian 12 tháng theo mùa vụ miệt vườn (Mùa mai vàng đón Tết, mùa sen Võ Văn Bích nở rộ, mùa hái trái cây Chú Sáu, mùa chèo SUP hoàng hôn sông Sài Gòn...).
   - Khối **Trạng thái Realtime**: Đồng hồ thời gian thực và cập nhật tình trạng sức chứa các ca đón khách hôm nay.

2. **Khám Phá Trải Nghiệm & Bộ Lọc Nâng Cao**:
   - Bộ lọc theo danh mục: *Nông nghiệp, Ẩm thực, Thiên nhiên, Văn hóa, Nghỉ ngơi*.
   - Thanh trượt giới hạn ngân sách (VNĐ/người), lọc địa điểm có khu vực mái che tránh mưa nắng.
   - Tìm kiếm nhanh theo tên hoạt động hoặc tên nhà vườn.

3. **Bản Đồ Sinh Thái & Tọa Độ Địa Lý**:
   - Sơ đồ mô phỏng địa hình Bình Mỹ uốn lượn theo bờ sông Sài Gòn và kênh Rạch Dứa.
   - Tọa độ và địa chỉ chuẩn xác của 8 cơ sở đối tác.

4. **Lập Hành Trình Tự Động Thông Minh (`/itinerary`)**:
   - Cho phép chọn nhiều điểm dừng trong 1 ngày.
   - Tự động sắp xếp các ca đón khách logic, cộng thêm 30 phút di chuyển dự phòng giữa các nhà vườn và tính tổng chi phí.

5. **Quy Trình Đặt Chỗ & Vòng Đời Dịch Vụ**:
   - Khách hàng đặt chỗ (`PENDING`) -> Kiểm tra sức chứa thời gian thực.
   - Nhà vườn Xác nhận (`CONFIRMED`) hoặc Đề xuất đổi lịch (`PROPOSED` kèm ngày, ca, lý do).
   - Khách hàng Chấp nhận đổi lịch (`accept`) hoặc Hủy (`cancel`).
   - Nhà vườn đánh dấu Hoàn thành (`COMPLETED`).
   - Khách hàng đánh giá 5 sao kèm nhận xét (`Review`).
   - Nhà vườn phản hồi trực tiếp lời cảm ơn cho khách.

6. **Trung Tâm Ban Quản Trị (`/admin`)**:
   - Hàng đợi kiểm duyệt dịch vụ (`review -> published / revision / paused`).
   - Quản lý kích hoạt / tạm ngưng cơ sở nhà vườn.
   - Quản lý tài khoản người dùng và phân quyền.
   - Bảng **Audit Logs** ghi lại toàn bộ thao tác hệ thống.
   - Thống kê nguồn truy cập (Website trực tiếp, Mã QR, Zalo, Facebook).

---

## 🛠 Hướng Dẫn Cài Đặt & Khởi Chạy

### 1. Chạy môi trường phát triển (Dev Server)
```bash
npm install
npm run dev
```
Mở trình duyệt truy cập: **`http://localhost:3000`**

### 2. Chạy với PostgreSQL (Tùy chọn)
Dự án đi kèm file `docker-compose.yml` cấu hình sẵn PostgreSQL 16:
```bash
# Khởi động PostgreSQL container
docker compose up -d

# Đẩy schema vào cơ sở dữ liệu PostgreSQL
npm run prisma:push

# Nạp dữ liệu tài khoản và 8 nhà vườn mẫu vào PostgreSQL
npm run prisma:seed
```

> ⚡ *Lưu ý*: Ứng dụng tích hợp sẵn cơ chế Dual-layer Data Adapter, tự động hoạt động mượt mà với dữ liệu mẫu ngay cả khi máy bạn chưa bật PostgreSQL.

### 3. Kiểm thử tự động (End-to-End Test)
```bash
node scripts/test_flow.mjs
```
Kiểm chứng toàn bộ luồng: Đăng nhập Khách hàng -> Tạo đơn -> Nhà vườn xác nhận -> Hoàn thành -> Viết đánh giá -> Phản hồi đánh giá -> Quản trị kiểm tra số liệu.
