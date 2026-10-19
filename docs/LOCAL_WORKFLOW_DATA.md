# Dữ liệu quy trình local

`npm run seed:workflow:local` tạo một tài khoản nhà vườn, một dịch vụ đang chờ duyệt, một khách hàng, một quản trị viên và lịch trong hai ngày tới. Dữ liệu chỉ được ghi khi `BM_LOCAL_WORKFLOW_DATABASE_URL` trỏ tới PostgreSQL trên `localhost`, `127.0.0.1` hoặc `::1`; script từ chối host bên ngoài và `NODE_ENV=production`. Script không đọc `DATABASE_URL` từ `.env`.

## Nạp dữ liệu

Trước tiên tạo database PostgreSQL local và áp dụng migration:

```powershell
$env:BM_LOCAL_WORKFLOW_DATABASE_URL = 'postgresql://postgres:<mat-khau-local>@127.0.0.1:5432/binhmy_wellness'
$env:DATABASE_URL = $env:BM_LOCAL_WORKFLOW_DATABASE_URL
$env:DIRECT_URL = $env:BM_LOCAL_WORKFLOW_DATABASE_URL
npx prisma migrate deploy
npm run seed:workflow:local
```

Seed có thể chạy lại mà không đặt lại trạng thái duyệt/xác minh của hồ sơ đã tồn tại. Dữ liệu mới bắt đầu ở trạng thái chờ. Tài khoản dùng mật khẩu local `BinhMyLocal@2026!`.

## Đi hết luồng

1. Đăng nhập nhà vườn tại `/login`, hoàn thiện hồ sơ, mở dịch vụ và cập nhật lịch tại `/provider`.
2. Đăng nhập quản trị, kích hoạt hồ sơ; duyệt dịch vụ rồi xác minh dịch vụ, tọa độ Bình Mỹ và các ca trống.
3. Đăng nhập khách hàng, lập và lưu hành trình, gửi yêu cầu sau khi xác nhận.
4. Nhà vườn xác nhận và đánh dấu hoàn tất; khách hàng gửi đánh giá; nhà vườn ghi nhận đối soát.

Tài khoản: `vuon.workflow@example.test`, `khach.workflow@example.test`, `quantri.workflow@example.test`. Dữ liệu này chỉ phục vụ database local; không dùng seed để đưa hồ sơ mẫu lên Production.
