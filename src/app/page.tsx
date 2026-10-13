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

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        // Load user
        const meRes = await fetch('/api/auth/me');
        const meData = await meRes.json();
        setCurrentUser(meData.user);

        // Load services
        const servRes = await fetch('/api/services');
        const servData = await servRes.json();
        if (servData.services) {
          setServices(servData.services);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, []);

  const toggleFavorite = (id: string) => {
    setFavorites((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
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
    <div className="space-y-12 sm:space-y-16 pb-20">
      {/* Hero Section */}
      <section className="relative min-h-[560px] sm:min-h-[640px] flex items-center justify-center overflow-hidden bg-forest-950">
        <Image
          src="/assets/bo_song_binh_my.jpg"
          alt="Bờ sông Sài Gòn xã Bình Mỹ Củ Chi"
          fill
          priority
          className="object-cover opacity-35 scale-105 transform hover:scale-100 transition-transform duration-1000"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-forest-950 via-forest-950/60 to-transparent" />

        <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-white py-16">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 text-xs sm:text-sm font-semibold mb-6 backdrop-blur-md">
            <Sparkles className="w-4 h-4 text-emerald-400" />
            <span>Du Lịch Nông Nghiệp Sinh Thái Xã Bình Mỹ, Củ Chi</span>
          </div>

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight text-white leading-tight drop-shadow-md">
            Một Ngày Xanh <br className="hidden sm:inline" />
            Bên Dòng Sông Sài Gòn
          </h1>

          <p className="mt-4 sm:mt-6 text-base sm:text-lg text-zinc-200 max-w-2xl mx-auto leading-relaxed">
            Rời xa khói bụi thành phố, chỉ cách trung tâm 45 phút di chuyển. Về với vườn rau hữu cơ, đầm sen rực rỡ, bữa trưa cá nướng bên rạch dứa và chèo SUP hoàng hôn ven sông.
          </p>

          {/* Quick Search Card */}
          <div className="mt-8 sm:mt-10 max-w-3xl mx-auto bg-white/95 backdrop-blur-xl p-3 sm:p-4 rounded-3xl shadow-2xl border border-white/20 text-zinc-900 flex flex-col sm:flex-row items-center gap-3">
            <div className="flex-1 w-full flex items-center gap-2.5 px-3 py-2 bg-zinc-50 rounded-2xl border border-zinc-200">
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
                className="px-3 py-2.5 bg-zinc-50 rounded-2xl border border-zinc-200 text-xs font-semibold text-zinc-700 focus:outline-none"
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>

              <a
                href="#experiences-grid"
                className="px-5 py-2.5 bg-forest-700 hover:bg-forest-800 text-white rounded-2xl font-bold text-xs sm:text-sm transition-all shadow-md flex items-center justify-center gap-1.5 shrink-0"
              >
                <span>Khám phá ngay</span>
                <ArrowRight className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Fast Highlights counter */}
          <div className="mt-8 flex flex-wrap items-center justify-center gap-6 text-xs text-zinc-300">
            <span className="flex items-center gap-1.5">
              <CheckCircle className="w-4 h-4 text-emerald-400" /> 8 Nhà vườn đối tác chính thức
            </span>
            <span className="flex items-center gap-1.5">
              <Droplets className="w-4 h-4 text-river-400" /> Bến sông Sài Gòn & Kênh Rạch Dứa
            </span>
            <span className="flex items-center gap-1.5">
              <Trees className="w-4 h-4 text-amber-400" /> 100% Nông sản tươi sạch tại vườn
            </span>
          </div>
        </div>
      </section>

      {/* Main Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12 sm:space-y-16">
        {/* Realtime Capacity Widget */}
        <RealtimeCapacityWidget services={services} />

        {/* 365 Days Seasonal Timeline */}
        <BinhMy365Timeline
          onSelectService={(serviceId) => {
            const found = services.find((s) => s.id === serviceId);
            if (found) setBookingService(found);
          }}
        />

        {/* Experiences Showcase Section */}
        <section id="experiences-grid" className="space-y-8 scroll-mt-24">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-forest-100 text-forest-800 text-xs font-semibold mb-2">
                <Trees className="w-3.5 h-3.5" />
                DANH MỤC TRẢI NGHIỆM ĐẶC SẮC
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-forest-950 tracking-tight">
                Không Gian Nhà Vườn & Hoạt Động Mở Đón
              </h2>
              <p className="text-zinc-600 text-sm mt-1">
                Lựa chọn hoạt động phù hợp theo sở thích, đối tượng và ngân sách của bạn.
              </p>
            </div>

            {/* Quick stats indicator */}
            <span className="text-xs font-semibold text-zinc-500">
              Hiển thị <strong className="text-forest-800">{filteredServices.length}</strong> / {services.length} hoạt động
            </span>
          </div>

          {/* Filter Bar */}
          <div className="bg-white p-4 sm:p-5 rounded-3xl border border-zinc-200/80 shadow-sm space-y-4">
            {/* Category Pills */}
            <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-4 py-2 rounded-2xl text-xs font-bold transition-all shrink-0 ${
                    selectedCategory === cat
                      ? 'bg-forest-700 text-white shadow-sm shadow-forest-700/20'
                      : 'bg-zinc-100 hover:bg-zinc-200 text-zinc-700'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Sub-filters (Budget slider + Indoor check) */}
            <div className="pt-2 border-t border-zinc-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-xs">
              <div className="flex items-center gap-3 w-full sm:w-auto">
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
                <span className="font-mono font-bold text-forest-800 bg-forest-50 px-2 py-0.5 rounded-md">
                  {budget.toLocaleString('vi-VN')}đ
                </span>
              </div>

              <div className="flex items-center gap-4">
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={indoorOnly}
                    onChange={(e) => setIndoorOnly(e.target.checked)}
                    className="rounded text-forest-700 focus:ring-forest-600"
                  />
                  <span className="text-zinc-700 font-medium">Có khu vực mái che</span>
                </label>

                {(selectedCategory !== 'Tất cả' || budget < 300000 || indoorOnly || searchQuery) && (
                  <button
                    onClick={() => {
                      setSelectedCategory('Tất cả');
                      setBudget(300000);
                      setIndoorOnly(false);
                      setSearchQuery('');
                    }}
                    className="text-rose-600 hover:underline font-semibold"
                  >
                    Xóa bộ lọc
                  </button>
                )}
              </div>
            </div>
          </div>

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
            <div className="bg-white p-12 text-center rounded-3xl border border-zinc-200">
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
                className="mt-3 px-4 py-2 bg-forest-700 text-white rounded-xl text-xs font-semibold"
              >
                Xem tất cả trải nghiệm
              </button>
            </div>
          )}
        </section>

        {/* Ecological Map Section */}
        <LeafletMap
          services={services}
          onSelectService={(s) => setBookingService(s)}
        />

        {/* Solution 3C Section (Phiếu 3C: Hook, Need, Approach, Benefits, Competition, Close) */}
        <section className="bg-gradient-to-br from-forest-900 via-forest-950 to-river-950 rounded-3xl p-8 sm:p-12 text-white shadow-xl">
          <div className="max-w-3xl mx-auto space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-emerald-300 text-xs font-semibold">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              MÔ HÌNH DỰ ÁN 3C - PHIẾU GIẢI PHÁP
            </div>

            <h2 className="text-2xl sm:text-4xl font-extrabold text-white leading-tight">
              Chuyển Đổi Số Du Lịch Sinh Thái Miệt Vườn Bình Mỹ
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs text-zinc-300 pt-2">
              <div className="bg-white/5 p-4 rounded-2xl border border-white/10">
                <h4 className="text-emerald-400 font-bold mb-1">1. Hook & Need (Nhu Cầu)</h4>
                <p>Khách đô thị cần không gian xanh cuối tuần gần Sài Gòn; nhà vườn Bình Mỹ có cảnh đẹp và ẩm thực nhưng thiếu kênh đặt chỗ minh bạch, dễ quá tải hoặc vắng khách bất ngờ.</p>
              </div>

              <div className="bg-white/5 p-4 rounded-2xl border border-white/10">
                <h4 className="text-amber-400 font-bold mb-1">2. Approach (Giải Pháp)</h4>
                <p>Nền tảng Next.js + PostgreSQL phân quyền 3 vai trò (Khách, Nhà vườn, Quản trị), quản lý sức chứa theo ca thời gian thực và tích hợp bản đồ miệt vườn ven sông.</p>
              </div>

              <div className="bg-white/5 p-4 rounded-2xl border border-white/10">
                <h4 className="text-river-400 font-bold mb-1">3. Benefits & Costs (Lợi Ích)</h4>
                <p>Nhà vườn chủ động đón tiếp, hạn chế hủy đơn; khách hàng an tâm có chỗ trước; ban quản trị theo dõi quy hoạch và nguồn thu cộng đồng bền vững.</p>
              </div>

              <div className="bg-white/5 p-4 rounded-2xl border border-white/10">
                <h4 className="text-rose-400 font-bold mb-1">4. Competition & Close</h4>
                <p>Khác biệt với OTA đại trà, nền tảng tập trung sâu vào bản sắc bản địa Bình Mỹ Củ Chi, tôn vinh câu chuyện từng chủ vườn và sản vật theo mùa 365 ngày.</p>
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
