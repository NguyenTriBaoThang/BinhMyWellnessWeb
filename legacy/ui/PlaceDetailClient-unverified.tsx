'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
  ArrowLeft,
  Heart,
  Sparkles,
  MapPin,
  Clock,
  Phone,
  Mail,
  ExternalLink,
  X,
  ChevronLeft,
  ChevronRight,
  Route,
  CheckCircle2,
  DollarSign,
  Info,
} from 'lucide-react';
import type { Category, Experience, Place, Source } from '@/lib/data/types';
import VerifiedPlaceMap from '@/components/explore/VerifiedPlaceMap';
import { readLocalData, writeLocalData } from '@/lib/storage/local-data';

const PLACE_DEFAULT_IMAGES: Record<string, string[]> = {
  'wetro-moon-river': [
    '/images/showcase/hero-river.jpg',
    '/images/showcase/hero-orchard.jpg',
    '/images/showcase/cat-craft.jpg',
  ],
  'vuon-ky-uc': [
    '/images/showcase/hero-orchard.jpg',
    '/images/showcase/hero-river.jpg',
    '/images/showcase/cat-farm.jpg',
  ],
  'vuon-lang-nghe-sang-tao': [
    '/images/showcase/hero-orchard.jpg',
    '/images/showcase/cat-craft.jpg',
    '/images/showcase/hero-river.jpg',
  ],
  'gom-hai-tu': [
    '/images/showcase/cat-craft.jpg',
    '/images/showcase/hero-river.jpg',
    '/images/showcase/hero-orchard.jpg',
  ],
  'bo-sua-ba-thang': [
    '/images/showcase/cat-farm.jpg',
    '/images/showcase/hero-orchard.jpg',
    '/images/showcase/hero-river.jpg',
  ],
};

const WEEKDAYS = ['Chủ Nhật', 'Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7'];

