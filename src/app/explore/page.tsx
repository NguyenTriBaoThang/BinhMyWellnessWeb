import type { Metadata } from 'next';
import SeasonExplorer from '@/components/explore/SeasonExplorer';
import { categoriesData, experiencesData, placesData } from '@/lib/data/repository';

export const metadata: Metadata = {
  title: 'Khám phá 4 mùa | Bình Mỹ Du Ký Website',
  description: 'Khám phá bốn chủ đề sông nước, miệt vườn, nghề quê và nông trại tại Bình Mỹ.',
};

export default function ExplorePage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-8 pb-28 sm:px-6 sm:py-12 sm:pb-28 md:pb-14 lg:px-8">
      <header className="max-w-3xl">
        <span className="text-sm font-bold text-[#A9761F]">Bốn mùa trải nghiệm</span>
        <h1 className="mt-2 text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-[#174C3C]">
          Mỗi lần đến, thêm một khám phá.
        </h1>
        <p className="mt-3 text-base text-[#59675E] leading-7">
          Chọn một chủ đề mùa, tìm hoạt động và địa điểm theo sở thích. Các mùa là cách khám phá; không đại diện cho lịch mùa vụ.
        </p>
      </header>

      <div className="mt-8">
        <SeasonExplorer
          places={placesData}
          categories={categoriesData}
          experiences={experiencesData}
        />
      </div>
    </div>
  );
}
