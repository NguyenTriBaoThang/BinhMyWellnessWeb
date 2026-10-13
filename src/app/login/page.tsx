'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { LogIn, Key, Shield, Trees, User, AlertCircle, CheckCircle2 } from 'lucide-react';
import { Role } from '@/types';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('baothang@gmail.com');
  const [password, setPassword] = useState('password@123');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Đăng nhập không thành công');

      // Redirect based on role
      if (data.user.role === 'ADMIN') router.push('/admin');
      else if (data.user.role === 'PROVIDER') router.push('/provider');
      else router.push('/customer');

      router.refresh();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const quickLoginAs = async (role: Role) => {
    setError(null);
    setLoading(true);
    try {
      const res = await fetch('/api/auth/switch-role', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Lỗi đăng nhập nhanh');

      if (role === 'ADMIN') router.push('/admin');
      else if (role === 'PROVIDER') router.push('/provider');
      else router.push('/customer');

      router.refresh();
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
          <div className="w-12 h-12 rounded-2xl bg-forest-700 text-white flex items-center justify-center mx-auto shadow-md shadow-forest-700/20">
            <LogIn className="w-6 h-6" />
          </div>
          <h1 className="text-2xl font-black text-forest-950 tracking-tight">
            Đăng Nhập Hệ Thống
          </h1>
          <p className="text-xs text-zinc-500">
            Bình Mỹ Wellness Web - Nền tảng du lịch miệt vườn Củ Chi
          </p>
        </div>

        {/* 1-Click Quick Demo Accounts Box */}
        <div className="bg-emerald-50/70 p-4 rounded-2xl border border-emerald-200/80 space-y-2.5">
          <div className="flex items-center justify-between text-xs font-bold text-emerald-900">
            <span className="flex items-center gap-1.5">
              <Key className="w-4 h-4 text-emerald-700" />
              Tài khoản mẫu được cấu hình:
            </span>
            <span className="font-mono text-[11px] text-amber-700 bg-amber-100/70 px-2 py-0.5 rounded">
              pass: password@123
            </span>
          </div>

          <div className="grid grid-cols-1 gap-2 pt-1">
            <button
              type="button"
              onClick={() => quickLoginAs('CUSTOMER')}
              className="flex items-center justify-between p-2.5 bg-white hover:bg-emerald-100/50 rounded-xl border border-emerald-200 text-left transition-all text-xs"
            >
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center">
                  <User className="w-4 h-4" />
                </div>
                <div>
                  <span className="font-bold text-zinc-900 block">Khách hàng: Bảo Thắng</span>
                  <span className="text-[11px] text-zinc-500 font-mono">baothang@gmail.com</span>
                </div>
              </div>
              <span className="text-[11px] font-semibold text-emerald-700">1-Chạm →</span>
            </button>

            <button
              type="button"
              onClick={() => quickLoginAs('PROVIDER')}
              className="flex items-center justify-between p-2.5 bg-white hover:bg-amber-100/50 rounded-xl border border-amber-200 text-left transition-all text-xs"
            >
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-amber-100 text-amber-800 flex items-center justify-center">
                  <Trees className="w-4 h-4" />
                </div>
                <div>
                  <span className="font-bold text-zinc-900 block">Chủ nhà vườn: Vườn Xanh A</span>
                  <span className="text-[11px] text-zinc-500 font-mono">nhavuona@gmail.com</span>
                </div>
              </div>
              <span className="text-[11px] font-semibold text-amber-700">1-Chạm →</span>
            </button>

            <button
              type="button"
              onClick={() => quickLoginAs('ADMIN')}
              className="flex items-center justify-between p-2.5 bg-white hover:bg-rose-100/50 rounded-xl border border-rose-200 text-left transition-all text-xs"
            >
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-rose-100 text-rose-800 flex items-center justify-center">
                  <Shield className="w-4 h-4" />
                </div>
                <div>
                  <span className="font-bold text-zinc-900 block">Ban quản trị hệ thống</span>
                  <span className="text-[11px] text-zinc-500 font-mono">binhmy@admin.com</span>
                </div>
              </div>
              <span className="text-[11px] font-semibold text-rose-700">1-Chạm →</span>
            </button>
          </div>
        </div>

        {/* Regular Login Form */}
        <form onSubmit={handleLogin} className="space-y-4">
          {error && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
              <span>{error}</span>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-zinc-700 mb-1">
              Địa chỉ Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-300 text-sm focus:outline-none focus:ring-2 focus:ring-forest-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-700 mb-1">
              Mật khẩu
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-300 text-sm focus:outline-none focus:ring-2 focus:ring-forest-500 font-mono"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl bg-forest-700 hover:bg-forest-800 text-white font-bold text-sm shadow-md shadow-forest-700/20 disabled:opacity-60 transition-all flex items-center justify-center gap-2"
          >
            {loading ? 'Đang xác thực...' : 'Đăng nhập'}
          </button>
        </form>

        <div className="text-center text-xs text-zinc-500">
          Chưa có tài khoản?{' '}
          <Link href="/register" className="text-forest-700 font-bold hover:underline">
            Đăng ký tài khoản mới
          </Link>
        </div>
      </div>
    </div>
  );
}
