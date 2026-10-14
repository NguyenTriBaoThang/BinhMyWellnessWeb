'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { User, Shield, Trees, Check, Key } from 'lucide-react';
import { Role } from '@/types';

interface RoleSwitcherBarProps {
  currentRole?: Role;
  currentEmail?: string;
}

export default function RoleSwitcherBar({
  currentRole,
  currentEmail,
}: RoleSwitcherBarProps) {
  const router = useRouter();
  const [loadingRole, setLoadingRole] = useState<Role | null>(null);

  if (process.env.NODE_ENV === 'production') return null;

  const switchRole = async (role: Role) => {
    try {
      setLoadingRole(role);
      const res = await fetch('/api/auth/switch-role', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role }),
      });

      if (res.ok) {
        if (role === 'CUSTOMER') router.push('/customer');
        else if (role === 'PROVIDER') router.push('/provider');
        else if (role === 'ADMIN') router.push('/admin');
        router.refresh();
      }
    } finally {
      setLoadingRole(null);
    }
  };

  return (
    <div className="bg-gradient-to-r from-forest-900 via-forest-800 to-river-900 text-white text-xs py-2 px-4 shadow-sm border-b border-forest-700/50">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="flex items-center gap-1 font-semibold text-emerald-300">
            <Key className="w-3.5 h-3.5" />
            Tài khoản mẫu:
          </span>
          <span className="text-zinc-300 hidden sm:inline">
            mật khẩu chung: <code className="bg-black/30 px-1.5 py-0.5 rounded text-amber-300 font-mono">password@123</code>
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <span className="text-zinc-400 text-[11px] mr-1 hidden lg:inline">Chuyển vai trò 1-chạm:</span>

          {/* Customer button */}
          <button
            onClick={() => switchRole('CUSTOMER')}
            disabled={loadingRole !== null}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md transition-all font-medium text-xs ${
              currentRole === 'CUSTOMER' && currentEmail === 'baothang@gmail.com'
                ? 'bg-emerald-500 text-white shadow-sm ring-2 ring-emerald-300/40'
                : 'bg-white/10 hover:bg-white/20 text-zinc-200'
            }`}
          >
            <User className="w-3.5 h-3.5" />
            <span>Khách: baothang@gmail.com</span>
            {currentRole === 'CUSTOMER' && <Check className="w-3 h-3 text-white" />}
          </button>

          {/* Provider button */}
          <button
            onClick={() => switchRole('PROVIDER')}
            disabled={loadingRole !== null}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md transition-all font-medium text-xs ${
              currentRole === 'PROVIDER'
                ? 'bg-amber-500 text-white shadow-sm ring-2 ring-amber-300/40'
                : 'bg-white/10 hover:bg-white/20 text-zinc-200'
            }`}
          >
            <Trees className="w-3.5 h-3.5" />
            <span>Chủ vườn: nhavuona@gmail.com</span>
            {currentRole === 'PROVIDER' && <Check className="w-3 h-3 text-white" />}
          </button>

          {/* Admin button */}
          <button
            onClick={() => switchRole('ADMIN')}
            disabled={loadingRole !== null}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md transition-all font-medium text-xs ${
              currentRole === 'ADMIN'
                ? 'bg-rose-600 text-white shadow-sm ring-2 ring-rose-300/40'
                : 'bg-white/10 hover:bg-white/20 text-zinc-200'
            }`}
          >
            <Shield className="w-3.5 h-3.5" />
            <span>Quản trị: binhmy@admin.com</span>
            {currentRole === 'ADMIN' && <Check className="w-3 h-3 text-white" />}
          </button>
        </div>
      </div>
    </div>
  );
}
