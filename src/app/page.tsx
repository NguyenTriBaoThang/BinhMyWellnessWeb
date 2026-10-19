'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
  Search,
  Filter,
  Sparkles,
  MapPin,
  Calendar,
  Compass,
  ArrowRight,
  ShieldCheck,
  Heart,
  Droplets,
  Trees,
  CheckCircle,
  Wind,
  Sun,
  Umbrella,
  SlidersHorizontal,
  ChevronRight,
  Star,
  Award,
  Clock,
  Users,
  Navigation,
} from 'lucide-react';
import { Service, User } from '@/types';
import { CATEGORIES } from '@/lib/constants';
import ExperienceCard from '@/components/ExperienceCard';
import RealtimeCapacityWidget from '@/components/RealtimeCapacityWidget';
import BinhMy365Timeline from '@/components/BinhMy365Timeline';
import MonthlyDestinationMap from '@/components/MonthlyDestinationMap';
import BookingModal from '@/components/BookingModal';
import ThreeDTiltCard from '@/components/ThreeDTiltCard';
import { ACTIVE_CAMPAIGN_MONTHS } from '@/lib/campaigns';
import { formatVND, getTodayInVietnam } from '@/lib/utils';

function getCurrentCampaignMonth(): number {
  const currentMonth = Number(getTodayInVietnam().slice(5, 7));
  return ACTIVE_CAMPAIGN_MONTHS.includes(currentMonth as (typeof ACTIVE_CAMPAIGN_MONTHS)[number])
    ? currentMonth
    : ACTIVE_CAMPAIGN_MONTHS[0];
}

