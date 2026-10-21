import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft, CalendarClock, CircleDollarSign, ExternalLink, MapPin, Route, TriangleAlert } from 'lucide-react';
import LocalPlaceActions from '@/components/LocalPlaceActions';
import VerifiedPlaceMap from '@/components/explore/VerifiedPlaceMap';
import { categoriesData, experiencesData, findPlaceBySlug, placesData, sourcesFor, getCategory } from '@/lib/data/repository';
import type { VerificationStatus } from '@/lib/data/types';

export function generateStaticParams() {
  return placesData.map((place) => ({ id: place.slug }));
}

export const dynamicParams = false;

function label(status: VerificationStatus): string {
  if (status === 'verified') return 'Đã xác minh';
  if (status === 'reported') return 'Có trong nguồn';
  if (status === 'needs_confirmation') return 'Cần xác nhận';
  return 'Chưa có dữ liệu';
}

const WEEKDAYS = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];
const PRICE_BASIS: Record<string, string> = { per_adult: 'người lớn', per_child: 'trẻ em', per_group: 'nhóm' };

function hoursText(activity: (typeof experiencesData)[number]): string {
  if (!activity.weeklyHours) return 'Giờ cần xác nhận';
  const days = Object.entries(activity.weeklyHours).flatMap(([day, windows]) => (windows ?? []).map((window) => `${WEEKDAYS[Number(day)]} ${window.start}–${window.end}`));
  return days.length ? days.join(' · ') : 'Không có khung giờ trong dữ liệu';
}

function suitabilityText(activity: (typeof experiencesData)[number]): string {
  if (activity.suitability.status !== 'verified') return 'Cần xác nhận';
  const limits = [activity.suitability.ageMinimum !== null ? `từ ${activity.suitability.ageMinimum} tuổi` : '', activity.suitability.ageMaximum !== null ? `đến ${activity.suitability.ageMaximum} tuổi` : ''].filter(Boolean);
  return limits.length ? `Đã xác minh: ${limits.join(', ')}` : 'Đã xác minh; không ghi giới hạn tuổi cụ thể';
}

export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
  const place = findPlaceBySlug(params.id) ?? placesData.find((item) => item.id === params.id);
  return { title: place ? `${place.name} | Bình Mỹ Du Ký Website` : 'Không tìm thấy địa điểm' };
}

