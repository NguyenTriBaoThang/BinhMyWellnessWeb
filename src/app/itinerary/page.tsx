'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
  Compass,
  Clock,
  MapPin,
  Calendar,
  CheckCircle,
  Plus,
  Trash2,
  ArrowRight,
  Sparkles,
  Car,
} from 'lucide-react';
import { Service } from '@/types';
import { formatVND } from '@/lib/utils';
import BookingModal from '@/components/BookingModal';

export default function ItineraryPage() {
  const [services, setServices] = useState<Service[]>([]);
  const [selectedIds, setSelectedIds] = useState<string[]>(['s1', 's2', 's7']);
  const [startTime, setStartTime] = useState<string>('08:30');
  const [bookingService, setBookingService] = useState<Service | null>(null);

  useEffect(() => {
    fetch('/api/services')
      .then((r) => r.json())
      .then((d) => {
        if (d.services) setServices(d.services);
      });
  }, []);

  const addStop = (id: string) => {
    if (!selectedIds.includes(id)) {
      setSelectedIds([...selectedIds, id]);
    }
  };

  const removeStop = (id: string) => {
    setSelectedIds(selectedIds.filter((x) => x !== id));
  };

  // Calculate timeline
  let currentMinutes =
    Number(startTime.split(':')[0]) * 60 + Number(startTime.split(':')[1]);

  const itinerarySteps = selectedIds.map((id, index) => {
    const s = services.find((serv) => serv.id === id);
    if (!s) return null;

    // Pick slot that fits after currentMinutes
    const suitableSlot = s.slots.find((slotStr) => {
      const slotMins =
        Number(slotStr.split(':')[0]) * 60 + Number(slotStr.split(':')[1]);
      return slotMins >= currentMinutes;
    });

    const stepStart =
      suitableSlot ||
      `${String(Math.floor(currentMinutes / 60)).padStart(2, '0')}:${String(
        currentMinutes % 60
      ).padStart(2, '0')}`;

    const stepStartMins =
      Number(stepStart.split(':')[0]) * 60 + Number(stepStart.split(':')[1]);
    const stepEndMins = stepStartMins + s.duration;
    const stepEnd = `${String(Math.floor(stepEndMins / 60)).padStart(
      2,
      '0'
    )}:${String(stepEndMins % 60).padStart(2, '0')}`;

    // Add 30 minutes transit buffer
    currentMinutes = stepEndMins + 30;

    return {
      service: s,
      start: stepStart,
      end: stepEnd,
      isAutoSlot: !!suitableSlot,
      transitNote:
        index > 0 ? 'Dự phòng 30 phút di chuyển ven rạch' : 'Điểm bắt đầu hành trình',
    };
  }).filter(Boolean);

  const totalCost = itinerarySteps.reduce(
    (sum, step) => sum + (step?.service.price || 0),
    0
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8">
      <div className="bg-gradient-to-r from-orchard-700 via-forest-900 to-river-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-1.5">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 text-amber-300 text-xs font-semibold">
            <Compass className="w-3.5 h-3.5" />
            LẬP HÀNH TRÌNH TỰ ĐỘNG THÔNG MINH
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white">
            Thiết Kế 1 Ngày Khám Phá Bình Mỹ
          </h1>
          <p className="text-xs sm:text-sm text-zinc-200">
            Hệ thống tự động tính toán khung giờ phù hợp và dành 30 phút di chuyển giữa các điểm dừng chân.
          </p>
        </div>

        <div className="bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/10 text-center">
          <span className="text-xs text-zinc-300 block">Tổng chi phí dự kiến / khách</span>
          <span className="text-2xl font-black text-amber-300 font-mono">
            {formatVND(totalCost)}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left: Interactive Timeline Plan */}
        <div className="lg:col-span-7 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-zinc-900">
              Lịch Trình Chi Tiết ({itinerarySteps.length} điểm đến)
            </h2>
            <div className="flex items-center gap-2 text-xs">
              <span className="text-zinc-600 font-semibold">Bắt đầu lúc:</span>
              <select
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="px-2 py-1 bg-white border border-zinc-300 rounded-lg font-mono font-semibold"
              >
                <option value="08:00">08:00</option>
                <option value="08:30">08:30</option>
                <option value="09:00">09:00</option>
                <option value="09:30">09:30</option>
              </select>
            </div>
          </div>

          <div className="space-y-4">
            {itinerarySteps.map((step: any, idx: number) => (
              <div key={step.service.id} className="relative">
                {idx > 0 && (
                  <div className="flex items-center gap-2 pl-6 py-2 text-[11px] text-zinc-500 font-semibold">
                    <Car className="w-3.5 h-3.5 text-river-600" />
                    <span>30 phút di chuyển giữa các nhà vườn</span>
                  </div>
                )}

                <div className="bg-white rounded-3xl p-5 border border-zinc-200 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="flex items-start sm:items-center gap-4">
                    <div className="w-10 h-10 rounded-2xl bg-forest-100 text-forest-800 flex items-center justify-center font-bold text-sm shrink-0">
                      {idx + 1}
                    </div>

                    <div className="relative w-20 h-20 rounded-xl overflow-hidden bg-zinc-100 shrink-0">
                      <Image
                        src={step.service.image}
                        alt={step.service.name}
                        fill
                        className="object-cover"
                      />
                    </div>

                    <div className="space-y-1">
                      <span className="text-[10px] font-bold text-forest-700 uppercase">
                        {step.service.providerName}
                      </span>
                      <h3 className="font-bold text-sm text-zinc-900 leading-snug">
                        {step.service.name}
                      </h3>
                      <div className="flex items-center gap-3 text-xs text-zinc-500 font-mono">
                        <span className="font-bold text-emerald-800">
                          {step.start} - {step.end}
                        </span>
                        <span>({step.service.duration} phút)</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
                    <span className="font-mono font-bold text-sm text-forest-900 mr-2">
                      {formatVND(step.service.price)}
                    </span>
                    <button
                      onClick={() => setBookingService(step.service)}
                      className="px-3 py-1.5 bg-forest-700 hover:bg-forest-800 text-white rounded-xl text-xs font-bold"
                    >
                      Đặt chỗ
                    </button>
                    <button
                      onClick={() => removeStop(step.service.id)}
                      className="p-1.5 text-zinc-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg"
                      title="Xóa điểm"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right: Available Spots to Add */}
        <div className="lg:col-span-5 space-y-4">
          <h2 className="text-lg font-bold text-zinc-900">Thêm Điểm Dừng Vào Hành Trình</h2>
          <div className="space-y-3">
            {services.map((s) => {
              const isAdded = selectedIds.includes(s.id);

              return (
                <div
                  key={s.id}
                  className="bg-white p-3.5 rounded-2xl border border-zinc-200 shadow-sm flex items-center justify-between gap-3"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="relative w-12 h-12 rounded-xl overflow-hidden bg-zinc-100 shrink-0">
                      <Image src={s.image} alt={s.name} fill className="object-cover" />
                    </div>
                    <div className="truncate">
                      <h4 className="font-bold text-xs text-zinc-900 truncate">{s.name}</h4>
                      <span className="text-[11px] text-zinc-500 truncate block">
                        {s.providerName} • {formatVND(s.price)}
                      </span>
                    </div>
                  </div>

                  {isAdded ? (
                    <span className="text-xs font-bold text-emerald-700 flex items-center gap-1 shrink-0">
                      <CheckCircle className="w-4 h-4" /> Đã chọn
                    </span>
                  ) : (
                    <button
                      onClick={() => addStop(s.id)}
                      className="px-3 py-1.5 bg-zinc-100 hover:bg-forest-50 text-zinc-700 hover:text-forest-800 rounded-xl text-xs font-bold flex items-center gap-1 shrink-0 transition-colors"
                    >
                      <Plus className="w-3.5 h-3.5" /> Thêm
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {bookingService && (
        <BookingModal
          service={bookingService}
          currentUser={null}
          onClose={() => setBookingService(null)}
        />
      )}
    </div>
  );
}