export default function HomePage() {
  const [services, setServices] = useState<Service[]>([]);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [servicesError, setServicesError] = useState<string | null>(null);
  const [reloadCount, setReloadCount] = useState(0);
  const [selectedCampaignMonth, setSelectedCampaignMonth] = useState<number>(getCurrentCampaignMonth);

  // Filters
  const [selectedCategory, setSelectedCategory] = useState<string>('Tất cả');
  const [budget, setBudget] = useState<number>(300000);
  const [indoorOnly, setIndoorOnly] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Modals & Active items
  const [bookingService, setBookingService] = useState<Service | null>(null);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [favoriteNotice, setFavoriteNotice] = useState('');

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        // Load user
        const meRes = await fetch('/api/auth/me');
        const meData = await meRes.json();
        setCurrentUser(meData.user);

        if (meData.user?.role === 'CUSTOMER') {
          const favoritesRes = await fetch('/api/favorites');
          if (favoritesRes.ok) {
            const favoritesData = await favoritesRes.json();
            setFavorites(favoritesData.favorites || []);
          }
        }

        // Load services
        const servRes = await fetch('/api/services');
        const servData = await servRes.json().catch(() => ({}));
        if (!servRes.ok) {
          throw new Error(servData.error || 'Chưa tải được danh sách địa điểm và hoạt động.');
        }
        if (!Array.isArray(servData.services)) {
          throw new Error('Dữ liệu địa điểm và hoạt động chưa đúng định dạng.');
        }
        setServices(servData.services);
        setServicesError(null);
        const requestedServiceId = new URLSearchParams(window.location.search).get('book');
        const requestedService = servData.services.find((service: Service) => service.id === requestedServiceId);
        if (requestedService) setBookingService(requestedService);
      } catch (err) {
        console.error(err);
        setServicesError(err instanceof Error ? err.message : 'Chưa tải được danh sách địa điểm và hoạt động.');
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [reloadCount]);

  const toggleFavorite = async (id: string) => {
    if (currentUser?.role !== 'CUSTOMER') {
      setFavoriteNotice(currentUser
        ? 'Tính năng yêu thích dành cho tài khoản khách hàng.'
        : 'Đăng nhập bằng tài khoản khách hàng để lưu trải nghiệm yêu thích.');
      return;
    }

    setFavoriteNotice('');
    try {
      const response = await fetch('/api/favorites', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ serviceId: id, favorited: !favorites.includes(id) }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Không lưu được trải nghiệm.');
      setFavorites(data.favorites || []);
    } catch (error) {
      setFavoriteNotice(error instanceof Error ? error.message : 'Không lưu được trải nghiệm.');
    }
  };

  // Filtered services
  const filteredServices = services.filter((s) => {
    if (selectedCategory !== 'Tất cả' && s.category !== selectedCategory) {
      return false;
    }
    if (budget > 0 && s.price > budget) {
      return false;
    }
    if (indoorOnly && !s.indoor) {
      return false;
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = s.name.toLowerCase().includes(q);
      const matchDesc = s.description.toLowerCase().includes(q);
      const matchProvider = s.providerName?.toLowerCase().includes(q);
      if (!matchName && !matchDesc && !matchProvider) return false;
    }
    return true;
  });

  // Featured service for 3D showcase
  const featuredService = services.find((s) => s.category.includes('Chèo') || s.price > 0) || services[0];

  return (
    <div className="space-y-12 sm:space-y-20 pb-28">
      {/* 3D Hero Section */}
      <section className="relative min-h-[640px] sm:min-h-[720px] flex items-center justify-center overflow-hidden bg-forest-950 perspective-2000">
        {/* Background photo & multi-gradient vignette */}
        <Image
          src="/assets/bo_song_binh_my.jpg"
          alt="Bờ sông Sài Gòn xã Bình Mỹ Củ Chi"
          fill
          priority
          sizes="100vw"
          className="object-cover opacity-35 scale-105 transition-transform duration-1000"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-forest-950 via-forest-950/60 to-forest-950/40" />
        <div className="absolute inset-0 bg-gradient-to-r from-forest-950/95 via-forest-950/70 to-forest-950/90" />

        {/* Floating 3D Ambient Light Orbs */}
        <div className="glow-orb w-96 h-96 -top-24 -left-24 bg-emerald-500/25 animate-float" />
        <div className="glow-orb w-96 h-96 top-1/2 -right-24 bg-teal-500/20 animate-float-reverse" />
        <div className="glow-orb w-80 h-80 -bottom-24 left-1/3 bg-amber-500/15 animate-pulse-slow" />

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24 w-full">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-8 items-center">
            {/* Left Column: Storytelling & 3D Search (7 cols) */}
            <div className="lg:col-span-7 space-y-6 text-white text-left">
              {/* Weather & Location Live Pill */}
              <div className="inline-flex flex-wrap items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-900/70 border border-emerald-400/40 text-emerald-300 text-xs font-semibold backdrop-blur-md shadow-lg">
                <span className="flex items-center gap-1.5">
                  <Sun className="w-3.5 h-3.5 text-amber-400 animate-spin-slow" />
                  <span>29°C Nắng đẹp ven sông</span>
                </span>
                <span className="text-emerald-500 font-bold">•</span>
                <span className="flex items-center gap-1.5">
                  <Wind className="w-3.5 h-3.5 text-river-300" />
                  <span>Gió sông Sài Gòn</span>
                </span>
                <span className="text-emerald-500 font-bold">•</span>
                <span className="text-emerald-200 font-bold">8 Nhà vườn mở đón</span>
              </div>

              {/* Grand 3D Heading */}
              <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight text-white leading-[1.1] drop-shadow-lg">
                Một Ngày Xanh <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-300 via-teal-100 to-amber-200 drop-shadow-md">
                  Bên Dòng Sông Sài Gòn
                </span>
              </h1>

              <p className="text-sm sm:text-base lg:text-lg text-zinc-200 max-w-xl leading-relaxed">
                Chỉ <strong>45 phút</strong> từ trung tâm TP.HCM. Trải nghiệm hái rau hữu cơ, dạo vườn bưởi da xanh Chú Sáu, thưởng thức cá lóc nướng Cầu Rạch Dứa và chèo SUP hoàng hôn lộng gió.
              </p>

              {/* Value Check Chips */}
              <div className="flex flex-wrap gap-2 text-xs text-emerald-100 font-medium">
                <span className="px-3 py-1 rounded-lg bg-white/10 backdrop-blur-md border border-white/10 flex items-center gap-1.5">
                  <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
                  Hái trái cây tại vườn
                </span>
                <span className="px-3 py-1 rounded-lg bg-white/10 backdrop-blur-md border border-white/10 flex items-center gap-1.5">
                  <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
                  Chèo SUP rạch mát
                </span>
                <span className="px-3 py-1 rounded-lg bg-white/10 backdrop-blur-md border border-white/10 flex items-center gap-1.5">
                  <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
                  Đặt ca giữ chỗ tức thì
                </span>
              </div>

              {/* 3D Glass Search & Filter Box */}
              <div className="pt-2">
                <div className="bg-white/95 backdrop-blur-xl p-3 sm:p-3.5 rounded-3xl shadow-2xl border border-white/40 text-zinc-900 flex flex-col sm:flex-row items-center gap-2.5 max-w-2xl">
                  <div className="flex-1 w-full flex items-center gap-2.5 px-3.5 py-2.5 bg-zinc-50 rounded-2xl border border-zinc-200 focus-within:border-forest-600 focus-within:bg-white transition-all">
                    <Search className="w-4 h-4 text-zinc-400 shrink-0" />
                    <input
                      type="text"
                      placeholder="Tìm nhà vườn, hái bưởi, chèo SUP, ẩm thực..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full bg-transparent text-xs sm:text-sm text-zinc-900 focus:outline-none placeholder:text-zinc-400 font-medium"
                    />
                  </div>

                  <div className="flex items-center gap-2 w-full sm:w-auto">
                    <select
                      value={selectedCategory}
                      onChange={(e) => setSelectedCategory(e.target.value)}
                      className="px-3.5 py-2.5 bg-zinc-50 rounded-2xl border border-zinc-200 text-xs font-semibold text-zinc-700 focus:outline-none cursor-pointer hover:bg-zinc-100"
                    >
                      {CATEGORIES.map((cat) => (
                        <option key={cat} value={cat}>
                          {cat}
                        </option>
                      ))}
                    </select>

                    <a
                      href="#experiences-grid"
                      className="px-5 py-2.5 bg-gradient-to-r from-forest-700 to-emerald-600 hover:from-forest-800 hover:to-emerald-700 text-white rounded-2xl font-bold text-xs sm:text-sm transition-all shadow-md shadow-forest-700/30 flex items-center justify-center gap-1.5 shrink-0 active:scale-95 cursor-pointer"
                    >
                      <span>Khám phá</span>
                      <ArrowRight className="w-4 h-4" />
                    </a>
                  </div>
                </div>
              </div>

              {/* Quick Jump Anchors */}
              <div className="flex flex-wrap items-center gap-2 text-xs pt-1">
                <a
                  href="#binhmy-365"
                  className="px-3 py-1.5 rounded-full bg-white/10 hover:bg-white/20 text-emerald-200 border border-white/15 transition-all backdrop-blur-md flex items-center gap-1.5"
                >
                  <Calendar className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Lịch mùa vụ 365</span>
                </a>
                <a
                  href="#map-section"
                  className="px-3 py-1.5 rounded-full bg-white/10 hover:bg-white/20 text-river-200 border border-white/15 transition-all backdrop-blur-md flex items-center gap-1.5"
                >
                  <Compass className="w-3.5 h-3.5 text-river-400" />
                  <span>Bản đồ số & Vệ tinh</span>
                </a>
                <a
                  href="#experiences-grid"
                  className="px-3 py-1.5 rounded-full bg-white/10 hover:bg-white/20 text-amber-200 border border-white/15 transition-all backdrop-blur-md flex items-center gap-1.5"
                >
                  <Trees className="w-3.5 h-3.5 text-amber-400" />
                  <span>8 Nhà vườn đối tác</span>
                </a>
                <Link
                  href="/itinerary"
                  className="px-3.5 py-1.5 rounded-full bg-emerald-500/30 hover:bg-emerald-500/50 text-white font-bold border border-emerald-400/40 transition-all backdrop-blur-md flex items-center gap-1.5"
                >
                  <Sparkles className="w-3.5 h-3.5 text-emerald-300" />
                  <span>Lập hành trình</span>
                </Link>
              </div>
            </div>

            {/* Right Column: Interactive 3D Showcase Card (5 cols) */}
            <div className="lg:col-span-5 flex justify-center perspective-1000">
              <ThreeDTiltCard maxTilt={10} scale={1.03} glare={true} className="w-full max-w-md">
                <div className="relative rounded-3xl overflow-hidden bg-white/10 backdrop-blur-2xl border border-white/30 p-4 shadow-3d preserve-3d">
                  {/* Floating 3D Badge (Top Left) */}
                  <div className="absolute top-6 left-6 z-30 translate-z-30">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-600/90 backdrop-blur-md text-white text-xs font-bold shadow-lg border border-emerald-300/40">
                      <Award className="w-3.5 h-3.5 text-amber-300" />
                      Trải Nghiệm Tiêu Biểu #1
                    </span>
                  </div>

                  {/* Floating 3D Badge (Top Right) */}
                  <div className="absolute top-6 right-6 z-30 translate-z-30">
                    <span className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-full bg-black/60 backdrop-blur-md text-amber-300 text-xs font-bold border border-white/20 shadow-md">
                      <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                      4.9 / 5.0
                    </span>
                  </div>

                  {/* Image with depth */}
                  <div className="relative h-64 sm:h-72 w-full rounded-2xl overflow-hidden shadow-inner">
                    <Image
                      src={featuredService?.image || '/assets/bo_song_binh_my.jpg'}
                      alt={featuredService?.name || 'Trải nghiệm tiêu biểu'}
                      fill
                      sizes="(max-width: 768px) 100vw, 400px"
                      className="object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-zinc-950/80 via-zinc-950/20 to-transparent" />

                    {/* Floating Info Pill at bottom of image */}
                    <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-xs text-white z-20 translate-z-20">
                      <span className="inline-flex items-center gap-1.5 bg-black/50 backdrop-blur-md px-2.5 py-1 rounded-lg border border-white/20">
                        <Clock className="w-3.5 h-3.5 text-emerald-300" />
                        {featuredService?.duration || 90} phút
                      </span>
                      <span className="inline-flex items-center gap-1.5 bg-black/50 backdrop-blur-md px-2.5 py-1 rounded-lg border border-white/20">
                        <Users className="w-3.5 h-3.5 text-amber-300" />
                        Sức chứa: {featuredService?.capacity || 16} khách
                      </span>
                    </div>
                  </div>

                  {/* Card Content with 3D Popout */}
                  <div className="pt-4 pb-2 px-2 text-white space-y-3 translate-z-20">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5 text-xs text-emerald-300 font-semibold">
                        <MapPin className="w-3.5 h-3.5" />
                        <span>{featuredService?.providerName || 'Nhà vườn ven sông Bình Mỹ'}</span>
                      </div>
                      <span className="text-[11px] font-mono text-zinc-300 bg-white/10 px-2 py-0.5 rounded-md">
                        Cách Q.1: ~45p
                      </span>
                    </div>

                    <h3 className="font-extrabold text-xl text-white line-clamp-1">
                      {featuredService?.name || 'Chèo SUP Hoàng Hôn Rạch Dứa'}
                    </h3>

                    <p className="text-xs text-zinc-300 line-clamp-2 leading-relaxed">
                      {featuredService?.description || 'Hít thở không khí sông nước trong lành, ngắm hoàng hôn buông trên rạch dừa nước mộc mạc.'}
                    </p>

                    <div className="pt-2 flex items-center justify-between gap-3 border-t border-white/15">
                      <div>
                        <span className="text-[10px] text-zinc-300 uppercase tracking-wider block">Giá vé từ</span>
                        <span className="font-mono text-xl font-black text-emerald-300">
                          {formatVND(featuredService?.price || 150000)}
                        </span>
                        <span className="text-[10px] text-zinc-400"> / người</span>
                      </div>

                      {featuredService && (
                        <button
                          type="button"
                          onClick={() => setBookingService(featuredService)}
                          className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-forest-950 font-black text-xs sm:text-sm shadow-lg shadow-emerald-500/30 transition-all active:scale-95 cursor-pointer flex items-center gap-1.5"
                        >
                          <span>Đặt chỗ ngay</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </ThreeDTiltCard>
            </div>
          </div>

          {/* 3D Key Stat Counters */}
          <div className="mt-14 grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="rounded-2xl border border-white/15 bg-white/10 p-4 text-center backdrop-blur-xl shadow-lg hover:border-emerald-400/50 hover:bg-white/15 transition-all">
              <div className="font-mono text-3xl sm:text-4xl font-black text-emerald-400">8+</div>
              <div className="text-xs font-semibold text-zinc-200 mt-1">Nhà Vườn Sinh Thái</div>
              <div className="text-[11px] text-zinc-400 mt-0.5">Liên kết cộng đồng</div>
            </div>

            <div className="rounded-2xl border border-white/15 bg-white/10 p-4 text-center backdrop-blur-xl shadow-lg hover:border-emerald-400/50 hover:bg-white/15 transition-all">
              <div className="font-mono text-3xl sm:text-4xl font-black text-teal-300">365</div>
              <div className="text-xs font-semibold text-zinc-200 mt-1">Ngày Mùa Vụ</div>
              <div className="text-[11px] text-zinc-400 mt-0.5">Mùa nào thức nấy</div>
            </div>

            <div className="rounded-2xl border border-white/15 bg-white/10 p-4 text-center backdrop-blur-xl shadow-lg hover:border-amber-400/50 hover:bg-white/15 transition-all">
              <div className="font-mono text-3xl sm:text-4xl font-black text-amber-300">4.9★</div>
              <div className="text-xs font-semibold text-zinc-200 mt-1">Đánh Giá Du Khách</div>
              <div className="text-[11px] text-zinc-400 mt-0.5">Trải nghiệm thật 100%</div>
            </div>

            <div className="rounded-2xl border border-white/15 bg-white/10 p-4 text-center backdrop-blur-xl shadow-lg hover:border-river-400/50 hover:bg-white/15 transition-all">
              <div className="font-mono text-3xl sm:text-4xl font-black text-river-300">0đ</div>
              <div className="text-xs font-semibold text-zinc-200 mt-1">Phí Trung Gian</div>
              <div className="text-[11px] text-zinc-400 mt-0.5">Ủng hộ trực tiếp nhà vườn</div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-14 sm:space-y-20">
        {/* Realtime Capacity Widget */}
        <RealtimeCapacityWidget />

        {/* 365 Days Seasonal Timeline */}
        <section id="binhmy-365" className="scroll-mt-24">
          <BinhMy365Timeline
            services={services}
            selectedMonth={selectedCampaignMonth}
            onMonthChange={setSelectedCampaignMonth}
            onSelectService={(serviceId) => {
              const found = services.find((s) => s.id === serviceId);
              if (found) setBookingService(found);
            }}
            onExploreCategory={(category) => {
              setSelectedCategory(category);
              document.getElementById('experiences-grid')?.scrollIntoView({ behavior: 'smooth' });
            }}
          />
        </section>

        {/* Monthly destination map */}
        <section id="map-section" className="scroll-mt-24">
          <MonthlyDestinationMap activeMonth={selectedCampaignMonth} onMonthChange={setSelectedCampaignMonth} />
        </section>

        {/* Experiences Showcase Section */}
        <section id="experiences-grid" className="space-y-8 scroll-mt-24">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-forest-100 text-forest-800 text-xs font-bold mb-2 border border-forest-200 shadow-xs">
                <Trees className="w-4 h-4 text-forest-600" />
                DANH MỤC TRẢI NGHIỆM ĐẶC SẮC
              </div>
              <h2 className="text-2xl sm:text-4xl font-black text-forest-950 tracking-tight">
                Không Gian Nhà Vườn & Hoạt Động Mở Đón
              </h2>
              <p className="text-zinc-600 text-xs sm:text-sm mt-1 max-w-2xl leading-relaxed">
                Tất cả trải nghiệm đều do chính các hộ nông dân, nhà vườn sinh thái tại Bình Mỹ Củ Chi trực tiếp đón tiếp và phục vụ.
              </p>
            </div>

            {/* Quick stats indicator */}
            <span className="text-xs font-semibold text-zinc-600 bg-white px-3.5 py-2 rounded-xl border border-zinc-200 shadow-sm self-start md:self-auto flex items-center gap-1.5">
              <span>Đang hiển thị:</span>
              <strong className="text-forest-800 font-bold">{filteredServices.length}</strong> / {services.length} hoạt động
            </span>
          </div>

          {/* Filter Bar with Glassmorphism */}
          <div className="glass-card-3d p-4 sm:p-6 rounded-3xl space-y-4">
            {/* Category Pills */}
            <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-4 py-2 rounded-2xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
                    selectedCategory === cat
                      ? 'bg-gradient-to-r from-forest-800 to-emerald-700 text-white shadow-md shadow-forest-800/25 scale-102'
                      : 'bg-zinc-100/90 hover:bg-zinc-200 text-zinc-700 border border-zinc-200/50'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Sub-filters (Budget slider + Indoor check) */}
            <div className="pt-3 border-t border-zinc-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-xs">
              <div className="flex items-center gap-3 w-full sm:w-auto">
                <SlidersHorizontal className="w-4 h-4 text-forest-700 shrink-0" />
                <span className="font-semibold text-zinc-700 shrink-0">Ngân sách tối đa:</span>
                <input
                  type="range"
                  min={50000}
                  max={300000}
                  step={20000}
                  value={budget}
                  onChange={(e) => setBudget(Number(e.target.value))}
                  className="w-32 sm:w-48 accent-forest-700 cursor-pointer"
                />
                <span className="font-mono font-bold text-forest-800 bg-forest-50 px-2.5 py-1 rounded-lg border border-forest-200">
                  {budget.toLocaleString('vi-VN')}đ / khách
                </span>
              </div>

              <div className="flex items-center gap-4">
                <label className="flex items-center gap-2 cursor-pointer select-none bg-zinc-50 px-3 py-1.5 rounded-xl border border-zinc-200 hover:bg-zinc-100 transition-colors">
                  <input
                    type="checkbox"
                    checked={indoorOnly}
                    onChange={(e) => setIndoorOnly(e.target.checked)}
                    className="rounded text-forest-700 focus:ring-forest-600"
                  />
                  <Umbrella className="w-3.5 h-3.5 text-forest-600" />
                  <span className="text-zinc-700 font-semibold text-xs">Có khu vực mái che</span>
                </label>

                {(selectedCategory !== 'Tất cả' || budget < 300000 || indoorOnly || searchQuery) && (
                  <button
                    onClick={() => {
                      setSelectedCategory('Tất cả');
                      setBudget(300000);
                      setIndoorOnly(false);
                      setSearchQuery('');
                    }}
                    className="text-rose-600 hover:text-rose-700 font-bold hover:underline cursor-pointer"
                  >
                    Xóa bộ lọc
                  </button>
                )}
              </div>
            </div>
          </div>

          {favoriteNotice && (
            <div role="status" className="flex flex-wrap items-center gap-1.5 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-xs text-amber-900 shadow-xs">
              <span>{favoriteNotice}</span>
              {!currentUser && <Link href="/login" className="font-bold underline ml-1">Đăng nhập</Link>}
            </div>
          )}

          {/* Experiences 3D Grid */}
          {loading ? (
            <div role="status" className="rounded-3xl border border-zinc-200 bg-white p-6 text-sm text-zinc-600 shadow-sm">
              Đang tải địa điểm và hoạt động…
            </div>
          ) : servicesError ? (
            <div role="alert" className="rounded-3xl border border-amber-200 bg-amber-50 p-6 text-amber-950 shadow-sm">
              <p className="font-bold">Chưa tải được địa điểm và hoạt động.</p>
              <p className="mt-1 text-sm">{servicesError}</p>
              <p className="mt-1 text-sm">Hệ thống cần kết nối cơ sở dữ liệu để hiển thị dịch vụ và nhận đặt chỗ.</p>
              <button
                type="button"
                onClick={() => {
                  setLoading(true);
                  setReloadCount((count) => count + 1);
                }}
                className="mt-4 rounded-xl bg-forest-800 px-4 py-2 text-sm font-bold text-white transition-colors hover:bg-forest-900"
              >
                Thử tải lại
              </button>
            </div>
          ) : filteredServices.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredServices.map((service) => (
                <ExperienceCard
                  key={service.id}
                  service={service}
                  onBook={(s) => setBookingService(s)}
                  isFavorite={favorites.includes(service.id)}
                  onToggleFavorite={toggleFavorite}
                />
              ))}
            </div>
          ) : (
            <div className="glass-card-3d p-12 text-center rounded-3xl">
              <p className="text-zinc-500 text-sm">
                Không tìm thấy trải nghiệm phù hợp với tiêu chí lọc hiện tại.
              </p>
              <button
                onClick={() => {
                  setSelectedCategory('Tất cả');
                  setBudget(300000);
                  setIndoorOnly(false);
                  setSearchQuery('');
                }}
                className="mt-3 px-5 py-2.5 bg-forest-700 text-white rounded-xl text-xs font-bold hover:bg-forest-800 transition-colors shadow-sm cursor-pointer"
              >
                Xem tất cả trải nghiệm
              </button>
            </div>
          )}
        </section>

        {/* Smart Itinerary Planner 3D CTA Section */}
        <section className="relative rounded-3xl p-8 sm:p-14 text-white shadow-2xl overflow-hidden bg-gradient-to-r from-emerald-900 via-forest-950 to-river-950 border border-emerald-500/30 card-glare">
          <div className="pointer-events-none absolute -right-20 -bottom-20 h-72 w-72 rounded-full bg-emerald-500/20 blur-3xl" />
          <div className="pointer-events-none absolute -left-20 -top-20 h-72 w-72 rounded-full bg-river-500/20 blur-3xl" />

          <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-8 space-y-4">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 text-emerald-300 text-xs font-bold border border-white/20 backdrop-blur-md">
                <Sparkles className="w-4 h-4 text-emerald-400" />
                <span>CÔNG CỤ TỰ ĐỘNG THÔNG MINH</span>
              </div>

              <h2 className="text-2xl sm:text-4xl font-black text-white leading-tight">
                Lập Kế Hoạch 1 Ngày Đi Chơi Bình Mỹ Trong 30 Giây
              </h2>

              <p className="text-sm sm:text-base text-zinc-200 leading-relaxed max-w-2xl">
                Bạn muốn kết hợp sáng hái bưởi, trưa ăn cá nướng rạch dứa và chiều chèo SUP hoàng hôn? Thuật toán thông minh sẽ tự động xếp khung giờ liền mạch và tính toán 30 phút di chuyển dự phòng giữa các nhà vườn.
              </p>

              {/* Visual preview pills of the route */}
              <div className="flex flex-wrap items-center gap-2 pt-2 text-xs font-medium text-emerald-200">
                <span className="bg-white/10 px-3 py-1.5 rounded-xl border border-white/15">🌅 08:30 Hái quả vườn xanh</span>
                <span className="text-emerald-400">➜</span>
                <span className="bg-white/10 px-3 py-1.5 rounded-xl border border-white/15">🍲 11:30 Cá lóc nướng Rạch Dứa</span>
                <span className="text-emerald-400">➜</span>
                <span className="bg-white/10 px-3 py-1.5 rounded-xl border border-white/15">🛶 15:30 Chèo SUP ven sông</span>
              </div>

              <div className="pt-4">
                <Link
                  href="/itinerary"
                  className="inline-flex items-center gap-2 px-7 py-4 rounded-2xl bg-white text-forest-950 font-black text-sm hover:bg-emerald-50 transition-all shadow-xl shadow-black/25 group cursor-pointer"
                >
                  <span>Bắt đầu lập hành trình ngay</span>
                  <ChevronRight className="w-4 h-4 text-forest-700 group-hover:translate-x-1.5 transition-transform" />
                </Link>
              </div>
            </div>

            <div className="lg:col-span-4 hidden lg:flex justify-center">
              <div className="relative p-6 rounded-3xl bg-white/10 backdrop-blur-2xl border border-white/20 shadow-2xl text-center space-y-3 max-w-xs animate-float">
                <div className="w-14 h-14 mx-auto rounded-2xl bg-emerald-500/20 border border-emerald-400/40 flex items-center justify-center text-emerald-300">
                  <Compass className="w-8 h-8" />
                </div>
                <h4 className="font-bold text-white text-base">Hành Trình Tự Động</h4>
                <p className="text-xs text-zinc-300 leading-relaxed">
                  Tối ưu thứ tự điểm đến, giảm thời gian di chuyển, tối đa thời gian hòa mình vào thiên nhiên.
                </p>
                <div className="pt-2 text-[11px] font-mono text-emerald-300 font-bold">
                  ✓ Miễn phí 100% cho du khách
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Solution 3C Section with 3D Isometric Cards */}
        <section className="rounded-3xl p-8 sm:p-14 text-white shadow-2xl bg-gradient-to-br from-forest-900 via-forest-950 to-river-950 border border-emerald-500/20 relative overflow-hidden">
          <div className="pointer-events-none absolute right-0 top-0 h-96 w-96 rounded-full bg-emerald-500/10 blur-3xl" />
          
          <div className="max-w-5xl mx-auto space-y-8 relative z-10">
            <div className="text-center space-y-2">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 text-emerald-300 text-xs font-bold border border-white/15 backdrop-blur-md">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                MÔ HÌNH DỰ ÁN 3C - PHIẾU GIẢI PHÁP SỐ HÓA
              </div>

              <h2 className="text-2xl sm:text-4xl font-black text-white leading-tight">
                Chuyển Đổi Số Du Lịch Sinh Thái Miệt Vườn Bình Mỹ
              </h2>
              <p className="text-zinc-300 text-xs sm:text-sm max-w-2xl mx-auto">
                Kết nối khách đô thị với không gian xanh miệt vườn qua nền tảng công nghệ số minh bạch, bền vững.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 pt-2">
              {/* Card 1 */}
              <div className="rounded-3xl bg-white/10 backdrop-blur-xl p-6 border border-white/15 hover:border-emerald-400/60 hover:bg-white/15 transition-all duration-300 space-y-3 group hover:-translate-y-2 shadow-xl">
                <div className="w-10 h-10 rounded-2xl bg-rose-500/20 border border-rose-400/40 flex items-center justify-center text-rose-300 font-black text-sm">
                  1
                </div>
                <h4 className="text-rose-300 font-bold text-sm">Hook & Need</h4>
                <p className="text-xs text-zinc-300 leading-relaxed">
                  Khách đô thị cần không gian xanh cuối tuần gần Sài Gòn; nhà vườn Bình Mỹ có cảnh đẹp và ẩm thực nhưng thiếu kênh đặt chỗ minh bạch, dễ quá tải hoặc vắng khách.
                </p>
              </div>

              {/* Card 2 */}
              <div className="rounded-3xl bg-white/10 backdrop-blur-xl p-6 border border-white/15 hover:border-amber-400/60 hover:bg-white/15 transition-all duration-300 space-y-3 group hover:-translate-y-2 shadow-xl">
                <div className="w-10 h-10 rounded-2xl bg-amber-500/20 border border-amber-400/40 flex items-center justify-center text-amber-300 font-black text-sm">
                  2
                </div>
                <h4 className="text-amber-300 font-bold text-sm">Approach</h4>
                <p className="text-xs text-zinc-300 leading-relaxed">
                  Nền tảng Next.js + PostgreSQL phân quyền 3 vai trò (Khách, Nhà vườn, Quản trị), quản lý sức chứa theo ca thời gian thực và tích hợp bản đồ miệt vườn ven sông.
                </p>
              </div>

              {/* Card 3 */}
              <div className="rounded-3xl bg-white/10 backdrop-blur-xl p-6 border border-white/15 hover:border-river-400/60 hover:bg-white/15 transition-all duration-300 space-y-3 group hover:-translate-y-2 shadow-xl">
                <div className="w-10 h-10 rounded-2xl bg-river-500/20 border border-river-400/40 flex items-center justify-center text-river-300 font-black text-sm">
                  3
                </div>
                <h4 className="text-river-300 font-bold text-sm">Benefits & Costs</h4>
                <p className="text-xs text-zinc-300 leading-relaxed">
                  Nhà vườn chủ động đón tiếp, hạn chế hủy đơn; khách hàng an tâm có chỗ trước; ban quản trị theo dõi quy hoạch và nguồn thu cộng đồng bền vững.
                </p>
              </div>

              {/* Card 4 */}
              <div className="rounded-3xl bg-white/10 backdrop-blur-xl p-6 border border-white/15 hover:border-emerald-400/60 hover:bg-white/15 transition-all duration-300 space-y-3 group hover:-translate-y-2 shadow-xl">
                <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 border border-emerald-400/40 flex items-center justify-center text-emerald-300 font-black text-sm">
                  4
                </div>
                <h4 className="text-emerald-300 font-bold text-sm">Competition & Close</h4>
                <p className="text-xs text-zinc-300 leading-relaxed">
                  Khác biệt với OTA đại trà, nền tảng tập trung sâu vào bản sắc bản địa Bình Mỹ Củ Chi, tôn vinh câu chuyện từng chủ vườn và sản vật theo mùa 365 ngày.
                </p>
              </div>
            </div>
          </div>
        </section>
      </div>

      {/* Booking Modal */}
      {bookingService && (
        <BookingModal
          service={bookingService}
          currentUser={currentUser}
          onClose={() => setBookingService(null)}
          onSuccess={() => {
            setBookingService(null);
          }}
        />
      )}
    </div>
  );
}
