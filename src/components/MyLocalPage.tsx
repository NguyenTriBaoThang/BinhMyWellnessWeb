'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Download, Trash2 } from 'lucide-react';
import type { LocalData, SavedItinerary } from '@/lib/storage/local-data';
import { downloadJson, emptyLocalData, readLocalData, writeLocalData } from '@/lib/storage/local-data';
import { placesData } from '@/lib/data/repository';
import PlaceCard from '@/components/PlaceCard';
import { getCategory } from '@/lib/data/repository';

export default function MyLocalPage() {
  const [data, setData] = useState<LocalData>(emptyLocalData());
  const [notice, setNotice] = useState('');
  useEffect(() => {
    const result = readLocalData();
    setData(result.data);
    if (result.warning) setNotice(result.warning);
  }, []);
  const favorites = placesData.filter((place) => data.favoritePlaceIds.includes(place.id));
  const visited = placesData.filter((place) => data.visitedPlaceIds.includes(place.id));
  const removeTrip = (trip: SavedItinerary) => {
    const next = { ...data, itineraries: data.itineraries.filter((item) => item.id !== trip.id) };
    const result = writeLocalData(next);
    if (result.ok) setData(next);
    setNotice(result.message);
  };
  return <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8"><p className="text-xs font-bold uppercase tracking-[.18em] text-[#40916C]">Trên thiết bị này</p><h1 className="mt-2 text-3xl font-black text-[#1B4332]">Hành trình của tôi</h1><p className="mt-3 max-w-2xl text-sm leading-6 text-zinc-600">Yêu thích, dấu tự đánh dấu đã trải nghiệm và hành trình chỉ được lưu trong trình duyệt này. Chúng không đồng bộ sang thiết bị khác.</p>{notice && <p role="status" className="mt-4 rounded-lg bg-amber-50 p-3 text-sm text-amber-900">{notice}</p>}<div className="mt-6 flex flex-wrap gap-2"><button type="button" onClick={() => downloadJson('binh-my-du-ky-du-lieu-tren-thiet-bi.json', data)} className="inline-flex items-center gap-2 rounded-lg bg-[#1B4332] px-4 py-2.5 text-sm font-bold text-white"><Download size={16} /> Xuất dữ liệu JSON</button><Link href="/itinerary" className="rounded-lg border border-zinc-200 bg-white px-4 py-2.5 text-sm font-bold text-zinc-700">Lập hành trình</Link></div><section className="mt-10"><h2 className="text-xl font-extrabold text-[#1B4332]">Hành trình đã lưu ({data.itineraries.length})</h2>{data.itineraries.length ? <div className="mt-4 grid gap-4 md:grid-cols-2">{data.itineraries.map((trip) => <article key={trip.id} className="rounded-2xl border border-zinc-200 bg-white p-5"><div className="flex items-start justify-between gap-3"><div><p className="text-xs font-bold text-[#40916C]">{trip.request.date}</p><h3 className="mt-1 font-extrabold text-[#1B4332]">{trip.title}</h3></div><button type="button" onClick={() => removeTrip(trip)} aria-label="Xóa hành trình đã lưu" className="rounded-lg p-2 text-zinc-500 hover:bg-rose-50 hover:text-rose-700"><Trash2 size={17} /></button></div><ol className="mt-3 space-y-2 text-sm text-zinc-700">{trip.options[0]?.stops.map((stop, index) => <li key={`${stop.experienceId}-${index}`}>{stop.arrivalTime} · {stop.name}</li>)}</ol><p className="mt-3 text-xs text-zinc-500">Lưu trên thiết bị · chưa gửi yêu cầu đến nhà vườn</p></article>)}</div> : <p className="mt-3 rounded-xl bg-white p-5 text-sm text-zinc-600">Bạn chưa lưu hành trình nào trên thiết bị này.</p>}</section><section className="mt-10"><h2 className="text-xl font-extrabold text-[#1B4332]">Yêu thích ({favorites.length})</h2>{favorites.length ? <div className="mt-4 grid gap-5 md:grid-cols-2 xl:grid-cols-3">{favorites.map((place) => <PlaceCard key={place.id} place={place} category={getCategory(place.primaryCategory)!} />)}</div> : <p className="mt-3 rounded-xl bg-white p-5 text-sm text-zinc-600">Chưa có địa điểm yêu thích.</p>}</section><section className="mt-10"><h2 className="text-xl font-extrabold text-[#1B4332]">Tự đánh dấu đã trải nghiệm ({visited.length})</h2>{visited.length ? <ul className="mt-4 grid gap-3 sm:grid-cols-2">{visited.map((place) => <li key={place.id} className="rounded-xl border border-zinc-200 bg-white p-4"><Link href={`/experiences/${place.slug}`} className="font-bold text-[#1B4332] hover:underline">{place.name}</Link><p className="mt-1 text-xs text-zinc-500">Dấu cá nhân lưu trên thiết bị; website không xác minh lượt ghé thăm.</p></li>)}</ul> : <p className="mt-3 rounded-xl bg-white p-5 text-sm text-zinc-600">Chưa có dấu cá nhân nào.</p>}</section></section>;
}
