'use client';

import { Suspense, useMemo, useState } from 'react';
import Image from 'next/image';
import { useSearchParams } from 'next/navigation';
import { ArrowRight, LayoutGrid, Map as MapIcon, RotateCcw, Search, SlidersHorizontal, X } from 'lucide-react';
import type { Category, Experience, Place } from '@/lib/data/types';
import PlaceCard from '@/components/PlaceCard';
import VerifiedPlaceMap from './VerifiedPlaceMap';
import { getCategory } from '@/lib/data/repository';
import { getSeasonTheme, seasonThemes } from '@/lib/seasons';
import { seasonImagePaths } from '@/lib/visual-assets';

function normalize(value: string) {
  return value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[đĐ]/g, 'd').toLocaleLowerCase('vi-VN');
}

export default function SeasonExplorer(props: { places: Place[]; categories: Category[]; experiences: Experience[] }) {
  return <Suspense fallback={<div className="min-h-64 animate-pulse rounded-3xl bg-[#E7EFE4]" aria-label="Đang tải nội dung khám phá" />}><SeasonExplorerContent {...props} /></Suspense>;
}

function SeasonExplorerContent({ places, categories, experiences }: { places: Place[]; categories: Category[]; experiences: Experience[] }) {
  const searchParams = useSearchParams();
  const requestedCategory = searchParams.get('category') ?? 'all';
  const initialSeason = searchParams.get('season') ?? seasonThemes.find((theme) => theme.categoryId === requestedCategory)?.id ?? 'spring';
  const [seasonId, setSeasonId] = useState(getSeasonTheme(initialSeason)?.id ?? 'spring');
  const [categoryId, setCategoryId] = useState(requestedCategory);
  const [query, setQuery] = useState(searchParams.get('q') ?? '');
  const [costFilter, setCostFilter] = useState('all');
  const [durationFilter, setDurationFilter] = useState('all');
  const [familyOnly, setFamilyOnly] = useState(false);
  const [view, setView] = useState<'list' | 'map'>(searchParams.get('view') === 'map' ? 'map' : 'list');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const season = getSeasonTheme(seasonId)!;

  const updateUrl = (next: { season?: string; category?: string; query?: string; view?: 'list' | 'map' }) => {
    const params = new URLSearchParams(window.location.search);
    params.set('season', next.season ?? seasonId);
    const category = next.category ?? categoryId;
    const text = next.query ?? query;
    const nextView = next.view ?? view;
    if (category === 'all') params.delete('category'); else params.set('category', category);
    if (text.trim()) params.set('q', text.trim()); else params.delete('q');
    if (nextView === 'map') params.set('view', 'map'); else params.delete('view');
    const suffix = params.toString();
    window.history.replaceState(null, '', suffix ? `/explore?${suffix}` : '/explore');
  };

  const selectSeason = (id: string) => {
    setSeasonId(id as typeof seasonId);
    updateUrl({ season: id });
  };
  const selectCategory = (id: string) => {
    setCategoryId(id);
    updateUrl({ category: id });
  };
  const selectView = (next: 'list' | 'map') => {
    setView(next);
    updateUrl({ view: next });
  };
  const changeQuery = (next: string) => {
    setQuery(next);
    updateUrl({ query: next });
  };
  const resetFilters = () => {
    setCategoryId('all'); setQuery(''); setCostFilter('all'); setDurationFilter('all'); setFamilyOnly(false);
    updateUrl({ category: 'all', query: '' });
  };

  const featuredActivities = experiences.filter((item) => item.categoryId === season.categoryId && item.placeId !== null).slice(0, 3);
  const filtered = useMemo(() => places.filter((place) => {
    const linked = experiences.filter((item) => item.placeId === place.id);
    const text = normalize([place.name, ...place.aliases, place.shortDescription, place.locality, place.address ?? '', ...linked.flatMap((item) => [item.name, ...item.activities])].join(' '));
    if (query && !text.includes(normalize(query))) return false;
    if (categoryId !== 'all' && place.primaryCategory !== categoryId && !place.secondaryCategories.includes(categoryId)) return false;
    const prices = linked.flatMap((item) => item.priceRules?.filter((rule) => rule.status === 'verified') ?? []);
    const adultPrice = prices.find((rule) => rule.basis === 'per_adult')?.amountVnd;
    if (costFilter !== 'all' && adultPrice === undefined) return false;
    if (costFilter === 'under100' && adultPrice! > 100_000) return false;
    if (costFilter === 'above100' && adultPrice! < 100_000) return false;
    if (durationFilter !== 'all') {
      const durations = linked.filter((item) => item.evidence.status === 'verified').map((item) => item.durationMinutes).filter((value): value is number => value !== null);
      if (!durations.length || (durationFilter === 'short' && !durations.some((value) => value <= 60)) || (durationFilter === 'long' && !durations.some((value) => value > 60))) return false;
    }
    if (familyOnly && !linked.some((item) => item.suitability.status === 'verified')) return false;
    return true;
  }).sort((a, b) => Number(b.primaryCategory === season.categoryId || b.secondaryCategories.includes(season.categoryId)) - Number(a.primaryCategory === season.categoryId || a.secondaryCategories.includes(season.categoryId))), [places, experiences, query, categoryId, costFilter, durationFilter, familyOnly, season.categoryId]);

  const activeFilters = Number(Boolean(query)) + Number(costFilter !== 'all') + Number(durationFilter !== 'all') + Number(familyOnly) + Number(categoryId !== 'all');

  return (
    <div className="space-y-7">
      <div role="tablist" aria-label="Chủ đề bốn mùa" className="no-scrollbar -mx-4 flex snap-x gap-2 overflow-x-auto px-4 pb-1 sm:mx-0 sm:grid sm:grid-cols-4 sm:px-0">
        {seasonThemes.map((item) => {
          const active = item.id === season.id;
          return <button key={item.id} id={`season-tab-${item.id}`} type="button" role="tab" aria-controls="season-panel" aria-selected={active} tabIndex={active ? 0 : -1} onKeyDown={(event) => {
            if (event.key !== 'ArrowRight' && event.key !== 'ArrowLeft') return;
            event.preventDefault();
            const index = seasonThemes.findIndex((theme) => theme.id === item.id);
            const offset = event.key === 'ArrowRight' ? 1 : -1;
            const next = seasonThemes[(index + offset + seasonThemes.length) % seasonThemes.length];
            selectSeason(next.id);
            document.getElementById(`season-tab-${next.id}`)?.focus();
          }} onClick={() => selectSeason(item.id)} className={`min-h-12 min-w-[7.25rem] snap-start rounded-2xl border px-5 text-sm font-extrabold transition-colors ${active ? 'border-[#174C3C] bg-[#174C3C] text-white shadow-[0_8px_20px_rgba(23,76,60,0.18)]' : 'border-[#DCE5DB] bg-white text-[#26352E] hover:bg-[#E7EFE4]'}`}>
            <span className="mr-2 inline-grid h-6 w-6 place-items-center rounded-lg text-xs font-black" style={{ backgroundColor: active ? item.surface : item.surface, color: item.accent }}>{item.label.slice(0, 1)}</span>{item.label}
          </button>;
        })}
      </div>

      <section id="season-panel" role="tabpanel" tabIndex={0} aria-labelledby={`season-tab-${season.id}`} className="grid overflow-hidden rounded-[24px] border border-[#DCE5DB] bg-white shadow-[0_12px_32px_rgba(23,76,60,0.08)] md:grid-cols-[1fr_.86fr]">
        <div className="flex flex-col justify-center p-6 sm:p-8 lg:p-10">
          <p className="text-sm font-bold" style={{ color: season.accent }}>Chủ đề {season.label}</p>
          <h2 id="season-heading" className="mt-2 text-2xl font-extrabold leading-tight text-[#174C3C] sm:text-3xl">{season.title}</h2>
          <p className="mt-3 max-w-xl text-sm leading-6 text-[#59675E]">{season.intro}</p>
          <div className="mt-5">
            <p className="text-xs font-bold uppercase tracking-wide text-[#59675E]">Gợi ý nội dung</p>
            <div className="mt-2 flex flex-wrap gap-2">
              {featuredActivities.length ? featuredActivities.map((item) => <span key={item.id} className="rounded-full px-3 py-1.5 text-xs font-semibold" style={{ backgroundColor: season.surface, color: season.accent }}>{item.name}</span>) : <span className="text-sm text-[#59675E]">Chưa có hoạt động trong danh mục này.</span>}
            </div>
          </div>
          <p className="mt-4 text-xs leading-5 text-[#59675E]">Các mùa là chủ đề khám phá; lịch hoạt động cần xác nhận theo từng địa điểm.</p>
          <a href={`/itinerary?season=${season.id}`} className="mt-5 inline-flex min-h-11 items-center gap-2 self-start rounded-full bg-[#174C3C] px-5 text-sm font-bold text-white hover:bg-[#113A2E] focus-visible:outline-offset-4">Lên hành trình mùa này <ArrowRight size={16} /></a>
        </div>
        <div className="relative min-h-48 aspect-[16/9] w-full md:aspect-auto md:min-h-full">
          <Image src={seasonImagePaths[season.id]} alt={`${season.title} tại Bình Mỹ`} fill sizes="(max-width: 768px) 100vw, 45vw" className="object-cover" />
        </div>
      </section>

      <div className="space-y-4 rounded-[22px] border border-[#DCE5DB] bg-white p-4 shadow-sm sm:p-5">
        <div role="group" aria-label="Lọc theo danh mục" className="flex flex-wrap gap-2">
          {[{ id: 'all', name: 'Tất cả' }, ...categories].map((item) => {
            const active = item.id === categoryId;
          return <button key={item.id} type="button" aria-pressed={active} onClick={() => selectCategory(item.id)} className={`min-h-11 rounded-full border px-4 text-sm font-bold transition-colors ${active ? 'border-[#174C3C] bg-[#E7EFE4] text-[#174C3C] ring-1 ring-[#174C3C]' : 'border-[#DCE5DB] text-[#59675E] hover:bg-[#F7F4EA]'}`}>{item.name}</button>;
          })}
        </div>
        <div className="relative">
          <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#59675E]" />
          <input value={query} onChange={(event) => changeQuery(event.target.value)} placeholder="Tìm địa điểm hoặc hoạt động" aria-label="Tìm địa điểm hoặc hoạt động" className="min-h-12 w-full rounded-xl border border-[#DCE5DB] bg-[#F7F4EA]/60 py-3 pl-11 pr-12 text-sm text-[#26352E] outline-none focus:border-[#174C3C] focus:bg-white focus:ring-2 focus:ring-[#174C3C]/10" />
          {query && <button type="button" aria-label="Xóa nội dung tìm kiếm" onClick={() => changeQuery('')} className="absolute right-2 top-1/2 grid h-10 w-10 -translate-y-1/2 place-items-center rounded-lg text-[#59675E] hover:bg-[#E7EFE4]"><X size={17} /></button>}
        </div>
        <div className="flex flex-wrap items-center gap-x-4 gap-y-3 border-t border-[#DCE5DB] pt-4">
          <label className="flex min-h-11 items-center gap-2 text-sm font-semibold text-[#26352E]">Chi phí<select value={costFilter} onChange={(event) => setCostFilter(event.target.value)} className="min-h-11 rounded-lg border border-[#DCE5DB] bg-white px-3 text-sm"><option value="all">Mọi mức</option><option value="under100">Dưới 100.000đ/khách</option><option value="above100">Từ 100.000đ/khách</option></select></label>
          <label className="flex min-h-11 items-center gap-2 text-sm font-semibold text-[#26352E]">Thời lượng<select value={durationFilter} onChange={(event) => setDurationFilter(event.target.value)} className="min-h-11 rounded-lg border border-[#DCE5DB] bg-white px-3 text-sm"><option value="all">Mọi thời lượng</option><option value="short">Tối đa 60 phút</option><option value="long">Trên 60 phút</option></select></label>
          <label className="flex min-h-11 items-center gap-2 text-sm font-medium text-[#26352E]"><input type="checkbox" checked={familyOnly} onChange={(event) => setFamilyOnly(event.target.checked)} className="h-5 w-5 accent-[#174C3C]" />Thông tin phù hợp trẻ em đã có</label>
          {activeFilters > 0 && <button type="button" onClick={resetFilters} className="inline-flex min-h-10 items-center gap-2 text-sm font-bold text-[#174C3C] underline underline-offset-4"><RotateCcw size={15} />Xóa bộ lọc</button>}
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <p aria-live="polite" className="text-sm text-[#59675E]">{filtered.length} địa điểm trong danh sách</p>
        <div role="group" aria-label="Cách xem địa điểm" className="inline-flex rounded-xl border border-[#DCE5DB] bg-white p-1">
          <button type="button" aria-pressed={view === 'list'} onClick={() => selectView('list')} className={`inline-flex min-h-11 items-center gap-2 rounded-lg px-3 text-sm font-bold ${view === 'list' ? 'bg-[#174C3C] text-white' : 'text-[#59675E]'}`}><LayoutGrid size={16} />Danh sách</button>
          <button type="button" aria-pressed={view === 'map'} onClick={() => selectView('map')} className={`inline-flex min-h-11 items-center gap-2 rounded-lg px-3 text-sm font-bold ${view === 'map' ? 'bg-[#174C3C] text-white' : 'text-[#59675E]'}`}><MapIcon size={16} />Bản đồ</button>
        </div>
      </div>

      {view === 'map' ? <div className="grid items-start gap-5 lg:grid-cols-[.9fr_1.1fr]">
        <div className="grid gap-3 sm:grid-cols-2 lg:max-h-[620px] lg:grid-cols-1 lg:overflow-y-auto lg:pr-2">
          {filtered.map((place) => <button type="button" key={place.id} onClick={() => setSelectedId(place.id)} aria-pressed={selectedId === place.id} className={`card-3d rounded-2xl border bg-white p-4 text-left ${selectedId === place.id ? 'border-[#D6A545] ring-2 ring-[#D6A545]/40' : 'border-[#DCE5DB]'}`}>
            <span className="text-xs font-bold text-[#59675E]">{getCategory(place.primaryCategory)?.name}</span><h3 className="mt-1 font-extrabold text-[#174C3C]">{place.name}</h3><p className="mt-1 line-clamp-2 text-sm leading-6 text-[#59675E]">{place.shortDescription}</p>
          </button>)}
          {!filtered.length && <EmptyState onReset={resetFilters} />}
        </div>
        <div className="lg:sticky lg:top-24"><VerifiedPlaceMap places={filtered} selectedId={selectedId} onSelect={setSelectedId} /></div>
      </div> : <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((place) => { const category = getCategory(place.primaryCategory); return category ? <PlaceCard key={place.id} place={place} category={category} /> : null; })}
        {!filtered.length && <div className="sm:col-span-2 lg:col-span-3"><EmptyState onReset={resetFilters} /></div>}
      </div>}
    </div>
  );
}

function EmptyState({ onReset }: { onReset: () => void }) {
  return <div className="rounded-3xl border border-dashed border-[#DCE5DB] bg-white px-6 py-12 text-center sm:px-10">
    <div className="mx-auto grid h-12 w-12 place-items-center rounded-2xl bg-[#E7EFE4] text-[#174C3C]"><SlidersHorizontal size={22} /></div>
    <h3 className="mt-4 text-lg font-extrabold text-[#174C3C]">Chưa thấy địa điểm phù hợp</h3>
    <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-[#59675E]">Thử đổi từ khóa hoặc bỏ bớt bộ lọc để xem thêm địa điểm.</p>
    <button type="button" onClick={onReset} className="btn-tactile btn-primary-forest mt-5 min-h-11 text-sm"><RotateCcw size={15} />Xóa bộ lọc</button>
  </div>;
}
