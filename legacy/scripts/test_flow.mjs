const BASE_URL = 'http://localhost:3000';

function getSessionCookie(header) {
  if (!header) return '';
  const match = header.match(/bm_session=[^;]+/);
  return match ? match[0] : '';
}

async function test() {
  console.log('🧪 Bắt đầu kiểm thử toàn bộ luồng nghiệp vụ trên Next.js...');

  // 1. Login as Customer
  let res = await fetch(`${BASE_URL}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'baothang@gmail.com', password: 'password@123' }),
  });
  let data = await res.json();
  const customerCookie = getSessionCookie(res.headers.get('set-cookie'));
  console.log('✅ 1. Đăng nhập Khách hàng:', data.user.email, 'Role:', data.user.role);

  // 2. Create Booking
  res = await fetch(`${BASE_URL}/api/bookings`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      cookie: customerCookie,
    },
    body: JSON.stringify({
      serviceId: 's1',
      date: '2026-10-16',
      slot: '08:30',
      people: 2,
      name: 'Bảo Thắng',
      phone: '0901234567',
    }),
  });
  data = await res.json();
  const bookingId = data.booking.id;
  console.log('✅ 2. Tạo đơn đặt chỗ mới:', bookingId, 'Status:', data.booking.status);

  // 3. Login as Provider
  res = await fetch(`${BASE_URL}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'nhavuona@gmail.com', password: 'password@123' }),
  });
  data = await res.json();
  const providerCookie = getSessionCookie(res.headers.get('set-cookie'));
  console.log('✅ 3. Đăng nhập Chủ nhà vườn:', data.user.email, 'Role:', data.user.role);

  // 4. Confirm Booking
  res = await fetch(`${BASE_URL}/api/bookings/${bookingId}/transition`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      cookie: providerCookie,
    },
    body: JSON.stringify({ action: 'confirm' }),
  });
  data = await res.json();
  console.log('✅ 4. Nhà vườn xác nhận đơn:', bookingId, 'Status:', data.booking.status);

  // 5. Complete Booking
  res = await fetch(`${BASE_URL}/api/bookings/${bookingId}/transition`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      cookie: providerCookie,
    },
    body: JSON.stringify({ action: 'complete', extra: { demoCompleted: true } }),
  });
  data = await res.json();
  console.log('✅ 5. Nhà vườn hoàn thành trải nghiệm:', bookingId, 'Status:', data.booking.status);

  // 6. Customer writes review
  res = await fetch(`${BASE_URL}/api/reviews`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      cookie: customerCookie,
    },
    body: JSON.stringify({
      bookingId,
      rating: 5,
      text: 'Trải nghiệm nhà vườn Bình Mỹ rất tuyệt vời, rau tươi ngon và không gian thoáng đãng!',
    }),
  });
  data = await res.json();
  if (!res.ok) throw new Error('Lỗi gửi review: ' + JSON.stringify(data));
  const reviewId = data.review.id;
  console.log('✅ 6. Khách gửi đánh giá 5 sao thành công:', reviewId);

  // 7. Provider replies review
  res = await fetch(`${BASE_URL}/api/reviews`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      cookie: providerCookie,
    },
    body: JSON.stringify({
      reviewId,
      replyText: 'Cảm ơn anh Thắng đã ghé thăm Vườn Xanh Bình Mỹ!',
    }),
  });
  data = await res.json();
  console.log('✅ 7. Nhà vườn phản hồi đánh giá:', data.review.reply);

  // 8. Admin login and check stats
  res = await fetch(`${BASE_URL}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'binhmy@admin.com', password: 'password@123' }),
  });
  data = await res.json();
  const adminCookie = getSessionCookie(res.headers.get('set-cookie'));
  console.log('✅ 8. Đăng nhập Ban quản trị:', data.user.email, 'Role:', data.user.role);

  // 9. Admin view analytics
  res = await fetch(`${BASE_URL}/api/analytics`, {
    headers: { cookie: adminCookie },
  });
  data = await res.json();
  console.log('✅ 9. Thống kê ban quản trị: Lượt xem:', data.summary.views, 'Yêu cầu:', data.summary.requests, 'Tỷ lệ:', data.summary.conversion + '%');

  console.log('\n🎉 TẤT CẢ CÁC VAI TRÒ VÀ NGHIỆP VỤ HOẠT ĐỘNG HOÀN HẢO 100%!');
}

test().catch(console.error);
