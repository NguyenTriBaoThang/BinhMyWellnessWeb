'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Calendar, Sparkles, ArrowRight, Sun, Leaf, Droplets } from 'lucide-react';
import { MONTHS_365 } from '@/lib/constants';

interface BinhMy365TimelineProps {
  onSelectService?: (serviceId: string) => void;
}

export default function BinhMy365Timeline({ onSelectService }: BinhMy365TimelineProps) {
  const currentMonthNum = new Date().getMonth() + 1;
  const [selectedMonth, setSelectedMonth] = useState<number>(currentMonthNum);

  const monthData = MONTHS_365.find((m) => m.month === selectedMonth) || MONTHS_365[0];

  return (
    <div id="binhmy-365" className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-emerald-100">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-forest-100 text-forest-800 text-xs font-semibold mb-2">
            <Calendar className="w-3.5 h-3.5" />
            HÀNH TRÌNH 12 THÁNG
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-forest-950 tracking-tight">
            Khám Phá Bình Mỹ 365 Ngày Theo Mùa
          </h2>
          <p className="text-zinc-600 text-sm mt-1">
            Mỗi mùa một sắc thái riêng: từ đầm sen ngát hương, trái cây trĩu cành đến ráng chiều chèo SUP ven sông Sài Gòn.
          </p>
        </div>

        {/* Current month indicator badge */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold self-start md:self-auto">
          <Sparkles className="w-4 h-4 text-emerald-600" />
          <span>Tháng hiện tại: Tháng {currentMonthNum}</span>
        </div>
      </div>

      {/* 12-Month horizontal pill buttons */}
      <div className="flex gap-2 overflow-x-auto pb-4 no-scrollbar border-b border-zinc-100">
        {MONTHS_365.map((item) => {
          const isActive = item.month === selectedMonth;
          const isCurrent = item.month === currentMonthNum;

          return (
            <button
              key={item.month}
              onClick={() => setSelectedMonth(item.month)}
              className={`flex-shrink-0 px-4 py-2.5 rounded-2xl text-xs font-bold transition-all flex flex-col items-center gap-0.5 ${
                isActive
                  ? 'bg-forest-700 text-white shadow-md shadow-forest-700/20 scale-105'
                  : 'bg-zinc-50 hover:bg-zinc-100 text-zinc-700 border border-zinc-200/60'
              }`}
            >
              <span className="text-[11px] uppercase tracking-wider">Tháng {item.month}</span>
              {isCurrent && (
                <span className={`text-[9px] px-1.5 py-0.2 rounded-full font-semibold ${
                  isActive ? 'bg-emerald-300 text-forest-950' : 'bg-emerald-100 text-emerald-800'
                }`}>
                  Hiện tại
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Featured Month Content Card */}
      <div className="mt-6 grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
        <div className="lg:col-span-5 relative h-64 sm:h-80 rounded-2xl overflow-hidden shadow-lg border border-zinc-100 group">
          <Image
            src={monthData.image}
            alt={monthData.title}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-500"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
          <div className="absolute bottom-4 left-4 right-4 text-white">
            <span className="text-xs font-semibold bg-emerald-600/90 backdrop-blur-sm px-2.5 py-1 rounded-lg">
              {monthData.theme}
            </span>
            <p className="font-bold text-lg mt-1.5 text-white leading-snug drop-shadow-sm">
              {monthData.title}
            </p>
          </div>
        </div>

        <div className="lg:col-span-7 flex flex-col justify-between space-y-4">
          <div>
            <span className="text-xs font-semibold text-emerald-700 uppercase tracking-wider">
              Chủ đề & trải nghiệm đặc trưng
            </span>
            <h3 className="text-xl sm:text-2xl font-bold text-zinc-900 mt-1">
              {monthData.title}
            </h3>
            <p className="text-zinc-600 text-sm mt-3 leading-relaxed">
              {monthData.highlight}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
            <div className="bg-forest-50/70 p-3 rounded-xl border border-forest-100">
              <div className="flex items-center gap-1.5 text-forest-800 font-semibold text-xs">
                <Sun className="w-4 h-4 text-amber-500" />
                Thời tiết lý tưởng
              </div>
              <p className="text-xs text-zinc-600 mt-1">Nắng sớm mát lành, gió sông Sài Gòn lộng mát.</p>
            </div>

            <div className="bg-emerald-50/70 p-3 rounded-xl border border-emerald-100">
              <div className="flex items-center gap-1.5 text-emerald-800 font-semibold text-xs">
                <Leaf className="w-4 h-4 text-emerald-600" />
                Nông sản thu hoạch
              </div>
              <p className="text-xs text-zinc-600 mt-1">Rau củ hữu cơ, hoa sen, quả ngọt miệt vườn.</p>
            </div>

            <div className="bg-river-50/70 p-3 rounded-xl border border-river-100">
              <div className="flex items-center gap-1.5 text-river-800 font-semibold text-xs">
                <Droplets className="w-4 h-4 text-river-600" />
                Không gian sinh thái
              </div>
              <p className="text-xs text-zinc-600 mt-1">Bến sông, rạch dừa và vườn cây rợp bóng.</p>
            </div>
          </div>

          <div className="pt-2">
            <a
              href={`#service-${monthData.activeServiceId}`}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-forest-700 text-white font-semibold text-sm hover:bg-forest-800 transition-colors shadow-sm"
            >
              <span>Xem trải nghiệm gợi ý tháng này</span>
              <ArrowRight className="w-4 h-4" />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
