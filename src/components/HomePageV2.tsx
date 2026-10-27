import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, BookOpen, Compass, MapPin, Route, Sparkles } from 'lucide-react';
import PlaceCard from '@/components/PlaceCard';
import { experiencesData, placesData, sourcesData, getCategory } from '@/lib/data/repository';
import { seasonThemes } from '@/lib/seasons';
import { seasonImagePaths } from '@/lib/visual-assets';

export default function HomePageV2() {
  const featuredPlaces = placesData.slice(0, 3);
  const nextExperience = experiencesData.find((item) => item.placeId === null);
  const nextSource = nextExperience
    ? sourcesData.find((source) => nextExperience.evidence.sourceIds.includes(source.id))
    : undefined;

  return (
    <div className="space-y-16 pb-28 sm:space-y-20 sm:pb-16 lg:space-y-24">
      <section className="relative overflow-hidden border-b border-[#DCE5DB] bg-[linear-gradient(135deg,#F7F4EA_0%,#F7F4EA_56%,#E7EFE4_100%)]">
        <div className="pointer-events-none absolute -right-32 -top-40 h-[26rem] w-[26rem] rounded-full border-[3rem] border-white/50" aria-hidden="true" />
        <div className="mx-auto grid max-w-7xl items-center gap-12 px-4 py-12 sm:px-6 sm:py-16 lg:grid-cols-[1.02fr_.98fr] lg:gap-14 lg:px-8 lg:py-20">
          <div className="relative z-10">
            <p className="inline-flex items-center gap-2 rounded-full border border-[#174C3C]/15 bg-white/75 px-4 py-2 text-xs font-bold uppercase tracking-[.14em] text-[#174C3C]">
              <Sparkles size={15} className="text-[#D6A545]" /> Bốn mùa trải nghiệm
            </p>
            <h1 className="mt-6 max-w-2xl text-[2.5rem] font-extrabold leading-[1.12] tracking-tight text-[#174C3C] sm:text-5xl lg:text-[3.65rem]">
              Bình Mỹ bốn mùa, mỗi chuyến đi một câu chuyện.
            </h1>
            <p className="mt-5 max-w-xl text-base leading-7 text-[#59675E] sm:text-lg sm:leading-8">
              Khám phá sông nước, miệt vườn, nghề quê và trang trại. Chọn hành trình phù hợp thời gian và túi tiền.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link href="/explore" className="btn-tactile btn-primary-forest min-h-12 justify-center rounded-full px-6 text-sm sm:text-base">
                <Compass size={18} /> Khám phá 4 mùa
              </Link>
              <Link href="/itinerary" className="btn-tactile btn-secondary-sage min-h-12 justify-center rounded-full px-6 text-sm sm:text-base">
                <Route size={18} /> Lập hành trình
              </Link>
            </div>
            <p className="mt-5 max-w-lg text-sm leading-6 text-[#59675E]">
              Bốn mùa là bốn chủ đề khám phá; lịch hoạt động thực tế tùy từng địa điểm.
            </p>
          </div>

          <div className="relative mx-auto w-full max-w-[640px] py-5 sm:px-5 sm:py-8">
            <div className="tilt-3d relative overflow-hidden rounded-[28px] border-[5px] border-white shadow-[0_20px_60px_rgba(23,76,60,0.16)]">
              <div className="relative aspect-[1.28/1] w-full">
                <Image src={seasonImagePaths.spring} alt="Khung cảnh sông nước Bình Mỹ" fill priority sizes="(max-width: 1024px) 100vw, 50vw" className="object-cover" />
              </div>
              <div className="absolute bottom-4 left-4 rounded-full border border-white/70 bg-white/90 px-4 py-2 text-sm font-bold text-[#174C3C] shadow-lg backdrop-blur">
                Sông nước & Ký ức
              </div>
            </div>
            <svg className="pointer-events-none absolute -right-1 top-1/4 z-10 hidden h-40 w-40 text-[#D6A545]/80 sm:block" viewBox="0 0 160 160" fill="none" aria-hidden="true">
              <path d="M22 136C88 117 65 74 136 48" stroke="currentColor" strokeWidth="2.5" strokeDasharray="5 8" />
              <circle cx="22" cy="136" r="6" fill="currentColor" /><circle cx="136" cy="48" r="8" fill="#174C3C" stroke="white" strokeWidth="4" />
            </svg>
            <div className="absolute -bottom-1 left-0 z-20 w-[42%] overflow-hidden rounded-[22px] border-4 border-white shadow-[0_14px_34px_rgba(23,76,60,0.18)] sm:-bottom-2 sm:left-1">
              <div className="relative aspect-[4/3] w-full">
                <Image src={seasonImagePaths.summer} alt="Vườn cây ăn trái ở Bình Mỹ" fill sizes="(max-width: 640px) 50vw, 25vw" className="object-cover" />
              </div>
              <span className="absolute bottom-2 left-2 rounded-full bg-white/90 px-3 py-1 text-[11px] font-bold text-[#72521D]">Hương vị miệt vườn</span>
            </div>
            <div className="absolute -right-1 top-0 z-20 hidden items-center gap-2 rounded-2xl border border-white/80 bg-white/95 px-4 py-3 text-sm font-bold text-[#174C3C] shadow-[0_12px_32px_rgba(23,76,60,0.12)] sm:flex">
              <span className="grid h-9 w-9 place-items-center rounded-xl bg-[#E7EFE4] text-[#174C3C]"><MapPin size={18} /></span>
              4 chủ đề trải nghiệm
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-bold text-[#A9761F]">Bình Mỹ theo nhịp riêng</p>
            <h2 className="mt-2 text-2xl font-extrabold text-[#174C3C] sm:text-3xl">Bốn mùa trải nghiệm</h2>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-[#59675E]">Mỗi mùa mở ra một chủ đề. Chọn điều bạn muốn khám phá, rồi xem các địa điểm có tư liệu.</p>
          </div>
          <Link href="/explore" className="inline-flex min-h-11 items-center gap-2 text-sm font-bold text-[#174C3C] hover:underline">
            Tất cả địa điểm <ArrowRight size={17} />
          </Link>
        </div>
        <div className="mt-7 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {seasonThemes.map((season) => (
            <Link key={season.id} href={`/explore?season=${season.id}`} className="card-3d group overflow-hidden rounded-[22px] border border-[#DCE5DB] bg-white">
              <div className="relative">
                <div className="relative aspect-[4/3] w-full overflow-hidden">
                  <Image src={seasonImagePaths[season.id]} alt={`${season.title} tại Bình Mỹ`} fill sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw" className="object-cover transition-transform duration-300 group-hover:scale-[1.02]" />
                </div>
                <span className="absolute left-3 top-3 rounded-full border border-white/80 bg-white/90 px-3 py-1 text-xs font-extrabold" style={{ color: season.accent }}>{season.label}</span>
              </div>
              <div className="p-5">
                <h3 className="text-lg font-extrabold text-[#174C3C]">{season.title}</h3>
                <p className="mt-2 min-h-12 text-sm leading-6 text-[#59675E]">{season.intro}</p>
                <span className="mt-4 inline-flex min-h-11 items-center gap-2 text-sm font-bold text-[#174C3C]">Khám phá mùa này <ArrowRight size={16} /></span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-bold text-[#A9761F]">Những câu chuyện đang có tư liệu</p>
            <h2 className="mt-2 text-2xl font-extrabold text-[#174C3C] sm:text-3xl">Địa điểm nổi bật</h2>
          </div>
          <Link href="/explore" className="inline-flex min-h-11 items-center gap-2 text-sm font-bold text-[#174C3C] hover:underline">Xem danh sách <ArrowRight size={17} /></Link>
        </div>
        <div className="mt-7 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {featuredPlaces.map((place) => {
            const category = getCategory(place.primaryCategory);
            return category ? <PlaceCard key={place.id} place={place} category={category} /> : null;
          })}
        </div>
      </section>

      <section className="bg-[#E7EFE4]/75 py-12 sm:py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl">
            <p className="text-sm font-bold text-[#A9761F]">Dễ bắt đầu, dễ lưu lại</p>
            <h2 className="mt-2 text-2xl font-extrabold text-[#174C3C] sm:text-3xl">Lên chuyến đi theo cách của bạn</h2>
          </div>
          <div className="mt-8 grid gap-4 md:grid-cols-3">
            {[
              { number: '01', title: 'Chọn nhu cầu', text: 'Chọn ngày đi, thời gian, nhóm khách và điều bạn muốn khám phá.', href: '/itinerary' },
              { number: '02', title: 'Xem tuyến đề xuất', text: 'Planner đối chiếu lịch, chi phí và các tuyến đã có dữ liệu.', href: '/itinerary' },
              { number: '03', title: 'Lưu hành trình', text: 'Lưu trên thiết bị để mở lại, chỉnh sửa hoặc in khi cần.', href: '/my' },
            ].map((step) => (
              <Link key={step.number} href={step.href} className="card-3d flex min-h-48 flex-col rounded-[22px] border border-white bg-white p-6">
                <span className="text-sm font-extrabold tracking-[.16em] text-[#A9761F]">{step.number}</span>
                <h3 className="mt-4 text-lg font-extrabold text-[#174C3C]">{step.title}</h3>
                <p className="mt-2 text-sm leading-6 text-[#59675E]">{step.text}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {nextExperience && (
        <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid overflow-hidden rounded-[28px] border border-[#DCE5DB] bg-white shadow-[0_12px_32px_rgba(23,76,60,0.10)] md:grid-cols-[.8fr_1.2fr]">
            <div className="relative min-h-56 overflow-hidden bg-[#F8EAE2]"><Image src={seasonImagePaths.autumn} alt="Trải nghiệm nghề thủ công tại Bình Mỹ" fill sizes="(max-width: 768px) 100vw, 35vw" className="object-cover" /></div>
            <div className="flex flex-col justify-center p-6 sm:p-9">
              <p className="text-sm font-bold text-[#C77952]">Lần tới, bạn muốn khám phá điều gì?</p>
              <h2 className="mt-2 text-2xl font-extrabold text-[#174C3C]">{nextExperience.name}</h2>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-[#59675E]">Bài viết được dẫn nguồn có nhắc nghề đan lục bình ở Bình Mỹ, nhưng chưa nêu hộ làm nghề để khách ghé thăm.</p>
              {nextSource && <a href={nextSource.sourceUrl} target="_blank" rel="noopener noreferrer" className="mt-5 inline-flex min-h-11 items-center gap-2 self-start font-bold text-[#174C3C] underline underline-offset-4"><BookOpen size={17} /> Đọc tư liệu <ArrowRight size={16} /></a>}
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
