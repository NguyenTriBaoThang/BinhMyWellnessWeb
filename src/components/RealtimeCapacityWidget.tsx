'use client';

import { useEffect, useState } from 'react';
import { Clock, Users, Sparkles, CheckCircle2 } from 'lucide-react';
import { getTodayInVietnam } from '@/lib/utils';

interface CapacitySummary {
  serviceCount: number;
  slotCount: number;
  openSlots: number;
  totalCapacity: number;
  availablePlaces: number;
  bookedPlaces: number;
  updatedAt: string;
}

export default function RealtimeCapacityWidget() {
  const [timeStr, setTimeStr] = useState('');
  const [dateStr, setDateStr] = useState('');
  const [capacity, setCapacity] = useState<CapacitySummary | null>(null);
  const [capacityError, setCapacityError] = useState(false);

  useEffect(() => {
    const updateClock = () => {
      const now = new Date();
      setTimeStr(now.toLocaleTimeString('vi-VN', {
        timeZone: 'Asia/Ho_Chi_Minh',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      }));
      setDateStr(now.toLocaleDateString('vi-VN', {
        timeZone: 'Asia/Ho_Chi_Minh',
        weekday: 'long',
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
      }));
    };

    updateClock();
    const timer = setInterval(updateClock, 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    let active = true;
    const refreshCapacity = async () => {
      try {
        const response = await fetch(`/api/capacity?date=${getTodayInVietnam()}`, { cache: 'no-store' });
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || 'Capacity unavailable');
        if (active) {
          setCapacity(data);
          setCapacityError(false);
        }
      } catch {
        if (active) setCapacityError(true);
      }
    };

    refreshCapacity();
    const timer = setInterval(refreshCapacity, 30000);
    return () => {
      active = false;
      clearInterval(timer);
    };
  }, []);

  const updatedAt = capacity?.updatedAt
    ? new Date(capacity.updatedAt).toLocaleTimeString('vi-VN', {
        timeZone: 'Asia/Ho_Chi_Minh',
        hour: '2-digit',
        minute: '2-digit',
      })
    : null;

  return (
    <section aria-labelledby="today-capacity-title" className="relative overflow-hidden rounded-2xl border border-emerald-500/20 bg-gradient-to-r from-emerald-900 via-forest-900 to-river-950 p-4 text-white shadow-xl sm:p-6">
      <div className="pointer-events-none absolute -right-8 -top-8 h-48 w-48 rounded-full bg-emerald-500/10 blur-2xl" />

      <div className="relative z-10 flex flex-col justify-between gap-4 lg:flex-row lg:items-center">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 rounded-full border border-emerald-400/30 bg-emerald-500/20 px-3 py-1 text-xs font-semibold text-emerald-300">
            <span className={`h-2 w-2 rounded-full bg-emerald-400 ${capacity && !capacityError ? 'animate-pulse' : ''}`} />
            <Sparkles className="h-3.5 w-3.5" />
            TÌNH TRẠNG CHỖ TRỐNG HÔM NAY
          </div>
          <h3 id="today-capacity-title" className="flex items-center gap-2 text-xl font-bold tracking-tight text-white sm:text-2xl">
            Nhịp sống nhà vườn Bình Mỹ
          </h3>
          <p className="text-sm capitalize text-zinc-300">
            {dateStr || 'Hôm nay'} · Giờ Việt Nam: <span className="font-mono font-bold text-emerald-300">{timeStr || '--:--:--'}</span>
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          <div className="rounded-xl border border-white/10 bg-white/10 p-3 text-center backdrop-blur-md">
            <div className="font-mono text-2xl font-black text-emerald-400">{capacity?.serviceCount ?? '—'}</div>
            <div className="text-xs font-medium text-zinc-300">Trải nghiệm đang mở</div>
          </div>

          <div className="rounded-xl border border-white/10 bg-white/10 p-3 text-center backdrop-blur-md">
            <div className="font-mono text-2xl font-black text-amber-300">{capacity?.availablePlaces ?? '—'}</div>
            <div className="text-xs font-medium text-zinc-300">Lượt khách còn nhận</div>
          </div>

          <div className="col-span-2 flex flex-col justify-center rounded-xl border border-white/10 bg-white/10 p-3 text-center backdrop-blur-md sm:col-span-1">
            <div className="flex items-center justify-center gap-1 text-xs font-semibold text-emerald-300">
              <Users className="h-4 w-4 text-emerald-400" />
              {capacityError
                ? 'Chưa tải được lịch nhận khách'
                : !capacity
                ? 'Đang tải lịch nhận khách'
                : capacity.availablePlaces > 0
                ? `${capacity.openSlots} khung giờ còn chỗ`
                : capacity.slotCount > 0
                ? 'Đã hết chỗ hôm nay'
                : 'Không còn ca đặt hôm nay'}
            </div>
            <div className="mt-0.5 text-[11px] text-zinc-400">
              {updatedAt ? `Cập nhật ${updatedAt} · làm mới mỗi 30 giây` : 'Đang lấy dữ liệu đặt chỗ'}
            </div>
          </div>
        </div>
      </div>

      {capacity && capacity.availablePlaces === 0 && !capacityError && (
        <p className="relative z-10 mt-4 flex items-center gap-1.5 text-xs text-amber-200">
          <Clock className="h-3.5 w-3.5" /> Bạn có thể chọn ngày khác trong biểu mẫu đặt trải nghiệm.
        </p>
      )}
      {!capacity && capacityError && (
        <p className="relative z-10 mt-4 flex items-center gap-1.5 text-xs text-amber-200">
          <CheckCircle2 className="h-3.5 w-3.5" /> Tình trạng chỗ sẽ hiện lại khi máy chủ phản hồi.
        </p>
      )}
    </section>
  );
}
