import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowLeft, ExternalLink, Image as ImageIcon, BookOpen, ShieldCheck } from 'lucide-react';
import { imagesData, sourcesData, placesData } from '@/lib/data/repository';

export const metadata: Metadata = {
  title: 'Nguồn ảnh & Minh bạch tư liệu | Bình Mỹ Du Ký Website',
  description: 'Ghi nhận nguồn tư liệu, tác giả và bản quyền hình ảnh phục vụ nghiên cứu du lịch sinh thái Bình Mỹ.',
};

export default function SourcesPage() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 sm:py-14 lg:px-8">
      <Link
        href="/"
        className="inline-flex items-center gap-2 text-sm font-bold text-[#174C3C] hover:underline"
      >
        <ArrowLeft size={16} /> Quay lại trang chủ
      </Link>

      <header className="mt-6 rounded-3xl bg-[#174C3C] p-6 sm:p-10 text-white">
        <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3.5 py-1 text-xs font-bold text-[#D6A545]">
          <ShieldCheck size={15} /> Minh bạch & Tôn trọng bản quyền
        </span>
        <h1 className="mt-4 text-3xl sm:text-4xl font-black tracking-tight text-white">
          Nguồn ảnh & Tư liệu nghiên cứu
        </h1>
        <p className="mt-3 max-w-2xl text-sm sm:text-base leading-relaxed text-[#E7EFE4]/90">
          Website cam kết không dùng ảnh sai địa điểm và tôn trọng quyền tác giả. Mọi hình ảnh và nội dung đều được đối chiếu với tư liệu ghi nhận thực tế tại xã Bình Mỹ, huyện Củ Chi, TP.HCM.
        </p>
      </header>

      {/* Danh sách ảnh và tác giả */}
      <section className="mt-12">
        <div className="flex items-center gap-3">
          <span className="grid h-10 w-10 place-items-center rounded-xl bg-[#E7EFE4] text-[#174C3C]">
            <ImageIcon size={20} />
          </span>
          <div>
            <h2 className="text-xl font-extrabold text-[#174C3C]">Tư liệu hình ảnh & Tác giả</h2>
            <p className="text-xs sm:text-sm text-[#26352E]/70">Ghi nhận đầy đủ nguồn gốc và quyền sử dụng theo dữ liệu metadata.</p>
          </div>
        </div>

        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          {imagesData.map((img) => {
            const place = placesData.find((p) => p.id === img.placeId);
            return (
              <article
                key={img.id}
                className="card-3d p-5 rounded-2xl flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-[#E7EFE4] text-[#174C3C]">
                      {img.categoryId}
                    </span>
                    <span className="text-[11px] font-semibold text-[#26352E]/60">
                      Mã: {img.id}
                    </span>
                  </div>
                  <h3 className="mt-3 font-bold text-base text-[#174C3C] leading-snug">
                    {img.alt}
                  </h3>
                  {place && (
                    <p className="mt-1.5 text-xs text-[#26352E]/75">
                      <strong className="text-[#174C3C]">Địa điểm gắn liền:</strong> {place.name}
                    </p>
                  )}
                  <p className="mt-2 text-xs text-[#26352E]/80">
                    <strong className="text-[#174C3C]">Tác giả / Đơn vị:</strong> {img.credit}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-zinc-100 flex items-center justify-between">
                  <a
                    href={img.sourceUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-[#174C3C] hover:text-[#D6A545] transition"
                  >
                    Xem bài viết gốc <ExternalLink size={13} />
                  </a>
                </div>
              </article>
            );
          })}
        </div>
      </section>

      {/* Nguồn bài viết và tư liệu xuất bản */}
      <section className="mt-14">
        <div className="flex items-center gap-3">
          <span className="grid h-10 w-10 place-items-center rounded-xl bg-[#E7EFE4] text-[#174C3C]">
            <BookOpen size={20} />
          </span>
          <div>
            <h2 className="text-xl font-extrabold text-[#174C3C]">Tư liệu xuất bản tham khảo</h2>
            <p className="text-xs sm:text-sm text-[#26352E]/70">Các ấn phẩm, báo chí và nghiên cứu về du lịch vườn, sinh thái ven sông Bình Mỹ.</p>
          </div>
        </div>

        <div className="mt-6 space-y-4">
          {sourcesData.map((src) => (
            <div
              key={src.id}
              className="card-3d p-5 rounded-2xl"
            >
              <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-2">
                <a
                  href={src.sourceUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-bold text-base text-[#174C3C] hover:text-[#D6A545] transition inline-flex items-center gap-1.5"
                >
                  {src.title} <ExternalLink size={14} />
                </a>
                <span className="text-xs text-[#26352E]/60 whitespace-nowrap">
                  {src.publisher} {src.publishedAt ? `· ${src.publishedAt}` : ''}
                </span>
              </div>
              <p className="mt-2 text-sm text-[#26352E]/80 leading-relaxed">
                {src.scopeNote}
              </p>
              {src.author && (
                <p className="mt-2 text-xs font-medium text-[#174C3C]">
                  Tác giả / Nghiên cứu: {src.author}
                </p>
              )}
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
