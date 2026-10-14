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
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-emerald-100 shadow-sm transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          {/* Logo */}
          <Link href="/" aria-label="Bình Mỹ Wellness Web - Trang chủ" className="group flex items-center gap-2 sm:gap-3">
            <Image
              src="/assets/logo-binh-my-wellness.png"
              alt="Bình Mỹ Wellness Web"
              width={434}
              height={145}
              priority
              className="h-10 w-auto object-contain transition-transform group-hover:scale-[1.02] sm:h-14"
            />
            <span className="rounded-full bg-emerald-100 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-emerald-800">
              365
            </span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-1 lg:gap-2">
            <Link
              href="/"
              className="px-3 py-2 text-sm font-medium text-zinc-700 hover:text-forest-700 hover:bg-forest-50/60 rounded-lg transition-colors"
            >
              Trang chủ
            </Link>
            <Link
              href="/#binhmy-365"
              className="px-3 py-2 text-sm font-medium text-zinc-700 hover:text-forest-700 hover:bg-forest-50/60 rounded-lg transition-colors flex items-center gap-1"
            >
              <CalendarDays className="w-4 h-4 text-forest-600" />
              Khám phá 365
            </Link>
            <Link
              href="/#map-section"
              className="px-3 py-2 text-sm font-medium text-zinc-700 hover:text-forest-700 hover:bg-forest-50/60 rounded-lg transition-colors flex items-center gap-1"
            >
              <MapPin className="w-4 h-4 text-river-600" />
              Bản đồ nhà vườn
            </Link>
            <Link
              href="/itinerary"
              className="px-3 py-2 text-sm font-medium text-zinc-700 hover:text-forest-700 hover:bg-forest-50/60 rounded-lg transition-colors flex items-center gap-1"
            >
              <Compass className="w-4 h-4 text-orchard-600" />
              Lập hành trình
            </Link>

            {/* Role-based dashboard shortcuts */}
            {currentUser?.role === 'CUSTOMER' && (
              <Link
                href="/customer"
                className="px-3 py-2 text-sm font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded-lg transition-colors flex items-center gap-1.5"
              >
                <User className="w-4 h-4" />
                Đơn đặt của tôi
              </Link>
            )}

            {currentUser?.role === 'PROVIDER' && (
              <Link
                href="/provider"
                className="px-3 py-2 text-sm font-semibold text-amber-800 bg-amber-50 hover:bg-amber-100 rounded-lg transition-colors flex items-center gap-1.5"
              >
                <Trees className="w-4 h-4 text-amber-600" />
                Quản lý nhà vườn
              </Link>
            )}

            {currentUser?.role === 'ADMIN' && (
              <Link
                href="/admin"
                className="px-3 py-2 text-sm font-semibold text-rose-800 bg-rose-50 hover:bg-rose-100 rounded-lg transition-colors flex items-center gap-1.5"
              >
                <Shield className="w-4 h-4 text-rose-600" />
                Quản trị hệ thống
              </Link>
            )}
          </nav>

          {/* User Profile / Auth Actions */}
          <div className="hidden md:flex items-center gap-3">
            {currentUser ? (
              <div className="flex items-center gap-2.5 pl-3 border-l border-zinc-200">
                <div className="flex flex-col text-right">
                  <span className="text-sm font-semibold text-zinc-800 leading-tight">
                    {currentUser.name}
                  </span>
                  <span className="text-[11px] text-zinc-500 font-mono">
                    {currentUser.email}
                  </span>
                </div>

                <button
                  onClick={handleLogout}
                  disabled={loggingOut}
                  title="Đăng xuất"
                  className="p-2 text-zinc-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  href="/login"
                  className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-semibold text-forest-700 bg-forest-50 hover:bg-forest-100 rounded-xl transition-colors"
                >
                  <LogIn className="w-4 h-4" />
                  Đăng nhập
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="flex md:hidden items-center gap-2">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-zinc-700 hover:text-forest-700 hover:bg-forest-50 rounded-lg"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-zinc-200 bg-white px-4 pt-3 pb-6 space-y-2">
          <Link
            href="/"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-lg text-base font-medium text-zinc-800 hover:bg-forest-50"
          >
            Trang chủ
          </Link>
          <Link
            href="/#binhmy-365"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-lg text-base font-medium text-zinc-800 hover:bg-forest-50"
          >
            Khám phá Bình Mỹ 365
          </Link>
          <Link
            href="/#map-section"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-lg text-base font-medium text-zinc-800 hover:bg-forest-50"
          >
            Bản đồ nhà vườn
          </Link>
          <Link
            href="/itinerary"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-lg text-base font-medium text-zinc-800 hover:bg-forest-50"
          >
            Lập hành trình thông minh
          </Link>

          {currentUser?.role === 'CUSTOMER' && (
            <Link
              href="/customer"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-lg text-base font-semibold text-emerald-800 bg-emerald-50"
            >
              Đơn đặt của tôi
            </Link>
          )}

          {currentUser?.role === 'PROVIDER' && (
            <Link
              href="/provider"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-lg text-base font-semibold text-amber-800 bg-amber-50"
            >
              Quản lý nhà vườn
            </Link>
          )}

          {currentUser?.role === 'ADMIN' && (
            <Link
              href="/admin"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-lg text-base font-semibold text-rose-800 bg-rose-50"
            >
              Quản trị hệ thống
            </Link>
          )}

          <div className="pt-4 border-t border-zinc-200">
            {currentUser ? (
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-semibold text-zinc-800">{currentUser.name}</p>
                  <p className="text-xs text-zinc-500">{currentUser.email}</p>
                </div>
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-rose-700 bg-rose-50 rounded-lg"
                >
                  <LogOut className="w-4 h-4" />
                  Đăng xuất
                </button>
              </div>
            ) : (
              <Link
                href="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full flex items-center justify-center gap-2 px-4 py-2 text-white bg-forest-700 rounded-xl font-semibold"
              >
                <LogIn className="w-4 h-4" />
                Đăng nhập
              </Link>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
