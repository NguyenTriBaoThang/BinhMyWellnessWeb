'use client';

import { useState } from 'react';
import { formatVND } from '@/lib/utils';
import type { Booking } from '@/types';

export default function BookingReconciliationForm({ booking }: { booking: Booking }) {
  const [net, setNet] = useState(String(booking.netReceivedVnd ?? ''));
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);

  const save = async (event: React.FormEvent) => {
    event.preventDefault();
    setBusy(true);
    setMessage('');
    try {
      const response = await fetch(`/api/bookings/${booking.id}/reconciliation`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'record', netReceivedVnd: Number(net) }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'Không lưu được đối soát.');
      setMessage(`Đã ghi nhận phí nền tảng 8%: ${formatVND(result.reconciliation.platformFeeVnd)}. Quản trị viên xác nhận khoản phí sau khi thu.`);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Không lưu được đối soát.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <form onSubmit={save} className="mt-3 rounded-2xl border border-amber-200 bg-amber-50 p-4">
      <p className="text-xs font-bold text-amber-950">Đối soát 8% trên khoản nhà vườn thực nhận</p>
      <div className="mt-2 flex flex-wrap items-end gap-2">
        <label className="min-w-48 flex-1 text-xs font-semibold text-zinc-700">Khoản thu ròng (VND)<input type="number" min="0" max="1000000000" step="1" required value={net} onChange={(event) => setNet(event.target.value)} className="mt-1 w-full rounded-lg border border-zinc-300 bg-white px-3 py-2" /></label>
        <button disabled={busy} className="rounded-lg bg-amber-800 px-3 py-2 text-xs font-bold text-white disabled:opacity-50">{busy ? 'Đang lưu…' : booking.feeRecordedAt ? 'Cập nhật đối soát' : 'Ghi nhận đối soát'}</button>
      </div>
      {booking.platformFeeVnd !== undefined && <p className="mt-2 text-xs text-zinc-700">Đã ghi nhận: {formatVND(booking.platformFeeVnd)}{booking.feePaidAt ? ' · đã xác nhận đã thu' : ' · chờ quản trị viên xác nhận đã thu'}</p>}
      {message && <p role="status" className="mt-2 text-xs text-zinc-700">{message}</p>}
    </form>
  );
}
