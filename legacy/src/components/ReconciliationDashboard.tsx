'use client';

import { useCallback, useEffect, useState } from 'react';
import { formatVND } from '@/lib/utils';

type ReconciliationRow = {
  id: string;
  code: string;
  date: string;
  netReceivedVnd: number | null;
  platformFeeVnd: number | null;
  feeRecordedAt: string | null;
  feePaidAt: string | null;
  total: number;
  customerName: string;
  service: { name: string };
  provider: { name: string };
};

export default function ReconciliationDashboard() {
  const [rows, setRows] = useState<ReconciliationRow[]>([]);
  const [totals, setTotals] = useState({ netReceivedVnd: 0, feeRecordedVnd: 0, feeUnpaidVnd: 0, unrecordedCount: 0 });
  const [amounts, setAmounts] = useState<Record<string, string>>({});
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState<string | null>(null);

  const load = useCallback(async () => {
    const response = await fetch('/api/reconciliation', { cache: 'no-store' });
    const result = await response.json();
    if (!response.ok) throw new Error(result.error || 'Could not load reconciliation data.');
    setRows(result.bookings);
    setTotals(result.totals);
    setAmounts(Object.fromEntries(result.bookings.map((row: ReconciliationRow) => [row.id, String(row.netReceivedVnd ?? '')])));
  }, []);

  useEffect(() => { load().catch((error) => setMessage(error.message)); }, [load]);

  const action = async (id: string, type: 'record' | 'mark_paid') => {
    setBusy(id);
    setMessage('');
    try {
      const response = await fetch(`/api/bookings/${id}/reconciliation`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(type === 'record' ? { action: type, netReceivedVnd: Number(amounts[id]) } : { action: type }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'Could not update reconciliation.');
      await load();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Could not update reconciliation.');
    } finally {
      setBusy(null);
    }
  };

  return (
    <section className="space-y-5">
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {[
          ['Kho\u1ea3n thu r\u00f2ng \u0111\u00e3 ghi nh\u1eadn', totals.netReceivedVnd],
          ['Ph\u00ed 8% \u0111\u00e3 \u0111\u1ed1i so\u00e1t', totals.feeRecordedVnd],
          ['Ph\u00ed ch\u1edd x\u00e1c nh\u1eadn \u0111\u00e3 thu', totals.feeUnpaidVnd],
          ['\u0110\u01a1n ho\u00e0n t\u1ea5t ch\u01b0a ghi nh\u1eadn', totals.unrecordedCount],
        ].map(([label, value], index) => (
          <div key={String(label)} className="rounded-2xl border border-zinc-200 bg-white p-4">
            <p className="text-xs text-zinc-600">{label}</p>
            <p className="mt-2 text-xl font-black text-forest-900">
              {index === 3 ? value : typeof value === 'number' ? formatVND(value) : value}
            </p>
          </div>
        ))}
      </div>
      <p className="rounded-xl border border-blue-200 bg-blue-50 p-3 text-xs text-blue-950">
        {'Nh\u00e0 v\u01b0\u1eddn khai b\u00e1o kho\u1ea3n thu r\u00f2ng c\u1ee7a c\u00e1c \u0111\u01a1n \u0111\u00e3 ho\u00e0n t\u1ea5t. X\u00e1c nh\u1eadn thu ph\u00ed \u0111\u01b0\u1ee3c ghi ri\u00eang; h\u1ec7 th\u1ed1ng kh\u00f4ng chuy\u1ec3n ti\u1ec1n.'}
      </p>
      {message && <p role="status" className="rounded-xl bg-amber-50 p-3 text-sm text-amber-900">{message}</p>}
      <div className="space-y-3">
        {rows.map((row) => (
          <article key={row.id} className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm">
            <div className="flex flex-wrap items-start justify-between gap-2">
              <div>
                <p className="font-mono text-xs font-bold text-zinc-500">{row.code} {'\u00b7'} {row.date}</p>
                <h3 className="mt-1 font-bold text-zinc-900">{row.service.name}</h3>
                <p className="text-xs text-zinc-600">{row.provider.name} {'\u00b7'} {row.customerName}</p>
              </div>
              <p className="text-sm font-bold text-forest-900">
                {row.platformFeeVnd === null ? 'Ch\u01b0a \u0111\u1ed1i so\u00e1t' : `Ph\u00ed ${formatVND(row.platformFeeVnd)}`}
              </p>
            </div>
            <div className="mt-3 flex flex-wrap items-end gap-2">
              {row.feeRecordedAt === null && (
                <>
                  <label className="text-xs font-semibold text-zinc-700">
                    {'Kho\u1ea3n thu r\u00f2ng (VND)'}
                    <input
                      type="number"
                      min="0"
                      max="1000000000"
                      step="1"
                      value={amounts[row.id] ?? ''}
                      onChange={(event) => setAmounts((current) => ({ ...current, [row.id]: event.target.value }))}
                      className="mt-1 block rounded-lg border border-zinc-300 px-3 py-2"
                    />
                  </label>
                  <button onClick={() => action(row.id, 'record')} disabled={busy === row.id} className="rounded-lg bg-forest-800 px-3 py-2 text-xs font-bold text-white">
                    {'Ghi nh\u1eadn ph\u00ed 8%'}
                  </button>
                </>
              )}
              {row.feeRecordedAt && !row.feePaidAt && (
                <button onClick={() => action(row.id, 'mark_paid')} disabled={busy === row.id} className="rounded-lg bg-emerald-700 px-3 py-2 text-xs font-bold text-white">
                  {'X\u00e1c nh\u1eadn \u0111\u00e3 thu ph\u00ed'}
                </button>
              )}
              {row.feePaidAt && <span className="text-xs font-semibold text-emerald-800">{'\u0110\u00e3 x\u00e1c nh\u1eadn thu ng\u00e0y'} {new Date(row.feePaidAt).toLocaleDateString('vi-VN')}</span>}
              {row.netReceivedVnd !== null && <span className="text-xs text-zinc-600">{'Thu r\u00f2ng:'} {formatVND(row.netReceivedVnd)}</span>}
            </div>
          </article>
        ))}
        {!rows.length && <p className="rounded-2xl border border-dashed border-zinc-300 bg-white p-8 text-center text-sm text-zinc-500">{'Ch\u01b0a c\u00f3 \u0111\u01a1n ho\u00e0n t\u1ea5t.'}</p>}
      </div>
    </section>
  );
}
