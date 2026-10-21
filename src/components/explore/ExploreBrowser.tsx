'use client';

import { useMemo, useState } from 'react';
import { List, Map as MapIcon, Search, SlidersHorizontal } from 'lucide-react';
import type { Category, Experience, Place } from '@/lib/data/types';
import PlaceCard from '@/components/PlaceCard';
import VerifiedPlaceMap from './VerifiedPlaceMap';
import { getCategory, sourcesData } from '@/lib/data/repository';

function normalize(value: string): string {
  return value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/đ/g, 'd').replace(/Đ/g, 'D').toLocaleLowerCase('vi-VN');
}

export default function ExploreBrowser({ places, categories, experiences }: { places: Place[]; categories: Category[]; experiences: Experience[] }) {
  const [query, setQuery] = useState('');
  const [categoryId, setCategoryId] = useState('all');
  const [costFilter, setCostFilter] = useState('all');
  const [durationFilter, setDurationFilter] = useState('all');
  const [familyOnly, setFamilyOnly] = useState(false);
  const [view, setView] = useState<'list' | 'map'>('list');
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const filtered = useMemo(() => places.filter((place) => {
    const linked = experiences.filter((item) => item.placeId === place.id);
    const haystack = normalize([place.name, ...place.aliases, place.shortDescription, place.locality, ...linked.flatMap((item) => [item.name, ...item.activities])].join(' '));
    if (query && !haystack.includes(normalize(query))) return false;
    if (categoryId !== 'all' && place.primaryCategory !== categoryId && !place.secondaryCategories.includes(categoryId)) return false;
    const verifiedPrice = linked.some((item) => item.priceRules?.some((rule) => rule.status === 'verified'));
    if (costFilter === 'known' && !verifiedPrice) return false;
    if (costFilter === 'unknown' && verifiedPrice) return false;
    if (durationFilter !== 'all') {
      const durations = linked.map((item) => item.durationMinutes).filter((value): value is number => value !== null);
      if (!durations.length) return false;
      const max = durationFilter === 'short' ? 120 : 240;
      if (!durations.some((value) => value <= max)) return false;
    }
    if (familyOnly && !linked.some((item) => item.suitability.status === 'verified')) return false;
    return true;
  }), [places, experiences, query, categoryId, costFilter, durationFilter, familyOnly]);
  const unplacedActivities = experiences.filter((item) => item.placeId === null && (categoryId === 'all' || item.categoryId === categoryId));

  return <div>
    <div className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm sm:p-5">
      <label className="flex items-center gap-3 rounded-xl border border-zinc-200 px-3.5 py-3 focus-within:border-[#40916C]"><Search size={18} className="shrink-0 text-zinc-400" /><span className="sr-only">Tìm địa điểm</span><input value={query} onChange={(event) => setQuery(event.target.value)} className="min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-zinc-400" placeholder="Tìm tên, nghề hoặc hoạt động…" /></label>
      <div className="mt-4 flex gap-2 overflow-x-auto pb-1">{[{ id: 'all', name: 'Tất cả' }, ...categories].map((category) => <button key={category.id} type="button" aria-pressed={categoryId === category.id} onClick={() => setCategoryId(category.id)} className={`shrink-0 rounded-full px-4 py-2 text-xs font-bold transition ${categoryId === category.id ? 'bg-[#1B4332] text-white' : 'bg-[#F1F5F2] text-zinc-700 hover:bg-emerald-100'}`}>{category.name}</button>)}</div>
      <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-[1fr_1fr_auto]">
        <label className="grid gap-1 text-xs font-semibold text-zinc-600"><span>Chi phí</span><select value={costFilter} onChange={(event) => setCostFilter(event.target.value)} className="rounded-lg border border-zinc-200 bg-white px-3 py-2.5 text-sm font-medium text-zinc-800"><option value="all">Mọi trạng thái</option><option value="known">Có giá đã xác minh</option><option value="unknown">Chưa có giá xác minh</option></select></label>
        <label className="grid gap-1 text-xs font-semibold text-zinc-600"><span>Thời lượng</span><select value={durationFilter} onChange={(event) => setDurationFilter(event.target.value)} className="rounded-lg border border-zinc-200 bg-white px-3 py-2.5 text-sm font-medium text-zinc-800"><option value="all">Mọi thời lượng</option><option value="short">Tối đa 2 giờ</option><option value="medium">Tối đa 4 giờ</option></select></label>
        <label className="flex items-center gap-2 self-end rounded-lg border border-zinc-200 px-3 py-2.5 text-sm font-semibold text-zinc-700"><input type="checkbox" checked={familyOnly} onChange={(event) => setFamilyOnly(event.target.checked)} className="accent-[#1B4332]" />Đã xác minh phù hợp trẻ em</label>
      </div>
      <p className="mt-3 text-xs leading-5 text-zinc-500">Bộ lọc giá, thời lượng và trẻ em chỉ tính dữ liệu có trạng thái xác minh. Hiện nhiều thông tin còn trống.</p>
    </div>

    <div className="mt-6 flex flex-wrap items-center justify-between gap-3"><p className="text-sm text-zinc-600"><strong className="text-zinc-900">{filtered.length}</strong> địa điểm phù hợp với bộ lọc</p><div className="inline-flex rounded-xl border border-zinc-200 bg-white p-1"><button type="button" aria-pressed={view === 'list'} onClick={() => setView('list')} className={`inline-flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-bold ${view === 'list' ? 'bg-[#1B4332] text-white' : 'text-zinc-600'}`}><List size={15} /> Danh sách</button><button type="button" aria-pressed={view === 'map'} onClick={() => setView('map')} className={`inline-flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-bold ${view === 'map' ? 'bg-[#1B4332] text-white' : 'text-zinc-600'}`}><MapIcon size={15} /> Bản đồ</button></div></div>

    {view === 'map' ? <div className="mt-4 grid gap-4 lg:grid-cols-[.8fr_1.2fr]"><div className="max-h-[560px] space-y-3 overflow-y-auto pr-1">{filtered.map((place) => <button key={place.id} type="button" onClick={() => setSelectedId(place.id)} aria-pressed={selectedId === place.id} className={`w-full rounded-xl border bg-white p-4 text-left transition ${selectedId === place.id ? 'border-[#E76F51] ring-2 ring-[#E76F51]/20' : 'border-zinc-200 hover:border-emerald-300'}`}><span className="text-xs font-bold text-[#40916C]">{getCategory(place.primaryCategory)?.name}</span><span className="mt-1 block font-extrabold text-[#1B4332]">{place.name}</span><span className="mt-1 block text-xs text-zinc-500">{place.coordinates && place.coordinateStatus === 'verified' ? 'Có vị trí đã xác minh' : 'Chưa có tọa độ xác minh; chưa ghim trên bản đồ'}</span></button>)}{!filtered.length && <EmptyResults />}</div><VerifiedPlaceMap places={filtered} selectedId={selectedId} onSelect={setSelectedId} /></div> : <div className="mt-4 grid gap-5 md:grid-cols-2 xl:grid-cols-3">{filtered.map((place) => <PlaceCard key={place.id} place={place} category={getCategory(place.primaryCategory)!} />)}{!filtered.length && <div className="md:col-span-2 xl:col-span-3"><EmptyResults /></div>}</div>}
    {unplacedActivities.length > 0 && <section className="mt-8 rounded-2xl border border-dashed border-orange-300 bg-orange-50/60 p-5"><p className="text-xs font-bold uppercase tracking-wide text-orange-800">Hoạt động chưa có địa điểm cụ thể</p><div className="mt-3 grid gap-3 sm:grid-cols-2">{unplacedActivities.map((item) => <article key={item.id} className="rounded-xl bg-white p-4"><h3 className="font-bold text-[#1B4332]">{item.name}</h3><p className="mt-2 text-sm leading-6 text-zinc-600">{item.activities.join(' ')}</p><p className="mt-2 text-xs text-zinc-500">Chưa có hộ cụ thể; không ghim bản đồ, không xếp tuyến và không nhận đặt dịch vụ.</p>{item.evidence.sourceIds.map((sourceId) => { const source = sourcesData.find((candidate) => candidate.id === sourceId); return source ? <a key={source.id} href={source.sourceUrl} target="_blank" rel="noopener noreferrer" className="mt-2 inline-block text-xs font-bold text-[#1B4332] underline">Nguồn: {source.publisher}</a> : null; })}</article>)}</div></section>}
  </div>;
}

function EmptyResults() {
  return <div className="rounded-2xl border border-dashed border-zinc-300 bg-white p-8 text-center"><SlidersHorizontal className="mx-auto text-[#40916C]" /><h3 className="mt-3 font-bold text-[#1B4332]">Chưa có địa điểm khớp điều kiện</h3><p className="mt-1 text-sm text-zinc-600">Thử đổi từ khóa hoặc nới bộ lọc. Dữ liệu chưa xác minh không được tự điền để tạo kết quả.</p></div>;
}
