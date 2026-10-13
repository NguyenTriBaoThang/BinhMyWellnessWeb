'use client';

import { useState, useEffect } from 'react';
import { Clock, Users, Sparkles, CheckCircle2 } from 'lucide-react';
import { Service } from '@/types';

interface RealtimeCapacityWidgetProps {
  services: Service[];
}

export default function RealtimeCapacityWidget({ services }: RealtimeCapacityWidgetProps) {
  const [timeStr, setTimeStr] = useState<string>('');
  const [dateStr, setDateStr] = useState<string>('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTimeStr(
        now.toLocaleTimeString('vi-VN', {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
        })
      );
      setDateStr(
        now.toLocaleDateString('vi-VN', {
          weekday: 'long',
          day: '2-digit',
          month: '2-digit',
          year: 'numeric',
        })
      );
    };

    updateTime();
    const timer = setInterval(updateTime, 1000);
    return () => clearInterval(timer);
  }, []);

  const totalCapacity = services.reduce((sum, s) => sum + s.capacity, 0);

  return (
    <div className="bg-gradient-to-r from-emerald-900 via-forest-900 to-river-950 rounded-2xl p-4 sm:p-6 text-white shadow-xl border border-emerald-500/20 relative overflow-hidden">
      {/* Decorative background glow */}
      <div className="absolute top-0 right-0 -mt-8 -mr-8 w-48 h-48 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />

      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 relative z-10">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 text-xs font-semibold">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            ĐANG CẬP NHẬT THEO THỜI GIAN THỰC (REALTIME)
          </div>
          <h3 className="text-xl sm:text-2xl font-bold tracking-tight text-white flex items-center gap-2">
            Nhịp Sống Nhà Vườn Bình Mỹ Hôm Nay
          </h3>
          <p className="text-zinc-300 text-sm capitalize">
            {dateStr || 'Hôm nay'} • Giờ địa phương: <span className="font-mono text-emerald-300 font-bold">{timeStr || '--:--:--'}</span>
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          <div className="bg-white/10 backdrop-blur-md rounded-xl p-3 border border-white/10 text-center">
            <div className="text-2xl font-black text-emerald-400 font-mono">
              {services.length}
            </div>
            <div className="text-xs text-zinc-300 font-medium">Trải nghiệm mở cửa</div>
          </div>

          <div className="bg-white/10 backdrop-blur-md rounded-xl p-3 border border-white/10 text-center">
            <div className="text-2xl font-black text-amber-300 font-mono">
              {totalCapacity}
            </div>
            <div className="text-xs text-zinc-300 font-medium">Tổng chỗ/ca ngày</div>
          </div>

          <div className="col-span-2 sm:col-span-1 bg-white/10 backdrop-blur-md rounded-xl p-3 border border-white/10 text-center flex flex-col justify-center">
            <div className="text-xs text-emerald-300 font-semibold flex items-center justify-center gap-1">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              Sẵn sàng đón tiếp
            </div>
            <div className="text-[11px] text-zinc-400 mt-0.5">Đặt trước 30 phút</div>
          </div>
        </div>
      </div>
    </div>
  );
}
