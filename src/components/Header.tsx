'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Compass,
  MapPin,
  CalendarDays,
  UserCheck,
  LogOut,
  LogIn,
  Menu,
  X,
  Sparkles,
  Trees,
  Shield,
  User,
  ArrowRight,
} from 'lucide-react';
import { User as UserType } from '@/types';

interface HeaderProps {
  currentUser: UserType | null;
}

export default function Header({ currentUser }: HeaderProps) {
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  const handleLogout = async () => {
    try {
      setLoggingOut(true);
      await fetch('/api/auth/logout', { method: 'POST' });
      router.push('/');
      router.refresh();
    } finally {
      setLoggingOut(false);
    }
  };

  return (
    <header className="sticky top-0 z-50 bg-white/85 backdrop-blur-xl border-b border-emerald-100/70 shadow-xs transition-all duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          {/* Logo with 3D micro-lift */}
          <Link
            href="/"
            aria-label="Bình Mỹ Wellness Web - Trang chủ"
            className="group flex items-center gap-2.5 sm:gap-3 transition-transform hover:scale-[1.02]"
          >
            <div className="relative">
              <Image
                src="/assets/logo-binh-my-wellness.png"
                alt="Bình Mỹ Wellness Web"
                width={434}
                height={145}
                priority
                className="h-9 w-auto object-contain sm:h-12 drop-shadow-xs"
              />
            </div>
            <span className="rounded-full bg-gradient-to-r from-emerald-100 to-teal-100 border border-emerald-300/50 px-2 py-0.5 text-[10px] font-black uppercase tracking-wider text-emerald-800 shadow-xs">
              365
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-1.5 lg:gap-2">
            <Link
              href="/"
              className="px-3.5 py-2 text-sm font-semibold text-zinc-700 hover:text-forest-800 hover:bg-forest-50/80 rounded-xl transition-all"
            >
              Trang chủ
            </Link>
            <Link
              href="/#binhmy-365"
              className="px-3.5 py-2 text-sm font-semibold text-zinc-700 hover:text-forest-800 hover:bg-forest-50/80 rounded-xl transition-all flex items-center gap-1.5"
            >
              <CalendarDays className="w-4 h-4 text-forest-600" />
              Khám phá 365
            </Link>
            <Link
              href="/#map-section"
              className="px-3.5 py-2 text-sm font-semibold text-zinc-700 hover:text-forest-800 hover:bg-forest-50/80 rounded-xl transition-all flex items-center gap-1.5"
            >
              <MapPin className="w-4 h-4 text-river-600" />
              Bản đồ nhà vườn
            </Link>
            <Link
              href="/itinerary"
              className="px-3.5 py-2 text-sm font-semibold text-zinc-700 hover:text-forest-800 hover:bg-forest-50/80 rounded-xl transition-all flex items-center gap-1.5"
            >
              <Compass className="w-4 h-4 text-orchard-600" />
              Lập hành trình
            </Link>

            {/* Role-based dashboard shortcuts */}
            {currentUser?.role === 'CUSTOMER' && (
              <Link
                href="/customer"
                className="px-3.5 py-2 text-sm font-bold text-emerald-800 bg-emerald-50 hover:bg-emerald-100/90 rounded-xl transition-all border border-emerald-200/60 flex items-center gap-1.5 shadow-xs"
              >
                <User className="w-4 h-4 text-emerald-700" />
                Đơn đặt của tôi
              </Link>
            )}

            {currentUser?.role === 'PROVIDER' && (
              <Link
                href="/provider"
                className="px-3.5 py-2 text-sm font-bold text-amber-900 bg-amber-50 hover:bg-amber-100/90 rounded-xl transition-all border border-amber-200/60 flex items-center gap-1.5 shadow-xs"
              >
                <Trees className="w-4 h-4 text-amber-700" />
                Quản lý nhà vườn
              </Link>
            )}

            {currentUser?.role === 'ADMIN' && (
              <Link
                href="/admin"
                className="px-3.5 py-2 text-sm font-bold text-rose-900 bg-rose-50 hover:bg-rose-100/90 rounded-xl transition-all border border-rose-200/60 flex items-center gap-1.5 shadow-xs"
              >
                <Shield className="w-4 h-4 text-rose-700" />
                Quản trị hệ thống
              </Link>
            )}
          </nav>

          {/* User Profile / Auth Actions */}
          <div className="hidden md:flex items-center gap-3">
            {currentUser ? (
              <div className="flex items-center gap-3 pl-3 border-l border-zinc-200/80">
                <div className="flex flex-col text-right">
                  <span className="text-sm font-bold text-zinc-900 leading-tight">
                    {currentUser.name}
                  </span>
                  <span className="text-[11px] text-zinc-500 font-mono">
                    {currentUser.email}
                  </span>
                </div>

                <button
                  type="button"
                  onClick={handleLogout}
                  disabled={loggingOut}
                  title="Đăng xuất"
                  className="p-2 text-zinc-500 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors cursor-pointer"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  href="/login"
                  className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-bold text-forest-700 bg-forest-50 hover:bg-forest-100/80 border border-forest-200/60 rounded-xl transition-all active:scale-95 shadow-xs"
                >
                  <LogIn className="w-4 h-4 text-forest-600" />
                  Đăng nhập
                </Link>
                <Link
                  href="/register"
                  className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-bold text-white bg-gradient-to-r from-forest-700 to-emerald-600 hover:from-forest-800 hover:to-emerald-700 rounded-xl transition-all shadow-md shadow-forest-700/20 active:scale-95"
                >
                  <span>Đăng ký</span>
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="flex md:hidden items-center gap-2">
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-zinc-700 hover:text-forest-700 hover:bg-forest-50 rounded-xl cursor-pointer"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-zinc-200/80 bg-white/95 backdrop-blur-2xl px-4 pt-3 pb-6 space-y-2 shadow-2xl animate-fade-in">
          <Link
            href="/"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3.5 py-2.5 rounded-xl text-base font-semibold text-zinc-800 hover:bg-forest-50"
          >
            Trang chủ
          </Link>
          <Link
            href="/#binhmy-365"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3.5 py-2.5 rounded-xl text-base font-semibold text-zinc-800 hover:bg-forest-50"
          >
            Khám phá Bình Mỹ 365
          </Link>
          <Link
            href="/#map-section"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3.5 py-2.5 rounded-xl text-base font-semibold text-zinc-800 hover:bg-forest-50"
          >
            Bản đồ nhà vườn
          </Link>
          <Link
            href="/itinerary"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3.5 py-2.5 rounded-xl text-base font-semibold text-zinc-800 hover:bg-forest-50"
          >
            Lập hành trình thông minh
          </Link>

          {currentUser?.role === 'CUSTOMER' && (
            <Link
              href="/customer"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3.5 py-2.5 rounded-xl text-base font-bold text-emerald-800 bg-emerald-50"
            >
              Đơn đặt của tôi
            </Link>
          )}

          {currentUser?.role === 'PROVIDER' && (
            <Link
              href="/provider"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3.5 py-2.5 rounded-xl text-base font-bold text-amber-800 bg-amber-50"
            >
              Quản lý nhà vườn
            </Link>
          )}

          {currentUser?.role === 'ADMIN' && (
            <Link
              href="/admin"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3.5 py-2.5 rounded-xl text-base font-bold text-rose-800 bg-rose-50"
            >
              Quản trị hệ thống
            </Link>
          )}

          <div className="pt-4 border-t border-zinc-200/80">
            {currentUser ? (
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-bold text-zinc-800">{currentUser.name}</p>
                  <p className="text-xs text-zinc-500 font-mono">{currentUser.email}</p>
                </div>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-semibold text-rose-700 bg-rose-50 rounded-xl cursor-pointer"
                >
                  <LogOut className="w-4 h-4" />
                  Đăng xuất
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-2 pt-1">
                <Link
                  href="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center justify-center gap-1.5 px-4 py-2.5 text-forest-800 bg-forest-50 rounded-xl font-bold text-sm"
                >
                  <LogIn className="w-4 h-4" />
                  Đăng nhập
                </Link>
                <Link
                  href="/register"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center justify-center gap-1.5 px-4 py-2.5 text-white bg-forest-700 rounded-xl font-bold text-sm"
                >
                  Đăng ký
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
