import Link from 'next/link';
import { Compass, Camera, Sparkles, MapPin, Heart, Route } from 'lucide-react';
import { categoriesData } from '@/lib/data/repository';

export default function Footer() {
  return (
    <footer className="mt-20 bg-[#174C3C] text-white">
      <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-4">
          {/* Brand block */}
          <div className="lg:col-span-1">
            <Link href="/" className="inline-flex items-center gap-2.5">
              <span className="grid h-10 w-10 place-items-center rounded-2xl bg-white/10 text-[#D6A545]">
                <Compass size={22} />
              </span>
              <span className="text-lg font-black tracking-tight text-white">
                BÌNH MỸ DU KÝ
              </span>
            </Link>
            <p className="mt-3 text-xs font-bold uppercase tracking-wider text-[#D6A545]">
              “Bốn mùa trải nghiệm — Mỗi lần đến, thêm một khám phá.”
            </p>
            <p className="mt-3 text-sm leading-relaxed text-[#E7EFE4]/80">
              Nền tảng du lịch sinh thái kết hợp miệt vườn, làng nghề truyền thống và sông nước Củ Chi.
            </p>
            <div className="mt-5 flex items-center gap-2 text-xs text-[#E7EFE4]/70">
              <MapPin size={14} className="text-[#D6A545] shrink-0" />
              <span>Bình Mỹ, Củ Chi, TP. Hồ Chí Minh</span>
            </div>
          </div>

          {/* 4 Trải nghiệm */}
          <div>
            <h3 className="text-sm font-black uppercase tracking-wider text-[#D6A545]">
              4 Nhóm trải nghiệm
            </h3>
            <ul className="mt-4 space-y-2.5 text-sm">
              {categoriesData.map((cat) => (
                <li key={cat.id}>
                  <Link
                    href={`/explore?category=${cat.id}`}
                    className="text-[#E7EFE4]/80 hover:text-white transition flex items-center gap-2"
                  >
                    <span className="h-1.5 w-1.5 rounded-full bg-[#D6A545]" />
                    {cat.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Điều hướng nhanh */}
          <div>
            <h3 className="text-sm font-black uppercase tracking-wider text-[#D6A545]">
              Tính năng chính
            </h3>
            <ul className="mt-4 space-y-2.5 text-sm">
              <li>
                <Link
                  href="/explore"
                  className="text-[#E7EFE4]/80 hover:text-white transition inline-flex items-center gap-2"
                >
                  <Compass size={14} /> Khám phá điểm đến
                </Link>
              </li>
              <li>
                <Link
                  href="/itinerary"
                  className="text-[#E7EFE4]/80 hover:text-white transition inline-flex items-center gap-2"
                >
                  <Route size={14} /> Lập hành trình thông minh
                </Link>
              </li>
              <li>
                <Link
                  href="/my"
                  className="text-[#E7EFE4]/80 hover:text-white transition inline-flex items-center gap-2"
                >
                  <Heart size={14} /> Điểm đến & Hành trình đã lưu
                </Link>
              </li>
              <li>
                <Link
                  href="/sources"
                  className="text-[#E7EFE4]/80 hover:text-white transition inline-flex items-center gap-2"
                >
                  <Camera size={14} /> Nguồn ảnh & Tư liệu
                </Link>
              </li>
            </ul>
          </div>

          {/* Minh bạch dữ liệu */}
          <div>
            <h3 className="text-sm font-black uppercase tracking-wider text-[#D6A545]">
              Minh bạch dữ liệu
            </h3>
            <p className="mt-4 text-xs leading-relaxed text-[#E7EFE4]/80">
              Dữ liệu được lưu trữ trực tiếp trên thiết bị qua localStorage. Website không thu thập thông tin cá nhân và không yêu cầu đăng nhập.
            </p>
            <div className="mt-4 pt-3 border-t border-white/10">
              <Link
                href="/editor"
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#E7EFE4] hover:text-[#D6A545] transition"
              >
                <Sparkles size={13} /> Công cụ quản lý dữ liệu trên máy
              </Link>
            </div>
          </div>
        </div>

        {/* Bottom copyright */}
        <div className="mt-12 border-t border-white/10 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-[#E7EFE4]/60">
          <p>© {new Date().getFullYear()} BÌNH MỸ DU KÝ WEBSITE. Bản quyền thuộc về dự án nghiên cứu du lịch sinh thái Bình Mỹ.</p>
          <p>Chạy trên nền tảng Vercel tĩnh · Dữ liệu JSON chuẩn hóa.</p>
        </div>
      </div>
    </footer>
  );
}
