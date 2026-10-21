'use client';

import { ChangeEvent, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { Download, FileUp, Trash2 } from 'lucide-react';
import PlaceCard from '@/components/PlaceCard';
import { getCategory, placesData } from '@/lib/data/repository';
import { downloadJson, emptyLocalData, parseLocalDataJson, readLocalData, writeLocalData, type LocalData } from '@/lib/storage/local-data';

export default function MyLocalPageV2() {
  const [data, setData] = useState<LocalData>(emptyLocalData());
  const [notice, setNotice] = useState('');
  useEffect(() => {
    const stored = readLocalData();
    setData(stored.data);
    if (stored.warning) setNotice(stored.warning);
  }, []);

  const favorites = useMemo(() => placesData.filter((place) => data.favoritePlaceIds.includes(place.id)), [data.favoritePlaceIds]);
  const visited = useMemo(() => placesData.filter((place) => data.visitedPlaceIds.includes(place.id)), [data.visitedPlaceIds]);
  const preferredCategories = new Set(favorites.flatMap((place) => [place.primaryCategory, ...place.secondaryCategories]));
  const suggestions = placesData.filter((place) => !data.visitedPlaceIds.includes(place.id)
    && (!preferredCategories.size || preferredCategories.has(place.primaryCategory) || place.secondaryCategories.some((id) => preferredCategories.has(id)))).slice(0, 3);

  const removeTrip = (id: string) => {
    const next = { ...data, itineraries: data.itineraries.filter((trip) => trip.id !== id) };
    const result = writeLocalData(next);
    if (result.ok) setData(next);
    setNotice(result.message);
  };

  const importData = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (file.size > 1_000_000) { setNotice('Tệp vượt giới hạn 1 MB.'); event.target.value = ''; return; }
    const parsed = parseLocalDataJson(await file.text());
    if (!parsed.data) { setNotice(`Không nhập được: ${parsed.error}`); event.target.value = ''; return; }
    const placeIds = new Set(placesData.map((place) => place.id));
    if (parsed.data.favoritePlaceIds.some((id) => !placeIds.has(id)) || parsed.data.visitedPlaceIds.some((id) => !placeIds.has(id))) {
      setNotice('JSON có mã địa điểm không có trong phiên bản website này. Dữ liệu cũ trên thiết bị vẫn được giữ.'); event.target.value = ''; return;
    }
    const result = writeLocalData(parsed.data);
    if (result.ok) setData(parsed.data);
    setNotice(result.ok ? 'Đã nhập dữ liệu cá nhân vào thiết bị này.' : result.message);
    event.target.value = '';
  };

  return <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
    <p className="text-xs font-bold uppercase tracking-[.18em] text-[#40916C]">Trên thiết bị này</p>
    <h1 className="mt-2 text-3xl font-black text-[#1B4332]">Hành trình của tôi</h1>
    <p className="mt-3 max-w-2xl text-sm leading-6 text-zinc-600">Yêu thích, dấu tự đánh dấu đã trải nghiệm và hành trình chỉ lưu trong trình duyệt này. Không có tài khoản hoặc đồng bộ giữa thiết bị.</p>
    {notice && <p role="status" className="mt-4 rounded-lg bg-amber-50 p-3 text-sm text-amber-900">{notice}</p>}
    <div className="mt-5 flex flex-wrap gap-2">
      <button type="button" onClick={() => downloadJson('binh-my-du-ky-du-lieu-tren-thiet-bi.json', data)} className="inline-flex items-center gap-2 rounded-lg bg-[#1B4332] px-4 py-2.5 text-sm font-bold text-white"><Download size={16} /> Xuất bản sao JSON</button>
      <label className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-zinc-200 bg-white px-4 py-2.5 text-sm font-bold text-zinc-700"><FileUp size={16} /> Nhập bản sao JSON<input type="file" accept="application/json,.json" onChange={importData} className="sr-only" /></label>
      <Link href="/itinerary" className="rounded-lg border border-zinc-200 bg-white px-4 py-2.5 text-sm font-bold text-zinc-700">Lập hành trình</Link>
    </div>
    <section className="mt-10">
      <h2 className="text-xl font-extrabold text-[#1B4332]">Hành trình đã lưu ({data.itineraries.length})</h2>
      {data.itineraries.length ? <div className="mt-4 grid gap-4 md:grid-cols-2">{data.itineraries.map((trip) => <article key={trip.id} className="rounded-2xl border border-zinc-200 bg-white p-5"><div className="flex items-start justify-between gap-3"><div><p className="text-xs font-bold text-[#40916C]">{trip.request.date}</p><h3 className="mt-1 font-extrabold text-[#1B4332]">{trip.title}</h3></div><button type="button" onClick={() => removeTrip(trip.id)} aria-label="Xóa hành trình đã lưu" className="rounded-lg p-2 text-zinc-500 hover:bg-rose-50 hover:text-rose-700"><Trash2 size={17} /></button></div><ol className="mt-3 space-y-2 text-sm text-zinc-700">{trip.options[0]?.stops.map((stop, index) => <li key={`${stop.experienceId}-${index}`}>{stop.arrivalTime} · {stop.name}</li>)}</ol><div className="mt-4 flex items-center justify-between gap-3"><p className="text-xs text-zinc-500">Lưu trên thiết bị · chưa gửi yêu cầu đến nhà vườn</p><Link href={`/itinerary?load=${encodeURIComponent(trip.id)}`} className="shrink-0 rounded-lg bg-[#1B4332] px-3 py-2 text-xs font-bold text-white">Mở lại</Link></div></article>)}</div> : <p className="mt-3 rounded-xl bg-white p-5 text-sm text-zinc-600">Bạn chưa lưu hành trình nào trên thiết bị này.</p>}
    </section>
    <section className="mt-10"><h2 className="text-xl font-extrabold text-[#1B4332]">Yêu thích ({favorites.length})</h2>{favorites.length ? <div className="mt-4 grid gap-5 md:grid-cols-2 xl:grid-cols-3">{favorites.map((place) => <PlaceCard key={place.id} place={place} category={getCategory(place.primaryCategory)!} />)}</div> : <p className="mt-3 rounded-xl bg-white p-5 text-sm text-zinc-600">Chưa có địa điểm yêu thích.</p>}</section>
    <section className="mt-10"><h2 className="text-xl font-extrabold text-[#1B4332]">Tự đánh dấu đã trải nghiệm ({visited.length})</h2>{visited.length ? <ul className="mt-4 grid gap-3 sm:grid-cols-2">{visited.map((place) => <li key={place.id} className="rounded-xl border border-zinc-200 bg-white p-4"><Link href={`/experiences/${place.slug}`} className="font-bold text-[#1B4332] hover:underline">{place.name}</Link><p className="mt-1 text-xs text-zinc-500">Dấu cá nhân trên thiết bị; website không xác minh lượt ghé thăm.</p></li>)}</ul> : <p className="mt-3 rounded-xl bg-white p-5 text-sm text-zinc-600">Chưa có dấu cá nhân nào.</p>}</section>
    {suggestions.length > 0 && <section className="mt-10"><h2 className="text-xl font-extrabold text-[#1B4332]">Gợi ý lần sau</h2><p className="mt-1 text-sm text-zinc-600">Ưu tiên nhóm bạn đã lưu; dấu trải nghiệm ở đây do bạn tự đánh dấu.</p><div className="mt-4 grid gap-5 md:grid-cols-2 xl:grid-cols-3">{suggestions.map((place) => <PlaceCard key={place.id} place={place} category={getCategory(place.primaryCategory)!} />)}</div></section>}
  </section>;
}
