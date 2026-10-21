# Quyền và quy trình ảnh

Không ảnh nghiên cứu nào trong repository hiện được cấp quyền xuất bản. Ảnh được giữ trong `research-assets/unverified/` hoặc `research-assets/unverified/legacy-public-assets/`, không nằm trong đường dẫn công khai của Next.js.

Trước khi tải ảnh, chủ dự án cần có quyền phù hợp và thêm hostname cụ thể vào `data/image-download-allowlist.json`. Script tải chỉ chấp nhận HTTPS, hostname allowlist, DNS IPv4 công khai đã pin, phản hồi không redirect, MIME JPEG/PNG/WebP, chữ ký file đúng, tối đa 8 MB và timeout 10 giây. Không thêm URL nguồn bên ngoài vào trang để hotlink.

```bash
node scripts/download-approved-image.mjs --url https://approved-host.example/photo.jpg --slug place-slug --name photo-name
```

Tải xuống chỉ tạo bản gốc trong `research-assets/approved-originals/`; không cấp quyền xuất bản. Sau khi đã xác nhận quyền, cài `sharp` cục bộ bằng `npm install --save-dev sharp`, thêm `imageId` vào `place.imageIds`, rồi chạy:

```bash
node scripts/optimize-approved-image.mjs --id image-id --slug place-slug --name photo-name --place-id place-id --category-id category-id --source-url https://approved-host.example/photo.jpg --credit "Tên tác giả" --alt "Mô tả chính xác" --rights owner_granted
```

Script xử lý ảnh tại máy, xoay theo metadata, resize tối đa 1600×1200, xuất WebP và cập nhật manifest. Chỉ dùng `licensed`, `owner_granted` hoặc `self_owned` khi đã có căn cứ. Giữ credit và URL nguồn. Kiểm tra lại nội dung/crop và chạy build trước khi redeploy. Không xóa watermark hoặc dùng ảnh của nơi khác/ảnh AI để thay ảnh Bình Mỹ.
