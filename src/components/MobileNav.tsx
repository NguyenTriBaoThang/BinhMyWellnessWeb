'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Compass, Route, BookmarkCheck } from 'lucide-react';

const mobileNavItems = [
  { href: '/', label: 'Trang chủ', icon: Home },
  { href: '/explore', label: 'Khám phá 4 mùa', icon: Compass },
  { href: '/itinerary', label: 'Lập hành trình', icon: Route },
  { href: '/my', label: 'Đã lưu', icon: BookmarkCheck },
];

export default function MobileNav() {
  const pathname = usePathname();

  return (
    <nav
      className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-[#F7F4EA]/95 backdrop-blur-lg border-t border-[#174C3C]/15 shadow-[0_-4px_20px_rgba(23,76,60,0.08)] pb-[max(env(safe-area-inset-bottom),8px)] pt-1.5"
      aria-label="Điều hướng dưới di động"
    >
      <div className="flex items-center justify-around px-2">
        {mobileNavItems.map((item) => {
          const isActive = pathname === item.href || (item.href !== '/' && pathname?.startsWith(item.href));
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center justify-center min-w-[76px] min-h-[52px] px-1.5 py-1 rounded-2xl transition-all duration-200 ${
                isActive
                  ? 'text-[#174C3C] font-bold'
                  : 'text-[#26352E]/70 hover:text-[#174C3C] font-medium'
              }`}
              aria-current={isActive ? 'page' : undefined}
            >
              <div
                className={`relative flex items-center justify-center w-10 h-7 rounded-full transition-all duration-200 ${
                  isActive ? 'bg-[#E7EFE4] text-[#174C3C]' : 'text-[#26352E]/70'
                }`}
              >
                <Icon size={19} strokeWidth={isActive ? 2.4 : 1.8} />
              </div>
              <span className="text-[11px] leading-tight mt-0.5 tracking-tight">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
