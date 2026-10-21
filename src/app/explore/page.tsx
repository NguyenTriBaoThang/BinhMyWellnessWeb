import type { Metadata } from 'next';
import ExploreBrowser from '@/components/explore/ExploreBrowser';
import { categoriesData, experiencesData, placesData } from '@/lib/data/repository';

export const metadata: Metadata = { title: 'Khám phá Bình Mỹ | Bình Mỹ Du Ký Website' };

export default function ExplorePage() {
  return <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 sm:py-14 lg:px-8">
    <p className="text-xs font-bold uppercase tracking-[.18em] text-[#40916C]">Khám phá</p>
    <h1 className="mt-2 text-3xl font-black tracking-tight text-[#1B4332] sm:text-4xl">Tìm điểm đến theo điều bạn thích</h1>
    <p className="mt-3 max-w-3xl text-sm leading-6 text-zinc-600">Danh sách dựa trên tư liệu đã dẫn nguồn. Giá, thời lượng, tọa độ và tình trạng tiếp khách chỉ được lọc hoặc ghim khi có dữ liệu xác minh.</p>
    <div className="mt-8"><ExploreBrowser places={placesData} categories={categoriesData} experiences={experiencesData} /></div>
  </section>;
}
