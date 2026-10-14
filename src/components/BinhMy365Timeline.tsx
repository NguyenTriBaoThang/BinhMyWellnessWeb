'use client';

import Image from 'next/image';
import Link from 'next/link';
import {
  ArrowRight,
  CalendarDays,
  Coffee,
  Landmark,
  Leaf,
  MapPin,
  ShieldCheck,
  Sparkles,
  Trees,
  Utensils,
  Users,
  type LucideIcon,
} from 'lucide-react';
import { formatVND } from '@/lib/utils';
import { ACTIVE_CAMPAIGN_MONTHS, CAMPAIGNS_365, CAMPAIGN_DETAILS, type CampaignSpotKind } from '@/lib/campaigns';
import type { Service } from '@/types';

interface BinhMy365TimelineProps {
  services: Service[];
  selectedMonth: number;
  onMonthChange: (month: number) => void;
  onSelectService?: (serviceId: string) => void;
  onExploreCategory?: (category: string) => void;
}

const SPOT_KIND: Record<CampaignSpotKind, { label: string; Icon: LucideIcon }> = {
  nature: { label: 'Thiên nhiên', Icon: Trees },
  heritage: { label: 'Văn hóa – lịch sử', Icon: Landmark },
  food: { label: 'Ẩm thực', Icon: Utensils },
  cafe: { label: 'Cà phê', Icon: Coffee },
  farm: { label: 'Miệt vườn', Icon: Leaf },
  craft: { label: 'Thủ công', Icon: Sparkles },
};

const SPOT_ROLES = ['Điểm nhấn tháng này', 'Trải nghiệm bổ sung', 'Lựa chọn linh hoạt'];

const KIND_TO_CATEGORY: Record<CampaignSpotKind, string> = {
  nature: 'Thiên nhiên',
  heritage: 'Văn hóa',
  food: 'Ẩm thực',
  cafe: 'Nghỉ ngơi',
  farm: 'Nông nghiệp',
  craft: 'Văn hóa',
};

