'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
  Trees,
  Calendar,
  Clock,
  Users,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Plus,
  Edit,
  MessageSquare,
  Sparkles,
  Phone,
  MapPin,
  Send,
} from 'lucide-react';
import { Booking, Service, Review, ProviderProfile, User } from '@/types';
import { formatVND, formatDateVN, getStatusBadge } from '@/lib/utils';
import ServiceEditModal from '@/components/ServiceEditModal';
import ProviderAvailabilityEditor from '@/components/ProviderAvailabilityEditor';
import BookingReconciliationForm from '@/components/BookingReconciliationForm';
import ProviderProfileEditor from '@/components/ProviderProfileEditor';

export default function ProviderDashboardPage() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [provider, setProvider] = useState<ProviderProfile | null>(null);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [availabilityCount, setAvailabilityCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [pageError, setPageError] = useState('');

  // Tab: 'orders' | 'services' | 'reviews'
  const [activeTab, setActiveTab] = useState<'profile' | 'orders' | 'services' | 'reviews'>('orders');
  const [orderFilter, setOrderFilter] = useState<string>('PENDING');

  // Modal
  const [editServiceModal, setEditServiceModal] = useState<Service | null | 'NEW'>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  // Propose reschedule dialog state
  const [proposeBookingId, setProposeBookingId] = useState<string | null>(null);
  const [proposeDate, setProposeDate] = useState(
    new Date(Date.now() + 172800000).toISOString().split('T')[0]
  );
  const [proposeSlot, setProposeSlot] = useState('10:30');
  const [proposeReason, setProposeReason] = useState('Nhà vườn cần đổi lịch do ca này đã đạt giới hạn an toàn');

  // Reply review state
  const [replyReviewId, setReplyReviewId] = useState<string | null>(null);
  const [replyText, setReplyText] = useState('');

  const loadData = async () => {
    try {
      setLoading(true);
      const [meRes, bRes, sRes, rRes] = await Promise.all([
        fetch('/api/auth/me').then((r) => r.json()),
        fetch('/api/bookings').then((r) => r.json()),
        fetch('/api/services?all=true').then((r) => r.json()),
        fetch('/api/reviews').then((r) => r.json()),
      ]);

      setCurrentUser(meRes.user);
      setProvider(meRes.provider || null);
      setAvailabilityCount(Number(meRes.availabilityCount) || 0);
      if (meRes.user?.role === 'PROVIDER' && !meRes.provider) setActiveTab('profile');
      if (bRes.bookings) setBookings(bRes.bookings);
      if (sRes.services) {
        setServices(sRes.services);
      }
      if (rRes.reviews) setReviews(rRes.reviews);
      setPageError('');
    } catch (err) {
      setPageError(err instanceof Error ? err.message : 'Không tải được dữ liệu nhà vườn.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleBookingTransition = async (bookingId: string, action: string, extra?: any) => {
    try {
      setActionLoading(bookingId);
      const res = await fetch(`/api/bookings/${bookingId}/transition`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, extra }),
      });

      if (res.ok) {
        setProposeBookingId(null);
        await loadData();
      } else {
        const result = await res.json();
        setPageError(result.error || 'Không cập nhật được yêu cầu.');
      }
    } finally {
      setActionLoading(null);
    }
  };

  const handleReplyReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyReviewId || !replyText.trim()) return;

    try {
      const res = await fetch('/api/reviews', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reviewId: replyReviewId, replyText }),
      });

      if (res.ok) {
        setReplyReviewId(null);
        setReplyText('');
        await loadData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const pendingBookings = bookings.filter((b) => b.status === 'PENDING');
  const confirmedBookings = bookings.filter((b) => b.status === 'CONFIRMED');
  const totalRevenue = bookings
    .filter((b) => ['CONFIRMED', 'COMPLETED'].includes(b.status))
    .reduce((sum, b) => sum + b.total, 0);

  const filteredOrders = bookings.filter((b) => {
    if (orderFilter === 'ALL') return true;
    return b.status === orderFilter;
  });

  const completedBookings = bookings.filter((booking) => booking.status === 'COMPLETED');
  const steps = [
    { label: 'Tạo hồ sơ', done: Boolean(provider), tab: 'profile' as const, detail: provider ? 'Hồ sơ đã lưu' : 'Bổ sung thông tin cơ sở' },
    { label: 'Đăng dịch vụ', done: services.length > 0, tab: 'services' as const, detail: services.length ? `${services.length} dịch vụ` : 'Tạo trải nghiệm đầu tiên' },
    { label: 'Cập nhật lịch', done: availabilityCount > 0, tab: 'services' as const, detail: availabilityCount ? `${availabilityCount} ca đã nhập` : 'Chọn ngày và ca phục vụ' },
    { label: 'Nhận yêu cầu', done: bookings.length > 0, tab: 'orders' as const, detail: bookings.length ? `${bookings.length} yêu cầu` : 'Đơn của khách sẽ hiện ở đây' },
    { label: 'Xác nhận', done: bookings.some((booking) => ['CONFIRMED', 'COMPLETED'].includes(booking.status)), tab: 'orders' as const, detail: 'Xác nhận hoặc đề xuất đổi lịch' },
    { label: 'Phục vụ', done: completedBookings.length > 0, tab: 'orders' as const, detail: 'Đánh dấu hoàn tất sau trải nghiệm' },
    { label: 'Đối soát', done: completedBookings.length > 0 && completedBookings.every((booking) => booking.feeRecordedAt), tab: 'orders' as const, detail: 'Ghi khoản thu ròng và phí 8%' },
  ];
  const activeStep = steps.findIndex((step) => !step.done);
  const openStep = (label: string, tab: typeof activeTab) => {
    setActiveTab(tab);
    if (label === 'Đăng dịch vụ' && services.length === 0) setEditServiceModal('NEW');
    if (label === 'Nhận yêu cầu') setOrderFilter('PENDING');
    if (label === 'Phục vụ') setOrderFilter('CONFIRMED');
    if (label === 'Đối soát') setOrderFilter('COMPLETED');
  };

  if (!loading && currentUser?.role !== 'PROVIDER') {
    return (
      <div className="mx-auto my-16 max-w-xl rounded-3xl border border-amber-200 bg-white p-8 text-center shadow-sm">
        <Trees className="mx-auto h-10 w-10 text-amber-700" />
        <h1 className="mt-4 text-2xl font-black text-zinc-900">Khu vực nhà vườn</h1>
        <p className="mt-2 text-sm text-zinc-600">Đăng nhập tài khoản nhà vườn hoặc gửi hồ sơ tham gia Bình Mỹ.</p>
        <div className="mt-5 flex flex-wrap justify-center gap-2">
          <Link href="/login" className="rounded-xl bg-forest-800 px-4 py-2.5 text-sm font-bold text-white">Đăng nhập</Link>
          <Link href="/register" className="rounded-xl border border-amber-300 px-4 py-2.5 text-sm font-bold text-amber-900">Tạo hồ sơ nhà vườn</Link>
        </div>
      </div>
    );
  }

  if (loading) return <div role="status" className="mx-auto max-w-7xl px-4 py-16 text-center text-sm text-zinc-600">Đang tải quy trình nhà vườn…</div>;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8">
      {/* Provider Header Banner */}
      <div className="bg-gradient-to-r from-amber-900 via-forest-900 to-forest-950 rounded-3xl p-6 sm:p-8 text-white shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-1.5">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 text-xs font-semibold">
            <Trees className="w-3.5 h-3.5" />
            CỔNG QUẢN LÝ NHÀ VƯỜN ĐỐI TÁC
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white">
            {provider?.name || 'Hoàn thiện hồ sơ nhà vườn'}
          </h1>
          <p className="text-xs sm:text-sm text-zinc-300">
            Tài khoản: <code className="font-mono text-amber-300">{currentUser?.email}</code>{provider?.address ? ` · ${provider.address}` : ''}
          </p>
        </div>

        {/* Stats Pills */}
        <div className="grid grid-cols-3 gap-3 text-center">
          <div className="bg-white/10 backdrop-blur-md p-3 rounded-2xl border border-white/10">
            <div className="text-xl font-black text-amber-300 font-mono">
              {pendingBookings.length}
            </div>
            <div className="text-[11px] text-zinc-300">Chờ xác nhận</div>
          </div>

          <div className="bg-white/10 backdrop-blur-md p-3 rounded-2xl border border-white/10">
            <div className="text-xl font-black text-emerald-300 font-mono">
              {confirmedBookings.length}
            </div>
            <div className="text-[11px] text-zinc-300">Đã xác nhận</div>
          </div>

          <div className="bg-white/10 backdrop-blur-md p-3 rounded-2xl border border-white/10">
            <div className="text-base font-black text-white font-mono">
              {formatVND(totalRevenue)}
            </div>
            <div className="text-[11px] text-zinc-300">Doanh thu dự kiến</div>
          </div>
        </div>
      </div>

      {pageError && <div role="alert" className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-900"><span>{pageError}</span><button onClick={() => void loadData()} className="rounded-lg bg-rose-700 px-3 py-2 text-xs font-bold text-white">Tải lại</button></div>}

      <section aria-labelledby="provider-flow-heading" className="space-y-3">
        <div className="flex flex-wrap items-end justify-between gap-2">
          <div><p className="text-xs font-bold uppercase tracking-wide text-amber-800">Quy trình phục vụ</p><h2 id="provider-flow-heading" className="mt-1 text-lg font-black text-zinc-900">Từ hồ sơ đến đối soát</h2></div>
          <div className="flex items-center gap-3"><p className="text-xs text-zinc-500">{steps.filter((step) => step.done).length} / {steps.length} bước đã hoàn tất</p><button type="button" onClick={() => void loadData()} className="rounded-lg border border-zinc-200 px-3 py-1.5 text-xs font-bold text-zinc-700 hover:bg-zinc-50">Làm mới yêu cầu</button></div>
        </div>
        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7">
          {steps.map((step, index) => (
            <button key={step.label} type="button" onClick={() => openStep(step.label, step.tab)} aria-current={index === activeStep ? 'step' : undefined} className={`min-w-0 rounded-2xl border p-3 text-left transition ${step.done ? 'border-emerald-200 bg-emerald-50' : index === activeStep ? 'border-amber-400 bg-amber-50 ring-2 ring-amber-100' : 'border-zinc-200 bg-white hover:border-amber-300'}`}>
              <span className="flex items-center gap-2"><span className={`grid h-6 w-6 shrink-0 place-items-center rounded-full text-[10px] font-black ${step.done ? 'bg-emerald-700 text-white' : 'bg-zinc-200 text-zinc-700'}`}>{step.done ? '✓' : index + 1}</span><span className="text-xs font-bold text-zinc-900">{step.label}</span></span>
              <span className="mt-2 block text-[10px] leading-relaxed text-zinc-600">{step.detail}</span>
            </button>
          ))}
        </div>
      </section>

      {/* Main Section Navigation */}
      <div className="flex items-center gap-2 overflow-x-auto border-b border-zinc-200 pb-2 text-xs sm:text-sm font-bold">
        <button
          onClick={() => setActiveTab('profile')}
          className={`shrink-0 px-4 py-2.5 rounded-xl transition-all ${activeTab === 'profile' ? 'bg-amber-600 text-white shadow-sm' : 'text-zinc-600 hover:bg-zinc-100'}`}
        >
          Hồ sơ nhà vườn {provider ? '✓' : '•'}
        </button>
        <button
          onClick={() => setActiveTab('orders')}
          className={`px-4 py-2.5 rounded-xl transition-all ${
            activeTab === 'orders'
              ? 'bg-amber-600 text-white shadow-sm'
              : 'text-zinc-600 hover:bg-zinc-100'
          }`}
        >
          Đơn Đặt Lịch ({bookings.length})
        </button>

        <button
          onClick={() => setActiveTab('services')}
          className={`px-4 py-2.5 rounded-xl transition-all ${
            activeTab === 'services'
              ? 'bg-amber-600 text-white shadow-sm'
              : 'text-zinc-600 hover:bg-zinc-100'
          }`}
        >
          Trải Nghiệm & Sức Chứa ({services.length})
        </button>

        <button
          onClick={() => setActiveTab('reviews')}
          className={`px-4 py-2.5 rounded-xl transition-all ${
            activeTab === 'reviews'
              ? 'bg-amber-600 text-white shadow-sm'
              : 'text-zinc-600 hover:bg-zinc-100'
          }`}
        >
          Đánh Giá & Phản Hồi ({reviews.length})
        </button>
      </div>

      {activeTab === 'profile' && <ProviderProfileEditor profile={provider} onSaved={() => void loadData()} />}

      {/* TAB 1: ORDERS */}
      {activeTab === 'orders' && (
        <div className="space-y-6">
          {/* Subfilter buttons */}
          <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar text-xs font-semibold">
            {['PENDING', 'CONFIRMED', 'PROPOSED', 'COMPLETED', 'ALL'].map((st) => (
              <button
                key={st}
                onClick={() => setOrderFilter(st)}
                className={`px-3 py-1.5 rounded-lg border transition-all ${
                  orderFilter === st
                    ? 'bg-zinc-900 text-white border-zinc-900'
                    : 'bg-white text-zinc-700 border-zinc-200 hover:bg-zinc-50'
                }`}
              >
                {st === 'PENDING' && `Chờ duyệt (${pendingBookings.length})`}
                {st === 'CONFIRMED' && `Đã duyệt (${confirmedBookings.length})`}
                {st === 'PROPOSED' && `Đề xuất đổi lịch`}
                {st === 'COMPLETED' && `Đã hoàn thành`}
                {st === 'ALL' && `Tất cả đơn`}
              </button>
            ))}
          </div>

          <div className="space-y-4">
            {filteredOrders.length === 0 ? (
              <div className="p-12 text-center bg-white rounded-3xl border border-zinc-200 text-zinc-500 text-sm">
                Không có đơn nào trong trạng thái này.
              </div>
            ) : (
              filteredOrders.map((b) => {
                const badge = getStatusBadge(b.status);

                return (
                  <div
                    key={b.id}
                    className="bg-white rounded-3xl p-5 sm:p-6 border border-zinc-200/90 shadow-sm space-y-4"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-zinc-100 pb-3">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-xs bg-zinc-100 px-2.5 py-1 rounded-md text-zinc-800">
                          {b.code}
                        </span>
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${badge.bg} ${badge.text} ${badge.border}`}
                        >
                          {badge.label}
                        </span>
                      </div>
                      <span className="text-xs text-zinc-500">
                        Đặt lúc: {new Date(b.createdAt).toLocaleDateString('vi-VN')} {new Date(b.createdAt).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
                      <div className="md:col-span-7 space-y-2">
                        <h3 className="font-bold text-base text-zinc-900">{b.serviceName}</h3>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs text-zinc-600">
                          <div>
                            <span className="text-zinc-400 block text-[10px]">Ngày đón</span>
                            <span className="font-semibold">{formatDateVN(b.date)}</span>
                          </div>
                          <div>
                            <span className="text-zinc-400 block text-[10px]">Ca giờ</span>
                            <span className="font-mono font-semibold">{b.slot}</span>
                          </div>
                          <div>
                            <span className="text-zinc-400 block text-[10px]">Số khách</span>
                            <span className="font-semibold">{b.people} người</span>
                          </div>
                        </div>

                        <div className="p-3 bg-zinc-50 rounded-xl text-xs space-y-1">
                          <div className="font-semibold text-zinc-800">
                            Khách: {b.customerName} • SĐT: <span className="font-mono text-emerald-800">{b.customerPhone}</span>
                          </div>
                          {b.notes && <p className="text-zinc-500 italic">Ghi chú: {b.notes}</p>}
                        </div>
                      </div>

                      <div className="md:col-span-5 flex flex-col md:items-end justify-between gap-3 pt-2 md:pt-0">
                        <div className="text-left md:text-right">
                          <span className="text-[11px] text-zinc-500 block">Tổng thu dự kiến</span>
                          <span className="text-xl font-black text-amber-800 font-mono">
                            {formatVND(b.total)}
                          </span>
                        </div>

                        {/* Action Buttons for Provider */}
                        <div className="flex flex-wrap items-center gap-2">
                          {b.status === 'PENDING' && (
                            <>
                              <button
                                onClick={() => handleBookingTransition(b.id, 'confirm')}
                                disabled={actionLoading === b.id}
                                className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-sm transition-all"
                              >
                                Xác nhận đón khách
                              </button>
                              <button
                                onClick={() => setProposeBookingId(b.id)}
                                className="px-3.5 py-1.5 rounded-xl bg-purple-50 hover:bg-purple-100 text-purple-800 text-xs font-semibold border border-purple-200 transition-all"
                              >
                                Đổi lịch
                              </button>
                              <button
                                onClick={() =>
                                  handleBookingTransition(b.id, 'reject', {
                                    reason: 'Nhà vườn kín chỗ khung giờ này',
                                  })
                                }
                                disabled={actionLoading === b.id}
                                className="px-3.5 py-1.5 rounded-xl border border-zinc-300 hover:bg-rose-50 hover:text-rose-700 text-zinc-600 text-xs font-semibold transition-all"
                              >
                                Từ chối
                              </button>
                            </>
                          )}

                          {b.status === 'CONFIRMED' && (
                            <>
                              <button
                                onClick={() =>
                                  handleBookingTransition(b.id, 'complete', {
                                    demoCompleted: true,
                                  })
                                }
                                disabled={actionLoading === b.id}
                                className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-sm transition-all"
                              >
                                Đánh dấu Hoàn thành
                              </button>
                              <button
                                onClick={() => setProposeBookingId(b.id)}
                                className="px-3 py-1.5 rounded-xl bg-zinc-100 hover:bg-zinc-200 text-zinc-700 text-xs font-semibold"
                              >
                                Đổi lịch
                              </button>
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    {b.status === 'COMPLETED' && <BookingReconciliationForm booking={b} onSaved={() => void loadData()} />}

                    {/* Propose reschedule inline popup */}
                    {proposeBookingId === b.id && (
                      <div className="mt-4 p-4 rounded-2xl bg-purple-50 border border-purple-200 space-y-3 text-xs">
                        <h4 className="font-bold text-purple-900">
                          Đề xuất ngày hoặc ca giờ mới cho khách {b.customerName}
                        </h4>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div>
                            <label className="block font-semibold text-zinc-700 mb-1">
                              Ngày mới đề xuất
                            </label>
                            <input
                              type="date"
                              value={proposeDate}
                              onChange={(e) => setProposeDate(e.target.value)}
                              className="w-full px-3 py-1.5 rounded-lg border border-zinc-300 font-medium"
                            />
                          </div>
                          <div>
                            <label className="block font-semibold text-zinc-700 mb-1">
                              Khung giờ mới
                            </label>
                            <select
                              value={proposeSlot}
                              onChange={(e) => setProposeSlot(e.target.value)}
                              className="w-full px-3 py-1.5 rounded-lg border border-zinc-300 font-medium bg-white"
                            >
                              <option value="08:30">08:30</option>
                              <option value="10:30">10:30</option>
                              <option value="14:00">14:00</option>
                              <option value="16:00">16:00</option>
                            </select>
                          </div>
                        </div>
                        <div>
                          <label className="block font-semibold text-zinc-700 mb-1">
                            Lý do đề xuất gửi khách
                          </label>
                          <input
                            type="text"
                            value={proposeReason}
                            onChange={(e) => setProposeReason(e.target.value)}
                            className="w-full px-3 py-1.5 rounded-lg border border-zinc-300"
                          />
                        </div>
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => setProposeBookingId(null)}
                            className="px-3 py-1.5 rounded-lg bg-zinc-200 text-zinc-700 font-semibold"
                          >
                            Hủy
                          </button>
                          <button
                            onClick={() =>
                              handleBookingTransition(b.id, 'propose', {
                                date: proposeDate,
                                slot: proposeSlot,
                                reason: proposeReason,
                              })
                            }
                            className="px-4 py-1.5 rounded-lg bg-purple-700 text-white font-bold"
                          >
                            Gửi đề xuất cho khách
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* TAB 2: SERVICES */}
      {activeTab === 'services' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-zinc-900">
              Danh Sách Trải Nghiệm Của Nhà Vườn
            </h2>
            <button
              onClick={() => setEditServiceModal('NEW')}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold shadow-md shadow-amber-600/20"
            >
              <Plus className="w-4 h-4" />
              Thêm trải nghiệm mới
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {services.map((s) => (
              <div
                key={s.id}
                className="bg-white rounded-3xl overflow-hidden border border-zinc-200 shadow-sm p-5 space-y-4 flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="relative h-40 rounded-2xl overflow-hidden bg-zinc-100">
                    <Image src={s.image} alt={s.name} fill className="object-cover" />
                    <span className="absolute top-2 left-2 bg-black/60 backdrop-blur-sm text-white text-[11px] font-semibold px-2.5 py-0.5 rounded-md">
                      {s.category}
                    </span>
                    <span
                      className={`absolute top-2 right-2 text-[11px] font-bold px-2 py-0.5 rounded-md ${
                        s.status === 'PUBLISHED'
                          ? 'bg-emerald-500 text-white'
                          : 'bg-amber-500 text-white'
                      }`}
                    >
                      {s.status === 'PUBLISHED' ? 'Đã công bố' : s.status === 'REVISION' ? 'Cần chỉnh sửa' : s.status === 'PAUSED' ? 'Đang tạm dừng' : 'Chờ kiểm duyệt'}
                    </span>
                  </div>

                  <h3 className="font-bold text-base text-zinc-900 leading-snug">{s.name}</h3>

                  <div className="grid grid-cols-2 gap-2 text-xs text-zinc-600">
                    <div>
                      <span className="text-zinc-400 block text-[10px]">Giá vé</span>
                      <span className="font-mono font-bold text-amber-800">
                        {formatVND(s.price)}
                      </span>
                    </div>
                    <div>
                      <span className="text-zinc-400 block text-[10px]">Sức chứa / ca</span>
                      <span className="font-semibold">{s.capacity} khách</span>
                    </div>
                  </div>

                  <div className="text-xs text-zinc-500">
                    <span className="block font-semibold text-zinc-700">Các ca mở:</span>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {s.slots.map((sl) => (
                        <span key={sl} className="px-2 py-0.5 bg-zinc-100 rounded text-[11px] font-mono">
                          {sl}
                        </span>
                      ))}
                    </div>
                  </div>
                  {['PUBLISHED', 'REVIEW'].includes(s.status) && <ProviderAvailabilityEditor service={s} onSaved={() => void loadData()} />}
                </div>

                <div className="pt-3 border-t border-zinc-100 flex items-center justify-between">
                  <span className="text-xs text-zinc-400">
                    {s.indoor ? 'Có mái che' : 'Ngoài trời'}
                  </span>
                  <button
                    onClick={() => setEditServiceModal(s)}
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-zinc-300 hover:bg-zinc-50 text-xs font-semibold text-zinc-700"
                  >
                    <Edit className="w-3.5 h-3.5" />
                    Chỉnh sửa
                  </button>
                </div>
              </div>
            ))}
          </div>
          {services.length === 0 && <div className="rounded-2xl border border-dashed border-amber-300 bg-amber-50 p-8 text-center text-sm text-amber-950">Chưa có dịch vụ. Tạo hồ sơ nhà vườn trước, sau đó đăng trải nghiệm đầu tiên để bắt đầu nhận yêu cầu.</div>}
        </div>
      )}

      {/* TAB 3: REVIEWS & REPLIES */}
      {activeTab === 'reviews' && (
        <div className="space-y-4">
          <h2 className="text-lg font-bold text-zinc-900">Đánh Giá & Nhận Xét Của Du Khách</h2>

          {reviews.length === 0 ? (
            <div className="p-12 text-center bg-white rounded-3xl border border-zinc-200 text-zinc-500 text-sm">
              Chưa có nhận xét nào từ khách hàng.
            </div>
          ) : (
            reviews.map((r) => (
              <div
                key={r.id}
                className="bg-white rounded-3xl p-5 sm:p-6 border border-zinc-200 shadow-sm space-y-3"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <span className="font-bold text-sm text-zinc-900">{r.userName}</span>
                    <span className="text-xs text-zinc-400 ml-2">
                      {new Date(r.createdAt).toLocaleDateString('vi-VN')}
                    </span>
                  </div>
                  <div className="flex items-center gap-0.5 text-amber-500">
                    {[...Array(r.rating)].map((_, i) => (
                      <span key={i}>★</span>
                    ))}
                  </div>
                </div>

                <p className="text-xs sm:text-sm text-zinc-700">{r.text}</p>

                {r.reply ? (
                  <div className="bg-amber-50/70 p-3 rounded-2xl border border-amber-200 text-xs text-amber-900">
                    <strong>Phản hồi của nhà vườn:</strong> {r.reply}
                  </div>
                ) : (
                  <div>
                    {replyReviewId === r.id ? (
                      <form onSubmit={handleReplyReview} className="space-y-2 pt-2">
                        <textarea
                          value={replyText}
                          onChange={(e) => setReplyText(e.target.value)}
                          rows={2}
                          required
                          placeholder="Nhập lời cảm ơn hoặc phản hồi chi tiết tới du khách..."
                          className="w-full p-2.5 rounded-xl border border-zinc-300 text-xs focus:outline-none focus:ring-2 focus:ring-amber-500"
                        />
                        <div className="flex items-center justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => setReplyReviewId(null)}
                            className="px-3 py-1.5 rounded-lg bg-zinc-200 text-zinc-700 text-xs"
                          >
                            Hủy
                          </button>
                          <button
                            type="submit"
                            className="px-4 py-1.5 rounded-lg bg-amber-600 text-white text-xs font-bold"
                          >
                            Gửi phản hồi
                          </button>
                        </div>
                      </form>
                    ) : (
                      <button
                        onClick={() => {
                          setReplyReviewId(r.id);
                          setReplyText('');
                        }}
                        className="inline-flex items-center gap-1.5 text-xs font-semibold text-amber-700 hover:underline"
                      >
                        <MessageSquare className="w-3.5 h-3.5" />
                        Viết phản hồi cho nhận xét này
                      </button>
                    )}
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      )}

      {/* Service Edit / Create Modal */}
      {editServiceModal && (
        <ServiceEditModal
          service={editServiceModal === 'NEW' ? null : editServiceModal}
          onClose={() => setEditServiceModal(null)}
          onSuccess={() => {
            setEditServiceModal(null);
            loadData();
          }}
        />
      )}
    </div>
  );
}
