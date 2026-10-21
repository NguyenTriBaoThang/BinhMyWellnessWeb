'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
  Calendar,
  Clock,
  Users,
  MapPin,
  Star,
  CheckCircle,
  AlertTriangle,
  XCircle,
  HelpCircle,
  MessageSquare,
  ArrowRight,
} from 'lucide-react';
import { Booking, BookingStatus, User } from '@/types';
import { formatVND, formatDateVN, getStatusBadge } from '@/lib/utils';
import ReviewModal from '@/components/ReviewModal';

export default function CustomerDashboardPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [savedItineraryCount, setSavedItineraryCount] = useState(0);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>('ALL');

  // Modal
  const [reviewBooking, setReviewBooking] = useState<Booking | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const loadData = async () => {
    try {
      setLoading(true);
      const [meResponse, bookingsResponse, itinerariesResponse] = await Promise.all([
        fetch('/api/auth/me', { cache: 'no-store' }),
        fetch('/api/bookings', { cache: 'no-store' }),
        fetch('/api/itineraries', { cache: 'no-store' }).catch(() => null),
      ]);
      const [meData, bookingsData] = await Promise.all([
        meResponse.json(),
        bookingsResponse.json(),
      ]);

      if (!meResponse.ok || !meData.user) {
        throw new Error(meData.error || 'Vui lòng đăng nhập để xem đơn đặt chỗ.');
      }
      if (!bookingsResponse.ok) {
        throw new Error(bookingsData.error || 'Không tải được danh sách đặt chỗ.');
      }

      const itinerariesData = itinerariesResponse?.ok ? await itinerariesResponse.json().catch(() => null) : null;

      setCurrentUser(meData.user);
      setBookings(Array.isArray(bookingsData.bookings) ? bookingsData.bookings : []);
      setSavedItineraryCount(Array.isArray(itinerariesData?.itineraries) ? itinerariesData.itineraries.length : 0);
      setLoadError(null);
    } catch (err) {
      setLoadError(err instanceof Error ? err.message : 'Không tải được danh sách đặt chỗ.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleAction = async (bookingId: string, action: string, extra?: any) => {
    try {
      setActionLoading(bookingId);
      const res = await fetch(`/api/bookings/${bookingId}/transition`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, extra }),
      });

      if (res.ok) {
        await loadData();
      } else {
        const result = await res.json();
        setLoadError(result.error || 'Không cập nhật được yêu cầu.');
      }
    } finally {
      setActionLoading(null);
    }
  };

  const filteredBookings = bookings.filter((b) => {
    if (filterStatus === 'ALL') return true;
    return b.status === filterStatus;
  });

  const completedBookings = bookings.filter((booking) => booking.status === 'COMPLETED');
  const hasChosenPlan = savedItineraryCount > 0 || bookings.length > 0;
  const hasConfirmation = bookings.some((booking) => ['PROPOSED', 'CONFIRMED', 'COMPLETED'].includes(booking.status));
  const customerSteps = [
    { label: 'Khám phá', done: hasChosenPlan, href: '/#experiences-grid', detail: 'Tìm nhà vườn và trải nghiệm' },
    { label: 'Nhập nhu cầu', done: hasChosenPlan, href: '/itinerary', detail: 'Ngày đi, nhóm khách, sở thích' },
    { label: 'Chọn hành trình', done: hasChosenPlan, href: '/itinerary', detail: savedItineraryCount ? `${savedItineraryCount} hành trình đã lưu` : 'Xem các điểm dừng phù hợp' },
    { label: 'Gửi yêu cầu', done: bookings.length > 0, href: '/itinerary', detail: bookings.length ? `${bookings.length} yêu cầu đã gửi` : 'Gửi yêu cầu tới nhà vườn' },
    { label: 'Nhận xác nhận', done: hasConfirmation, href: '/customer#my-bookings', detail: 'Theo dõi trạng thái và lịch hẹn' },
    { label: 'Trải nghiệm', done: completedBookings.length > 0, href: '/customer#my-bookings', detail: 'Nhà vườn cập nhật sau khi phục vụ' },
    { label: 'Đánh giá', done: completedBookings.length > 0 && completedBookings.every((booking) => Boolean(booking.review)), href: '/customer#my-bookings', detail: 'Chia sẻ nhận xét sau chuyến đi' },
  ];
  const activeCustomerStep = customerSteps.findIndex((step) => !step.done);

  if (loading) return <div role="status" className="mx-auto max-w-7xl px-4 py-16 text-center text-sm text-zinc-600">Đang tải hành trình khách hàng…</div>;
  if (!currentUser) {
    return (
      <div className="mx-auto my-16 max-w-xl space-y-4 rounded-3xl border border-emerald-100 bg-white p-8 text-center shadow-sm">
        <h1 className="text-2xl font-black text-zinc-900">Đăng nhập để theo dõi hành trình</h1>
        <p className="text-sm text-zinc-600">Bạn có thể khám phá trải nghiệm trước, sau đó đăng nhập để lưu lịch, gửi yêu cầu và đánh giá.</p>
        {loadError && <p role="alert" className="rounded-xl bg-amber-50 p-3 text-xs text-amber-950">{loadError}</p>}
        <div className="flex flex-wrap justify-center gap-2">
          <Link href="/login" className="rounded-xl bg-forest-800 px-4 py-2.5 text-sm font-bold text-white">Đăng nhập</Link>
          <Link href="/register" className="rounded-xl border border-emerald-300 px-4 py-2.5 text-sm font-bold text-emerald-900">Tạo tài khoản</Link>
          <Link href="/#experiences-grid" className="rounded-xl border border-zinc-300 px-4 py-2.5 text-sm font-bold text-zinc-800">Khám phá nhà vườn</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8">
      {/* Header Profile Banner */}
      <div className="bg-gradient-to-r from-forest-900 to-river-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div className="space-y-1">
          <span className="text-xs font-semibold uppercase tracking-wider text-emerald-300">
            Khu Vực Khách Hàng
          </span>
          <h1 className="text-2xl sm:text-3xl font-black text-white">
            Chào mừng, {currentUser.name}
          </h1>
          <p className="text-xs sm:text-sm text-zinc-300">
            Email: <code className="font-mono text-emerald-300">{currentUser.email}</code>{currentUser.phone ? ` · Điện thoại: ${currentUser.phone}` : ''}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Link
            href="/#experiences-grid"
            className="px-4 py-2.5 rounded-2xl bg-white text-forest-900 font-bold text-xs sm:text-sm hover:bg-emerald-50 transition-all shadow-md"
          >
            Khám phá trải nghiệm
          </Link>
          <Link href="/itinerary" className="rounded-2xl border border-white/30 bg-white/10 px-4 py-2.5 text-xs font-bold text-white hover:bg-white/20 sm:text-sm">
            Lập hành trình
          </Link>
        </div>
      </div>

      <section aria-labelledby="customer-flow-heading" className="space-y-3 rounded-3xl border border-emerald-100 bg-white p-5 shadow-sm sm:p-6">
        <div className="flex flex-wrap items-end justify-between gap-2">
          <div><p className="text-xs font-bold uppercase tracking-wide text-emerald-800">Hành trình của bạn</p><h2 id="customer-flow-heading" className="mt-1 text-lg font-black text-zinc-900">Từ khám phá đến đánh giá</h2></div>
          <div className="flex items-center gap-3"><p className="text-xs text-zinc-500">{customerSteps.filter((step) => step.done).length} / {customerSteps.length} bước đã hoàn tất</p><button type="button" onClick={() => void loadData()} className="rounded-lg border border-zinc-200 px-3 py-1.5 text-xs font-bold text-zinc-700 hover:bg-zinc-50">Làm mới trạng thái</button></div>
        </div>
        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7">
          {customerSteps.map((step, index) => (
            <Link key={step.label} href={step.href} aria-current={index === activeCustomerStep ? 'step' : undefined} className={`min-w-0 rounded-2xl border p-3 transition ${step.done ? 'border-emerald-200 bg-emerald-50' : index === activeCustomerStep ? 'border-amber-400 bg-amber-50 ring-2 ring-amber-100' : 'border-zinc-200 bg-zinc-50 hover:border-emerald-300'}`}>
              <span className="flex items-center gap-2"><span className={`grid h-6 w-6 shrink-0 place-items-center rounded-full text-[10px] font-black ${step.done ? 'bg-emerald-700 text-white' : 'bg-zinc-200 text-zinc-700'}`}>{step.done ? '✓' : index + 1}</span><span className="text-xs font-bold text-zinc-900">{step.label}</span></span>
              <span className="mt-2 block text-[10px] leading-relaxed text-zinc-600">{step.detail}</span>
            </Link>
          ))}
        </div>
        <p className="text-[11px] leading-relaxed text-zinc-500">Lưu hành trình tại trang lập lịch để quay lại chỉnh sửa; yêu cầu đặt chỗ chỉ được gửi sau khi bạn xác nhận.</p>
      </section>

      {/* Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-zinc-200 text-xs font-bold no-scrollbar">
        {[
          { id: 'ALL', label: 'Tất cả đơn', count: bookings.length },
          { id: 'PENDING', label: 'Chờ xác nhận', count: bookings.filter((b) => b.status === 'PENDING').length },
          { id: 'PROPOSED', label: 'Đề xuất đổi lịch', count: bookings.filter((b) => b.status === 'PROPOSED').length },
          { id: 'CONFIRMED', label: 'Đã xác nhận', count: bookings.filter((b) => b.status === 'CONFIRMED').length },
          { id: 'COMPLETED', label: 'Đã hoàn thành', count: bookings.filter((b) => b.status === 'COMPLETED').length },
          { id: 'CANCELLED', label: 'Đã hủy', count: bookings.filter((b) => b.status === 'CANCELLED').length },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setFilterStatus(tab.id)}
            className={`px-4 py-2 rounded-xl transition-all shrink-0 flex items-center gap-1.5 ${
              filterStatus === tab.id
                ? 'bg-forest-700 text-white shadow-sm'
                : 'bg-zinc-100 hover:bg-zinc-200 text-zinc-700'
            }`}
          >
            <span>{tab.label}</span>
            <span
              className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                filterStatus === tab.id
                  ? 'bg-white/20 text-white'
                  : 'bg-zinc-200 text-zinc-700'
              }`}
            >
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      {/* Bookings List */}
      <div id="my-bookings" className="scroll-mt-24 space-y-4">
        {loadError && (
          <div role="alert" className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-800">
            <span>{loadError}</span>
            <button
              type="button"
              onClick={loadData}
              className="rounded-xl bg-rose-700 px-3 py-2 text-xs font-bold text-white hover:bg-rose-800"
            >
              Tải lại
            </button>
          </div>
        )}
        {loading ? (
          <div className="py-12 text-center text-zinc-500 text-sm">
            Đang tải danh sách lịch đặt...
          </div>
        ) : filteredBookings.length === 0 ? (
          <div className="bg-white p-12 text-center rounded-3xl border border-zinc-200 space-y-3">
            <p className="text-zinc-500 text-sm">Chưa có yêu cầu đặt chỗ nào trong mục này.</p>
            <Link
              href="/#experiences-grid"
              className="inline-block px-5 py-2.5 bg-forest-700 text-white font-semibold text-xs rounded-xl"
            >
              Khám phá nhà vườn Bình Mỹ ngay
            </Link>
          </div>
        ) : (
          filteredBookings.map((b) => {
            const badge = getStatusBadge(b.status);

            return (
              <div
                key={b.id}
                className="bg-white rounded-3xl p-5 sm:p-6 border border-zinc-200/90 shadow-sm hover:shadow-md transition-all flex flex-col lg:flex-row justify-between gap-6"
              >
                {/* Left detail */}
                <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 flex-1">
                  <div className="relative w-full sm:w-44 h-32 sm:h-36 rounded-2xl overflow-hidden bg-zinc-100 shrink-0">
                    <Image
                      src={b.serviceImage || '/assets/nong_trai_binh_my.jpg'}
                      alt={b.serviceName}
                      fill
                      className="object-cover"
                    />
                    <span className="absolute bottom-2 left-2 bg-black/60 backdrop-blur-sm text-white font-mono text-[10px] px-2 py-0.5 rounded">
                      {b.code}
                    </span>
                  </div>

                  <div className="space-y-2 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-bold border ${badge.bg} ${badge.text} ${badge.border}`}
                      >
                        {badge.label}
                      </span>
                      <span className="text-xs text-forest-700 font-bold">
                        {b.providerName}
                      </span>
                    </div>

                    <h3 className="font-bold text-base sm:text-lg text-zinc-900 leading-snug">
                      {b.serviceName}
                    </h3>

                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs text-zinc-600 font-medium pt-1">
                      <div className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-forest-600" />
                        <span>{formatDateVN(b.date)}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-river-600" />
                        <span className="font-mono">{b.slot}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Users className="w-3.5 h-3.5 text-amber-600" />
                        <span>{b.people} khách</span>
                      </div>
                    </div>

                    {b.notes && (
                      <p className="text-xs text-zinc-500 italic bg-zinc-50 p-2 rounded-xl border border-zinc-100">
                        Ghi chú: {b.notes}
                      </p>
                    )}

                    {/* Reschedule Proposal alert */}
                    {b.status === 'PROPOSED' && b.proposal && (
                      <div className="bg-purple-50 p-3.5 rounded-2xl border border-purple-200 text-xs text-purple-900 space-y-1.5">
                        <div className="font-bold flex items-center gap-1.5">
                          <AlertTriangle className="w-4 h-4 text-purple-600" />
                          Nhà vườn đề xuất đổi sang ngày {formatDateVN(b.proposal.date)} ({b.proposal.slot})
                        </div>
                        <p className="text-purple-700">Lý do: {b.proposal.reason}</p>
                        <div className="flex items-center gap-2 pt-1">
                          <button
                            onClick={() => handleAction(b.id, 'accept')}
                            disabled={actionLoading === b.id}
                            className="px-3 py-1.5 bg-purple-700 hover:bg-purple-800 text-white rounded-lg font-bold text-xs"
                          >
                            Đồng ý lịch mới này
                          </button>
                          <button
                            onClick={() =>
                              handleAction(b.id, 'cancel', {
                                reason: 'Khách không tiện lịch đề xuất',
                              })
                            }
                            disabled={actionLoading === b.id}
                            className="px-3 py-1.5 bg-zinc-200 hover:bg-zinc-300 text-zinc-700 rounded-lg font-semibold text-xs"
                          >
                            Hủy đơn
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Review text if already submitted */}
                    {b.review && (
                      <div className="bg-emerald-50/70 p-3 rounded-2xl border border-emerald-200 text-xs space-y-1">
                        <div className="flex items-center gap-1 text-amber-500 font-bold">
                          {[...Array(b.review.rating)].map((_, i) => (
                            <Star key={i} className="w-3.5 h-3.5 fill-current" />
                          ))}
                          <span className="text-zinc-600 ml-1">Đánh giá của bạn</span>
                        </div>
                        <p className="text-zinc-700">{b.review.text}</p>
                        {b.review.reply && (
                          <div className="mt-1 pl-2 border-l-2 border-emerald-500 text-emerald-800 text-[11px]">
                            <strong>Nhà vườn phản hồi:</strong> {b.review.reply}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {/* Right price & action CTA */}
                <div className="flex lg:flex-col items-center lg:items-end justify-between border-t lg:border-t-0 pt-3 lg:pt-0 border-zinc-100 shrink-0">
                  <div className="text-left lg:text-right">
                    <span className="text-[11px] text-zinc-500 block">Tổng thanh toán</span>
                    <span className="text-lg font-black text-forest-900 font-mono">
                      {formatVND(b.total)}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    {/* Customer cancel if pending or confirmed */}
                    {['PENDING', 'CONFIRMED'].includes(b.status) && (
                      <button
                        onClick={() =>
                          handleAction(b.id, 'cancel', { reason: 'Khách đổi kế hoạch' })
                        }
                        disabled={actionLoading === b.id}
                        className="px-3 py-1.5 border border-zinc-300 hover:bg-rose-50 hover:text-rose-700 text-zinc-600 rounded-xl text-xs font-semibold transition-colors"
                      >
                        Hủy lịch
                      </button>
                    )}

                    {/* Review button if completed and no review yet */}
                    {b.status === 'COMPLETED' && !b.review && (
                      <button
                        onClick={() => setReviewBooking(b)}
                        className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-xl text-xs font-bold transition-all shadow-sm flex items-center gap-1.5"
                      >
                        <Star className="w-3.5 h-3.5 fill-current" />
                        Viết đánh giá
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Review Modal */}
      {reviewBooking && (
        <ReviewModal
          booking={reviewBooking}
          onClose={() => setReviewBooking(null)}
          onSuccess={() => {
            setReviewBooking(null);
            loadData();
          }}
        />
      )}
    </div>
  );
}
