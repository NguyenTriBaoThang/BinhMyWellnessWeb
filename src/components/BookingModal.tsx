'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { X, Users, Check, AlertCircle } from 'lucide-react';
import { Service, User } from '@/types';
import { formatVND, getTodayInVietnam, getTomorrowInVietnam } from '@/lib/utils';

interface BookingModalProps {
  service: Service | null;
  currentUser: User | null;
  onClose: () => void;
  onSuccess?: () => void;
  returnPath?: string;
}

export default function BookingModal({
  service,
  currentUser,
  onClose,
  onSuccess,
  returnPath = '/',
}: BookingModalProps) {
  const router = useRouter();

  const [date, setDate] = useState(getTomorrowInVietnam());
  const [slot, setSlot] = useState(service?.slots[0] || '08:30');
  const [people, setPeople] = useState(2);
  const [name, setName] = useState(currentUser?.name || '');
  const [phone, setPhone] = useState(currentUser?.phone || '');
  const [notes, setNotes] = useState('');
  const [accepted, setAccepted] = useState(false);
  const [availablePlaces, setAvailablePlaces] = useState<number | null>(null);
  const [checkingCapacity, setCheckingCapacity] = useState(false);
  const [capacityMessage, setCapacityMessage] = useState<string | null>(null);
  const [capacityErrorBlocksBooking, setCapacityErrorBlocksBooking] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (currentUser?.name) setName((value) => value || currentUser.name);
    if (currentUser?.phone) setPhone((value) => value || currentUser.phone || '');
  }, [currentUser?.id, currentUser?.name, currentUser?.phone]);

  useEffect(() => {
    if (!service || !date || !slot || currentUser?.role !== 'CUSTOMER') return;

    let active = true;
    setCheckingCapacity(true);
    setAvailablePlaces(null);
    setCapacityMessage(null);
    setCapacityErrorBlocksBooking(false);

    fetch(`/api/capacity?date=${encodeURIComponent(date)}&serviceId=${encodeURIComponent(service.id)}&slot=${encodeURIComponent(slot)}`, { cache: 'no-store' })
      .then(async (response) => {
        const data = await response.json();
        if (!response.ok) {
          const error = new Error(data.error || 'Không tải được chỗ trống.') as Error & { status: number };
          error.status = response.status;
          throw error;
        }
        return data;
      })
      .then((data) => {
        if (active) {
          setAvailablePlaces(data.availablePlaces);
          if (data.availablePlaces > 0) {
            setPeople((count) => Math.min(count, data.availablePlaces));
          }
        }
      })
      .catch((error: unknown) => {
        if (active) {
          setAvailablePlaces(null);
          const status = error instanceof Error ? (error as Error & { status?: number }).status : undefined;
          setCapacityErrorBlocksBooking(status === 400 || status === 404 || status === 409);
          setCapacityMessage(error instanceof Error ? error.message : 'Chưa lấy được tình trạng chỗ.');
        }
      })
      .finally(() => {
        if (active) setCheckingCapacity(false);
      });

    return () => {
      active = false;
    };
  }, [currentUser?.role, date, service, slot]);

  if (!service) return null;

  if (currentUser?.role !== 'CUSTOMER') {
    const returnTo = encodeURIComponent(`${returnPath}?book=${service.id}`);
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
        <div role="dialog" aria-modal="true" aria-labelledby="booking-login-title" className="w-full max-w-md space-y-5 rounded-3xl border border-emerald-100 bg-white p-6 shadow-2xl">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-emerald-700">Đặt lịch trải nghiệm</p>
              <h2 id="booking-login-title" className="mt-1 text-lg font-bold text-zinc-900">Đăng nhập để tiếp tục</h2>
              <p className="mt-2 text-sm leading-relaxed text-zinc-600">Đăng nhập bằng tài khoản khách hàng để gửi yêu cầu và theo dõi phản hồi từ nhà vườn.</p>
            </div>
            <button type="button" onClick={onClose} aria-label="Đóng" className="rounded-full p-1.5 text-zinc-500 hover:bg-zinc-100">
              <X className="h-5 w-5" />
            </button>
          </div>
          <div className="rounded-xl bg-forest-50 p-3 text-sm font-semibold text-forest-900">{service.name}</div>
          <div className="flex justify-end gap-2">
            <button type="button" onClick={onClose} className="rounded-xl border border-zinc-300 px-4 py-2.5 text-xs font-semibold text-zinc-700 hover:bg-zinc-50">Để sau</button>
            <Link href={`/login?returnTo=${returnTo}`} className="rounded-xl bg-forest-700 px-4 py-2.5 text-xs font-bold text-white hover:bg-forest-800">Đăng nhập</Link>
          </div>
        </div>
      </div>
    );
  }

  const total = service.price * people;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!accepted) {
      setError('Vui lòng đồng ý với điều kiện dịch vụ nhà vườn.');
      return;
    }

    if (!name || name.trim().length < 2) {
      setError('Vui lòng nhập tên người liên hệ.');
      return;
    }

    if (!phone || phone.trim().length < 9) {
      setError('Vui lòng nhập số điện thoại hợp lệ.');
      return;
    }

    try {
      setLoading(true);
      const res = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          serviceId: service.id,
          name,
          phone,
          date,
          slot,
          people,
          notes,
          source: 'Website Bình Mỹ 365',
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Đặt chỗ không thành công');
      }

      setSuccess(true);
      setTimeout(() => {
        onClose();
        if (onSuccess) onSuccess();
        router.push('/customer');
        router.refresh();
      }, 1500);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl border border-emerald-100 flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="p-5 bg-gradient-to-r from-forest-800 to-river-900 text-white flex items-center justify-between">
          <div>
            <span className="text-[11px] font-semibold text-emerald-300 uppercase tracking-wider block">
              Đặt Lịch Trải Nghiệm
            </span>
            <h3 className="font-bold text-lg text-white truncate max-w-xs sm:max-w-sm">
              {service.name}
            </h3>
            <p className="text-xs text-zinc-300 truncate">{service.providerName}</p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-5 sm:p-6 space-y-4 overflow-y-auto flex-1">
          {error && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
              <span>{error}</span>
            </div>
          )}

          {service.testOnly && (
            <div className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-xs leading-relaxed text-amber-950">
              Đây là yêu cầu đặt chỗ thử nghiệm. Ngày, địa điểm và giá đang chờ đơn vị vận hành xác nhận; lượt thử này không thu tiền.
            </div>
          )}

          {success && (
            <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm flex items-center gap-2 font-semibold">
              <Check className="w-5 h-5 shrink-0 text-emerald-600" />
              <span>{service.testOnly ? 'Tạo yêu cầu thử nghiệm thành công! Đang chuyển đến trang quản lý đơn...' : 'Gửi yêu cầu thành công! Đang chuyển đến trang quản lý đơn...'}</span>
            </div>
          )}

          {/* Date Picker */}
          <div>
            <label className="block text-xs font-semibold text-zinc-700 mb-1.5">
              1. Chọn ngày trải nghiệm
            </label>
            <div className="relative">
              <input
                type="date"
                min={getTodayInVietnam()}
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
                className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-300 text-sm text-zinc-900 focus:outline-none focus:ring-2 focus:ring-forest-500 font-medium"
              />
            </div>
          </div>

          {/* Slot Picker */}
          <div>
            <label className="block text-xs font-semibold text-zinc-700 mb-1.5">
              2. Chọn ca / khung giờ
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {service.slots.map((s) => (
                <button
                  type="button"
                  key={s}
                  onClick={() => setSlot(s)}
                  className={`py-2 px-3 rounded-xl text-xs font-mono font-semibold transition-all border ${
                    slot === s
                      ? 'bg-forest-700 text-white border-forest-700 shadow-sm'
                      : 'bg-zinc-50 hover:bg-zinc-100 text-zinc-700 border-zinc-200'
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
            <p role="status" className="mt-2 text-xs text-zinc-500">
              {checkingCapacity
                ? 'Đang kiểm tra chỗ trống…'
                : capacityMessage
                ? capacityMessage
                : availablePlaces === null
                ? 'Chưa lấy được tình trạng chỗ. Máy chủ sẽ kiểm tra lại khi gửi yêu cầu.'
                : availablePlaces > 0
                ? `Còn ${availablePlaces} chỗ trong ca này.`
                : 'Ca này đã hết chỗ. Hãy chọn khung giờ hoặc ngày khác.'}
            </p>
          </div>

          {/* People Count */}
          <div>
            <label className="block text-xs font-semibold text-zinc-700 mb-1.5">
              3. Số lượng khách tham gia
            </label>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setPeople(Math.max(1, people - 1))}
                className="w-9 h-9 rounded-xl border border-zinc-300 flex items-center justify-center font-bold text-lg hover:bg-zinc-100"
              >
                -
              </button>
              <span className="font-mono font-bold text-lg text-zinc-900 w-8 text-center">
                {people}
              </span>
              <button
                type="button"
                disabled={people >= Math.min(service.capacity, availablePlaces ?? service.capacity)}
                onClick={() => setPeople(Math.min(service.capacity, availablePlaces ?? service.capacity, people + 1))}
                className="w-9 h-9 rounded-xl border border-zinc-300 flex items-center justify-center font-bold text-lg hover:bg-zinc-100 disabled:cursor-not-allowed disabled:opacity-40"
              >
                +
              </button>
              <span className="text-xs text-zinc-500">
                (Tối đa {Math.min(service.capacity, availablePlaces ?? service.capacity)} khách trong ca này)
              </span>
            </div>
          </div>

          {/* Contact details */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            <div>
              <label className="block text-xs font-semibold text-zinc-700 mb-1">
                Tên người liên hệ
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                placeholder="Ví dụ: Nguyễn Văn A"
                className="w-full px-3 py-2 rounded-xl border border-zinc-300 text-sm focus:outline-none focus:ring-2 focus:ring-forest-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-zinc-700 mb-1">
                Số điện thoại Zalo
              </label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                required
                placeholder="0901234567"
                className="w-full px-3 py-2 rounded-xl border border-zinc-300 text-sm focus:outline-none focus:ring-2 focus:ring-forest-500"
              />
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-xs font-semibold text-zinc-700 mb-1">
              Ghi chú thêm cho nhà vườn (tùy chọn)
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={2}
              placeholder="Ví dụ: Đoàn có trẻ nhỏ, cần chuẩn bị thêm áo phao cỡ nhỏ..."
              className="w-full px-3 py-2 rounded-xl border border-zinc-300 text-xs focus:outline-none focus:ring-2 focus:ring-forest-500 resize-none"
            />
          </div>

          {/* Agreement */}
          <div className="flex items-start gap-2 pt-1">
            <input
              type="checkbox"
              id="accepted-terms"
              checked={accepted}
              onChange={(e) => setAccepted(e.target.checked)}
              className="mt-0.5 rounded text-forest-600 focus:ring-forest-500"
            />
            <label htmlFor="accepted-terms" className="text-[11px] text-zinc-600 leading-tight">
              Tôi xác nhận thông tin trên là chính xác và đồng ý với hướng dẫn an toàn, điều kiện phục vụ của nhà vườn.
            </label>
          </div>

          {/* Price summary */}
          <div className="p-3.5 bg-emerald-50 rounded-2xl border border-emerald-100 flex items-center justify-between">
            <div>
              <span className="text-[11px] text-emerald-800 block">{service.testOnly ? `Tổng giá đề xuất (${people} ${service.bookingUnit || 'khách'})` : `Tạm tính (${people} khách)`}</span>
              <span className="text-xl font-black text-forest-900 font-mono">
                {formatVND(total)}
              </span>
            </div>
            <div className="text-[10px] text-emerald-700 text-right">
              {service.testOnly ? <>Không thu tiền<br />trong lượt thử</> : <>Thanh toán trực tiếp <br /> khi đến nhà vườn</>}
            </div>
          </div>

          {/* Action buttons */}
          <div className="pt-2 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-zinc-300 text-zinc-700 text-xs font-semibold hover:bg-zinc-50"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={loading || success || checkingCapacity || availablePlaces === 0 || capacityErrorBlocksBooking}
              className="px-6 py-2.5 rounded-xl bg-forest-700 hover:bg-forest-800 text-white text-xs sm:text-sm font-bold shadow-md shadow-forest-700/20 disabled:opacity-60 transition-all"
            >
              {loading ? 'Đang gửi...' : service.testOnly ? 'Gửi yêu cầu thử nghiệm' : 'Xác nhận đặt lịch'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
