'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Compass, Heart, Menu, X } from 'lucide-react';

const navigation = [
  { href: '/', label: 'Trang chủ' },
  { href: '/explore', label: 'Khám phá' },
  { href: '/itinerary', label: 'Lập hành trình' },
  { href: '/my', label: 'Hành trình của tôi' },
];

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  return (
    <header className="sticky top-0 z-40 border-b border-emerald-950/10 bg-[#f8faf9]/95 backdrop-blur">
      <div className="mx-auto flex h-[76px] max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-3" aria-label="Bình Mỹ Du Ký Website, trang chủ">
          <span className="grid h-11 w-11 place-items-center rounded-2xl bg-[#1B4332] text-white"><Compass size={23} strokeWidth={1.8} /></span>
          <span className="leading-tight"><span className="block text-sm font-black tracking-tight text-[#1B4332] sm:text-base">Bình Mỹ Du Ký</span><span className="text-[11px] font-medium tracking-wide text-zinc-500">WEBSITE</span></span>
        </Link>
        <nav className="hidden items-center gap-1 md:flex" aria-label="Điều hướng chính">
          {navigation.map((item) => <Link key={item.href} href={item.href} className="rounded-xl px-3.5 py-2.5 text-sm font-semibold text-zinc-700 transition hover:bg-emerald-900/5 hover:text-[#1B4332]">{item.label}</Link>)}
          <Link href="/explore" className="ml-2 inline-flex items-center gap-2 rounded-xl bg-[#1B4332] px-4 py-2.5 text-sm font-bold text-white transition hover:bg-[#143627]"><Heart size={16} /> Bắt đầu khám phá</Link>
        </nav>
        <button type="button" className="grid h-11 w-11 place-items-center rounded-xl text-zinc-800 hover:bg-emerald-900/5 md:hidden" aria-label={menuOpen ? 'Đóng menu' : 'Mở menu'} aria-expanded={menuOpen} onClick={() => setMenuOpen((value) => !value)}>
          {menuOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>
      {menuOpen && <nav className="border-t border-emerald-950/10 bg-[#f8faf9] px-4 py-3 md:hidden" aria-label="Điều hướng di động">{navigation.map((item) => <Link key={item.href} href={item.href} onClick={() => setMenuOpen(false)} className="block rounded-xl px-3 py-3 font-semibold text-zinc-800 hover:bg-emerald-900/5">{item.label}</Link>)}<Link href="/editor" onClick={() => setMenuOpen(false)} className="block rounded-xl px-3 py-3 font-semibold text-zinc-600 hover:bg-emerald-900/5">Công cụ biên tập trên thiết bị</Link></nav>}
    </header>
  );
}