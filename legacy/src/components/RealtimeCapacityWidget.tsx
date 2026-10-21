'use client';

import { useEffect, useState } from 'react';
import { Clock, Users, Sparkles, CheckCircle2, Activity, ArrowUpRight } from 'lucide-react';
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

  const totalCap = capacity?.totalCapacity || 100;
  const booked = capacity?.bookedPlaces || 0;
  const fillRate = Math.min(100, Math.round((booked / (totalCap || 1)) * 100));

  return (
    <section
      aria-labelledby="today-capacity-title"
      className="relative overflow-hidden rounded-3xl border border-emerald-500/30 bg-gradient-to-br from-forest-950 via-forest-900 to-river-950 p-6 sm:p-8 text-white shadow-2xl transition-all duration-300 card-glare"
    >
      {/* 3D Ambient Glowing Light Orbs */}
      <div className="pointer-events-none absolute -right-16 -top-16 h-64 w-64 rounded-full bg-emerald-500/20 blur-3xl animate-pulse-slow" />
      <div className="pointer-events-none absolute -left-16 -bottom-16 h-64 w-64 rounded-full bg-river-500/15 blur-3xl animate-pulse-slow" />

      <div className="relative z-10 flex flex-col justify-between gap-6 lg:flex-row lg:items-center">
        {/* Left header with status badge */}
        <div className="space-y-2 max-w-xl">
          <div className="inline-flex items-center gap-2 rounded-full border border-emerald-400/40 bg-emerald-500/15 px-3.5 py-1 text-xs font-semibold text-emerald-300 backdrop-blur-md shadow-xs">
            <span className="relative flex h-2.5 w-2.5">
              <span className={`absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75 ${capacity && !capacityError ? 'animate-ping' : ''}`} />
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500" />
            </span>
            <Sparkles className="h-3.5 w-3.5 text-emerald-300" />
            <span>THEO DÕI SỨC CHỨA THEO THỜI GIAN THỰC</span>
          </div>

          <h3 id="today-capacity-title" className="text-2xl sm:text-3xl font-black tracking-tight text-white leading-tight">
            Nhịp Sống Nhà Vườn Bình Mỹ
          </h3>

          <p className="text-xs sm:text-sm capitalize text-zinc-300 flex items-center gap-2">
            <span>{dateStr || 'Hôm nay'}</span>
            <span className="text-emerald-500 font-bold">•</span>
            <span>Giờ hiện tại: <strong className="font-mono font-bold text-emerald-300 text-sm tracking-wide">{timeStr || '--:--:--'}</strong></span>
          </p>

          {/* Capacity Progress Bar */}
          {capacity && !capacityError && (
            <div className="pt-2">
              <div className="flex justify-between items-center text-xs mb-1 text-zinc-300">
                <span>Tỷ lệ lấp đầy toàn xã:</span>
                <span className="font-mono font-bold text-emerald-400">{fillRate}% ({booked} / {totalCap} chỗ)</span>
              </div>
              <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden p-0.5 border border-white/10">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-emerald-400 via-teal-300 to-amber-400 transition-all duration-700 shadow-sm"
                  style={{ width: `${Math.max(5, fillRate)}%` }}
                />
              </div>
            </div>
          )}
        </div>

        {/* Right 3D Telemetry Cards */}
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 w-full lg:w-auto">
          {/* Card 1 */}
          <div className="rounded-2xl border border-white/15 bg-white/10 p-4 text-center backdrop-blur-xl shadow-lg hover:border-emerald-400/50 hover:bg-white/15 transition-all duration-300 group">
            <div className="text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-1 flex items-center justify-center gap-1">
              <span>Đang mở</span>
              <Activity className="w-3 h-3 text-emerald-400 group-hover:scale-110 transition-transform" />
            </div>
            <div className="font-mono text-3xl sm:text-4xl font-black text-emerald-400 drop-shadow-sm">
              {capacity?.serviceCount ?? '—'}
            </div>
            <div className="text-[11px] text-zinc-400 mt-0.5">Trải nghiệm đối tác</div>
          </div>

          {/* Card 2 */}
          <div className="rounded-2xl border border-white/15 bg-white/10 p-4 text-center backdrop-blur-xl shadow-lg hover:border-amber-400/50 hover:bg-white/15 transition-all duration-300 group">
            <div className="text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-1 flex items-center justify-center gap-1">
              <span>Còn nhận</span>
              <Users className="w-3 h-3 text-amber-400 group-hover:scale-110 transition-transform" />
            </div>
            <div className="font-mono text-3xl sm:text-4xl font-black text-amber-300 drop-shadow-sm">
              {capacity?.availablePlaces ?? '—'}
            </div>
            <div className="text-[11px] text-zinc-400 mt-0.5">Lượt khách trống</div>
          </div>

          {/* Card 3 */}
          <div className="col-span-2 sm:col-span-1 rounded-2xl border border-white/15 bg-white/10 p-4 text-center backdrop-blur-xl shadow-lg flex flex-col justify-center hover:border-river-400/50 hover:bg-white/15 transition-all duration-300">
            <div className="flex items-center justify-center gap-1.5 text-xs font-bold text-emerald-300">
              <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
              <span>
                {capacityError
                  ? 'Chưa cập nhật'
                  : !capacity
                  ? 'Đang đồng bộ'
                  : capacity.availablePlaces > 0
                  ? `${capacity.openSlots} khung giờ`
                  : 'Đã kín ca'}
              </span>
            </div>
            <div className="mt-1 text-[11px] text-zinc-300 font-medium">
              {capacity && capacity.availablePlaces > 0 ? 'Sẵn sàng đón khách' : 'Vui lòng chọn ngày khác'}
            </div>
            <div className="mt-1.5 text-[10px] text-zinc-400 font-mono">
              {updatedAt ? `Cập nhật: ${updatedAt}` : 'Làm mới mỗi 30s'}
            </div>
          </div>
        </div>
      </div>

      {capacity && capacity.availablePlaces === 0 && !capacityError && (
        <div className="relative z-10 mt-4 flex items-center gap-2 rounded-xl bg-amber-500/20 border border-amber-400/30 px-3.5 py-2 text-xs text-amber-200">
          <Clock className="h-4 w-4 shrink-0 text-amber-300" />
          <span>Hôm nay các ca đã kín chỗ. Bạn có thể chọn ngày cuối tuần tới trong biểu mẫu để được phục vụ chu đáo nhất.</span>
        </div>
      )}
    </section>
  );
}
