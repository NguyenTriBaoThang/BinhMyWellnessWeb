'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowLeft, ArrowRight, CalendarClock, Check, ChevronLeft, ChevronRight, Clock, ExternalLink, Heart, MapPin, Route, X } from 'lucide-react';
import type { Category, Experience, Place, Source } from '@/lib/data/types';
import SeasonArtwork from '@/components/SeasonArtwork';
import VerifiedPlaceMap from '@/components/explore/VerifiedPlaceMap';
import { imagesData } from '@/lib/data/repository';
import { readLocalData, writeLocalData } from '@/lib/storage/local-data';
import { placeImagePaths } from '@/lib/visual-assets';

type TabId = 'overview' | 'activities' | 'pricing' | 'location';
type DisplayPhoto = { id: string; publishedPath: string; alt: string; credit: string; sourceUrl?: string };
const artByCategory: Record<string, 'spring' | 'summer' | 'autumn' | 'winter'> = { 'song-nuoc-ky-uc': 'spring', 'vuon-trai-cay': 'summer', 'trai-nghiem-lam-nghe': 'autumn', 'trang-trai': 'winter' };
const priceBasis: Record<string, string> = { per_adult: 'người lớn', per_child: 'trẻ em', per_group: 'nhóm' };
const weekdays = ['Chủ nhật', 'Thứ hai', 'Thứ ba', 'Thứ tư', 'Thứ năm', 'Thứ sáu', 'Thứ bảy'];

