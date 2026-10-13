import Link from 'next/link';
import { Trees, MapPin, Phone, Mail, Heart, ShieldCheck } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-forest-950 text-white pt-16 pb-12 border-t border-forest-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          {/* Col 1 */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-forest-600 flex items-center justify-center text-white shadow-lg">
                <Trees className="w-6 h-6" />
              </div>
              <span className="font-bold text-xl text-white tracking-tight">
                Bình Mỹ Wellness
              </span>
            </div>
            <p className="text-sm text-forest-200 leading-relaxed">
              Nền tảng kết nối du lịch nông nghiệp, sinh thái miệt vườn và trải nghiệm thiên nhiên bền vững tại Xã Bình Mỹ, Huyện Củ Chi, TP. Hồ Chí Minh.
            </p>
            <div className="flex items-center gap-2 text-xs text-emerald-400">
              <ShieldCheck className="w-4 h-4" />
              <span>Dự án số hóa du lịch nông thôn 2026</span>
            </div>
          </div>

          {/* Col 2 */}
          <div>
            <h4 className="text-base font-semibold text-white mb-4">Các Hợp Phần Trải Nghiệm</h4>
            <ul className="space-y-2.5 text-sm text-forest-200">
              <li>
                <Link href="/#binhmy-365" className="hover:text-white transition-colors">
                  • Khám phá Bình Mỹ 365 ngày
                </Link>
              </li>
              <li>
                <Link href="/#map-section" className="hover:text-white transition-colors">
                  • Bản đồ sinh thái & nhà vườn ven sông
                </Link>
              </li>
              <li>
                <Link href="/itinerary" className="hover:text-white transition-colors">
                  • Lập hành trình thông minh tự động
                </Link>
              </li>
              <li>
                <Link href="/customer" className="hover:text-white transition-colors">
                  • Theo dõi đặt chỗ & đánh giá
                </Link>
              </li>
              <li>
                <Link href="/provider" className="hover:text-white transition-colors">
                  • Cổng thông tin dành cho nhà vườn
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 3 */}
          <div>
            <h4 className="text-base font-semibold text-white mb-4">Nhà Vườn Tiêu Biểu</h4>
            <ul className="space-y-2.5 text-sm text-forest-200">
              <li>🏡 Vườn xanh Bình Mỹ (Ấp 6)</li>
              <li>🛶 Bình Mỹ Riverside (SUP sông Sài Gòn)</li>
              <li>🍲 Khu ẩm thực Rạch Dứa</li>
              <li>🪷 Đầm sen đường Võ Văn Bích</li>
              <li>🍊 Vườn trái cây Chú Sáu (TL9)</li>
              <li>☕ Zi Coffee sân vườn hồ cá</li>
            </ul>
          </div>

          {/* Col 4 */}
          <div>
            <h4 className="text-base font-semibold text-white mb-4">Thông Tin Địa Phương</h4>
            <div className="space-y-3 text-sm text-forest-200">
              <div className="flex items-start gap-2.5">
                <MapPin className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                <span>UBND Xã Bình Mỹ, Tỉnh lộ 9, Huyện Củ Chi, TP. Hồ Chí Minh</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Phone className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Đường dây nóng du lịch: 0908 123 456</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Mail className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>hotro@binhmywellness.vn</span>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-forest-900/80 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-forest-300">
          <p>© 2026 Bình Mỹ Wellness Web. Bản quyền thuộc về Ban điều phối du lịch cộng đồng Bình Mỹ.</p>
          <p className="flex items-center gap-1">
            Thiết kế vì tình yêu sông nước & miệt vườn Củ Chi <Heart className="w-3.5 h-3.5 text-rose-400 inline fill-rose-400" />
          </p>
        </div>
      </div>
    </footer>
  );
}
