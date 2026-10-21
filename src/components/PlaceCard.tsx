import Link from 'next/link';
import Image from 'next/image';
import { ArrowUpRight, MapPin, TriangleAlert } from 'lucide-react';
import type { Category, Place } from '@/lib/data/types';
import { experiencesData, imagesData } from '@/lib/data/repository';

export default function PlaceCard({ place, category }: { place: Place; category: Category }) {
  const image = imagesData.find((item) => place.imageIds.includes(item.id) && item.publishAllowed && item.publishedPath);
  const experiences = experiencesData.filter((item) => item.placeId === place.id);
  const routableExperience = experiences.find((item) => item.routeEligible && item.evidence.status === 'verified');
  const activity = experiences.find((item) => item.evidence.status === 'verified' || item.evidence.status === 'reported');
  const verifiedPrices = experiences.flatMap((item) => item.priceRules?.filter((rule) => rule.status === 'verified') ?? []);
  const adultPrice = verifiedPrices.find((rule) => rule.basis === 'per_adult');
  const groupPrice = verifiedPrices.find((rule) => rule.basis === 'per_group');
  const priceText = groupPrice ? `${new Intl.NumberFormat('vi-VN').format(groupPrice.amountVnd)}đ / nhóm`
    : adultPrice ? `${new Intl.NumberFormat('vi-VN').format(adultPrice.amountVnd)}đ / người lớn${verifiedPrices.some((rule) => rule.basis === 'per_child') ? '' : ' · trẻ em cần xác nhận'}`
      : 'Liên hệ để biết giá';
  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-2xl border border-zinc-200 bg-white transition hover:-translate-y-1 hover:border-emerald-300 hover:shadow-lg">
      <div className="relative grid min-h-44 place-items-center overflow-hidden bg-[#F8FAF9] p-6">{image?.publishedPath ? <><Image src={image.publishedPath} alt={image.alt} fill sizes="(max-width: 768px) 100vw, 33vw" className="object-cover" /><a href={image.sourceUrl} target="_blank" rel="noopener noreferrer" className="absolute bottom-2 right-2 rounded bg-black/65 px-2 py-1 text-[10px] text-white underline">{image.credit}</a></> : <><span className="absolute -right-8 -top-12 h-36 w-36 rounded-full border-[18px] border-white/70" aria-hidden="true" /><span className="absolute -bottom-16 -left-10 h-40 w-40 rounded-full border-[20px] border-white/60" aria-hidden="true" /><div className="relative max-w-sm text-center"><span className="inline-flex rounded-full px-3 py-1 text-[11px] font-bold text-white" style={{ backgroundColor: category.accent }}>{category.name}</span><p className="mt-4 text-xs font-semibold uppercase tracking-[.15em] text-zinc-400">Ảnh đang chờ xác nhận quyền sử dụng</p></div></>}</div>
      <div className="flex flex-1 flex-col p-5">
        <h3 className="text-lg font-extrabold leading-snug text-[#1B4332]">{place.name}</h3>
        <p className="mt-2 line-clamp-3 text-sm leading-6 text-zinc-600">{place.shortDescription}</p>
        <p className="mt-3 text-xs leading-5 text-zinc-600"><span className="font-bold text-zinc-700">Hoạt động: </span>{activity?.activities[0] ?? 'Cần xác nhận trực tiếp với địa điểm.'}</p>
        <div className="mt-4 grid gap-2 text-xs text-zinc-600">
          <span className="inline-flex items-center gap-2"><MapPin size={14} className="shrink-0 text-[#40916C]" />{place.address ?? 'Địa chỉ cụ thể cần xác nhận'}</span>
          <span className="inline-flex items-center gap-2"><TriangleAlert size={14} className="shrink-0 text-[#E76F51]" />{place.verification.operations.status === 'needs_confirmation' ? 'Tình trạng đón khách cần xác nhận' : 'Thông tin vận hành đang được cập nhật'}</span>
        </div>
        <div className="mt-auto flex items-center justify-between gap-3 border-t border-zinc-100 pt-4">
          <span className="text-xs font-semibold text-zinc-500">Giá: {priceText}</span>
          <div className="flex items-center gap-3"><Link href={`/experiences/${place.slug}`} className="inline-flex items-center gap-1 text-sm font-bold text-[#1B4332] hover:underline">Chi tiết <ArrowUpRight size={16} /></Link>{routableExperience && <Link href={`/itinerary?experience=${encodeURIComponent(routableExperience.id)}`} className="text-xs font-bold text-[#40916C] underline">Thêm vào hành trình</Link>}</div>
        </div>
      </div>
    </article>
  );
}
