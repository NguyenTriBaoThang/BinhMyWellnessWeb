'use client';

import { ChangeEvent, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import {
  Download,
  FileUp,
  Trash2,
  BookmarkCheck,
  Heart,
  Compass,
  Route,
  Sparkles,
  CalendarDays,
  Clock,
  ArrowRight,
  CheckCircle2,
  FolderOpen,
} from 'lucide-react';
import PlaceCard from '@/components/PlaceCard';
import { getCategory, placesData } from '@/lib/data/repository';
import {
  downloadJson,
  emptyLocalData,
  parseLocalDataJson,
  readLocalData,
  writeLocalData,
  type LocalData,
} from '@/lib/storage/local-data';

export default function MyLocalPageV2() {
  const [data, setData] = useState<LocalData>(emptyLocalData());
  const [notice, setNotice] = useState('');
  const [activeTab, setActiveTab] = useState<'trips' | 'favorites' | 'visited'>('trips');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    const stored = readLocalData();
    setData(stored.data);
    if (stored.warning) setNotice(stored.warning);
  }, []);

  const favorites = useMemo(
    () => placesData.filter((place) => data.favoritePlaceIds.includes(place.id)),
    [data.favoritePlaceIds]
  );
  const visited = useMemo(
    () => placesData.filter((place) => data.visitedPlaceIds.includes(place.id)),
    [data.visitedPlaceIds]
  );

  const removeTrip = (id: string) => {
    const next = { ...data, itineraries: data.itineraries.filter((trip) => trip.id !== id) };
    const result = writeLocalData(next);
    if (result.ok) {
      setData(next);
      setToastMessage('Đã xóa hành trình khỏi thiết bị.');
      setTimeout(() => setToastMessage(null), 2500);
    }
  };

  const removeVisited = (placeId: string) => {
    const next = { ...data, visitedPlaceIds: data.visitedPlaceIds.filter((id) => id !== placeId) };
    const result = writeLocalData(next);
    if (result.ok) {
      setData(next);
      setToastMessage('Đã bỏ dấu trải nghiệm.');
      setTimeout(() => setToastMessage(null), 2000);
    }
  };

  const importData = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (file.size > 1_000_000) {
      setNotice('Tệp vượt quá giới hạn 1 MB.');
      event.target.value = '';
      return;
    }
    const parsed = parseLocalDataJson(await file.text());
    if (!parsed.data) {
      setNotice(`Không thể nhập dữ liệu: ${parsed.error}`);
      event.target.value = '';
      return;
    }
    const placeIds = new Set(placesData.map((place) => place.id));
    if (
      parsed.data.favoritePlaceIds.some((id) => !placeIds.has(id)) ||
      parsed.data.visitedPlaceIds.some((id) => !placeIds.has(id))
    ) {
      setNotice('Tệp chứa một số mã địa điểm không tồn tại trong phiên bản hiện tại.');
      event.target.value = '';
      return;
    }
    const result = writeLocalData(parsed.data);
    if (result.ok) {
      setData(parsed.data);
      setToastMessage('Đã nhập dữ liệu thành công!');
      setTimeout(() => setToastMessage(null), 2500);
    }
    event.target.value = '';
  };

  return (
    <main className="mx-auto max-w-7xl px-4 py-8 pb-28 sm:px-6 sm:py-12 sm:pb-28 md:pb-14 lg:px-8 space-y-8">
      {/* Toast Notification */}
      {toastMessage && (
        <div role="status" aria-live="polite" className="fixed top-20 right-6 z-50 rounded-2xl bg-[#174C3C] text-white px-4 py-2.5 shadow-xl border border-[#D6A545]/40 text-xs sm:text-sm font-bold animate-fade-in flex items-center gap-2">
          <CheckCircle2 size={16} className="text-[#D6A545]" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-6 border-b border-[#174C3C]/10">
        <div>
          <span className="text-xs font-black uppercase tracking-widest text-[#D6A545]">
            Không gian cá nhân
          </span>
          <h1 className="mt-1 text-3xl sm:text-4xl font-black text-[#174C3C]">
            Đã lưu
          </h1>
          <p className="mt-2 text-xs sm:text-sm text-[#26352E]/80 max-w-2xl leading-relaxed">
            Hành trình đã lên lịch, danh sách địa điểm yêu thích và dấu trải nghiệm được lưu bảo mật trong trình duyệt này qua localStorage. Không cần đăng nhập.
          </p>
        </div>

        {/* Import / Export tools */}
        <div className="flex flex-wrap items-center gap-2.5 shrink-0">
          <button
            type="button"
            onClick={() => downloadJson('binh-my-du-ky-sao-luu.json', data)}
            className="btn-tactile btn-primary-forest text-xs py-2 px-3.5 rounded-full"
            title="Xuất tệp sao lưu JSON"
          >
            <Download size={14} className="text-[#D6A545]" />
            <span>Xuất JSON</span>
          </button>

          <label className="btn-tactile btn-secondary-sage text-xs py-2 px-3.5 rounded-full cursor-pointer">
            <FileUp size={14} />
            <span>Nhập JSON</span>
            <input
              type="file"
              accept="application/json,.json"
              onChange={importData}
              className="sr-only"
            />
          </label>

          <Link
            href="/itinerary"
            className="btn-tactile btn-accent-gold text-xs py-2 px-4 rounded-full"
          >
            <Sparkles size={14} className="text-[#174C3C]" />
            <span>Lập hành trình mới</span>
          </Link>
        </div>
      </div>

      {notice && (
        <div role="status" className="rounded-2xl bg-amber-50 border border-amber-200 p-4 text-xs sm:text-sm text-amber-900">
          {notice}
        </div>
      )}

      {/* Tabs */}
      <div role="group" aria-label="Chọn nội dung đã lưu" className="flex gap-2 border-b border-[#174C3C]/10 pb-2 overflow-x-auto no-scrollbar">
        {[
          { id: 'trips', label: `Hành trình đã lưu (${data.itineraries.length})`, icon: Route },
          { id: 'favorites', label: `Địa điểm yêu thích (${favorites.length})`, icon: Heart },
          { id: 'visited', label: `Dấu đã trải nghiệm (${visited.length})`, icon: BookmarkCheck },
        ].map((tab) => {
          const isSelected = activeTab === tab.id;
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id as typeof activeTab)}
              aria-pressed={isSelected}
              className={`min-h-11 shrink-0 flex items-center gap-2 px-4 py-2.5 rounded-full text-xs sm:text-sm font-bold transition-all ${
                isSelected
                  ? 'bg-[#174C3C] text-white shadow-md'
                  : 'bg-white text-[#26352E]/70 hover:bg-[#E7EFE4] hover:text-[#174C3C]'
              }`}
            >
              <Icon size={14} className={isSelected ? 'text-[#D6A545]' : ''} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* TAB CONTENT 1: HÀNH TRÌNH ĐÃ LƯU */}
      {activeTab === 'trips' && (
        <section aria-label="Hành trình đã lưu" className="space-y-4">
          {data.itineraries.length > 0 ? (
            <div className="grid gap-6 md:grid-cols-2">
              {data.itineraries.map((trip) => {
                const opt = trip.options[0];
                return (
                  <article
                    key={trip.id}
                    className="card-3d p-6 bg-white space-y-4 flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <span className="inline-flex items-center gap-1.5 rounded-full bg-[#E7EFE4] px-3 py-1 text-xs font-bold text-[#174C3C]">
                            <CalendarDays size={13} className="text-[#D6A545]" />
                            {trip.request.date} · {trip.request.startTime}–{trip.request.endTime}
                          </span>
                          <h3 className="mt-2.5 text-lg font-black text-[#174C3C]">{trip.title}</h3>
                        </div>

                        <button
                          type="button"
                          onClick={() => removeTrip(trip.id)}
                          className="text-zinc-400 hover:text-rose-600 p-1.5 rounded-lg hover:bg-rose-50 transition"
                          title="Xóa hành trình"
                          aria-label="Xóa hành trình"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>

                      {/* Stops preview */}
                      {opt && (
                        <div className="mt-4 space-y-2 pt-3 border-t border-zinc-100">
                          <p className="text-xs font-bold text-[#26352E]/70">Lộ trình các chặng:</p>
                          <ol className="space-y-1.5 text-xs text-[#26352E]/85">
                            {opt.stops.map((stop, sIdx) => (
                              <li key={`${stop.experienceId}-${sIdx}`} className="flex items-center gap-2">
                                <span className="grid h-4 w-4 shrink-0 place-items-center rounded-full bg-[#174C3C] text-[9px] font-bold text-white">
                                  {sIdx + 1}
                                </span>
                                <span className="font-semibold text-[#D6A545]">{stop.arrivalTime}</span>
                                <span className="truncate">{stop.name}</span>
                              </li>
                            ))}
                          </ol>
                        </div>
                      )}
                    </div>

                    <div className="mt-4 pt-4 border-t border-zinc-100 flex items-center justify-between gap-3">
                      <span className="text-xs text-[#26352E]/60">Lưu trên thiết bị này</span>
                      <Link
                        href={`/itinerary?load=${encodeURIComponent(trip.id)}`}
                        className="btn-tactile btn-primary-forest min-h-11 text-xs py-2 px-4 rounded-full"
                      >
                        <span>Mở lại trên bản đồ</span>
                        <ArrowRight size={13} />
                      </Link>
                    </div>
                  </article>
                );
              })}
            </div>
          ) : (
            <div className="rounded-3xl border border-dashed border-[#174C3C]/20 bg-white p-8 sm:p-12 text-center space-y-3">
              <div className="mx-auto grid h-12 w-12 place-items-center rounded-2xl bg-[#E7EFE4] text-[#174C3C]">
                <Route size={22} />
              </div>
              <h3 className="text-lg font-black text-[#174C3C]">Chưa có hành trình nào được lưu</h3>
              <p className="text-xs sm:text-sm text-[#26352E]/70 max-w-md mx-auto">
                Hãy sử dụng công cụ &quot;Lập hành trình&quot; để thiết kế một chuyến đi Bình Mỹ theo ý muốn và lưu lại tại đây.
              </p>
              <div className="pt-2">
                <Link
                  href="/itinerary"
                  className="btn-tactile btn-accent-gold text-xs sm:text-sm px-5 py-2.5 rounded-full"
                >
                  <Sparkles size={15} className="text-[#174C3C]" />
                  <span>Bắt đầu lập hành trình ngay</span>
                </Link>
              </div>
            </div>
          )}
        </section>
      )}

      {/* TAB CONTENT 2: ĐỊA ĐIỂM YÊU THÍCH */}
      {activeTab === 'favorites' && (
        <section aria-label="Địa điểm yêu thích">
          {favorites.length > 0 ? (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {favorites.map((place) => {
                const cat = getCategory(place.primaryCategory)!;
                return <PlaceCard key={place.id} place={place} category={cat} />;
              })}
            </div>
          ) : (
            <div className="rounded-3xl border border-dashed border-[#174C3C]/20 bg-white p-8 sm:p-12 text-center space-y-3">
              <div className="mx-auto grid h-12 w-12 place-items-center rounded-2xl bg-[#E7EFE4] text-[#174C3C]">
                <Heart size={22} />
              </div>
              <h3 className="text-lg font-black text-[#174C3C]">Chưa có địa điểm yêu thích</h3>
              <p className="text-xs sm:text-sm text-[#26352E]/70 max-w-md mx-auto">
                Bấm biểu tượng trái tim trên các thẻ địa điểm ở trang &quot;Khám phá&quot; để lưu lại những điểm đến bạn muốn ghé thăm.
              </p>
              <div className="pt-2">
                <Link
                  href="/explore"
                  className="btn-tactile btn-primary-forest text-xs sm:text-sm px-5 py-2.5 rounded-full"
                >
                  <Compass size={15} className="text-[#D6A545]" />
                  <span>Khám phá các điểm đến</span>
                </Link>
              </div>
            </div>
          )}
        </section>
      )}

      {/* TAB CONTENT 3: DẤU ĐÃ TRẢI NGHIỆM */}
      {activeTab === 'visited' && (
        <section aria-label="Địa điểm đã trải nghiệm">
          {visited.length > 0 ? (
            <div className="grid gap-4 sm:grid-cols-2">
              {visited.map((place) => (
                <div
                  key={place.id}
                  className="card-3d p-5 bg-white flex items-center justify-between gap-4"
                >
                  <div className="min-w-0">
                    <span className="text-[11px] font-bold text-[#D6A545] uppercase tracking-wider">
                      Đã trải nghiệm
                    </span>
                    <h3 className="font-black text-base text-[#174C3C] truncate">
                      <Link href={`/experiences/${place.slug}`} className="hover:underline">
                        {place.name}
                      </Link>
                    </h3>
                    <p className="text-xs text-[#26352E]/60 truncate mt-0.5">
                      {place.locality}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeVisited(place.id)}
                    className="text-zinc-400 hover:text-rose-600 p-2 rounded-lg hover:bg-rose-50 transition"
                    title="Bỏ đánh dấu"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div className="rounded-3xl border border-dashed border-[#174C3C]/20 bg-white p-8 sm:p-12 text-center space-y-3">
              <div className="mx-auto grid h-12 w-12 place-items-center rounded-2xl bg-[#E7EFE4] text-[#174C3C]">
                <BookmarkCheck size={22} />
              </div>
              <h3 className="text-lg font-black text-[#174C3C]">Chưa có dấu trải nghiệm</h3>
              <p className="text-xs sm:text-sm text-[#26352E]/70 max-w-md mx-auto">
                Khi đến thăm một địa điểm tại Bình Mỹ, bạn có thể tự đánh dấu vào hành trình cá nhân để lưu lại kỷ niệm.
              </p>
            </div>
          )}
        </section>
      )}
    </main>
  );
}
