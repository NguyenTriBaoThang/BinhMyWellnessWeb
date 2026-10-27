'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Compass, Sparkles } from 'lucide-react';

const navigation = [
  { href: '/', label: 'Trang chủ' },
  { href: '/explore', label: 'Khám phá 4 mùa' },
  { href: '/itinerary', label: 'Lập hành trình' },
  { href: '/my', label: 'Đã lưu' },
];

export default function Header() {
  const pathname = usePathname();
  const [hasScrolled, setHasScrolled] = useState(false);

  useEffect(() => {
    const update = () => setHasScrolled(window.scrollY > 8);
    update();
    window.addEventListener('scroll', update, { passive: true });
    return () => window.removeEventListener('scroll', update);
  }, []);

  return (
    <header className={`sticky top-0 z-40 border-b border-[#174C3C]/10 bg-[#F7F4EA]/95 backdrop-blur-md transition-shadow duration-200 ${hasScrolled ? 'shadow-[0_8px_24px_rgba(23,76,60,0.09)]' : ''}`}>
      <div className="mx-auto flex h-[68px] sm:h-[72px] max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Brand Logo */}
        <Link
          href="/"
          className="group flex items-center gap-3 transition-transform active:scale-98"
          aria-label="Bình Mỹ Du Ký Website — Trang chủ"
        >
          <Image src="/images/showcase/logo-binh-my-wellness.png" alt="Bình Mỹ Wellness Web" width={190} height={64} priority className="h-10 w-auto object-contain sm:h-12" />
          <span className="hidden grid h-10 w-10 sm:h-11 sm:w-11 place-items-center rounded-2xl bg-[#174C3C] text-white shadow-md shadow-[#174C3C]/20 transition-transform group-hover:scale-105">
            <Compass size={22} strokeWidth={2} className="text-[#D6A545]" />
          </span>
          <div className="hidden leading-tight">
            <div className="flex items-center gap-1.5">
              <span className="text-base sm:text-lg font-black tracking-tight text-[#174C3C]">
                BÌNH MỸ DU KÝ
              </span>
            </div>
            <span className="text-[10px] sm:text-[11px] font-bold tracking-widest text-[#26352E]/60 uppercase">
              Du lịch sinh thái
            </span>
          </div>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-1.5" aria-label="Điều hướng chính">
          {navigation.map((item) => {
            const isActive =
              pathname === item.href ||
              (item.href !== '/' && pathname?.startsWith(item.href));
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`relative px-4 py-2 rounded-full text-sm font-bold transition-all duration-200 ${
                  isActive
                    ? 'bg-[#174C3C] text-white shadow-sm'
                    : 'text-[#26352E]/80 hover:text-[#174C3C] hover:bg-[#E7EFE4]/60'
                }`}
                aria-current={isActive ? 'page' : undefined}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* CTA Button Right */}
        <div className="flex items-center gap-2">
          <Link
            href="/itinerary"
            className="btn-tactile btn-accent-gold text-xs sm:text-sm !py-2 sm:!py-2.5 !px-3.5 sm:!px-5 rounded-full"
            aria-label="Lên chuyến đi Bình Mỹ ngay"
          >
            <Sparkles size={15} className="text-[#174C3C]" />
            <span>Lên chuyến đi</span>
          </Link>
        </div>
      </div>
    </header>
  );
}
