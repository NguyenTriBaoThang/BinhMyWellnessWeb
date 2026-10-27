'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, Heart, MapPin, Route, Clock } from 'lucide-react';
import type { Category, Place } from '@/lib/data/types';
import SeasonArtwork from '@/components/SeasonArtwork';
import { experiencesData, imagesData } from '@/lib/data/repository';
import { readLocalData, writeLocalData } from '@/lib/storage/local-data';
import { placeImagePaths } from '@/lib/visual-assets';

const CATEGORY_ART: Record<string, 'spring' | 'summer' | 'autumn' | 'winter'> = {
  'song-nuoc-ky-uc': 'spring',
  'vuon-trai-cay': 'summer',
  'trai-nghiem-lam-nghe': 'autumn',
  'trang-trai': 'winter',
};

export default function PlaceCard({
  place,
  category,
}: {
  place: Place;
  category: Category;
}) {
  const [isFavorited, setIsFavorited] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    const stored = readLocalData();
    setIsFavorited(stored.data.favoritePlaceIds.includes(place.id));
  }, [place.id]);

  const toggleFavorite = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    const stored = readLocalData();
    const current = stored.data;
    const exists = current.favoritePlaceIds.includes(place.id);
    const nextFavorites = exists
      ? current.favoritePlaceIds.filter((id) => id !== place.id)
      : [...current.favoritePlaceIds, place.id];

    const result = writeLocalData({
      ...current,
      favoritePlaceIds: nextFavorites,
    });

    if (result.ok) {
      setIsFavorited(!exists);
      setToastMessage(!exists ? 'Đã lưu vào danh sách yêu thích' : 'Đã bỏ lưu địa điểm');
      setTimeout(() => setToastMessage(null), 2500);
    }
  };

  const experiences = experiencesData.filter((item) => item.placeId === place.id);
  const primaryExperience = experiences[0];
  const activityDesc = primaryExperience?.activities?.[0] || place.shortDescription;

  // Format verified price or clean natural fallback
  const verifiedPrices = experiences.flatMap(
    (item) => item.priceRules?.filter((rule) => rule.status === 'verified') ?? []
  );
  const adultPrice = verifiedPrices.find((rule) => rule.basis === 'per_adult');
  const groupPrice = verifiedPrices.find((rule) => rule.basis === 'per_group');
  const priceText = groupPrice
    ? `${new Intl.NumberFormat('vi-VN').format(groupPrice.amountVnd)}đ / nhóm`
    : adultPrice
    ? `${new Intl.NumberFormat('vi-VN').format(adultPrice.amountVnd)}đ / khách`
    : 'Liên hệ để biết giá';

  // Duration if available
  const duration = primaryExperience?.evidence.status === 'verified' ? primaryExperience.durationMinutes : null;
  const publishedImage = imagesData.find((image) => place.imageIds.includes(image.id) && image.publishAllowed && image.publishedPath);
  const fallbackImage = placeImagePaths[place.id]?.[0];
  const artworkSeason = CATEGORY_ART[category.id] ?? 'spring';

  return (
    <article className="card-3d group relative flex h-full flex-col overflow-hidden rounded-[22px] border border-[#DCE5DB] bg-white">
      {/* Toast notification */}
      {toastMessage && (
        <div role="status" aria-live="polite" className="absolute top-3 left-1/2 -translate-x-1/2 z-30 rounded-full bg-[#174C3C] text-white text-xs font-bold px-3 py-2 shadow-lg border border-[#D6A545]/40 animate-fade-in pointer-events-none whitespace-nowrap">
          {toastMessage}
        </div>
      )}

      {/* Image 4:3 Ratio */}
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-[#E7EFE4]">
        {publishedImage?.publishedPath ? <Image src={publishedImage.publishedPath} alt={publishedImage.alt} fill sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw" className="object-cover" /> : fallbackImage ? <Image src={fallbackImage} alt={`Trải nghiệm tại ${place.name}`} fill sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw" className="object-cover transition-transform duration-300 group-hover:scale-[1.02]" /> : <SeasonArtwork season={artworkSeason} className="h-full w-full transition-transform duration-300 group-hover:scale-[1.02]" />}

        {/* Category badge top-left */}
        <span
          className="absolute left-3 top-3 z-10 rounded-full border border-white/90 bg-white/95 px-3 py-1.5 text-xs font-bold tracking-tight shadow-sm"
          style={{ color: category.accent }}
        >
          {category.name}
        </span>

        {/* Heart Favorite button top-right */}
        <button
          type="button"
          onClick={toggleFavorite}
          className={`absolute right-3 top-3 z-10 grid h-11 w-11 place-items-center rounded-full border border-white/80 transition-all duration-200 active:scale-95 ${
            isFavorited
              ? 'bg-rose-500 text-white shadow-md shadow-rose-500/30'
              : 'bg-white/90 text-[#26352E] hover:bg-white hover:text-rose-600 shadow-md backdrop-blur-sm'
          }`}
          aria-label={isFavorited ? 'Bỏ lưu địa điểm' : 'Lưu địa điểm vào yêu thích'}
        >
          <Heart
            size={18}
            className={`transition-transform duration-200 ${isFavorited ? 'fill-current scale-110' : ''}`}
          />
        </button>

      </div>

      {/* Card Content */}
      <div className="flex flex-1 flex-col p-5">
        <h3 className="text-lg font-extrabold leading-snug text-[#174C3C] group-hover:text-[#2A6953] transition-colors">
          <Link href={`/experiences/${place.slug}`} className="hover:underline">
            {place.name}
          </Link>
        </h3>

        <p className="mt-2 text-sm leading-6 text-[#59675E] line-clamp-2">
          {activityDesc}
        </p>

        {/* Location info */}
        <div className="mt-4 flex items-center gap-1.5 text-sm text-[#59675E]">
          <MapPin size={15} className="shrink-0 text-[#174C3C]" />
          <span className="truncate">{place.address || place.locality}</span>
        </div>

        <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm font-semibold text-[#26352E]">
          <span>{priceText}</span>
          {duration !== null && duration !== undefined && <span className="inline-flex items-center gap-1.5 text-[#59675E]"><Clock size={14} />{duration} phút</span>}
        </div>

        {/* Action Buttons Bottom */}
        <div className="mt-auto pt-5 flex flex-wrap items-center justify-between gap-2 border-t border-[#DCE5DB]">
          <Link
            href={`/experiences/${place.slug}`}
            className="inline-flex min-h-11 items-center gap-1 text-sm font-bold text-[#174C3C] hover:underline"
          >
            Xem chi tiết <ArrowRight size={15} />
          </Link>

          <Link
            href={
              primaryExperience
                ? `/itinerary?experience=${encodeURIComponent(primaryExperience.id)}`
                : '/itinerary'
            }
            className="inline-flex min-h-11 items-center gap-2 rounded-full bg-[#E7EFE4] px-4 text-sm font-bold text-[#174C3C] transition-colors hover:bg-[#174C3C] hover:text-white"
          >
            <Route size={15} />
            <span>Lên hành trình</span>
          </Link>
        </div>
      </div>
    </article>
  );
}