export default function PlaceDetailClientV2({ place, category, activities, sources }: { place: Place; category: Category; activities: Experience[]; sources: Source[] }) {
  const [activeTab, setActiveTab] = useState<TabId>('overview');
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [photoIndex, setPhotoIndex] = useState(0);
  const [favorite, setFavorite] = useState(false);
  const [visited, setVisited] = useState(false);
  const [notice, setNotice] = useState('');
  const dialogRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLElement | null>(null);
  const art = artByCategory[category.id] ?? 'spring';
  const photos = useMemo<DisplayPhoto[]>(() => {
    const approvedPhotos = imagesData.filter((image) => place.imageIds.includes(image.id) && image.publishAllowed && image.publishedPath);
    if (approvedPhotos.length) return approvedPhotos.map((image) => ({ ...image, publishedPath: image.publishedPath! }));

    return (placeImagePaths[place.id] ?? []).map((publishedPath, index) => ({
      id: `${place.id}-showcase-${index}`,
      publishedPath,
      alt: `Hình ảnh trải nghiệm tại ${place.name}`,
      credit: '',
    }));
  }, [place.id, place.imageIds, place.name]);
  const primaryExperience = activities[0];
  const publishedPrices = activities.flatMap((activity) => activity.priceRules?.filter((rule) => rule.status === 'verified') ?? []);
  const mapEligible = place.areaCode === 'BINH_MY' && place.verification.area.status === 'verified' && place.coordinates !== null && place.coordinateStatus === 'verified' && place.verification.coordinates.status === 'verified';

  useEffect(() => {
    const local = readLocalData().data;
    setFavorite(local.favoritePlaceIds.includes(place.id));
    setVisited(local.visitedPlaceIds.includes(place.id));
  }, [place.id]);
  useEffect(() => {
    if (!lightboxOpen) return;
    dialogRef.current?.focus();
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setLightboxOpen(false);
      if (event.key === 'ArrowRight' && photos.length > 1) setPhotoIndex((index) => (index + 1) % photos.length);
      if (event.key === 'ArrowLeft' && photos.length > 1) setPhotoIndex((index) => (index - 1 + photos.length) % photos.length);
      if (event.key === 'Tab' && dialogRef.current) {
        const controls = Array.from(dialogRef.current.querySelectorAll<HTMLButtonElement>('button:not(:disabled)'));
        if (!controls.length) return;
        const first = controls[0];
        const last = controls[controls.length - 1];
        if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
        else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
      }
    };
    window.addEventListener('keydown', closeOnEscape);
    return () => {
      window.removeEventListener('keydown', closeOnEscape);
      triggerRef.current?.focus();
    };
  }, [lightboxOpen, photos.length]);

  const toggleFavorite = () => {
    const current = readLocalData().data;
    const exists = current.favoritePlaceIds.includes(place.id);
    const favoritePlaceIds = exists ? current.favoritePlaceIds.filter((id) => id !== place.id) : [...current.favoritePlaceIds, place.id];
    const result = writeLocalData({ ...current, favoritePlaceIds });
    setNotice(result.ok ? (exists ? 'Đã bỏ lưu địa điểm.' : 'Đã lưu địa điểm trên thiết bị này.') : result.message);
    if (result.ok) setFavorite(!exists);
  };

  const toggleVisited = () => {
    const current = readLocalData().data;
    const visitedPlaceIds = visited ? current.visitedPlaceIds.filter((id) => id !== place.id) : [...current.visitedPlaceIds, place.id];
    const result = writeLocalData({ ...current, visitedPlaceIds });
    setNotice(result.ok ? (visited ? 'Đã bỏ dấu cá nhân này.' : 'Đã lưu dấu trải nghiệm trên thiết bị này.') : result.message);
    if (result.ok) setVisited(!visited);
  };

  const openPhoto = (index: number) => {
    triggerRef.current = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    setPhotoIndex(index);
    setLightboxOpen(true);
  };
  const shownPrice = publishedPrices.length > 0;

  return (
    <div className="mx-auto max-w-7xl space-y-7 px-4 py-7 pb-28 sm:px-6 sm:py-10 md:pb-14 lg:px-8">
      <Link href="/explore" className="inline-flex min-h-11 items-center gap-2 text-sm font-bold text-[#174C3C] hover:underline"><ArrowLeft size={16} />Trở lại khám phá</Link>

      <header className="grid items-end gap-5 border-b border-[#DCE5DB] pb-6 lg:grid-cols-[1fr_auto]">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full bg-[#E7EFE4] px-3 py-1.5 text-xs font-bold text-[#174C3C]">{category.name}</span>
            <span className="inline-flex items-center gap-1.5 text-sm text-[#59675E]"><MapPin size={15} />{place.locality}</span>
          </div>
          <h1 className="mt-4 text-3xl font-extrabold leading-tight tracking-tight text-[#174C3C] sm:text-4xl lg:text-5xl">{place.name}</h1>
          <p className="mt-3 max-w-3xl text-base leading-7 text-[#59675E]">{place.shortDescription}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button type="button" onClick={toggleFavorite} aria-pressed={favorite} className={`btn-tactile min-h-11 rounded-full border px-4 text-sm ${favorite ? 'border-rose-200 bg-rose-50 text-rose-700' : 'border-[#DCE5DB] bg-white text-[#174C3C]'}`}><Heart size={17} fill={favorite ? 'currentColor' : 'none'} />{favorite ? 'Đã lưu' : 'Lưu địa điểm'}</button>
          <button type="button" onClick={toggleVisited} aria-pressed={visited} className="btn-tactile min-h-11 rounded-full border border-[#DCE5DB] bg-white px-4 text-sm text-[#174C3C]"><Check size={17} />{visited ? 'Đã đánh dấu trải nghiệm' : 'Tự đánh dấu đã trải nghiệm'}</button>
          <Link href={primaryExperience ? `/itinerary?experience=${encodeURIComponent(primaryExperience.id)}` : '/itinerary'} className="btn-tactile btn-primary-forest min-h-11 rounded-full px-5 text-sm"><Route size={17} />Thêm vào hành trình</Link>
        </div>
      </header>
      {notice && <p role="status" aria-live="polite" className="rounded-xl bg-[#E7EFE4] px-4 py-3 text-sm text-[#174C3C]">{notice}</p>}

      <section aria-label="Hình ảnh địa điểm">
        {photos.length > 0 ? <div className="grid gap-3 lg:grid-cols-[1.55fr_.45fr]">
          <button type="button" onClick={() => openPhoto(0)} aria-label="Phóng to ảnh địa điểm" className="group relative aspect-[4/3] overflow-hidden rounded-[24px] border border-[#DCE5DB] bg-white text-left shadow-[0_12px_32px_rgba(23,76,60,0.10)] lg:aspect-[16/9]">
            <Image src={photos[0].publishedPath!} alt={photos[0].alt} fill priority sizes="(max-width: 1024px) 100vw, 70vw" className="object-cover transition-transform duration-300 group-hover:scale-[1.02]" />
            <span className="absolute bottom-3 left-3 rounded-full bg-white/95 px-3 py-1.5 text-xs font-bold text-[#174C3C]">Mở ảnh</span>
          </button>
          {photos.length > 1 && <div className="grid grid-cols-3 gap-3 lg:grid-cols-1">
            {photos.slice(1, 4).map((photo, index) => <button type="button" key={photo.id} onClick={() => openPhoto(index + 1)} aria-label={`Mở ảnh ${index + 2}`} className="relative aspect-[4/3] overflow-hidden rounded-2xl border border-[#DCE5DB] bg-white lg:aspect-auto lg:min-h-24">
              <Image src={photo.publishedPath!} alt={photo.alt} fill sizes="(max-width: 1024px) 33vw, 25vw" className="object-cover transition-transform duration-300 hover:scale-[1.03]" />
            </button>)}
          </div>}
          {photos[0].credit && <a href={photos[0].sourceUrl} target="_blank" rel="noopener noreferrer" className="col-span-full inline-flex min-h-10 items-center gap-2 text-xs text-[#59675E] underline underline-offset-4"><ExternalLink size={14} />Ảnh: {photos[0].credit}</a>}
        </div> : <div className="grid overflow-hidden rounded-[24px] border border-[#DCE5DB] bg-white md:grid-cols-[1.25fr_.75fr]">
          <button type="button" onClick={() => openPhoto(0)} aria-label="Phóng to minh họa chủ đề" className="group relative block aspect-[4/3] overflow-hidden text-left sm:aspect-[16/9]">
            <SeasonArtwork season={art} className="h-full w-full transition-transform duration-300 group-hover:scale-[1.02]" />
            <span className="absolute bottom-3 left-3 rounded-full bg-white/95 px-3 py-1.5 text-xs font-bold text-[#174C3C]">Minh họa chủ đề</span>
          </button>
          <div className="flex flex-col justify-center p-5 sm:p-7">
            <p className="text-sm font-bold text-[#A9761F]">{category.name}</p>
            <h2 className="mt-2 text-xl font-extrabold text-[#174C3C]">Một góc nhìn về trải nghiệm</h2>
            <p className="mt-2 text-sm leading-6 text-[#59675E]">Minh họa gợi mở chủ đề; hoạt động cụ thể được trình bày theo tư liệu tham khảo bên dưới.</p>
          </div>
        </div>}
      </section>

      <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_300px]">
        <div>
          <div role="tablist" aria-label="Thông tin địa điểm" className="no-scrollbar flex snap-x gap-2 overflow-x-auto border-b border-[#DCE5DB]">
            {([{ id: 'overview', label: 'Tổng quan' }, { id: 'activities', label: 'Hoạt động' }, { id: 'pricing', label: 'Chi phí' }, { id: 'location', label: 'Vị trí' }] as const).map((tab) => <button key={tab.id} id={`detail-tab-${tab.id}`} type="button" role="tab" aria-controls="detail-panel" aria-selected={activeTab === tab.id} tabIndex={activeTab === tab.id ? 0 : -1} onKeyDown={(event) => {
              if (event.key !== 'ArrowRight' && event.key !== 'ArrowLeft') return;
              event.preventDefault();
              const ids: TabId[] = ['overview', 'activities', 'pricing', 'location'];
              const index = ids.indexOf(tab.id);
              const next = ids[(index + (event.key === 'ArrowRight' ? 1 : ids.length - 1)) % ids.length];
              setActiveTab(next);
              document.getElementById(`detail-tab-${next}`)?.focus();
            }} onClick={() => setActiveTab(tab.id)} className={`min-h-12 shrink-0 border-b-2 px-4 text-sm font-bold ${activeTab === tab.id ? 'border-[#174C3C] text-[#174C3C]' : 'border-transparent text-[#59675E] hover:text-[#174C3C]'}`}>{tab.label}</button>)}
          </div>

          <div id="detail-panel" role="tabpanel" aria-labelledby={`detail-tab-${activeTab}`} tabIndex={0} className="pt-5">
            {activeTab === 'overview' && <section className="space-y-5">
              <div className="rounded-[22px] border border-[#DCE5DB] bg-white p-5 sm:p-7"><h2 className="text-xl font-extrabold text-[#174C3C]">Về địa điểm này</h2><p className="mt-3 text-base leading-7 text-[#59675E]">{place.shortDescription}</p><div className="mt-5 grid gap-3 sm:grid-cols-2">
                <Fact icon={<MapPin size={17} />} label="Khu vực" value={place.locality} />
                <Fact icon={<CalendarClock size={17} />} label="Giờ hoạt động" value={place.verification.hours.status === 'verified' ? 'Xem lịch hoạt động bên dưới.' : 'Vui lòng liên hệ địa điểm trước khi đi.'} />
                <Fact icon={<Clock size={17} />} label="Thời lượng" value={primaryExperience?.durationMinutes && primaryExperience.evidence.status === 'verified' ? `${primaryExperience.durationMinutes} phút` : 'Liên hệ để hỏi thời lượng phù hợp.'} />
                <Fact icon={<Check size={17} />} label="Đón khách" value={place.verification.operations.status === 'verified' ? 'Đã xác nhận theo thông tin hiện có.' : 'Cần xác nhận trực tiếp với địa điểm.'} />
              </div></div>
              {sources.length > 0 && <SourcesList sources={sources} />}
            </section>}

            {activeTab === 'activities' && <section className="space-y-4">
              <h2 className="text-xl font-extrabold text-[#174C3C]">Hoạt động được nhắc đến</h2>
              {activities.length ? activities.map((activity) => <article key={activity.id} className="rounded-[22px] border border-[#DCE5DB] bg-white p-5 sm:p-6">
                <h3 className="text-lg font-extrabold text-[#174C3C]">{activity.name}</h3>
                <ul className="mt-3 list-disc space-y-2 pl-5 text-sm leading-6 text-[#59675E]">{activity.activities.map((item) => <li key={item}>{item}</li>)}</ul>
                <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2 border-t border-[#DCE5DB] pt-4 text-sm text-[#59675E]">
                  <span className="inline-flex items-center gap-2"><Clock size={15} />{activity.durationMinutes && activity.evidence.status === 'verified' ? `${activity.durationMinutes} phút` : 'Thời lượng cần hỏi địa điểm'}</span>
                  <span className="inline-flex items-center gap-2"><CalendarClock size={15} />{formatHours(activity)}</span>
                </div>
                <p className="mt-3 text-sm leading-6 text-[#59675E]">{activity.bookingRequirement}</p>
                {activity.suitability.notes && activity.suitability.status === 'verified' && <p className="mt-2 text-sm text-[#59675E]">{activity.suitability.notes}</p>}
              </article>) : <p className="rounded-2xl bg-white p-5 text-sm text-[#59675E]">Chưa có hoạt động cụ thể được ghi nhận cho địa điểm này.</p>}
              {sources.length > 0 && <SourcesList sources={sources} />}
            </section>}

            {activeTab === 'pricing' && <section className="space-y-4 rounded-[22px] border border-[#DCE5DB] bg-white p-5 sm:p-7">
              <h2 className="text-xl font-extrabold text-[#174C3C]">Chi phí tham khảo</h2>
              {shownPrice ? <ul className="space-y-3">{publishedPrices.map((rule, index) => <li key={`${rule.basis}-${index}`} className="flex flex-wrap items-center justify-between gap-3 rounded-xl bg-[#F7F4EA] p-4"><span className="font-bold text-[#26352E]">{priceBasis[rule.basis]}</span><strong className="text-lg text-[#174C3C]">{new Intl.NumberFormat('vi-VN').format(rule.amountVnd)}đ</strong></li>)}</ul> : <p className="rounded-xl bg-[#FFF4D9] p-4 text-sm leading-6 text-[#72521D]">Liên hệ để biết giá. Hiện chưa có mức giá công khai để hiển thị.</p>}
              <p className="text-sm leading-6 text-[#59675E]">Chi phí ăn uống, di chuyển và các dịch vụ phát sinh cần xác nhận riêng trước chuyến đi.</p>
              {sources.length > 0 && <SourcesList sources={sources} />}
            </section>}

            {activeTab === 'location' && <section className="space-y-4">
              <div className="rounded-[22px] border border-[#DCE5DB] bg-white p-5 sm:p-7"><h2 className="text-xl font-extrabold text-[#174C3C]">Vị trí</h2><p className="mt-2 text-sm text-[#59675E]">{place.address ?? 'Chưa có địa chỉ cụ thể được ghi nhận.'}</p><div className="mt-5"><VerifiedPlaceMap places={mapEligible ? [place] : []} selectedId={place.id} /></div><p className="mt-3 text-sm leading-6 text-[#59675E]">{mapEligible ? 'Điểm ghé được hiển thị trên bản đồ.' : 'Bản đồ chưa có điểm ghé để ghim; hãy xác nhận địa chỉ và lối vào trước khi khởi hành.'}</p></div>
              {sources.length > 0 && <SourcesList sources={sources} />}
            </section>}
          </div>
        </div>

        <aside className="lg:sticky lg:top-24">
          <div className="rounded-[22px] border border-[#DCE5DB] bg-white p-5 shadow-[0_12px_32px_rgba(23,76,60,0.10)]">
            <p className="text-sm font-bold text-[#A9761F]">Lên chuyến đi</p><h2 className="mt-2 text-lg font-extrabold leading-snug text-[#174C3C]">{place.name}</h2>
            <p className="mt-3 text-sm font-semibold text-[#26352E]">{shownPrice ? 'Có giá được ghi nhận' : 'Liên hệ để biết giá'}</p>
            {primaryExperience?.durationMinutes && primaryExperience.evidence.status === 'verified' && <p className="mt-1 text-sm text-[#59675E]">Thời lượng: {primaryExperience.durationMinutes} phút</p>}
            <Link href={primaryExperience ? `/itinerary?experience=${encodeURIComponent(primaryExperience.id)}` : '/itinerary'} className="btn-tactile btn-primary-forest mt-5 min-h-12 w-full rounded-full text-sm">Lên hành trình <ArrowRight size={16} /></Link>
            <button type="button" onClick={toggleFavorite} aria-pressed={favorite} className="btn-tactile mt-2 min-h-12 w-full rounded-full border border-[#DCE5DB] bg-white text-sm font-bold text-[#174C3C]"><Heart size={16} fill={favorite ? 'currentColor' : 'none'} />{favorite ? 'Đã lưu địa điểm' : 'Lưu địa điểm'}</button>
            {place.contacts?.phone && <a href={`tel:${place.contacts.phone}`} className="mt-4 inline-flex min-h-11 w-full items-center justify-center rounded-full bg-[#E7EFE4] px-4 text-sm font-bold text-[#174C3C]">Gọi xác nhận: {place.contacts.phone}</a>}
          </div>
        </aside>
      </div>

      {lightboxOpen && <div ref={dialogRef} tabIndex={-1} role="dialog" aria-modal="true" aria-label="Xem ảnh lớn" className="fixed inset-0 z-[70] grid place-items-center bg-[#16231D]/95 p-4 outline-none" onClick={() => setLightboxOpen(false)}>
        <button type="button" aria-label="Đóng ảnh" onClick={() => setLightboxOpen(false)} className="absolute right-4 top-4 grid h-12 w-12 place-items-center rounded-full bg-white text-[#174C3C] shadow-lg"><X size={22} /></button>
        {(photos.length > 1) && <button type="button" aria-label="Ảnh trước" onClick={(event) => { event.stopPropagation(); setPhotoIndex((photoIndex - 1 + photos.length) % photos.length); }} className="absolute left-3 grid h-12 w-12 place-items-center rounded-full bg-white text-[#174C3C] sm:left-6"><ChevronLeft size={24} /></button>}
        <div className="relative max-h-[82vh] w-full max-w-5xl overflow-hidden rounded-2xl" onClick={(event) => event.stopPropagation()}>
          {photos.length ? <div className="relative aspect-[4/3] w-full sm:aspect-[16/10]"><Image src={photos[photoIndex].publishedPath!} alt={photos[photoIndex].alt} fill sizes="90vw" className="object-contain" /></div> : <SeasonArtwork season={art} className="aspect-[4/3] w-full sm:aspect-[16/10]" />}
        </div>
        {(photos.length > 1) && <button type="button" aria-label="Ảnh tiếp theo" onClick={(event) => { event.stopPropagation(); setPhotoIndex((photoIndex + 1) % photos.length); }} className="absolute right-3 grid h-12 w-12 place-items-center rounded-full bg-white text-[#174C3C] sm:right-6"><ChevronRight size={24} /></button>}
      </div>}
    </div>
  );
}

