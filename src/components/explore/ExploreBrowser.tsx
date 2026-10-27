'use client';

import { useEffect, useMemo, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { LayoutGrid, Map as MapIcon, Search, SlidersHorizontal, RotateCcw, X, MapPin } from 'lucide-react';
import type { Category, Experience, Place } from '@/lib/data/types';
import PlaceCard from '@/components/PlaceCard';
import VerifiedPlaceMap from './VerifiedPlaceMap';
import { getCategory } from '@/lib/data/repository';

function normalize(value: string): string {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D')
    .toLocaleLowerCase('vi-VN');
}

export default function ExploreBrowserWrapper(props: {
  places: Place[];
  categories: Category[];
  experiences: Experience[];
}) {
  return (
    <Suspense fallback={<div className="py-12 text-center text-sm font-semibold text-[#174C3C]">Đang tải dữ liệu khám phá...</div>}>
      <ExploreBrowser {...props} />
    </Suspense>
  );
}

function ExploreBrowser({
  places,
  categories,
  experiences,
}: {
  places: Place[];
  categories: Category[];
  experiences: Experience[];
}) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const initialCat = searchParams.get('category') || 'all';
  const initialView = searchParams.get('view') === 'map' ? 'map' : 'list';
  const initialQuery = searchParams.get('q') || '';

  const [categoryId, setCategoryId] = useState(initialCat);
  const [query, setQuery] = useState(initialQuery);
  const [costFilter, setCostFilter] = useState('all');
  const [durationFilter, setDurationFilter] = useState('all');
  const [familyOnly, setFamilyOnly] = useState(false);
  const [view, setView] = useState<'list' | 'map'>(initialView);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  // Sync state to URL params cleanly
  const updateUrl = (newCat: string, newView: string, newQ: string) => {
    const params = new URLSearchParams();
    if (newCat && newCat !== 'all') params.set('category', newCat);
    if (newView === 'map') params.set('view', 'map');
    if (newQ.trim()) params.set('q', newQ.trim());
    const queryStr = params.toString();
    const newPath = queryStr ? `/explore?${queryStr}` : '/explore';
    window.history.replaceState(null, '', newPath);
  };

  const handleTabChange = (id: string) => {
    setCategoryId(id);
    updateUrl(id, view, query);
  };

  const handleViewChange = (v: 'list' | 'map') => {
    setView(v);
    updateUrl(categoryId, v, query);
  };

  const handleQueryChange = (val: string) => {
    setQuery(val);
    updateUrl(categoryId, view, val);
  };

  const resetFilters = () => {
    setCategoryId('all');
    setQuery('');
    setCostFilter('all');
    setDurationFilter('all');
    setFamilyOnly(false);
    updateUrl('all', view, '');
  };

  const filtered = useMemo(() => {
    return places.filter((place) => {
      const linked = experiences.filter((item) => item.placeId === place.id);
      const haystack = normalize(
        [
          place.name,
          ...place.aliases,
          place.shortDescription,
          place.locality,
          place.address ?? '',
          ...linked.flatMap((item) => [item.name, ...item.activities]),
        ].join(' ')
      );

      // Search text
      if (query && !haystack.includes(normalize(query))) return false;

      // Category filter
      if (
        categoryId !== 'all' &&
        place.primaryCategory !== categoryId &&
        !place.secondaryCategories.includes(categoryId)
      ) {
        return false;
      }

      // Cost filter
      const prices = linked.flatMap((item) => item.priceRules ?? []);
      const adultPrice = prices.find((p) => p.basis === 'per_adult')?.amountVnd;
      if (costFilter === 'under100' && adultPrice !== undefined && adultPrice > 100000) return false;
      if (costFilter === 'above100' && adultPrice !== undefined && adultPrice <= 100000) return false;

      // Duration filter
      if (durationFilter !== 'all') {
        const durations = linked
          .map((item) => item.durationMinutes)
          .filter((v): v is number => v !== null);
        if (!durations.length) return false;
        if (durationFilter === 'short' && !durations.some((d) => d <= 60)) return false;
        if (durationFilter === 'long' && !durations.some((d) => d > 60)) return false;
      }

      // Family friendly
      if (familyOnly && !linked.some((item) => item.suitability?.status === 'verified')) {
        return false;
      }

      return true;
    });
  }, [places, experiences, query, categoryId, costFilter, durationFilter, familyOnly]);

  const activeFiltersCount =
    (costFilter !== 'all' ? 1 : 0) +
    (durationFilter !== 'all' ? 1 : 0) +
    (familyOnly ? 1 : 0) +
    (query ? 1 : 0);

  return (
    <div className="space-y-6">
      {/* 4-CATEGORY TABS (SCROLLABLE ON MOBILE) */}
      <div className="relative">
        <div
          role="tablist"
          aria-label="Nhóm trải nghiệm Bình Mỹ"
          className="flex gap-2.5 overflow-x-auto no-scrollbar pb-2 pt-1 -mx-4 px-4 sm:mx-0 sm:px-0"
        >
          {[{ id: 'all', name: 'Tất cả điểm đến' }, ...categories].map((cat) => {
            const isSelected = categoryId === cat.id;
            return (
              <button
                key={cat.id}
                role="tab"
                aria-selected={isSelected}
                onClick={() => handleTabChange(cat.id)}
                className={`shrink-0 rounded-full px-5 py-2.5 text-xs sm:text-sm font-bold transition-all duration-200 active:scale-95 ${
                  isSelected
                    ? 'bg-[#174C3C] text-white shadow-md shadow-[#174C3C]/20 ring-2 ring-[#174C3C]'
                    : 'bg-white text-[#26352E]/85 border border-[#174C3C]/15 hover:bg-[#E7EFE4] hover:text-[#174C3C]'
                }`}
              >
                {cat.name}
              </button>
            );
          })}
        </div>
      </div>

      {/* SEARCH AND FILTER BAR */}
      <div className="rounded-2xl border border-[#174C3C]/10 bg-white p-4 sm:p-5 shadow-sm space-y-4">
        {/* Search Input */}
        <div className="relative flex items-center">
          <Search size={18} className="absolute left-3.5 text-[#26352E]/40" />
          <input
            type="text"
            value={query}
            onChange={(e) => handleQueryChange(e.target.value)}
            placeholder="Tìm tên địa điểm, vườn cây, hoạt động làm nghề..."
            className="w-full rounded-xl border border-[#174C3C]/15 bg-[#F7F4EA]/40 pl-10 pr-9 py-2.5 text-sm text-[#26352E] outline-none transition focus:border-[#174C3C] focus:bg-white focus:ring-2 focus:ring-[#174C3C]/10"
          />
          {query && (
            <button
              type="button"
              onClick={() => handleQueryChange('')}
              className="absolute right-3 text-[#26352E]/40 hover:text-[#26352E]"
              aria-label="Xóa từ khóa tìm kiếm"
            >
              <X size={16} />
            </button>
          )}
        </div>

        {/* Secondary Compact Filters */}
        <div className="flex flex-wrap items-center gap-3 pt-1 border-t border-zinc-100">
          {/* Mức chi */}
          <div className="flex items-center gap-1.5 text-xs">
            <span className="font-bold text-[#174C3C]">Mức chi:</span>
            <select
              value={costFilter}
              onChange={(e) => setCostFilter(e.target.value)}
              className="rounded-lg border border-[#174C3C]/15 bg-white px-2.5 py-1.5 font-medium text-[#26352E] text-xs outline-none focus:border-[#174C3C]"
            >
              <option value="all">Mọi mức chi</option>
              <option value="under100">Dưới 100.000đ/khách</option>
              <option value="above100">Từ 100.000đ/khách</option>
            </select>
          </div>

          {/* Thời lượng */}
          <div className="flex items-center gap-1.5 text-xs">
            <span className="font-bold text-[#174C3C]">Thời lượng:</span>
            <select
              value={durationFilter}
              onChange={(e) => setDurationFilter(e.target.value)}
              className="rounded-lg border border-[#174C3C]/15 bg-white px-2.5 py-1.5 font-medium text-[#26352E] text-xs outline-none focus:border-[#174C3C]"
            >
              <option value="all">Mọi thời lượng</option>
              <option value="short">Tối đa 60 phút</option>
              <option value="long">Trên 60 phút</option>
            </select>
          </div>

          {/* Phù hợp gia đình */}
          <label className="flex items-center gap-1.5 text-xs font-semibold text-[#26352E] cursor-pointer">
            <input
              type="checkbox"
              checked={familyOnly}
              onChange={(e) => setFamilyOnly(e.target.checked)}
              className="h-4 w-4 rounded accent-[#174C3C]"
            />
            <span>Phù hợp trẻ em & gia đình</span>
          </label>

          {/* Reset Filters */}
          {activeFiltersCount > 0 && (
            <button
              type="button"
              onClick={resetFilters}
              className="ml-auto inline-flex items-center gap-1 text-xs font-bold text-rose-600 hover:underline"
            >
              <RotateCcw size={12} /> Đặt lại ({activeFiltersCount})
            </button>
          )}
        </div>
      </div>

      {/* RESULTS HEADER & VIEW SWITCH */}
      <div className="flex items-center justify-between gap-3 pt-2">
        <p className="text-xs sm:text-sm font-semibold text-[#26352E]/80">
          Hiển thị <strong className="text-[#174C3C] text-base">{filtered.length}</strong> địa điểm phù hợp
        </p>

        {/* View Toggle */}
        <div className="inline-flex rounded-xl border border-[#174C3C]/15 bg-white p-1 shadow-sm">
          <button
            type="button"
            aria-pressed={view === 'list'}
            onClick={() => handleViewChange('list')}
            className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold transition-all ${
              view === 'list'
                ? 'bg-[#174C3C] text-white shadow-sm'
                : 'text-[#26352E]/70 hover:text-[#174C3C]'
            }`}
          >
            <LayoutGrid size={14} /> Danh sách
          </button>
          <button
            type="button"
            aria-pressed={view === 'map'}
            onClick={() => handleViewChange('map')}
            className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold transition-all ${
              view === 'map'
                ? 'bg-[#174C3C] text-white shadow-sm'
                : 'text-[#26352E]/70 hover:text-[#174C3C]'
            }`}
          >
            <MapIcon size={14} /> Bản đồ
          </button>
        </div>
      </div>

      {/* CONTENT: LIST VIEW OR MAP VIEW */}
      {view === 'map' ? (
        <div className="grid gap-6 lg:grid-cols-[1fr_1.3fr] items-start">
          {/* Left: Place List */}
          <div className="space-y-3 max-h-[620px] overflow-y-auto pr-1">
            {filtered.map((place) => {
              const isSelected = selectedId === place.id;
              const cat = getCategory(place.primaryCategory);
              return (
                <div
                  key={place.id}
                  onClick={() => setSelectedId(place.id)}
                  className={`card-3d p-4 cursor-pointer transition-all ${
                    isSelected
                      ? 'border-[#D6A545] ring-2 ring-[#D6A545]/40 shadow-lg'
                      : 'hover:border-[#174C3C]/30'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <span
                      className="rounded-full px-2.5 py-0.5 text-[10px] font-bold text-white"
                      style={{ backgroundColor: cat?.accent ?? '#174C3C' }}
                    >
                      {cat?.name}
                    </span>
                    <span className="text-[11px] font-bold text-[#D6A545] inline-flex items-center gap-1">
                      <MapPin size={12} /> Ghim số {places.indexOf(place) + 1}
                    </span>
                  </div>
                  <h3 className="mt-2 font-black text-base text-[#174C3C]">{place.name}</h3>
                  <p className="mt-1 text-xs text-[#26352E]/70 line-clamp-2">
                    {place.shortDescription}
                  </p>
                </div>
              );
            })}
            {!filtered.length && <EmptyFilterState onReset={resetFilters} />}
          </div>

          {/* Right: Interactive Map */}
          <div className="sticky top-24">
            <VerifiedPlaceMap
              places={filtered}
              selectedId={selectedId}
              onSelect={(id) => setSelectedId(id)}
            />
          </div>
        </div>
      ) : (
        /* List View: 3 cols desktop, 2 tablet, 1 mobile */
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((place) => {
            const cat = getCategory(place.primaryCategory)!;
            return <PlaceCard key={place.id} place={place} category={cat} />;
          })}
          {!filtered.length && (
            <div className="sm:col-span-2 lg:col-span-3">
              <EmptyFilterState onReset={resetFilters} />
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function EmptyFilterState({ onReset }: { onReset: () => void }) {
  return (
    <div className="rounded-3xl border border-dashed border-[#174C3C]/20 bg-white p-8 sm:p-12 text-center">
      <div className="mx-auto grid h-12 w-12 place-items-center rounded-2xl bg-[#E7EFE4] text-[#174C3C]">
        <SlidersHorizontal size={22} />
      </div>
      <h3 className="mt-4 text-lg font-black text-[#174C3C]">
        Không tìm thấy địa điểm phù hợp
      </h3>
      <p className="mt-2 max-w-md mx-auto text-xs sm:text-sm text-[#26352E]/70 leading-relaxed">
        Thử đổi từ khóa hoặc mở rộng bộ lọc chi phí, thời lượng để khám phá thêm các điểm đến sinh thái tại Bình Mỹ.
      </p>
      <button
        type="button"
        onClick={onReset}
        className="mt-5 btn-tactile btn-primary-forest text-xs sm:text-sm"
      >
        <RotateCcw size={14} className="text-[#D6A545]" />
        <span>Đặt lại toàn bộ bộ lọc</span>
      </button>
    </div>
  );
}
