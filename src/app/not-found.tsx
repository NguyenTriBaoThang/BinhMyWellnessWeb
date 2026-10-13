import Link from 'next/link';
import { ArrowLeft, Trees } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4 py-16 text-center">
      <div className="max-w-md w-full bg-white rounded-3xl p-8 border border-emerald-100 shadow-xl space-y-4">
        <div className="w-16 h-16 rounded-2xl bg-emerald-100 text-forest-800 flex items-center justify-center mx-auto">
          <Trees className="w-8 h-8" />
        </div>
        <h2 className="text-3xl font-black text-forest-950">404</h2>
        <h3 className="text-lg font-bold text-zinc-900">Không tìm thấy trang</h3>
        <p className="text-xs text-zinc-600">
          Trang bạn tìm kiếm không tồn tại hoặc đã được chuyển sang địa chỉ khác.
        </p>
        <div className="pt-2">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-forest-700 hover:bg-forest-800 text-white font-bold text-xs shadow-md transition-all"
          >
            <ArrowLeft className="w-4 h-4" /> Quay lại trang chủ
          </Link>
        </div>
      </div>
    </div>
  );
}
