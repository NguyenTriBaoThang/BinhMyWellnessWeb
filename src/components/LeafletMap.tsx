'use client';

import { useState } from 'react';
import Image from 'next/image';
import { MapPin, Navigation, ExternalLink, Compass } from 'lucide-react';
import { Service } from '@/types';
import { formatVND } from '@/lib/utils';

interface LeafletMapProps {
  services: Service[];
  onSelectService: (service: Service) => void;
}

export default function LeafletMap({ services, onSelectService }: LeafletMapProps) {
  const [selectedService, setSelectedService] = useState<Service>(services[0] || null);

  return (
    <div id="map-section" className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-emerald-100">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-6">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-river-100 text-river-800 text-xs font-semibold mb-2">
            <Compass className="w-3.5 h-3.5" />
            SƠ ĐỒ ĐỊA LÝ SINH THÁI
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-forest-950 tracking-tight">
            Bản Đồ Nhà Vườn & Ven Sông Bình Mỹ
          </h2>
          <p className="text-zinc-600 text-sm mt-1">
            Xã Bình Mỹ được bao bọc bởi sông Sài Gòn và hệ thống kênh rạch tự nhiên. Bấm vào từng điểm để xem vị trí và hoạt động.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Interactive Schematic Map Canvas */}
        <div className="lg:col-span-8 bg-gradient-to-br from-emerald-50 via-forest-50/40 to-river-50/60 rounded-2xl p-4 sm:p-6 border border-emerald-200/80 relative min-h-[380px] sm:min-h-[440px] flex flex-col justify-between overflow-hidden shadow-inner">
          {/* Simulated River Curve Visual */}
          <div className="absolute top-0 right-0 bottom-0 w-32 sm:w-44 bg-gradient-to-l from-river-200/50 via-river-100/30 to-transparent pointer-events-none border-l border-river-300/40">
            <span className="absolute bottom-6 right-3 text-[11px] font-bold text-river-700 uppercase tracking-widest rotate-90 origin-bottom-right">
              Sông Sài Gòn 🌊
            </span>
          </div>

          <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-md px-3 py-1.5 rounded-xl border border-emerald-200 text-xs font-semibold text-forest-900 shadow-sm flex items-center gap-2">
            <Navigation className="w-3.5 h-3.5 text-forest-600" />
            <span>Tọa độ Bình Mỹ: 10.957° N, 106.638° E</span>
          </div>

          {/* Farm Pins positioned on schematic terrain */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 my-auto py-10 relative z-10">
            {services.map((item, idx) => {
              const isSelected = selectedService?.id === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setSelectedService(item);
                  }}
                  className={`p-3 rounded-2xl text-left transition-all backdrop-blur-md border flex flex-col justify-between h-28 sm:h-32 shadow-sm ${
                    isSelected
                      ? 'bg-forest-800 text-white border-forest-800 shadow-lg scale-105 z-20'
                      : 'bg-white/90 hover:bg-white text-zinc-800 border-emerald-100/90 hover:border-forest-300'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span
                      className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                        isSelected
                          ? 'bg-emerald-400 text-forest-950'
                          : 'bg-emerald-100 text-emerald-800'
                      }`}
                    >
                      {idx + 1}
                    </span>
                    <span
                      className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full ${
                        isSelected
                          ? 'bg-white/20 text-white'
                          : 'bg-zinc-100 text-zinc-600'
                      }`}
                    >
                      {item.category}
                    </span>
                  </div>

                  <div>
                    <h4
                      className={`font-bold text-xs line-clamp-2 leading-tight ${
                        isSelected ? 'text-white' : 'text-zinc-900'
                      }`}
                    >
                      {item.providerName}
                    </h4>
                    <span
                      className={`text-[11px] font-mono mt-0.5 block ${
                        isSelected ? 'text-emerald-300' : 'text-forest-700 font-semibold'
                      }`}
                    >
                      {formatVND(item.price)}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>

          <div className="text-[11px] text-zinc-500 bg-white/80 backdrop-blur-sm px-3 py-1.5 rounded-xl border border-zinc-200 self-start">
            💡 Gợi ý: Các cơ sở nằm trong bán kính 3-5km dọc đường Hà Duy Phiên (TL9), đường Võ Văn Bích và ven sông Sài Gòn.
          </div>
        </div>

        {/* Selected Farm Detail Card */}
        {selectedService && (
          <div className="lg:col-span-4 bg-zinc-50 rounded-2xl p-5 border border-zinc-200/80 flex flex-col justify-between">
            <div className="space-y-3">
              <div className="relative h-44 rounded-xl overflow-hidden shadow-sm">
                <Image
                  src={selectedService.image}
                  alt={selectedService.name}
                  fill
                  className="object-cover"
                />
                <span className="absolute top-2 left-2 bg-black/60 backdrop-blur-sm text-white text-[11px] font-semibold px-2 py-0.5 rounded-md">
                  {selectedService.category}
                </span>
              </div>

              <div>
                <span className="text-[11px] font-bold text-forest-700 uppercase tracking-wider">
                  {selectedService.providerName}
                </span>
                <h3 className="font-bold text-base text-zinc-900 leading-snug mt-0.5">
                  {selectedService.name}
                </h3>
              </div>

              <div className="text-xs text-zinc-600 space-y-1.5 bg-white p-3 rounded-xl border border-zinc-200/70">
                <div className="flex items-start gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-forest-600 shrink-0 mt-0.5" />
                  <span>{selectedService.providerAddress || 'Xã Bình Mỹ, Huyện Củ Chi'}</span>
                </div>
                <div className="flex items-center justify-between text-zinc-500 pt-1 border-t border-zinc-100">
                  <span>Thời lượng: {selectedService.duration} phút</span>
                  <span className="font-bold text-forest-800 font-mono text-sm">
                    {formatVND(selectedService.price)}
                  </span>
                </div>
              </div>

              <p className="text-xs text-zinc-600 line-clamp-3 leading-relaxed">
                {selectedService.description}
              </p>
            </div>

            <div className="pt-4 flex items-center gap-2">
              <button
                onClick={() => onSelectService(selectedService)}
                className="w-full py-2.5 rounded-xl bg-forest-700 hover:bg-forest-800 text-white text-xs font-bold transition-all shadow-md shadow-forest-700/20"
              >
                Đặt chỗ tại điểm này
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
