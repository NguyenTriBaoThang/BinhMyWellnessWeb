'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { UserPlus, AlertCircle, Trees } from 'lucide-react';

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [accountType, setAccountType] = useState<'CUSTOMER' | 'PROVIDER'>('CUSTOMER');
  const [providerName, setProviderName] = useState('');
  const [providerStory, setProviderStory] = useState('');
  const [providerContact, setProviderContact] = useState('');
  const [providerAddress, setProviderAddress] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name, email, phone, password, role: accountType,
          ...(accountType === 'PROVIDER' ? {
            provider: { name: providerName, story: providerStory, contact: providerContact, address: providerAddress },
          } : {}),
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Đăng ký không thành công');
      if (accountType === 'PROVIDER') setSuccess(data.message || 'Đã gửi hồ sơ nhà vườn.');
      else router.push('/login');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <div className="max-w-md w-full bg-white rounded-3xl p-6 sm:p-8 shadow-xl border border-emerald-100 space-y-6">
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-forest-700 text-white flex items-center justify-center mx-auto shadow-md">
            <UserPlus className="w-6 h-6" />
          </div>
          <h1 className="text-2xl font-black text-forest-950 tracking-tight">
            Tạo Tài Khoản Mới
          </h1>
          <p className="text-xs text-zinc-500">
            Tạo tài khoản khách hàng hoặc bắt đầu hồ sơ nhà vườn Bình Mỹ.
          </p>
        </div>

        {success ? (
          <div role="status" className="space-y-4 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-950">
            <div className="flex items-start gap-2"><Trees className="mt-0.5 h-5 w-5 shrink-0" /><p>{success}</p></div>
            <Link href="/login" className="inline-flex rounded-xl bg-forest-800 px-4 py-2.5 text-sm font-bold text-white">Đăng nhập để tiếp tục</Link>
          </div>
        ) : (
        <form onSubmit={handleRegister} className="space-y-4">
          {error && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
              <span>{error}</span>
            </div>
          )}

          <div>
            <label className="mb-1 block text-xs font-semibold text-zinc-700">Bạn muốn tham gia với vai trò</label>
            <select value={accountType} onChange={(e) => setAccountType(e.target.value as 'CUSTOMER' | 'PROVIDER')} className="w-full rounded-xl border border-zinc-300 bg-white px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-forest-500">
              <option value="CUSTOMER">Khách hàng</option>
              <option value="PROVIDER">Nhà vườn / đơn vị trải nghiệm</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-700 mb-1">
              Họ và tên
            </label>
            <input
              type="text"
              autoComplete="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              placeholder="Nguyễn Văn A"
              className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-300 text-sm focus:outline-none focus:ring-2 focus:ring-forest-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-700 mb-1">
              Email đăng nhập
            </label>
            <input
              type="email"
              autoComplete="username"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="name@example.com"
              className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-300 text-sm focus:outline-none focus:ring-2 focus:ring-forest-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-700 mb-1">
              Số điện thoại
            </label>
            <input
              type="tel"
              autoComplete="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              required
              placeholder="0901234567"
              className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-300 text-sm focus:outline-none focus:ring-2 focus:ring-forest-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-700 mb-1">
              Mật khẩu
            </label>
            <input
              type="password"
              autoComplete="new-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              minLength={8}
              required
              className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-300 text-sm focus:outline-none focus:ring-2 focus:ring-forest-500 font-mono"
            />
          </div>

          {accountType === 'PROVIDER' && (
            <div className="space-y-3 rounded-2xl border border-amber-200 bg-amber-50/70 p-4">
              <div className="flex items-center gap-2 text-sm font-bold text-amber-950"><Trees className="h-4 w-4" /> Hồ sơ nhà vườn</div>
              <label className="block text-xs font-semibold text-zinc-700">Tên nhà vườn / đơn vị
                <input value={providerName} onChange={(e) => setProviderName(e.target.value)} minLength={2} maxLength={100} required className="mt-1 w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm" placeholder="Ví dụ: Vườn sinh thái Bình Mỹ" />
              </label>
              <label className="block text-xs font-semibold text-zinc-700">Giới thiệu (ít nhất 20 ký tự)
                <textarea value={providerStory} onChange={(e) => setProviderStory(e.target.value)} minLength={20} maxLength={3000} required rows={3} className="mt-1 w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm" placeholder="Giới thiệu vườn, hoạt động và cách gia đình đón khách…" />
              </label>
              <label className="block text-xs font-semibold text-zinc-700">Số điện thoại / thông tin liên hệ
                <input value={providerContact} onChange={(e) => setProviderContact(e.target.value)} minLength={6} maxLength={100} required className="mt-1 w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm" placeholder="Số điện thoại liên hệ khách" />
              </label>
              <label className="block text-xs font-semibold text-zinc-700">Địa chỉ nhà vườn
                <input value={providerAddress} onChange={(e) => setProviderAddress(e.target.value)} minLength={5} maxLength={200} required className="mt-1 w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm" placeholder="Ấp, xã Bình Mỹ, Củ Chi" />
              </label>
              <p className="text-[11px] leading-relaxed text-amber-900">Hồ sơ mới cần quản trị viên kích hoạt trước khi được hiển thị công khai.</p>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl bg-forest-700 hover:bg-forest-800 text-white font-bold text-sm shadow-md shadow-forest-700/20 disabled:opacity-60 transition-all"
          >
            {loading ? 'Đang gửi...' : accountType === 'PROVIDER' ? 'Tạo hồ sơ nhà vườn' : 'Tạo tài khoản'}
          </button>
        </form>
        )}

        <div className="text-center text-xs text-zinc-500">
          Đã có tài khoản?{' '}
          <Link href="/login" className="text-forest-700 font-bold hover:underline">
            Đăng nhập ngay
          </Link>
        </div>
      </div>
    </div>
  );
}
