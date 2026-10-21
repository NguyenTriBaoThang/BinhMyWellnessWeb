'use client';

import { useEffect, useState } from 'react';
import type { Service } from '@/types';

function defaultDate(): string {
  const date = new Date();
  date.setDate(date.getDate() + 2);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

export default function AdminVerificationPanel({ service, onSaved }: { service: Service; onSaved: () => void }) {
  const [serviceVerified, setServiceVerified] = useState(false);
  const [locationVerified, setLocationVerified] = useState(false);
  const [latitude, setLatitude] = useState<number | string>(service.latitude ?? 10.96);
  const [longitude, setLongitude] = useState<number | string>(service.longitude ?? 106.64);
  const [date, setDate] = useState(defaultDate());
  const [slots, setSlots] = useState<string[]>([]);
  const [openSlots, setOpenSlots] = useState<string[]>([]);
  const [status, setStatus] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    setSlots([]);
    fetch(`/api/services/${service.id}/availability?date=${encodeURIComponent(date)}`, { cache: 'no-store' })
      .then((response) => response.ok ? response.json() : null)
      .then((data) => setOpenSlots((data?.availability || []).filter((item: { status: string }) => item.status === 'AVAILABLE').map((item: { slot: string }) => item.slot)))
      .catch(() => setOpenSlots([]));
  }, [service.id, date]);

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setBusy(true);
    setStatus('');
    try {
      const response = await fetch(`/api/services/${service.id}/verification`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          serviceVerified: serviceVerified ? true : undefined,
          locationVerified: locationVerified ? true : undefined,
          latitude: Number(latitude),
          longitude: Number(longitude),
          areaCode: 'BINH_MY',
          availability: slots.map((slot) => ({ date, slot })),
        }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'Không thể xác minh dữ liệu.');
      setStatus(`Đã cập nhật xác minh; ${result.verifiedAvailabilityCount} ca trống được xác nhận.`);
      setSlots([]);
      onSaved();
    } catch (error) {
      setStatus(error instanceof Error ? error.message : 'Không thể xác minh dữ liệu.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <form onSubmit={submit} className="mt-4 w-full space-y-3 rounded-2xl border border-amber-200 bg-amber-50/70 p-4">
      <div>
        <h4 className="text-sm font-bold text-amber-950">Xác minh dữ liệu lập lịch</h4>
        <p className="mt-1 text-xs leading-relaxed text-amber-900">Chỉ đánh dấu sau khi đối chiếu trực tiếp với nhà vườn và nguồn tọa độ. Tọa độ mẫu cần được kiểm tra.</p>
      </div>
      <label className="flex items-center gap-2 text-xs font-semibold text-zinc-800">
        <input type="checkbox" checked={serviceVerified} onChange={(event) => setServiceVerified(event.target.checked)} /> Tôi đã xác nhận nội dung dịch vụ với nhà vườn
      </label>
      <label className="flex items-center gap-2 text-xs font-semibold text-zinc-800">
        <input type="checkbox" checked={locationVerified} onChange={(event) => setLocationVerified(event.target.checked)} /> Tôi đã đối chiếu tọa độ và khu vực Bình Mỹ
      </label>
      <div className="grid grid-cols-2 gap-2">
        <label className="text-xs font-semibold text-zinc-700">Vĩ độ<input type="number" step="any" value={latitude} onChange={(event) => setLatitude(event.target.value)} className="mt-1 w-full rounded-lg border border-zinc-300 bg-white px-2.5 py-2" /></label>
        <label className="text-xs font-semibold text-zinc-700">Kinh độ<input type="number" step="any" value={longitude} onChange={(event) => setLongitude(event.target.value)} className="mt-1 w-full rounded-lg border border-zinc-300 bg-white px-2.5 py-2" /></label>
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <label className="text-xs font-semibold text-zinc-700">Ngày lịch<input type="date" value={date} onChange={(event) => setDate(event.target.value)} className="mt-1 block rounded-lg border border-zinc-300 bg-white px-2.5 py-2" /></label>
        <div className="flex flex-wrap gap-2 pt-4">
          {openSlots.map((slot) => <label key={slot} className="flex items-center gap-1 rounded-lg border border-zinc-200 bg-white px-2 py-1 text-xs"><input type="checkbox" checked={slots.includes(slot)} onChange={(event) => setSlots((current) => event.target.checked ? [...current, slot] : current.filter((value) => value !== slot))} />{slot}</label>)}
          {!openSlots.length && <span className="pt-5 text-xs text-zinc-500">Nhà vườn chưa mở ca trống ngày này.</span>}
        </div>
      </div>
      <button disabled={busy || (!serviceVerified && !locationVerified && slots.length === 0)} className="rounded-lg bg-amber-800 px-3 py-2 text-xs font-bold text-white disabled:opacity-50">{busy ? 'Đang lưu…' : 'Lưu xác minh'}</button>
      {status && <p role="status" className="text-xs text-zinc-700">{status}</p>}
    </form>
  );
}
