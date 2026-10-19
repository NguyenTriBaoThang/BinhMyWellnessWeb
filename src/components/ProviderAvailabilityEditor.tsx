'use client';

import { useEffect, useMemo, useState } from 'react';
import { CalendarCheck } from 'lucide-react';
import type { Service } from '@/types';

function localDateAfter(days: number): string {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

export default function ProviderAvailabilityEditor({ service }: { service: Service }) {
  const [date, setDate] = useState(localDateAfter(2));
  const [slots, setSlots] = useState<string[]>([]);
  const [capacity, setCapacity] = useState(service.capacity);
  const [note, setNote] = useState('');
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);
  const [loadingDate, setLoadingDate] = useState(false);
  const availableCapacity = useMemo(() => Math.min(service.capacity, Math.max(1, capacity)), [service.capacity, capacity]);

  useEffect(() => {
    setLoadingDate(true);
    fetch(`/api/services/${service.id}/availability?date=${encodeURIComponent(date)}`, { cache: 'no-store' })
      .then((response) => response.ok ? response.json() : null)
      .then((data) => {
        const rows = data?.availability || [];
        setSlots(rows.filter((row: { status: string }) => row.status === 'AVAILABLE').map((row: { slot: string }) => row.slot));
        if (rows.find((row: { capacity: number | null }) => row.capacity !== null)?.capacity) {
          setCapacity(rows.find((row: { capacity: number | null }) => row.capacity !== null).capacity);
        }
      })
      .catch(() => setSlots([]))
      .finally(() => setLoadingDate(false));
  }, [service.id, date]);

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setBusy(true);
    setMessage('');
    try {
      const response = await fetch(`/api/services/${service.id}/availability`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ date, slots, capacity: availableCapacity, sourceNote: note }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'Không thể cập nhật lịch.');
      setMessage(`Đã lưu ${slots.length} khung giờ. Quản trị viên cần xác minh trước khi khách thấy lịch.`);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Không thể cập nhật lịch.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <form onSubmit={submit} className="space-y-3 rounded-2xl border border-river-100 bg-river-50/60 p-4">
      <div className="flex items-center gap-2 text-sm font-bold text-river-950">
        <CalendarCheck className="h-4 w-4" /> Cập nhật lịch trống
      </div>
      <label className="block text-xs font-semibold text-zinc-700">
        Ngày
        <input type="date" value={date} min={localDateAfter(0)} onChange={(event) => setDate(event.target.value)} className="mt-1 w-full rounded-lg border border-zinc-300 bg-white px-2.5 py-2" required />
      </label>
      <fieldset disabled={loadingDate} className="flex flex-wrap gap-2">
        <legend className="mb-1 text-xs font-semibold text-zinc-700">Ca có thể phục vụ</legend>
        {loadingDate && <span className="text-xs text-zinc-500">Đang tải lịch hiện có…</span>}
        {!loadingDate && service.slots.map((slot) => (
          <label key={slot} className="flex items-center gap-1 rounded-lg border border-zinc-200 bg-white px-2 py-1 text-xs">
            <input type="checkbox" checked={slots.includes(slot)} onChange={(event) => setSlots((current) => event.target.checked ? [...current, slot] : current.filter((value) => value !== slot))} />
            {slot}
          </label>
        ))}
      </fieldset>
      <label className="block text-xs font-semibold text-zinc-700">
        Sức chứa tối đa
        <input type="number" min={1} max={service.capacity} value={capacity} onChange={(event) => setCapacity(Number(event.target.value))} className="mt-1 w-full rounded-lg border border-zinc-300 bg-white px-2.5 py-2" />
      </label>
      <input value={note} onChange={(event) => setNote(event.target.value)} maxLength={200} placeholder="Ghi chú nguồn lịch (tùy chọn)" className="w-full rounded-lg border border-zinc-300 bg-white px-2.5 py-2 text-xs" />
      <button disabled={busy || loadingDate || service.status !== 'PUBLISHED'} className="rounded-lg bg-river-800 px-3 py-2 text-xs font-bold text-white disabled:opacity-50">
        {busy ? 'Đang lưu…' : 'Lưu lịch ngày này'}
      </button>
      {message && <p role="status" className="text-xs leading-relaxed text-zinc-700">{message}</p>}
    </form>
  );
}