function Fact({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return <div className="rounded-xl bg-[#F7F4EA] p-4"><span className="inline-flex items-center gap-2 text-xs font-bold text-[#59675E]">{icon}{label}</span><p className="mt-2 text-sm font-semibold leading-6 text-[#26352E]">{value}</p></div>;
}

function SourcesList({ sources }: { sources: Source[] }) {
  return <section className="rounded-[22px] border border-[#DCE5DB] bg-white p-5 sm:p-6"><h3 className="font-extrabold text-[#174C3C]">Tư liệu tham khảo</h3><ul className="mt-3 space-y-3">{sources.map((source) => <li key={source.id} className="border-t border-[#DCE5DB] pt-3"><a href={source.sourceUrl} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-10 items-center gap-2 text-sm font-bold text-[#174C3C] underline underline-offset-4"><ExternalLink size={15} />{source.title}</a><p className="text-xs leading-5 text-[#59675E]">{source.publisher}{source.publishedAt ? ` · ${source.publishedAt}` : ''} · {source.scopeNote}</p></li>)}</ul></section>;
}

function formatHours(activity: Experience) {
  if (!activity.weeklyHours || activity.evidence.status !== 'verified') return 'Giờ đón khách cần xác nhận';
  const rows = Object.entries(activity.weeklyHours).flatMap(([day, windows]) => (windows ?? []).map((window) => `${weekdays[Number(day)]} ${window.start}–${window.end}`));
  return rows.length ? rows.join(' · ') : 'Giờ đón khách cần xác nhận';
}