export default function ExperienceDetailPage({ params }: { params: { id: string } }) {
  const place = findPlaceBySlug(params.id) ?? placesData.find((item) => item.id === params.id);
  if (!place) notFound();
  const category = getCategory(place.primaryCategory)!;
  const activities = experiencesData.filter((item) => item.placeId === place.id);
  const routeExperience = activities.find((item) => item.routeEligible && item.evidence.status === 'verified');
  const sourceIds = Array.from(new Set([
    ...place.sourceIds,
    ...Object.values(place.verification).flatMap((fact) => fact.sourceIds),
    ...activities.flatMap((item) => [
      ...item.evidence.sourceIds,
      ...(item.priceRules?.flatMap((rule) => rule.sourceId ? [rule.sourceId] : []) ?? []),
      ...(item.seasonAvailability?.sourceIds ?? []),
    ]),
  ]));
  const sources = sourcesFor(sourceIds);
  const mapEligible = Boolean(place.areaCode === 'BINH_MY' && place.verification.area.status === 'verified' && place.coordinates && place.coordinateStatus === 'verified' && place.verification.coordinates.status === 'verified');
  return <article className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
    <Link href="/explore" className="inline-flex items-center gap-2 text-sm font-bold text-[#1B4332] hover:underline"><ArrowLeft size={16} /> Quay lại khám phá</Link>
    <header className="mt-6 overflow-hidden rounded-[2rem] bg-[#1B4332] px-6 py-10 text-white sm:px-10 sm:py-14">
      <span className="inline-flex rounded-full bg-white/15 px-3 py-1.5 text-xs font-bold">{category.name}</span>
      <p className="mt-5 text-xs font-bold uppercase tracking-[.16em] text-emerald-200">Địa điểm có tư liệu nguồn</p>
      <h1 className="mt-2 max-w-4xl text-3xl font-black leading-tight sm:text-5xl">{place.name}</h1>
      <p className="mt-4 max-w-3xl text-sm leading-7 text-emerald-50/90 sm:text-base">{place.shortDescription}</p>
      <p className="mt-5 inline-flex items-center gap-2 text-xs text-emerald-100"><MapPin size={14} />{place.locality}</p>
    </header>
    <div className="mt-6"><LocalPlaceActions placeId={place.id} /></div>
    <div className="mt-8 grid gap-6 lg:grid-cols-[1.1fr_.9fr]">
      <section className="rounded-2xl border border-zinc-200 bg-white p-5 sm:p-6">
        <h2 className="text-xl font-extrabold text-[#1B4332]">Đến đây làm gì?</h2>
        {activities.length ? <ul className="mt-4 space-y-3">{activities.map((activity) => <li key={activity.id} className="rounded-xl bg-[#F8FAF9] p-4"><h3 className="font-bold text-zinc-900">{activity.name}</h3><ul className="mt-2 list-disc space-y-1 pl-5 text-sm leading-6 text-zinc-600">{activity.activities.map((item) => <li key={item}>{item}</li>)}</ul><p className="mt-3 text-xs leading-5 text-zinc-600">Thời lượng: {activity.durationMinutes ? `${activity.durationMinutes} phút` : 'Cần xác nhận'} · Giờ: {hoursText(activity)} · {activity.bookingRequirement}</p>{activity.priceRules?.length ? <ul className="mt-3 space-y-2 text-xs leading-5">{activity.priceRules.map((rule, index) => <li key={`${rule.basis}-${index}`} className="rounded-lg border border-zinc-200 bg-white p-3"><strong>{new Intl.NumberFormat('vi-VN').format(rule.amountVnd)}đ / {PRICE_BASIS[rule.basis]}</strong><span className="ml-2 text-zinc-500">{rule.status === 'verified' ? 'Giá có nguồn' : 'Dự trù, chưa phải giá nhà vườn'}</span>{rule.included.length > 0 && <p className="mt-1 text-zinc-600">Bao gồm: {rule.included.join(', ')}</p>}{rule.excluded.length > 0 && <p className="mt-1 text-zinc-600">Không bao gồm: {rule.excluded.join(', ')}</p>}</li>)}</ul> : <p className="mt-2 text-xs text-zinc-500">Giá: liên hệ để biết; chưa có mức giá công khai đã xác minh.</p>}<p className="mt-3 text-xs text-zinc-600">Phù hợp trẻ em: {suitabilityText(activity)}</p>{activity.suitability.notes && <p className="mt-1 text-xs text-zinc-500">{activity.suitability.notes}</p>}</li>)}</ul> : <p className="mt-3 text-sm text-zinc-600">Chưa có hoạt động riêng được xác minh cho địa điểm này.</p>}
        <div className="mt-6 grid gap-3 sm:grid-cols-2">{[[MapPin, 'Địa chỉ / lối vào', place.address ?? 'Cần xác nhận'], [CalendarClock, 'Giờ và lịch', place.verification.hours.status === 'verified' ? 'Theo khung giờ có nguồn' : 'Cần xác nhận trước khi đi'], [CircleDollarSign, 'Giá', place.verification.pricing.status === 'verified' ? 'Có dữ liệu giá đã xác minh' : 'Liên hệ để biết giá'], [TriangleAlert, 'Tình trạng đón khách', place.verification.operations.status === 'verified' ? 'Đã xác minh' : 'Cần xác nhận trực tiếp']].map(([Icon, title, value]) => { const FactIcon = Icon as typeof MapPin; return <div key={String(title)} className="rounded-xl border border-zinc-200 p-4"><span className="inline-flex items-center gap-2 text-xs font-bold text-zinc-500"><FactIcon size={15} />{String(title)}</span><p className="mt-2 text-sm font-semibold text-zinc-800">{String(value)}</p></div>; })}</div>
        {place.contacts && <section className="mt-5 rounded-xl border border-zinc-200 p-4"><h3 className="text-sm font-bold text-[#1B4332]">Liên hệ đã ghi nhận</h3><div className="mt-2 flex flex-wrap gap-4 text-sm">{place.contacts.phone && <a href={`tel:${place.contacts.phone}`} className="font-semibold text-[#1B4332] underline">{place.contacts.phone}</a>}{place.contacts.email && <a href={`mailto:${place.contacts.email}`} className="font-semibold text-[#1B4332] underline">{place.contacts.email}</a>}{place.contacts.website && <a href={place.contacts.website} target="_blank" rel="noopener noreferrer" className="font-semibold text-[#1B4332] underline">Trang liên hệ</a>}</div></section>}
        <div className="mt-5 rounded-xl bg-[#EAF4EE] p-4"><p className="text-sm font-bold text-[#1B4332]">Vị trí và lộ trình</p><p className="mt-1 text-sm leading-6 text-zinc-700">{mapEligible ? 'Tọa độ đã xác minh; xem trên bản đồ bên cạnh.' : 'Chưa có tọa độ đúng lối tiếp cận được xác minh. Địa điểm được giữ trong danh sách nhưng chưa ghim và chưa đưa vào tính tuyến.'}</p><Link href={routeExperience ? `/itinerary?experience=${encodeURIComponent(routeExperience.id)}` : '/itinerary'} className="mt-3 inline-flex items-center gap-2 text-sm font-bold text-[#1B4332] underline-offset-4 hover:underline"><Route size={15} />{routeExperience ? 'Thêm vào hành trình' : 'Mở công cụ lập hành trình'}</Link></div>
      </section>
      <aside className="space-y-5"><div><VerifiedPlaceMap places={mapEligible ? [place] : []} selectedId={place.id} /></div><section className="rounded-2xl border border-zinc-200 bg-white p-5"><h2 className="font-extrabold text-[#1B4332]">Trạng thái thông tin</h2><dl className="mt-3 space-y-2 text-sm">{Object.entries(place.verification).map(([key, fact]) => <div key={key} className="flex justify-between gap-3 border-b border-zinc-100 pb-2"><dt className="capitalize text-zinc-600">{{ identity: 'Tên điểm', area: 'Khu vực Bình Mỹ', address: 'Địa chỉ', coordinates: 'Tọa độ', hours: 'Giờ hoạt động', pricing: 'Giá', operations: 'Đón khách' }[key] ?? key}</dt><dd className="text-right font-semibold text-zinc-800">{label(fact.status)}</dd></div>)}</dl></section></aside>
    </div>
    <section className="mt-8 rounded-2xl border border-zinc-200 bg-white p-5 sm:p-6"><h2 className="text-xl font-extrabold text-[#1B4332]">Nguồn và ngày kiểm tra</h2><ul className="mt-4 space-y-3">{sources.map((source) => <li key={source.id} className="rounded-xl bg-[#F8FAF9] p-4"><a href={source.sourceUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-start gap-2 font-bold text-[#1B4332] underline-offset-4 hover:underline"><ExternalLink size={15} className="mt-1 shrink-0" />{source.title}</a><p className="mt-2 text-xs text-zinc-500">{source.publisher}{source.author ? ` · ${source.author}` : ''}{source.publishedAt ? ` · đăng ${source.publishedAt}` : ''} · kiểm tra {source.checkedAt}</p><p className="mt-2 text-sm leading-6 text-zinc-600">{source.scopeNote}</p></li>)}</ul></section>
  </article>;
}