export default function BinhMy365Timeline({
  services,
  selectedMonth,
  onMonthChange,
  onSelectService,
  onExploreCategory,
}: BinhMy365TimelineProps) {
  const campaign = CAMPAIGNS_365.find((item) => item.month === selectedMonth) ?? CAMPAIGNS_365[0];
  const details = CAMPAIGN_DETAILS[campaign.month];

  return (
    <section
      id="binhmy-365"
      aria-labelledby="binhmy-365-title"
      className="rounded-3xl border border-emerald-100 bg-white p-5 shadow-sm sm:p-8"
    >
      <div className="mb-7 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div className="max-w-3xl">
          <div className="mb-2 inline-flex items-center gap-1.5 rounded-full bg-forest-100 px-3 py-1 text-xs font-semibold text-forest-800">
            <CalendarDays className="h-3.5 w-3.5" />
            BÌNH MỸ 365 · THÁNG CÓ THÔNG TIN
          </div>
          <h2 id="binhmy-365-title" className="text-2xl font-extrabold tracking-tight text-forest-950 sm:text-3xl">
            Khám phá Bình Mỹ theo tháng hoạt động
          </h2>
          <p className="mt-2 text-sm leading-relaxed text-zinc-600">
            Chọn tháng có trong kế hoạch để xem ảnh, trải nghiệm và địa điểm tương ứng.
          </p>
        </div>

        <div className="inline-flex items-center gap-2 self-start rounded-xl border border-emerald-200 bg-emerald-50 px-3.5 py-2 text-xs font-semibold text-emerald-800 md:self-auto">
          <Sparkles className="h-4 w-4 text-emerald-600" />
          <span>Đang xem tháng {selectedMonth}</span>
        </div>
      </div>

      <nav aria-label="Chọn tháng" className="-mx-1 flex gap-2 overflow-x-auto border-b border-zinc-100 px-1 pb-4 no-scrollbar">
        {CAMPAIGNS_365.filter((item) => ACTIVE_CAMPAIGN_MONTHS.includes(item.month as (typeof ACTIVE_CAMPAIGN_MONTHS)[number])).map((item) => {
          const isActive = item.month === selectedMonth;

          return (
            <button
              key={item.month}
              type="button"
              aria-pressed={isActive}
              onClick={() => onMonthChange(item.month)}
              className={`flex min-w-[5.25rem] shrink-0 flex-col items-center gap-1 rounded-2xl px-3 py-2.5 text-xs font-bold transition-all ${
                isActive
                  ? 'bg-forest-700 text-white shadow-md shadow-forest-700/20'
                  : 'border border-zinc-200/70 bg-zinc-50 text-zinc-700 hover:bg-zinc-100'
              }`}
            >
              <span>Tháng {item.month}</span>
            </button>
          );
        })}
      </nav>

      <div className="mt-6 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-wider text-emerald-700">{campaign.theme}</p>
          <h3 className="mt-1 text-xl font-bold text-zinc-900 sm:text-2xl">{campaign.title}</h3>
          <p className="mt-2 max-w-3xl text-sm leading-relaxed text-zinc-600">{campaign.summary}</p>
        </div>
        <span className="inline-flex shrink-0 items-center gap-1.5 self-start rounded-lg bg-zinc-100 px-2.5 py-1.5 text-xs font-semibold text-zinc-600 sm:self-auto">
          <MapPin className="h-3.5 w-3.5" /> {campaign.spots.length} điểm gợi ý
        </span>
      </div>

      <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
        {campaign.spots.map((spot, index) => {
          const { Icon, label } = SPOT_KIND[spot.kind];
          const images = spot.images ?? (spot.image ? [{ src: spot.image, alt: spot.imageAlt || `Ảnh ${spot.name}` }] : []);
          const linkedService = spot.serviceId
            ? services.find((service) => service.id === spot.serviceId && service.status === 'PUBLISHED')
            : undefined;

          return (
            <article key={`${campaign.month}-${spot.name}`} className="flex min-w-0 flex-col overflow-hidden rounded-2xl border border-zinc-200 bg-white transition-shadow hover:shadow-lg">
              {images.length ? (
                <div className={`relative grid h-40 overflow-hidden bg-forest-50 ${images.length > 1 ? 'grid-cols-2 gap-0.5' : 'grid-cols-1'}`}>
                  {images.slice(0, 2).map((image) => (
                    <div key={image.src} className="relative min-w-0 overflow-hidden">
                      <Image
                        src={image.src}
                        alt={image.alt}
                        fill
                        sizes={images.length > 1 ? '(max-width: 768px) 50vw, 25vw' : '(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 33vw'}
                        className="object-cover transition-transform duration-500 hover:scale-105"
                      />
                    </div>
                  ))}
                  <span className="absolute bottom-2 left-2 rounded-md bg-black/55 px-2 py-1 text-[10px] font-medium text-white backdrop-blur-sm">
                    {spot.imageCaption || 'Ảnh địa điểm'}
                  </span>
                </div>
              ) : (
                <div className="flex h-40 items-center justify-center bg-gradient-to-br from-forest-50 via-emerald-50 to-amber-50">
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-white bg-white/85 text-forest-700 shadow-sm">
                    <Icon className="h-7 w-7" aria-hidden="true" />
                  </div>
                </div>
              )}

              <div className="flex flex-1 flex-col p-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="rounded-full bg-forest-50 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-forest-800">
                    {SPOT_ROLES[index]}
                  </span>
                  <span className={`inline-flex items-center gap-1 text-[10px] font-semibold ${linkedService ? 'text-emerald-700' : 'text-amber-700'}`}>
                    <CalendarDays className="h-3 w-3" /> {linkedService ? 'Có thể đặt' : 'Cần xác nhận'}
                  </span>
                </div>

                <div className="mt-3 flex items-start gap-2">
                  <Icon className="mt-0.5 h-4 w-4 shrink-0 text-forest-600" aria-hidden="true" />
                  <div className="min-w-0">
                    <span className="text-[10px] font-semibold uppercase tracking-wide text-zinc-500">{label}</span>
                    <h4 className="mt-0.5 text-base font-bold leading-snug text-zinc-900">{spot.name}</h4>
                  </div>
                </div>

                <p className="mt-3 flex items-start gap-1.5 text-xs leading-relaxed text-zinc-500">
                  <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-700" />
                  <span>{spot.location}</span>
                </p>
                <p className="mt-3 flex-1 text-sm leading-relaxed text-zinc-700">{spot.activity}</p>

                {linkedService ? (
                  <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-zinc-600">
                    <span>{formatVND(linkedService.price)} / người</span>
                    <span>{linkedService.duration} phút</span>
                  </div>
                ) : (
                  <p className="mt-3 text-xs text-amber-800">Lịch và giá sẽ được cập nhật sau khi địa điểm xác nhận.</p>
                )}

                <div className="mt-4 flex items-start gap-1.5 border-t border-zinc-100 pt-3 text-xs text-zinc-600">
                  <Users className="mt-0.5 h-3.5 w-3.5 shrink-0 text-amber-600" />
                  <span><strong className="font-semibold text-zinc-700">Phù hợp:</strong> {spot.audience}</span>
                </div>

                {linkedService && onSelectService ? (
                  <button
                    type="button"
                    onClick={() => onSelectService(linkedService.id)}
                    className="mt-3 inline-flex items-center gap-1.5 self-start rounded-lg bg-forest-700 px-3 py-2 text-xs font-bold text-white hover:bg-forest-800"
                  >
                    Đặt trải nghiệm <ArrowRight className="h-3.5 w-3.5" />
                  </button>
                ) : onExploreCategory ? (
                  <button
                    type="button"
                    onClick={() => onExploreCategory(KIND_TO_CATEGORY[spot.kind])}
                    className="mt-3 inline-flex items-center gap-1.5 self-start text-xs font-bold text-forest-700 hover:text-forest-900"
                  >
                    Xem dịch vụ cùng chủ đề <ArrowRight className="h-3.5 w-3.5" />
                  </button>
                ) : (
                  <Link
                    href="/#experiences-grid"
                    className="mt-3 inline-flex items-center gap-1.5 self-start text-xs font-bold text-forest-700 hover:text-forest-900"
                  >
                    Xem dịch vụ cùng chủ đề <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                )}
              </div>
            </article>
          );
        })}
      </div>

      {details && (
        <section aria-labelledby="campaign-details-title" className="mt-6 overflow-hidden rounded-2xl border border-forest-200 bg-gradient-to-br from-forest-50 via-white to-amber-50/70">
          <div className="border-b border-forest-100 px-4 py-4 sm:px-6">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-forest-700">
                  {campaign.month === 10 ? 'Kế hoạch chuyển lịch từ tài liệu tháng 9' : `Thông tin từ tài liệu tháng ${campaign.month}`}
                </p>
                <h4 id="campaign-details-title" className="mt-1 text-lg font-extrabold text-forest-950 sm:text-xl">Chi tiết chương trình & bảng giá</h4>
              </div>
              <span className="inline-flex w-fit items-center gap-1.5 rounded-full border border-amber-200 bg-amber-50 px-3 py-1.5 text-[10px] font-bold text-amber-900 sm:text-xs">
                <ShieldCheck className="h-3.5 w-3.5" /> {details.status}
              </span>
            </div>
            {details.message && <p className="mt-3 max-w-4xl text-sm leading-relaxed text-zinc-700">{details.message}</p>}
          </div>

          {details.media && details.media.length > 0 && (
            <details className="border-b border-forest-100 px-4 py-3 sm:px-6">
              <summary className="cursor-pointer text-xs font-bold text-forest-900">
                Xem {details.media.length} ảnh và poster trích từ Word
              </summary>
              <div className="mt-3 grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-4">
                {details.media.map((media) => (
                  <figure key={media.src} className="overflow-hidden rounded-xl border border-zinc-200 bg-white">
                    <a href={media.src} target="_blank" rel="noreferrer" aria-label={`Mở ảnh gốc: ${media.title}`}>
                      <div className={`relative bg-zinc-100 ${media.orientation === 'portrait' ? 'aspect-[3/4]' : 'aspect-[4/3]'}`}>
                        <Image
                          src={media.src}
                          alt={media.alt}
                          fill
                          sizes="(max-width: 768px) 50vw, (max-width: 1280px) 33vw, 25vw"
                          className="object-contain transition-transform duration-300 hover:scale-[1.02]"
                        />
                      </div>
                    </a>
                    <figcaption className="px-2.5 py-2 text-[10px] font-semibold leading-snug text-zinc-700">Ảnh tham khảo · {media.title}</figcaption>
                  </figure>
                ))}
              </div>
            </details>
          )}

          <div className="grid gap-5 p-4 sm:p-6 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
            <div className="space-y-4">
              <dl className="space-y-3 rounded-xl border border-zinc-200 bg-white/90 p-4 text-xs">
                <div>
                  <dt className="font-bold text-zinc-800">Địa điểm</dt>
                  <dd className="mt-1 flex items-start gap-1.5 leading-relaxed text-zinc-600"><MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0 text-forest-700" />{details.place}</dd>
                </div>
                <div>
                  <dt className="font-bold text-zinc-800">Thời gian</dt>
                  <dd className="mt-1 flex items-start gap-1.5 leading-relaxed text-zinc-600"><CalendarDays className="mt-0.5 h-3.5 w-3.5 shrink-0 text-forest-700" />{details.time}</dd>
                </div>
                {details.audience && (
                  <div>
                    <dt className="font-bold text-zinc-800">Đối tượng</dt>
                    <dd className="mt-1 flex items-start gap-1.5 leading-relaxed text-zinc-600"><Users className="mt-0.5 h-3.5 w-3.5 shrink-0 text-forest-700" />{details.audience}</dd>
                  </div>
                )}
                {details.organizer && (
                  <div>
                    <dt className="font-bold text-zinc-800">Đơn vị phối hợp theo tài liệu</dt>
                    <dd className="mt-1 leading-relaxed text-zinc-600">{details.organizer}</dd>
                  </div>
                )}
              </dl>

              {details.prices && details.prices.length > 0 ? (
                <div className="overflow-hidden rounded-xl border border-zinc-200 bg-white">
                  <div className="border-b border-zinc-100 px-4 py-3">
                    <h5 className="text-sm font-bold text-zinc-900">Bảng giá trong tài liệu</h5>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full min-w-[30rem] text-left text-xs">
                      <thead className="bg-zinc-50 text-[10px] uppercase tracking-wide text-zinc-500">
                        <tr><th scope="col" className="px-4 py-2.5 font-bold">Gói / hoạt động</th><th scope="col" className="px-4 py-2.5 font-bold">Giá</th><th scope="col" className="px-4 py-2.5 font-bold">Quyền lợi / đối tượng</th></tr>
                      </thead>
                      <tbody className="divide-y divide-zinc-100">
                        {details.prices.map((price) => (
                          <tr key={price.name} className="align-top">
                            <th scope="row" className="px-4 py-3 font-semibold leading-relaxed text-zinc-800">{price.name}</th>
                            <td className="whitespace-nowrap px-4 py-3 font-bold text-forest-800">
                              <span>{formatVND(price.amount)} / {price.unit}</span>
                              {price.studentAmount && <span className="mt-1 block text-[10px] font-semibold text-amber-800">HS/SV: {formatVND(price.studentAmount)} / người</span>}
                            </td>
                            <td className="px-4 py-3 leading-relaxed text-zinc-600">
                              {price.includes?.length ? <ul className="list-disc space-y-1 pl-4">{price.includes.map((item) => <li key={item}>{item}</li>)}</ul> : null}
                              {price.audience && <p className={price.includes?.length ? 'mt-1.5' : ''}>{price.audience}</p>}
                              {!price.includes?.length && !price.audience && <span>Chi tiết quyền lợi cần xác nhận.</span>}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  {details.pricingNote && <p className="border-t border-amber-100 bg-amber-50/70 px-4 py-3 text-[11px] leading-relaxed text-amber-950">{details.pricingNote}</p>}
                </div>
              ) : (
                <div className="rounded-xl border border-dashed border-amber-300 bg-amber-50/70 p-4">
                  <h5 className="text-sm font-bold text-amber-950">Giá vé</h5>
                  <p className="mt-1 text-xs leading-relaxed text-amber-900">{details.pricingNote}</p>
                </div>
              )}
            </div>

            <div className="space-y-4">
              {details.activities && details.activities.length > 0 && (
                <div>
                  <h5 className="mb-2 text-sm font-bold text-zinc-900">Hoạt động dự kiến</h5>
                  <div className="grid gap-2 sm:grid-cols-2">
                    {details.activities.map((activity, index) => (
                      <article key={activity.title} className="rounded-xl border border-zinc-200 bg-white/90 p-3">
                        <p className="text-[10px] font-bold uppercase tracking-wide text-forest-700">Hoạt động {index + 1}</p>
                        <h6 className="mt-1 text-xs font-bold text-zinc-900">{activity.title}</h6>
                        <p className="mt-1 text-xs leading-relaxed text-zinc-600">{activity.description}</p>
                      </article>
                    ))}
                  </div>
                </div>
              )}

              {details.schedule && details.schedule.length > 0 && (
                <div className="overflow-hidden rounded-xl border border-zinc-200 bg-white/90">
                  <h5 className="border-b border-zinc-100 px-4 py-3 text-sm font-bold text-zinc-900">Lịch trình mẫu</h5>
                  <table className="w-full text-left text-xs">
                    <tbody className="divide-y divide-zinc-100">
                      {details.schedule.map((item) => (
                        <tr key={`${item.time}-${item.activity}`}>
                          <th scope="row" className="w-28 whitespace-nowrap px-4 py-2.5 font-semibold text-forest-800">{item.time}</th>
                          <td className="px-4 py-2.5 leading-relaxed text-zinc-700">{item.activity}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {details.dateNote && <p className="rounded-xl border border-sky-200 bg-sky-50 p-3 text-xs leading-relaxed text-sky-950">{details.dateNote}</p>}
              {details.operationNotes && details.operationNotes.length > 0 && (
                <details className="rounded-xl border border-zinc-200 bg-white/90 p-3">
                  <summary className="cursor-pointer text-xs font-bold text-zinc-800">Lưu ý tổ chức và an toàn</summary>
                  <ul className="mt-2 list-disc space-y-1.5 pl-4 text-xs leading-relaxed text-zinc-600">
                    {details.operationNotes.map((note) => <li key={note}>{note}</li>)}
                  </ul>
                </details>
              )}
            </div>
          </div>
        </section>
      )}

      <div className="mt-5 flex flex-col gap-4 rounded-2xl border border-amber-200 bg-amber-50/80 p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5">
        <div className="flex items-start gap-2.5">
          <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-amber-700" />
          <p className="text-xs leading-relaxed text-amber-950">
            Đây là các gợi ý trong kế hoạch. Lịch, giá, tình trạng mở cửa và sự kiện chỉ được cập nhật sau khi địa điểm xác nhận.
          </p>
        </div>
        <div className="flex shrink-0 flex-wrap gap-2">
          <Link
            href="#experiences-grid"
            className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-forest-700 px-4 py-2.5 text-xs font-bold text-white shadow-sm transition-colors hover:bg-forest-800"
          >
            Xem trải nghiệm <ArrowRight className="h-3.5 w-3.5" />
          </Link>
          <Link
            href="/itinerary"
            className="inline-flex items-center justify-center rounded-xl border border-forest-200 bg-white px-4 py-2.5 text-xs font-bold text-forest-800 transition-colors hover:bg-forest-50"
          >
            Lập hành trình
          </Link>
        </div>
      </div>
    </section>
  );
}
