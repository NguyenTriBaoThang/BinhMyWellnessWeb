'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Sparkles, ArrowRight, Compass } from 'lucide-react';
import PlaceCard from '@/components/PlaceCard';
import { placesData, getCategory, categoriesData } from '@/lib/data/repository';
import { readLocalData } from '@/lib/storage/local-data';
import type { Place } from '@/lib/data/types';

export default function RevisitSuggestions() {
  const [unexploredPlaces, setUnexploredPlaces] = useState<Place[]>([]);
  const [visitedCount, setVisitedCount] = useState(0);

  useEffect(() => {
    const stored = readLocalData();
    const data = stored.data;
    const visitedIds = new Set([...data.visitedPlaceIds, ...data.favoritePlaceIds]);
    setVisitedCount(data.visitedPlaceIds.length);

    // Filter places not visited or saved yet
    const remaining = placesData.filter((p) => !visitedIds.has(p.id));
    // If user has visited/saved everything or none, pick fresh variety
    setUnexploredPlaces(remaining.length > 0 ? remaining.slice(0, 3) : placesData.slice(1, 4));
  }, []);

  return (
    <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
      <div className="rounded-3xl bg-[#E7EFE4]/70 border border-[#174C3C]/10 p-6 sm:p-10 lg:p-12 relative overflow-hidden">
        {/* Decorative background glow */}
        <div className="pointer-events-none absolute -right-20 -bottom-20 w-80 h-80 rounded-full bg-[#174C3C]/5 blur-3xl" />

        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div className="max-w-2xl">
            <span className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[#174C3C] bg-white/80 px-3 py-1 rounded-full shadow-sm">
              <Sparkles size={14} className="text-[#D6A545]" />
              Gợi mở chuyến đi tiếp theo
            </span>
            <h2 className="mt-3 text-2xl sm:text-3xl font-black text-[#174C3C]">
              Lần sau, khám phá một Bình Mỹ khác.
            </h2>
            <p className="mt-2 text-sm sm:text-base text-[#26352E]/80 leading-relaxed">
              {visitedCount > 0
                ? `Bạn đã đánh dấu ${visitedCount} trải nghiệm. Dưới đây là những góc nhìn mới mẻ đang chờ bạn khám phá tiếp.`
                : 'Mỗi mùa, Bình Mỹ lại mang một nhịp sống riêng: từ mùa hoa trái rộ đến những buổi hoàng hôn ven sông và lò gốm đượm lửa.'}
            </p>
          </div>

          <Link
            href="/explore"
            className="btn-tactile btn-primary-forest shrink-0 text-xs sm:text-sm self-start md:self-auto"
          >
            <Compass size={16} className="text-[#D6A545]" />
            <span>Xem tất cả điểm đến</span>
          </Link>
        </div>

        {/* Suggestion Cards */}
        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {unexploredPlaces.map((place) => {
            const cat = getCategory(place.primaryCategory)!;
            return <PlaceCard key={place.id} place={place} category={cat} />;
          })}
        </div>
      </div>
    </section>
  );
}
