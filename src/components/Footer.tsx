import Link from 'next/link';
import { Compass, FileText, MapPin } from 'lucide-react';
import { siteData } from '@/lib/data/repository';

export default function Footer() {
  return (
    <footer className="mt-20 bg-[#1B4332] text-white">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-12 sm:px-6 md:grid-cols-[1.3fr_1fr_1fr] lg:px-8">
        <div>
          <div className="flex items-center gap-3"><span className="grid h-10 w-10 place-items-center rounded-xl bg-white/10"><Compass size={21} /></span><span className="font-bold">{siteData.name}</span></div>
          <p className="mt-4 max-w-md text-sm leading-6 text-emerald-100">{siteData.tagline} Thông tin địa điểm, lịch và chi phí được ghi theo nguồn; nội dung chưa xác minh sẽ được đánh dấu.</p>
        </div>
        <div>
          <h2 className="text-sm font-bold">Khám phá</h2>
          <div className="mt-3 grid gap-2 text-sm text-emerald-100"><Link href="/explore" className="hover:text-white">Các điểm đến</Link><Link href="/itinerary" className="hover:text-white">Lập hành trình</Link><Link href="/my" className="hover:text-white">Hành trình của tôi</Link></div>
        </div>
        <div>
          <h2 className="inline-flex items-center gap-2 text-sm font-bold"><MapPin size={16} /> Dữ liệu minh bạch</h2>
          <p className="mt-3 text-sm leading-6 text-emerald-100">{siteData.locality}. Giá và lịch đón khách cần được xác nhận trực tiếp với từng điểm đến.</p>
          <Link href="/editor" className="mt-3 inline-flex items-center gap-2 text-sm text-white underline-offset-4 hover:underline"><FileText size={15} /> Công cụ biên tập trên thiết bị</Link>
        </div>
      </div>
      <div className="border-t border-white/10"><div className="mx-auto flex max-w-7xl flex-col gap-1 px-4 py-4 text-xs text-emerald-100/80 sm:px-6 md:flex-row md:justify-between lg:px-8"><span>© {new Date().getFullYear()} {siteData.name}</span><span>Thay đổi nội dung công khai bằng cách cập nhật JSON và redeploy.</span></div></div>
    </footer>
  );
}