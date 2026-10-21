'use client';

import { useEffect, useState } from 'react';
import { Heart, MapPinned } from 'lucide-react';
import { emptyLocalData, readLocalData, writeLocalData, type LocalData } from '@/lib/storage/local-data';

export default function LocalPlaceActions({ placeId }: { placeId: string }) {
  const [data, setData] = useState<LocalData>(emptyLocalData());
  const [status, setStatus] = useState('');
  useEffect(() => { setData(readLocalData().data); }, []);
  const update = (kind: 'favoritePlaceIds' | 'visitedPlaceIds') => {
    const next = { ...data, [kind]: data[kind].includes(placeId) ? data[kind].filter((id) => id !== placeId) : [...data[kind], placeId] };
    const result = writeLocalData(next);
    if (result.ok) setData(next);
    setStatus(result.message);
  };
  const favorite = data.favoritePlaceIds.includes(placeId);
  const visited = data.visitedPlaceIds.includes(placeId);
  return <div><div className="flex flex-wrap gap-2"><button type="button" aria-pressed={favorite} onClick={() => update('favoritePlaceIds')} className={`inline-flex items-center gap-2 rounded-xl px-4 py-3 text-sm font-bold ${favorite ? 'bg-rose-50 text-rose-700' : 'border border-zinc-200 bg-white text-zinc-700'}`}><Heart size={16} fill={favorite ? 'currentColor' : 'none'} />{favorite ? 'Đã lưu yêu thích' : 'Lưu yêu thích'}</button><button type="button" aria-pressed={visited} onClick={() => update('visitedPlaceIds')} className={`inline-flex items-center gap-2 rounded-xl px-4 py-3 text-sm font-bold ${visited ? 'bg-emerald-100 text-[#1B4332]' : 'border border-zinc-200 bg-white text-zinc-700'}`}><MapPinned size={16} />{visited ? 'Bạn đã đánh dấu đã trải nghiệm' : 'Tự đánh dấu đã trải nghiệm'}</button></div><p className="mt-2 text-xs text-zinc-500">Các lựa chọn này chỉ lưu trên thiết bị hiện tại; dấu đã trải nghiệm không phải check-in xác thực.</p>{status && <p role="status" className="mt-2 text-xs text-zinc-600">{status}</p>}</div>;
}
