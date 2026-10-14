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
} from 'lucide-react';
import { Service, User } from '@/types';
import { CATEGORIES } from '@/lib/constants';
import ExperienceCard from '@/components/ExperienceCard';
import RealtimeCapacityWidget from '@/components/RealtimeCapacityWidget';
import BinhMy365Timeline from '@/components/BinhMy365Timeline';
import LeafletMap from '@/components/LeafletMap';
import BookingModal from '@/components/BookingModal';

export default function HomePage() {
  const [services, setServices] = useState<Service[]>([]);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

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
        const servData = await servRes.json();
        if (servData.services) {
          setServices(servData.services);
          const requestedServiceId = new URLSearchParams(window.location.search).get('book');
          const requestedService = servData.services.find((service: Service) => service.id === requestedServiceId);
          if (requestedService) setBookingService(requestedService);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, []);

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

  return (
    <div className="space-y-12 sm:space-y-16 pb-24">
      {/* Hero Section */}
      <section className="relative min-h-[580px] sm:min-h-[660px] flex items-center justify-center overflow-hidden bg-forest-950">
        <Image
          src="/assets/bo_song_binh_my.jpg"
          alt="Bờ sông Sài Gòn xã Bình Mỹ Củ Chi"
          fill
          priority
          className="object-cover opacity-40 scale-105 transform hover:scale-100 transition-transform duration-1000"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-forest-950 via-forest-950/50 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-forest-950/80 via-transparent to-forest-950/80" />

        <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-white py-16 sm:py-20">
          {/* Weather & Location Live Pill */}
          <div className="inline-flex flex-wrap items-center justify-center gap-2 px-4 py-1.5 rounded-full bg-emerald-900/60 border border-emerald-400/40 text-emerald-300 text-xs font-semibold mb-6 backdrop-blur-md shadow-lg">
            <span className="flex items-center gap-1.5">
              <Sun className="w-3.5 h-3.5 text-amber-400" />
              <span>Thời tiết hôm nay: 29°C Nắng đẹp</span>
            </span>
            <span className="text-emerald-500 font-bold">•</span>
            <span className="flex items-center gap-1.5">
              <Wind className="w-3.5 h-3.5 text-river-300" />
              <span>Gió sông Sài Gòn lộng mát</span>
            </span>
            <span className="text-emerald-500 font-bold">•</span>
            <span className="text-emerald-200 font-medium">8 Nhà vườn mở đón</span>
          </div>

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight text-white leading-tight drop-shadow-md">
            Một Ngày Xanh <br className="hidden sm:inline" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-300 via-teal-200 to-river-300">
              Bên Dòng Sông Sài Gòn
            </span>
          </h1>

          <p className="mt-4 sm:mt-6 text-sm sm:text-lg text-zinc-200 max-w-2xl mx-auto leading-relaxed">
            Chỉ 45 phút từ trung tâm TP.HCM. Trải nghiệm hái rau hữu cơ, vườn bưởi da xanh Chú Sáu, bữa trưa cá nướng Cầu Rạch Dứa và chèo SUP hoàng hôn ven sông.
          </p>

          {/* Quick Search & Filter Card */}
          <div className="mt-8 sm:mt-10 max-w-3xl mx-auto bg-white/95 backdrop-blur-xl p-3 sm:p-4 rounded-3xl shadow-2xl border border-white/30 text-zinc-900 flex flex-col sm:flex-row items-center gap-3">
            <div className="flex-1 w-full flex items-center gap-2.5 px-3 py-2 bg-zinc-50 rounded-2xl border border-zinc-200 focus-within:border-forest-600 focus-within:bg-white transition-all">
              <Search className="w-4 h-4 text-zinc-400 shrink-0" />
              <input
                type="text"
                placeholder="Tìm trải nghiệm, nhà vườn, hái trái cây, chèo SUP..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-transparent text-xs sm:text-sm text-zinc-900 focus:outline-none placeholder:text-zinc-400 font-medium"
              />
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-3 py-2.5 bg-zinc-50 rounded-2xl border border-zinc-200 text-xs font-semibold text-zinc-700 focus:outline-none cursor-pointer hover:bg-zinc-100"
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>

              <a
                href="#experiences-grid"
                className="px-5 py-2.5 bg-forest-700 hover:bg-forest-800 text-white rounded-2xl font-bold text-xs sm:text-sm transition-all shadow-md shadow-forest-700/30 flex items-center justify-center gap-1.5 shrink-0"
              >
                <span>Khám phá ngay</span>
                <ArrowRight className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Quick Jump Anchors */}
          <div className="mt-8 flex flex-wrap items-center justify-center gap-2 text-xs">
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
              className="px-3 py-1.5 rounded-full bg-emerald-500/30 hover:bg-emerald-500/40 text-white font-bold border border-emerald-400/40 transition-all backdrop-blur-md flex items-center gap-1.5"
            >
              <Sparkles className="w-3.5 h-3.5 text-emerald-300" />
              <span>Lập hành trình tự động</span>
            </Link>
          </div>
        </div>
      </section>

      {/* Main Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12 sm:space-y-16">
        {/* Realtime Capacity Widget */}
        <RealtimeCapacityWidget />

        {/* 365 Days Seasonal Timeline */}
        <BinhMy365Timeline
          services={services}
          onSelectService={(serviceId) => {
            const found = services.find((s) => s.id === serviceId);
            if (found) setBookingService(found);
          }}
          onExploreCategory={(category) => {
            setSelectedCategory(category);
            document.getElementById('experiences-grid')?.scrollIntoView({ behavior: 'smooth' });
          }}
        />

        {/* Interactive Leaflet Map Section */}
        <LeafletMap
          services={services}
          onSelectService={(s) => setBookingService(s)}
        />

        {/* Experiences Showcase Section */}
        <section id="experiences-grid" className="space-y-8 scroll-mt-24">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-forest-100 text-forest-800 text-xs font-bold mb-2 border border-forest-200 shadow-xs">
                <Trees className="w-4 h-4 text-forest-600" />
                DANH MỤC TRẢI NGHIỆM ĐẶC SẮC
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-forest-950 tracking-tight">
                Không Gian Nhà Vườn & Hoạt Động Mở Đón
              </h2>
              <p className="text-zinc-600 text-xs sm:text-sm mt-1">
                Lựa chọn hoạt động phù hợp theo sở thích, nhóm khách và ngân sách chuyến đi.
              </p>
            </div>

            {/* Quick stats indicator */}
            <span className="text-xs font-semibold text-zinc-500 bg-white px-3 py-1.5 rounded-xl border border-zinc-200 shadow-xs self-start md:self-auto">
              Hiển thị <strong className="text-forest-800 font-bold">{filteredServices.length}</strong> / {services.length} hoạt động
            </span>
          </div>

          {/* Filter Bar */}
          <div className="bg-white p-4 sm:p-6 rounded-3xl border border-zinc-200 shadow-sm space-y-4">
            {/* Category Pills */}
            <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-4 py-2 rounded-2xl text-xs font-bold transition-all shrink-0 ${
                    selectedCategory === cat
                      ? 'bg-forest-800 text-white shadow-md shadow-forest-800/20 scale-102'
                      : 'bg-zinc-100 hover:bg-zinc-200 text-zinc-700'
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
                    className="text-rose-600 hover:text-rose-700 font-bold hover:underline"
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

          {/* Experiences Grid */}
          {filteredServices.length > 0 ? (
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
            <div className="bg-white p-12 text-center rounded-3xl border border-zinc-200 shadow-sm">
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
                className="mt-3 px-4 py-2 bg-forest-700 text-white rounded-xl text-xs font-semibold hover:bg-forest-800 transition-colors"
              >
                Xem tất cả trải nghiệm
              </button>
            </div>
          )}
        </section>

        {/* Smart Itinerary Planner CTA Section */}
        <section className="bg-gradient-to-r from-emerald-800 via-forest-900 to-river-900 rounded-3xl p-8 sm:p-12 text-white shadow-xl relative overflow-hidden">
          <div className="relative z-10 max-w-3xl space-y-4">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 text-emerald-300 text-xs font-bold border border-white/15 backdrop-blur-md">
              <Sparkles className="w-4 h-4 text-emerald-400" />
              <span>CÔNG CỤ TỰ ĐỘNG THÔNG MINH</span>
            </div>

            <h2 className="text-2xl sm:text-4xl font-extrabold text-white leading-tight">
              Lập Kế Hoạch 1 Ngày Đi Chơi Bình Mỹ Trong 30 Giây
            </h2>

            <p className="text-sm sm:text-base text-zinc-200 leading-relaxed">
              Bạn muốn kết hợp sáng hái bưởi, trưa ăn cá nướng rạch dứa và chiều chèo SUP hoàng hôn? Thuật toán thông minh sẽ tự động xếp khung giờ liền mạch và tính toán 30 phút di chuyển dự phòng giữa các nhà vườn.
            </p>

            <div className="pt-2">
              <Link
                href="/itinerary"
                className="inline-flex items-center gap-2 px-6 py-3.5 rounded-2xl bg-white text-forest-950 font-black text-sm hover:bg-emerald-50 transition-all shadow-lg shadow-black/20 group"
              >
                <span>Bắt đầu lập hành trình ngay</span>
                <ChevronRight className="w-4 h-4 text-forest-700 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </div>
        </section>

        {/* Solution 3C Section (Phiếu 3C: Hook, Need, Approach, Benefits, Competition, Close) */}
        <section className="bg-gradient-to-br from-forest-900 via-forest-950 to-river-950 rounded-3xl p-8 sm:p-12 text-white shadow-xl">
          <div className="max-w-4xl mx-auto space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-emerald-300 text-xs font-semibold">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              MÔ HÌNH DỰ ÁN 3C - PHIẾU GIẢI PHÁP SỐ HÓA
            </div>

            <h2 className="text-2xl sm:text-4xl font-extrabold text-white leading-tight">
              Chuyển Đổi Số Du Lịch Sinh Thái Miệt Vườn Bình Mỹ
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs text-zinc-300 pt-2">
              <div className="bg-white/5 p-5 rounded-2xl border border-white/10 space-y-2">
                <h4 className="text-emerald-400 font-bold text-sm">1. Hook & Need (Nhu Cầu)</h4>
                <p className="leading-relaxed">Khách đô thị cần không gian xanh cuối tuần gần Sài Gòn; nhà vườn Bình Mỹ có cảnh đẹp và ẩm thực nhưng thiếu kênh đặt chỗ minh bạch, dễ quá tải hoặc vắng khách bất ngờ.</p>
              </div>

              <div className="bg-white/5 p-5 rounded-2xl border border-white/10 space-y-2">
                <h4 className="text-amber-400 font-bold text-sm">2. Approach (Giải Pháp)</h4>
                <p className="leading-relaxed">Nền tảng Next.js + PostgreSQL phân quyền 3 vai trò (Khách, Nhà vườn, Quản trị), quản lý sức chứa theo ca thời gian thực và tích hợp bản đồ miệt vườn ven sông.</p>
              </div>

              <div className="bg-white/5 p-5 rounded-2xl border border-white/10 space-y-2">
                <h4 className="text-river-400 font-bold text-sm">3. Benefits & Costs (Lợi Ích)</h4>
                <p className="leading-relaxed">Nhà vườn chủ động đón tiếp, hạn chế hủy đơn; khách hàng an tâm có chỗ trước; ban quản trị theo dõi quy hoạch và nguồn thu cộng đồng bền vững.</p>
              </div>

              <div className="bg-white/5 p-5 rounded-2xl border border-white/10 space-y-2">
                <h4 className="text-rose-400 font-bold text-sm">4. Competition & Close</h4>
                <p className="leading-relaxed">Khác biệt với OTA đại trà, nền tảng tập trung sâu vào bản sắc bản địa Bình Mỹ Củ Chi, tôn vinh câu chuyện từng chủ vườn và sản vật theo mùa 365 ngày.</p>
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
