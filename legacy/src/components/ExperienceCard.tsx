'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Clock, Users, MapPin, Heart, ArrowRight, Sparkles, CheckCircle } from 'lucide-react';
import { Service } from '@/types';
import { formatVND } from '@/lib/utils';
import ThreeDTiltCard from './ThreeDTiltCard';

interface ExperienceCardProps {
  service: Service;
  onBook: (service: Service) => void;
  isFavorite?: boolean;
  onToggleFavorite?: (serviceId: string) => void;
}

export default function ExperienceCard({
  service,
  onBook,
  isFavorite = false,
  onToggleFavorite,
}: ExperienceCardProps) {
  const isSpecial = service.category.includes('ẩm thực') || service.category.includes('Ăn uống');
  const isSport = service.category.includes('Chèo') || service.category.includes('Thuyền') || service.category.includes('Nước');

  return (
    <ThreeDTiltCard
      maxTilt={6}
      scale={1.02}
      glare={true}
      className="h-full rounded-3xl"
    >
      <div
        id={`service-${service.id}`}
        className="group relative bg-white rounded-3xl overflow-hidden border border-emerald-100/80 hover:border-emerald-400/80 hover:shadow-3d transition-all duration-400 flex flex-col justify-between h-full preserve-3d"
      >
        <div>
          {/* Image & Badges */}
          <div className="relative h-52 sm:h-56 w-full overflow-hidden bg-zinc-100">
            <Image
              src={service.image}
              alt={service.name}
              fill
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
              className="object-cover group-hover:scale-108 transition-transform duration-700 ease-out"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-zinc-950/75 via-zinc-950/20 to-black/15" />

            {/* Top badges floating in 3D */}
            <div className="absolute top-3 left-3 right-3 flex items-center justify-between z-20 translate-z-20">
              <div className="flex items-center gap-1.5 flex-wrap">
                <span
                  className={`backdrop-blur-md font-bold text-[11px] px-3 py-1 rounded-full shadow-sm border ${
                    isSpecial
                      ? 'bg-amber-500/90 text-white border-amber-300/40'
                      : isSport
                      ? 'bg-sky-600/90 text-white border-sky-300/40'
                      : 'bg-emerald-800/90 text-emerald-50 border-emerald-400/30'
                  }`}
                >
                  {service.category}
                </span>

                {service.testOnly && (
                  <span className="bg-purple-600/90 backdrop-blur-md text-white font-bold text-[10px] px-2.5 py-0.5 rounded-full shadow-xs border border-purple-300/40 flex items-center gap-1">
                    <Sparkles className="w-2.5 h-2.5" />
                    Thử nghiệm
                  </span>
                )}
              </div>

              {onToggleFavorite && (
                <button
                  type="button"
                  onClick={() => onToggleFavorite(service.id)}
                  aria-label={isFavorite ? `Bỏ lưu ${service.name}` : `Lưu ${service.name} vào yêu thích`}
                  aria-pressed={isFavorite}
                  className={`w-9 h-9 rounded-full flex items-center justify-center transition-all ${
                    isFavorite
                      ? 'bg-rose-500 text-white shadow-md scale-110'
                      : 'bg-white/85 backdrop-blur-md text-zinc-700 hover:bg-white hover:text-rose-500 hover:scale-110 shadow-sm'
                  }`}
                  title={isFavorite ? 'Bỏ lưu' : 'Lưu trải nghiệm'}
                >
                  <Heart className={`w-4 h-4 ${isFavorite ? 'fill-current' : ''}`} />
                </button>
              )}
            </div>

            {/* Bottom image metadata */}
            <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-white text-xs z-10 translate-z-10">
              <div className="flex items-center gap-1.5 bg-black/50 backdrop-blur-md px-2.5 py-1 rounded-lg border border-white/15">
                <Clock className="w-3.5 h-3.5 text-emerald-300" />
                <span>{service.duration} phút</span>
              </div>
              <div className="flex items-center gap-1.5 bg-black/50 backdrop-blur-md px-2.5 py-1 rounded-lg border border-white/15">
                <Users className="w-3.5 h-3.5 text-amber-300" />
                <span>{service.capacity} khách/ca</span>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="p-5 sm:p-6 space-y-3 translate-z-10">
            {/* Provider name */}
            <div className="flex items-center gap-1.5 text-xs text-forest-700 font-semibold">
              <MapPin className="w-3.5 h-3.5 shrink-0 text-emerald-600" />
              <span className="truncate">{service.providerName || 'Nhà vườn Bình Mỹ'}</span>
            </div>

            {/* Service title */}
            <h3 className="font-bold text-base sm:text-lg text-zinc-900 group-hover:text-forest-700 transition-colors line-clamp-2 leading-snug">
              {service.name}
            </h3>

            <p className="text-zinc-600 text-xs sm:text-sm line-clamp-2 leading-relaxed">
              {service.description}
            </p>

            {/* Slots preview */}
            <div className="pt-1">
              <span className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider block mb-1.5">
                Khung giờ mở đón:
              </span>
              <div className="flex flex-wrap gap-1.5">
                {service.slots.map((slot) => (
                  <span
                    key={slot}
                    className="px-2 py-0.5 rounded-md bg-zinc-100/90 text-zinc-700 text-xs font-mono font-medium border border-zinc-200/60"
                  >
                    {slot}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Footer & CTA */}
        <div className="px-5 pb-5 sm:px-6 sm:pb-6 pt-3 border-t border-zinc-100 flex items-center justify-between gap-3 translate-z-20">
          <div>
            <span className="text-[11px] text-zinc-400 block font-medium">Giá vé trải nghiệm</span>
            <span className="text-lg font-black text-forest-800 font-mono tracking-tight">
              {formatVND(service.price)}
            </span>
            <span className="text-[10px] text-zinc-500 block">/ {service.bookingUnit || 'khách'}</span>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href={`/experiences/${service.id}`}
              className="px-3 py-2 text-xs font-semibold text-zinc-600 hover:text-forest-700 hover:bg-forest-50/80 rounded-xl transition-all"
            >
              Chi tiết
            </Link>
            <button
              type="button"
              onClick={() => onBook(service)}
              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-gradient-to-r from-forest-700 to-emerald-600 hover:from-forest-800 hover:to-emerald-700 text-white font-bold text-xs sm:text-sm transition-all shadow-md shadow-forest-700/25 hover:shadow-lg hover:shadow-forest-700/35 active:scale-95 cursor-pointer"
            >
              <span>Đặt chỗ</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
            </button>
          </div>
        </div>
      </div>
    </ThreeDTiltCard>
  );
}