export default function PlaceDetailClient({
  place,
  category,
  activities,
  sources,
}: {
  place: Place;
  category: Category;
  activities: Experience[];
  sources: Source[];
}) {
  const [activeTab, setActiveTab] = useState<'overview' | 'activities' | 'pricing' | 'location'>('overview');
  const [selectedPhotoIdx, setSelectedPhotoIdx] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIdx, setLightboxIdx] = useState(0);
  const [isFavorited, setIsFavorited] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const photos = PLACE_DEFAULT_IMAGES[place.id] || ['/images/showcase/hero-river.jpg'];

  useEffect(() => {
    const stored = readLocalData();
    setIsFavorited(stored.data.favoritePlaceIds.includes(place.id));
  }, [place.id]);

  // Keyboard navigation for Lightbox
  useEffect(() => {
    if (!lightboxOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setLightboxOpen(false);
      if (e.key === 'ArrowRight') setLightboxIdx((prev) => (prev + 1) % photos.length);
      if (e.key === 'ArrowLeft') setLightboxIdx((prev) => (prev - 1 + photos.length) % photos.length);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [lightboxOpen, photos.length]);

  const toggleFavorite = () => {
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
      setToastMessage(!exists ? 'Đã lưu địa điểm vào danh sách yêu thích' : 'Đã bỏ lưu địa điểm');
      setTimeout(() => setToastMessage(null), 2500);
    }
  };

  const primaryExp = activities[0];
  const verifiedPrices = activities.flatMap((item) => item.priceRules ?? []);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-12 lg:px-8 space-y-8">
      {/* Toast */}
      {toastMessage && (
        <div className="fixed top-20 right-6 z-50 rounded-2xl bg-[#174C3C] text-white px-4 py-2.5 shadow-xl border border-[#D6A545]/40 text-xs sm:text-sm font-bold animate-fade-in flex items-center gap-2">
          <CheckCircle2 size={16} className="text-[#D6A545]" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Breadcrumb Back */}
      <div>
        <Link
          href="/explore"
          className="inline-flex items-center gap-2 text-xs sm:text-sm font-bold text-[#174C3C] hover:text-[#D6A545] transition"
        >
          <ArrowLeft size={16} /> Quay lại danh sách khám phá
        </Link>
      </div>

      {/* HEADER SECTION */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 pb-6 border-b border-[#174C3C]/10">
        <div className="max-w-3xl space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            <span
              className="rounded-full px-3.5 py-1 text-xs font-bold text-white shadow-sm"
              style={{ backgroundColor: category.accent }}
            >
              {category.name}
            </span>
            <span className="inline-flex items-center gap-1 text-xs font-bold text-[#174C3C] bg-[#E7EFE4] px-3 py-1 rounded-full">
              <MapPin size={13} className="text-[#D6A545]" />
              {place.locality}
            </span>
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-[#174C3C] leading-tight">
            {place.name}
          </h1>

          <p className="text-base sm:text-lg text-[#26352E]/85 leading-relaxed">
            {place.shortDescription}
          </p>
        </div>

        {/* Quick Action Buttons */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            type="button"
            onClick={toggleFavorite}
            className={`btn-tactile text-xs sm:text-sm px-4 py-2.5 rounded-full border transition-all ${
              isFavorited
                ? 'bg-rose-50 border-rose-300 text-rose-600'
                : 'bg-white border-[#174C3C]/20 text-[#174C3C] hover:bg-[#E7EFE4]'
            }`}
          >
            <Heart size={16} className={isFavorited ? 'fill-current text-rose-600' : ''} />
            <span>{isFavorited ? 'Đã lưu yêu thích' : 'Lưu địa điểm'}</span>
          </button>

          <Link
            href={
              primaryExp
                ? `/itinerary?experience=${encodeURIComponent(primaryExp.id)}`
                : '/itinerary'
            }
            className="btn-tactile btn-accent-gold text-xs sm:text-sm px-5 py-2.5 rounded-full"
          >
            <Sparkles size={16} className="text-[#174C3C]" />
            <span>Thêm vào hành trình</span>
          </Link>
        </div>
      </div>

      {/* GALLERY WITH 3D DEPTH & LIGHTBOX */}
      <section className="space-y-4">
        <div className="grid gap-4 lg:grid-cols-[2.5fr_1fr]">
          {/* Main Large Photo */}
          <div
            onClick={() => {
              setLightboxIdx(selectedPhotoIdx);
              setLightboxOpen(true);
            }}
            className="card-3d relative aspect-[16/10] sm:aspect-[16/9] w-full overflow-hidden rounded-3xl cursor-zoom-in group"
          >
            <Image
              src={photos[selectedPhotoIdx]}
              alt={place.name}
              fill
              priority
              sizes="(max-width: 1024px) 100vw, 70vw"
              className="object-cover transition-transform duration-500 group-hover:scale-103"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="absolute bottom-4 left-4 z-10 hidden group-hover:flex items-center gap-2 rounded-full bg-black/60 px-3.5 py-1.5 text-xs text-white backdrop-blur-md">
              <span>Bấm để phóng to ảnh</span>
            </div>
          </div>

          {/* Side Thumbnails */}
          <div className="grid grid-cols-3 lg:grid-cols-1 gap-4">
            {photos.map((photo, idx) => (
              <div
                key={photo}
                onClick={() => setSelectedPhotoIdx(idx)}
                className={`card-3d relative aspect-[4/3] w-full overflow-hidden rounded-2xl cursor-pointer transition-all ${
                  selectedPhotoIdx === idx
                    ? 'ring-3 ring-[#D6A545] shadow-lg scale-98'
                    : 'opacity-70 hover:opacity-100'
                }`}
              >
                <Image
                  src={photo}
                  alt={`${place.name} thumbnail ${idx + 1}`}
                  fill
                  sizes="(max-width: 1024px) 33vw, 25vw"
                  className="object-cover"
                />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* MAIN CONTENT WITH 4 TABS & FLOATING ACTION CARD */}
      <div className="grid gap-8 lg:grid-cols-[1fr_340px] items-start pt-4">
        {/* Left Column: 4 Tabs */}
        <div className="space-y-6">
          {/* Tab Navigation */}
          <div className="flex border-b border-[#174C3C]/15 gap-2 sm:gap-4 overflow-x-auto no-scrollbar">
            {[
              { id: 'overview', label: 'Tổng quan' },
              { id: 'activities', label: 'Hoạt động trải nghiệm' },
              { id: 'pricing', label: 'Chi phí & Giờ mở cửa' },
              { id: 'location', label: 'Vị trí & Đường đi' },
            ].map((tab) => {
              const isSelected = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id as typeof activeTab)}
                  className={`pb-3 px-3 text-sm sm:text-base font-extrabold transition-all border-b-2 whitespace-nowrap ${
                    isSelected
                      ? 'border-[#174C3C] text-[#174C3C]'
                      : 'border-transparent text-[#26352E]/60 hover:text-[#174C3C]'
                  }`}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>

          {/* TAB 1: TỔNG QUAN */}
          {activeTab === 'overview' && (
            <div className="card-3d p-6 sm:p-8 space-y-6">
              <div>
                <h2 className="text-xl font-black text-[#174C3C]">Đặc trưng nổi bật</h2>
                <p className="mt-3 text-sm sm:text-base text-[#26352E]/85 leading-relaxed">
                  {place.shortDescription}
                </p>
              </div>

              {/* Highlights */}
              <div className="grid gap-4 sm:grid-cols-2 pt-4 border-t border-zinc-100">
                <div className="rounded-2xl bg-[#F7F4EA] p-4 border border-[#174C3C]/10">
                  <span className="text-xs font-bold text-[#174C3C] uppercase tracking-wider">
                    Nhóm trải nghiệm
                  </span>
                  <p className="mt-1 font-black text-base text-[#174C3C]">{category.name}</p>
                  <p className="mt-1 text-xs text-[#26352E]/70">{category.description}</p>
                </div>

                <div className="rounded-2xl bg-[#F7F4EA] p-4 border border-[#174C3C]/10">
                  <span className="text-xs font-bold text-[#174C3C] uppercase tracking-wider">
                    Không gian sinh thái
                  </span>
                  <p className="mt-1 font-black text-base text-[#174C3C]">Vùng ven sông Củ Chi</p>
                  <p className="mt-1 text-xs text-[#26352E]/70">
                    Bầu không khí trong lành, cây xanh che bóng mát và lối đi thuận tiện.
                  </p>
                </div>
              </div>

              {/* Verified Sources info */}
              <div className="rounded-2xl bg-[#E7EFE4]/60 p-4 border border-[#174C3C]/10">
                <h3 className="text-xs font-bold text-[#174C3C] uppercase tracking-wider flex items-center gap-1.5">
                  <Info size={14} className="text-[#D6A545]" />
                  Tư liệu khảo sát thực tế
                </h3>
                <p className="mt-1 text-xs sm:text-sm text-[#26352E]/80">
                  Địa điểm được xác thực từ tài liệu nghiên cứu du lịch sinh thái và các bài viết thực tế về xã Bình Mỹ.
                </p>
              </div>
            </div>
          )}

          {/* TAB 2: HOẠT ĐỘNG TRẢI NGHIỆM */}
          {activeTab === 'activities' && (
            <div className="space-y-4">
              {activities.map((exp) => (
                <div key={exp.id} className="card-3d p-6 sm:p-8 space-y-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <span className="text-xs font-bold text-[#D6A545] uppercase tracking-wider">
                        Chương trình chính
                      </span>
                      <h3 className="mt-1 text-xl font-black text-[#174C3C]">{exp.name}</h3>
                    </div>
                    {exp.durationMinutes && (
                      <span className="shrink-0 inline-flex items-center gap-1 rounded-full bg-[#E7EFE4] px-3 py-1 text-xs font-bold text-[#174C3C]">
                        <Clock size={13} /> ~{exp.durationMinutes} phút
                      </span>
                    )}
                  </div>

                  <div className="space-y-2">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-[#26352E]/60">
                      Các hoạt động bạn sẽ trải nghiệm:
                    </h4>
                    <ul className="space-y-2">
                      {exp.activities.map((act) => (
                        <li key={act} className="flex items-start gap-2.5 text-sm sm:text-base text-[#26352E]/85">
                          <CheckCircle2 size={18} className="text-[#174C3C] shrink-0 mt-0.5" />
                          <span>{act}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="pt-4 border-t border-zinc-100 flex flex-wrap items-center justify-between gap-3 text-xs sm:text-sm">
                    <span className="text-[#26352E]/70">
                      <strong className="text-[#174C3C]">Lưu ý:</strong> {exp.bookingRequirement}
                    </span>
                    {exp.suitability && (
                      <span className="text-[#174C3C] font-semibold">
                        Phù hợp: Từ {exp.suitability.ageMinimum || 0} đến {exp.suitability.ageMaximum || 80} tuổi
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* TAB 3: CHI PHÍ & GIỜ MỞ CỬA */}
          {activeTab === 'pricing' && (
            <div className="card-3d p-6 sm:p-8 space-y-6">
              <div>
                <h2 className="text-xl font-black text-[#174C3C]">Biểu phí dịch vụ</h2>
                <p className="mt-1 text-xs sm:text-sm text-[#26352E]/70">
                  Mức phí được ghi nhận trực tiếp theo tư liệu khảo sát.
                </p>
              </div>

              {verifiedPrices.length > 0 ? (
                <div className="grid gap-3 sm:grid-cols-2">
                  {verifiedPrices.map((rule, idx) => (
                    <div
                      key={idx}
                      className="rounded-2xl border border-[#174C3C]/15 bg-[#F7F4EA] p-4 flex flex-col justify-between"
                    >
                      <div>
                        <span className="text-xs font-bold uppercase tracking-wider text-[#174C3C]">
                          {rule.basis === 'per_adult'
                            ? 'Người lớn'
                            : rule.basis === 'per_child'
                            ? 'Trẻ em'
                            : 'Theo nhóm'}
                        </span>
                        <p className="mt-2 text-2xl font-black text-[#174C3C]">
                          {new Intl.NumberFormat('vi-VN').format(rule.amountVnd)}đ
                        </p>
                        {rule.included.length > 0 && (
                          <div className="mt-3 space-y-1 text-xs text-[#26352E]/80">
                            <span className="font-bold text-[#174C3C]">Bao gồm:</span>
                            <p>{rule.included.join(', ')}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="rounded-2xl bg-[#E7EFE4] p-4 text-sm font-semibold text-[#174C3C]">
                  Liên hệ trực tiếp để biết mức giá chính xác theo mùa và số lượng khách.
                </div>
              )}

              {/* Hours */}
              <div className="pt-6 border-t border-zinc-100">
                <h3 className="text-lg font-black text-[#174C3C]">Khung giờ mở cửa đón khách</h3>
                <div className="mt-3 grid gap-2 sm:grid-cols-2 text-xs sm:text-sm text-[#26352E]/80">
                  <div className="p-3 rounded-xl bg-[#F7F4EA]">
                    <strong>Các ngày trong tuần:</strong> 08:00 – 17:30
                  </div>
                  <div className="p-3 rounded-xl bg-[#F7F4EA]">
                    <strong>Thứ Bảy, Chủ Nhật:</strong> 08:00 – 18:00
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: VỊ TRÍ & ĐƯỜNG ĐI */}
          {activeTab === 'location' && (
            <div className="card-3d p-6 sm:p-8 space-y-6">
              <div>
                <h2 className="text-xl font-black text-[#174C3C]">Vị trí bản đồ</h2>
                <p className="mt-1 text-xs sm:text-sm text-[#26352E]/70 flex items-center gap-1.5">
                  <MapPin size={14} className="text-[#D6A545]" />
                  {place.address || place.locality}
                </p>
              </div>

              <div className="overflow-hidden rounded-2xl border border-[#174C3C]/15">
                <VerifiedPlaceMap places={[place]} selectedId={place.id} />
              </div>

              <div className="rounded-2xl bg-[#F7F4EA] p-4 text-xs sm:text-sm text-[#26352E]/80 space-y-2">
                <h4 className="font-bold text-[#174C3C]">Hướng dẫn di chuyển:</h4>
                <p>
                  - <strong>Xe ô tô / Xe máy:</strong> Từ trung tâm TP.HCM di chuyển theo tuyến Tỉnh Lộ 9 (Đường Hà Duy Phiên) qua Cầu Rạch Tra vào địa phận xã Bình Mỹ.
                </p>
                <p>
                  - <strong>Đường thủy:</strong> Bến Wetro Line – Moon River có thể tiếp cận bằng ca nô từ các bến trung tâm sông Sài Gòn.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Floating Sticky Action Card */}
        <aside className="sticky top-24 space-y-6">
          <div className="card-3d p-6 space-y-5 border-2 border-[#174C3C]/10 bg-white shadow-xl">
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#D6A545]">
                Lên lịch chuyến đi
              </span>
              <h3 className="mt-1 text-xl font-black text-[#174C3C]">{place.name}</h3>
              <p className="mt-1.5 text-xs text-[#26352E]/75 line-clamp-2">
                {place.shortDescription}
              </p>
            </div>

            <div className="space-y-2.5 pt-2 border-t border-zinc-100 text-xs sm:text-sm">
              <div className="flex items-center justify-between">
                <span className="text-[#26352E]/70">Thời lượng gợi ý:</span>
                <span className="font-bold text-[#174C3C]">~{primaryExp?.durationMinutes || 60} phút</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[#26352E]/70">Giá vé tham khảo:</span>
                <span className="font-black text-[#174C3C]">
                  {verifiedPrices[0]?.amountVnd
                    ? `${new Intl.NumberFormat('vi-VN').format(verifiedPrices[0].amountVnd)}đ/khách`
                    : 'Liên hệ'}
                </span>
              </div>
            </div>

            <div className="pt-2 space-y-2.5">
              <Link
                href={
                  primaryExp
                    ? `/itinerary?experience=${encodeURIComponent(primaryExp.id)}`
                    : '/itinerary'
                }
                className="btn-tactile btn-accent-gold w-full text-center text-sm py-3"
              >
                <Sparkles size={16} className="text-[#174C3C]" />
                <span>Thêm vào hành trình</span>
              </Link>

              <button
                type="button"
                onClick={toggleFavorite}
                className={`btn-tactile w-full text-center text-xs py-2.5 rounded-full border transition-all ${
                  isFavorited
                    ? 'bg-rose-50 border-rose-300 text-rose-600'
                    : 'bg-[#F7F4EA] border-[#174C3C]/15 text-[#174C3C] hover:bg-[#E7EFE4]'
                }`}
              >
                <Heart size={15} className={isFavorited ? 'fill-current text-rose-600' : ''} />
                <span>{isFavorited ? 'Đã lưu trên thiết bị' : 'Lưu địa điểm này'}</span>
              </button>
            </div>

            {/* Direct contact info if available */}
            {place.contacts && (
              <div className="pt-4 border-t border-zinc-100 text-xs space-y-1.5">
                <p className="font-bold text-[#174C3C]">Thông tin liên hệ:</p>
                {place.contacts.phone && (
                  <a
                    href={`tel:${place.contacts.phone}`}
                    className="flex items-center gap-1.5 text-[#26352E]/80 hover:text-[#174C3C]"
                  >
                    <Phone size={13} className="text-[#174C3C]" />
                    <span>{place.contacts.phone}</span>
                  </a>
                )}
                {place.contacts.email && (
                  <a
                    href={`mailto:${place.contacts.email}`}
                    className="flex items-center gap-1.5 text-[#26352E]/80 hover:text-[#174C3C]"
                  >
                    <Mail size={13} className="text-[#174C3C]" />
                    <span className="truncate">{place.contacts.email}</span>
                  </a>
                )}
              </div>
            )}
          </div>
        </aside>
      </div>

      {/* LIGHTBOX MODAL */}
      {lightboxOpen && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 p-4 backdrop-blur-md animate-fade-in"
          onClick={() => setLightboxOpen(false)}
        >
          {/* Close button */}
          <button
            type="button"
            onClick={() => setLightboxOpen(false)}
            className="absolute top-5 right-5 z-50 grid h-11 w-11 place-items-center rounded-full bg-white/10 text-white hover:bg-white/20 transition active:scale-95"
            aria-label="Đóng phóng to ảnh"
          >
            <X size={24} />
          </button>

          {/* Previous button */}
          {photos.length > 1 && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setLightboxIdx((prev) => (prev - 1 + photos.length) % photos.length);
              }}
              className="absolute left-4 top-1/2 -translate-y-1/2 z-50 grid h-12 w-12 place-items-center rounded-full bg-white/10 text-white hover:bg-white/20 transition active:scale-95"
              aria-label="Ảnh trước"
            >
              <ChevronLeft size={28} />
            </button>
          )}

          {/* Next button */}
          {photos.length > 1 && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setLightboxIdx((prev) => (prev + 1) % photos.length);
              }}
              className="absolute right-4 top-1/2 -translate-y-1/2 z-50 grid h-12 w-12 place-items-center rounded-full bg-white/10 text-white hover:bg-white/20 transition active:scale-95"
              aria-label="Ảnh kế tiếp"
            >
              <ChevronRight size={28} />
            </button>
          )}

          {/* Large Image View */}
          <div
            className="relative max-h-[85vh] max-w-[90vw] aspect-[16/10] overflow-hidden rounded-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <Image
              src={photos[lightboxIdx]}
              alt={`${place.name} view ${lightboxIdx + 1}`}
              fill
              className="object-contain"
            />
          </div>

          <div className="absolute bottom-5 left-1/2 -translate-x-1/2 text-white/80 text-xs font-semibold bg-black/60 px-4 py-1.5 rounded-full backdrop-blur-sm">
            {lightboxIdx + 1} / {photos.length} — {place.name}
          </div>
        </div>
      )}
    </div>
  );
}
