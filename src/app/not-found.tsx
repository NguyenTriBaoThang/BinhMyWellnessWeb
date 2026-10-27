import Link from 'next/link';
import { ArrowLeft, Compass } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4 py-16 text-center">
      <div className="max-w-md w-full bg-white rounded-3xl p-8 border border-[#174C3C]/15 shadow-xl space-y-4">
        <div className="w-16 h-16 rounded-2xl bg-[#E7EFE4] text-[#174C3C] flex items-center justify-center mx-auto shadow-sm">
          <Compass className="w-8 h-8 text-[#D6A545]" />
        </div>
        <h2 className="text-4xl font-black text-[#174C3C]">404</h2>
        <h3 className="text-xl font-black text-[#26352E]">Không tìm thấy trang</h3>
        <p className="text-xs sm:text-sm text-[#26352E]/70 leading-relaxed">
          Địa chỉ bạn truy cập không tồn tại hoặc đã được cập nhật lại theo cấu trúc mới của Bình Mỹ Du Ký.
        </p>
        <div className="pt-2">
          <Link
            href="/"
            className="btn-tactile btn-primary-forest text-xs sm:text-sm px-6 py-2.5 rounded-full"
          >
            <ArrowLeft className="w-4 h-4" /> Quay lại trang chủ
          </Link>
        </div>
      </div>
    </div>
  );
}
