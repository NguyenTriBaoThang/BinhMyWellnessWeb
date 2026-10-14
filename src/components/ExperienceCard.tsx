'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Clock, Users, MapPin, Heart, ArrowRight } from 'lucide-react';
import { Service } from '@/types';
import { formatVND } from '@/lib/utils';

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
  return (
    <div
      id={`service-${service.id}`}
      className="group bg-white rounded-3xl overflow-hidden border border-zinc-200/80 hover:border-forest-400 hover:shadow-xl transition-all duration-300 flex flex-col justify-between"
    >
      <div>
        {/* Image & Badges */}
        <div className="relative h-52 sm:h-56 w-full overflow-hidden bg-zinc-100">
          <Image
            src={service.image}
            alt={service.name}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-500"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20" />

          {/* Top badges */}
          <div className="absolute top-3 left-3 right-3 flex items-center justify-between">
            <span className="bg-white/90 backdrop-blur-md text-forest-900 font-bold text-xs px-3 py-1 rounded-full shadow-sm">
              {service.category}
            </span>

            {onToggleFavorite && (
              <button
                type="button"
                onClick={() => onToggleFavorite(service.id)}
                aria-label={isFavorite ? `Bỏ lưu ${service.name}` : `Lưu ${service.name} vào yêu thích`}
                aria-pressed={isFavorite}
                className={`w-9 h-9 rounded-full flex items-center justify-center transition-all ${
                  isFavorite
                    ? 'bg-rose-500 text-white shadow-md'
                    : 'bg-white/80 backdrop-blur-md text-zinc-700 hover:bg-white hover:text-rose-500'
                }`}
                title={isFavorite ? 'Bỏ lưu' : 'Lưu trải nghiệm'}
              >
                <Heart className={`w-4 h-4 ${isFavorite ? 'fill-current' : ''}`} />
              </button>
            )}
          </div>

          {/* Bottom image metadata */}
          <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-white text-xs">
            <div className="flex items-center gap-1.5 bg-black/40 backdrop-blur-md px-2.5 py-1 rounded-lg">
              <Clock className="w-3.5 h-3.5 text-emerald-300" />
              <span>{service.duration} phút</span>
            </div>
            <div className="flex items-center gap-1.5 bg-black/40 backdrop-blur-md px-2.5 py-1 rounded-lg">
              <Users className="w-3.5 h-3.5 text-amber-300" />
              <span>Sức chứa: {service.capacity} khách/ca</span>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-5 sm:p-6 space-y-3">
          {/* Provider name */}
          <div className="flex items-center gap-1.5 text-xs text-forest-700 font-semibold">
            <MapPin className="w-3.5 h-3.5 shrink-0" />
            <span className="truncate">{service.providerName}</span>
          </div>

          {/* Service title */}
          <h3 className="font-bold text-lg text-zinc-900 group-hover:text-forest-800 transition-colors line-clamp-2 leading-snug">
            {service.name}
          </h3>

          <p className="text-zinc-600 text-xs sm:text-sm line-clamp-2 leading-relaxed">
            {service.description}
          </p>

          {/* Slots preview */}
          <div className="pt-1">
            <span className="text-[11px] font-semibold text-zinc-500 uppercase tracking-wider block mb-1.5">
              Khung giờ mở đón:
            </span>
            <div className="flex flex-wrap gap-1.5">
              {service.slots.map((slot) => (
                <span
                  key={slot}
                  className="px-2 py-0.5 rounded-md bg-zinc-100 text-zinc-700 text-xs font-mono font-medium"
                >
                  {slot}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Footer & CTA */}
      <div className="px-5 pb-5 sm:px-6 sm:pb-6 pt-3 border-t border-zinc-100 flex items-center justify-between gap-3">
        <div>
          <span className="text-[11px] text-zinc-500 block">Giá vé trải nghiệm</span>
          <span className="text-lg font-black text-forest-800 font-mono">
            {formatVND(service.price)}
          </span>
          <span className="text-[10px] text-zinc-500 block">/người</span>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href={`/experiences/${service.id}`}
            className="px-3 py-2 text-xs font-semibold text-zinc-700 hover:text-forest-700 hover:bg-forest-50 rounded-xl transition-colors"
          >
            Chi tiết
          </Link>
          <button
            onClick={() => onBook(service)}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-forest-700 hover:bg-forest-800 text-white font-semibold text-xs sm:text-sm transition-all shadow-md shadow-forest-700/20 active:scale-95"
          >
            <span>Đặt chỗ</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
