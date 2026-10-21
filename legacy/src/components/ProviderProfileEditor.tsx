'use client';

import { useEffect, useState } from 'react';
import { Save, Trees } from 'lucide-react';
import type { ProviderProfile } from '@/types';

export default function ProviderProfileEditor({ profile, onSaved }: {
  profile: ProviderProfile | null;
  onSaved: () => void;
}) {
  const [name, setName] = useState(profile?.name ?? '');
  const [story, setStory] = useState(profile?.story ?? '');
  const [contact, setContact] = useState(profile?.contact ?? '');
  const [address, setAddress] = useState(profile?.address ?? '');
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    setName(profile?.name ?? '');
    setStory(profile?.story ?? '');
    setContact(profile?.contact ?? '');
    setAddress(profile?.address ?? '');
  }, [profile]);

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setBusy(true);
    setMessage('');
    setError('');
    try {
      const response = await fetch('/api/auth/me', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, story, contact, address }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'Không lưu được hồ sơ.');
      setMessage(result.message || 'Đã lưu hồ sơ nhà vườn.');
      onSaved();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'Không lưu được hồ sơ.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <form onSubmit={submit} className="mx-auto max-w-3xl space-y-5 rounded-3xl border border-amber-200 bg-white p-5 shadow-sm sm:p-7">
      <div className="flex items-start gap-3">
        <span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-amber-100 text-amber-800"><Trees className="h-5 w-5" /></span>
        <div>
          <h2 className="text-lg font-bold text-zinc-900">{profile ? 'Hồ sơ nhà vườn' : 'Tạo hồ sơ nhà vườn'}</h2>
          <p className="mt-1 text-xs leading-relaxed text-zinc-600">Thông tin này xuất hiện cùng dịch vụ để khách biết ai đón tiếp và liên hệ ở đâu.</p>
        </div>
      </div>

      {profile && !profile.active && <p className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-xs leading-relaxed text-amber-950">Hồ sơ đang chờ quản trị viên kích hoạt. Bạn vẫn có thể chuẩn bị dịch vụ và lịch; khách chỉ thấy các mục đã được duyệt, xác minh.</p>}
      {error && <p role="alert" className="rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs text-rose-900">{error}</p>}
      {message && <p role="status" className="rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-xs text-emerald-900">{message}</p>}

      <div className="grid gap-4 sm:grid-cols-2">
        <label className="text-xs font-semibold text-zinc-700">Tên nhà vườn / đơn vị
          <input value={name} onChange={(event) => setName(event.target.value)} minLength={2} maxLength={100} required className="mt-1 w-full rounded-xl border border-zinc-300 px-3 py-2.5 text-sm" />
        </label>
        <label className="text-xs font-semibold text-zinc-700">Số điện thoại / liên hệ
          <input value={contact} onChange={(event) => setContact(event.target.value)} minLength={6} maxLength={100} required className="mt-1 w-full rounded-xl border border-zinc-300 px-3 py-2.5 text-sm" />
        </label>
        <label className="text-xs font-semibold text-zinc-700 sm:col-span-2">Địa chỉ
          <input value={address} onChange={(event) => setAddress(event.target.value)} minLength={5} maxLength={200} required className="mt-1 w-full rounded-xl border border-zinc-300 px-3 py-2.5 text-sm" />
        </label>
        <label className="text-xs font-semibold text-zinc-700 sm:col-span-2">Câu chuyện và cách đón khách (20–3.000 ký tự)
          <textarea value={story} onChange={(event) => setStory(event.target.value)} minLength={20} maxLength={3000} required rows={5} className="mt-1 w-full rounded-xl border border-zinc-300 px-3 py-2.5 text-sm leading-relaxed" />
        </label>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-zinc-100 pt-4">
        <p className="text-[11px] text-zinc-500">Mã hồ sơ: {profile?.code ?? 'sẽ được tạo khi lưu'}</p>
        <button disabled={busy} className="inline-flex items-center gap-2 rounded-xl bg-amber-700 px-4 py-2.5 text-xs font-bold text-white hover:bg-amber-800 disabled:opacity-50"><Save className="h-4 w-4" />{busy ? 'Đang lưu…' : 'Lưu hồ sơ'}</button>
      </div>
    </form>
  );
}
