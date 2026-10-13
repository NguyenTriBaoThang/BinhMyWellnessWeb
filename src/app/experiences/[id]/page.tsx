'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import {
  Clock,
  Users,
  MapPin,
  CheckCircle2,
  Calendar,
  Phone,
  Mail,
  Shield,
  Star,
  ArrowLeft,
  Share2,
} from 'lucide-react';
import { Service, ProviderProfile, Review, User } from '@/types';
import { formatVND } from '@/lib/utils';
import BookingModal from '@/components/BookingModal';

export default function ExperienceDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [service, setService] = useState<Service | null>(null);
  const [provider, setProvider] = useState<ProviderProfile | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isBookingOpen, setIsBookingOpen] = useState(false);

  useEffect(() => {
    async function fetchDetail() {
      try {
        setLoading(true);
        const [meRes, servRes] = await Promise.all([
          fetch('/api/auth/me').then((r) => r.json()),
          fetch(`/api/services/${params.id}`).then((r) => r.json()),
        ]);

        setCurrentUser(meRes.user);
        if (servRes.service) {
          setService(servRes.service);
          setProvider(servRes.provider);
          setReviews(servRes.reviews || []);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

    if (params.id) {
      fetchDetail();
    }
  }, [params.id]);

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-20 text-center text-zinc-500 text-sm">
        Đang tải thông tin chi tiết trải nghiệm...
      </div>
    );
  }

  if (!service) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-20 text-center space-y-4">
        <h2 className="text-xl font-bold text-zinc-900">Không tìm thấy trải nghiệm này.</h2>
        <Link href="/" className="inline-block px-4 py-2 bg-forest-700 text-white rounded-xl text-xs font-semibold">
          Quay lại trang chủ
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-xs text-zinc-500">
        <Link href="/" className="hover:text-forest-700 flex items-center gap-1">
          <ArrowLeft className="w-3.5 h-3.5" /> Trang chủ
        </Link>
        <span>/</span>
        <span className="text-zinc-700 font-semibold">{service.category}</span>
        <span>/</span>
        <span className="text-zinc-900 font-bold truncate max-w-xs">{service.name}</span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Image, Description, Details */}
        <div className="lg:col-span-8 space-y-8">
          {/* Main Image */}
          <div className="relative h-72 sm:h-96 rounded-3xl overflow-hidden shadow-lg bg-zinc-100">
            <Image
              src={service.image}
              alt={service.name}
              fill
              priority
              className="object-cover"
            />
            <div className="absolute top-4 left-4 flex gap-2">
              <span className="bg-white/90 backdrop-blur-md px-3 py-1 rounded-full text-xs font-bold text-forest-900">
                {service.category}
              </span>
              {service.indoor && (
                <span className="bg-emerald-600/90 backdrop-blur-md px-3 py-1 rounded-full text-xs font-bold text-white">
                  Khu vực có mái che
                </span>
              )}
            </div>
          </div>

          {/* Title & Host info */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-xs font-semibold text-forest-700">
              <MapPin className="w-4 h-4" />
              <span>{service.providerName}</span>
            </div>

            <h1 className="text-2xl sm:text-4xl font-extrabold text-forest-950 tracking-tight leading-tight">
              {service.name}
            </h1>

            <p className="text-sm text-zinc-600 leading-relaxed pt-2">
              {service.description}
            </p>
          </div>

          {/* Highlights & Amenities */}
          <div className="bg-zinc-50 rounded-3xl p-6 border border-zinc-200/80 space-y-4">
            <h3 className="font-bold text-base text-zinc-900">Tiện Nghi & Điều Kiện Phục Vụ</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {service.amenities.map((item) => (
                <div key={item} className="flex items-center gap-2 text-xs text-zinc-700">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>{item}</span>
                </div>
              ))}
            </div>

            {service.included && (
              <div className="pt-3 border-t border-zinc-200/80 text-xs text-zinc-600">
                <strong className="text-zinc-900">Bao gồm:</strong> {service.included}
              </div>
            )}

            {service.conditions && (
              <div className="text-xs text-zinc-600">
                <strong className="text-zinc-900">Lưu ý khi tham gia:</strong> {service.conditions}
              </div>
            )}
          </div>

          {/* Provider Story Box */}
          {provider && (
            <div className="bg-forest-50/70 rounded-3xl p-6 border border-forest-100 space-y-3">
              <h3 className="font-bold text-base text-forest-950">
                Câu Chuyện Nhà Vườn: {provider.name}
              </h3>
              <p className="text-xs sm:text-sm text-forest-900/80 leading-relaxed">
                {provider.story}
              </p>
              <div className="text-xs text-forest-800 pt-1 font-mono">
                Địa chỉ: {provider.address}
              </div>
            </div>
          )}

          {/* Reviews section */}
          <div className="space-y-4 pt-4">
            <h3 className="font-bold text-lg text-zinc-900 flex items-center gap-2">
              <Star className="w-5 h-5 text-amber-500 fill-amber-500" />
              Đánh Giá Từ Du Khách ({reviews.length})
            </h3>

            {reviews.length === 0 ? (
              <p className="text-xs text-zinc-500 italic">Chưa có đánh giá nào cho hoạt động này.</p>
            ) : (
              <div className="space-y-3">
                {reviews.map((rev) => (
                  <div key={rev.id} className="bg-white p-4 rounded-2xl border border-zinc-200 shadow-sm space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-zinc-800">{rev.userName}</span>
                      <div className="flex text-amber-400">
                        {[...Array(rev.rating)].map((_, i) => (
                          <span key={i}>★</span>
                        ))}
                      </div>
                    </div>
                    <p className="text-xs text-zinc-600">{rev.text}</p>
                    {rev.reply && (
                      <div className="bg-forest-50 p-2.5 rounded-xl border border-forest-100 text-[11px] text-forest-900">
                        <strong>Nhà vườn:</strong> {rev.reply}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Sticky Booking Card */}
        <div className="lg:col-span-4">
          <div className="sticky top-24 bg-white rounded-3xl p-6 border border-zinc-200 shadow-xl space-y-6">
            <div className="flex items-baseline justify-between border-b border-zinc-100 pb-4">
              <div>
                <span className="text-xs text-zinc-500">Giá trải nghiệm</span>
                <div className="text-2xl font-black text-forest-900 font-mono">
                  {formatVND(service.price)}
                </div>
              </div>
              <span className="text-xs text-zinc-500 font-medium">/khách</span>
            </div>

            <div className="space-y-3 text-xs text-zinc-700">
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1.5 text-zinc-500">
                  <Clock className="w-4 h-4 text-forest-600" /> Thời lượng:
                </span>
                <span className="font-bold">{service.duration} phút</span>
              </div>

              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1.5 text-zinc-500">
                  <Users className="w-4 h-4 text-amber-600" /> Sức chứa:
                </span>
                <span className="font-bold">{service.capacity} khách / ca</span>
              </div>
            </div>

            <div>
              <span className="block text-xs font-semibold text-zinc-700 mb-2">
                Các khung giờ đón khách trong ngày:
              </span>
              <div className="grid grid-cols-2 gap-2">
                {service.slots.map((s) => (
                  <div
                    key={s}
                    className="p-2 rounded-xl bg-zinc-50 text-center font-mono text-xs font-semibold text-zinc-800 border border-zinc-200"
                  >
                    {s}
                  </div>
                ))}
              </div>
            </div>

            <button
              onClick={() => setIsBookingOpen(true)}
              className="w-full py-3.5 rounded-2xl bg-forest-700 hover:bg-forest-800 text-white font-bold text-sm shadow-lg shadow-forest-700/25 active:scale-95 transition-all"
            >
              Đặt chỗ trải nghiệm ngay
            </button>

            <div className="text-center text-[11px] text-zinc-500 space-y-1">
              <p>✓ Không cần trả trước • Thanh toán tại nhà vườn</p>
              <p>✓ Xác nhận nhanh trong vòng 30 phút</p>
            </div>
          </div>
        </div>
      </div>

      {isBookingOpen && (
        <BookingModal
          service={service}
          currentUser={currentUser}
          onClose={() => setIsBookingOpen(false)}
        />
      )}
    </div>
  );
}
