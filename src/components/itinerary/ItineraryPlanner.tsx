'use client';

import { FormEvent, useEffect, useMemo, useState, Suspense } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import {
  CalendarDays,
  Clock,
  Users,
  Compass,
  Route,
  Sparkles,
  MapPin,
  Trash2,
  Printer,
  Download,
  BookmarkCheck,
  CheckCircle2,
  Car,
  Footprints,
  Ship,
  Bike,
  SlidersHorizontal,
  ChevronRight,
  Info,
  DollarSign,
  Share2,
} from 'lucide-react';
import type { Category, Experience, Place, Source } from '@/lib/data/types';
import { categoriesData, routeMatrix } from '@/lib/data/repository';
import VerifiedPlaceMap from '@/components/explore/VerifiedPlaceMap';
import SeasonArtwork from '@/components/SeasonArtwork';
import { getSeasonTheme } from '@/lib/seasons';
import { placeImagePaths } from '@/lib/visual-assets';
import {
  generateItineraryOptions,
  recalculateItinerary,
  type ItineraryOption,
  type PlannerResult,
  type PlannerTransport,
  type TripPace,
  type TripRequest,
  type ItineraryStop,
} from '@/lib/planner/engine';
import {
  downloadJson,
  emptyLocalData,
  newLocalId,
  readLocalData,
  writeLocalData,
  type LocalData,
  type SavedItinerary,
} from '@/lib/storage/local-data';

const categoryArtwork: Record<string, 'spring' | 'summer' | 'autumn' | 'winter'> = {
  'song-nuoc-ky-uc': 'spring', 'vuon-trai-cay': 'summer', 'trai-nghiem-lam-nghe': 'autumn', 'trang-trai': 'winter',
};

function dateInHcm(daysFromNow: number): string {
  const date = new Date();
  date.setDate(date.getDate() + daysFromNow);
  return date.toISOString().slice(0, 10);
}

function money(value: number | null): string {
  return value === null
    ? 'Liên hệ để biết giá'
    : new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', maximumFractionDigits: 0 }).format(value);
}

export default function ItineraryPlannerWrapper(props: {
  places: Place[];
  experiences: Experience[];
  categories: Category[];
  sources: Source[];
}) {
  return (
    <Suspense fallback={<div className="py-12 text-center text-sm font-semibold text-[#174C3C]">Đang chuẩn bị công cụ lập hành trình...</div>}>
      <ItineraryPlanner {...props} />
    </Suspense>
  );
}

function ItineraryPlanner({
  places,
  experiences,
  categories,
  sources,
}: {
  places: Place[];
  experiences: Experience[];
  categories: Category[];
  sources: Source[];
}) {
  const searchParams = useSearchParams();
  const initialSeason = getSeasonTheme(searchParams.get('season'));

  // Form states
  const [date, setDate] = useState(() => dateInHcm(7));
  const [startTime, setStartTime] = useState('08:00');
  const [endTime, setEndTime] = useState('17:00');
  const [adults, setAdults] = useState(2);
  const [children, setChildren] = useState(0);
  const [budgetBasis, setBudgetBasis] = useState<'group' | 'person'>('group');
  const [budgetText, setBudgetText] = useState('');
  const [transportMode, setTransportMode] = useState<PlannerTransport>('car');
  const [originPlaceId, setOriginPlaceId] = useState('');
  const [destinationPlaceId, setDestinationPlaceId] = useState('');
  const [interestCategoryIds, setInterestCategoryIds] = useState<string[]>(initialSeason ? [initialSeason.categoryId] : []);
  const [requiredExperienceIds, setRequiredExperienceIds] = useState<string[]>([]);
  const [pace, setPace] = useState<TripPace>('balanced');
  const [maxStops, setMaxStops] = useState(4);

  // Results & UI states
  const [result, setResult] = useState<PlannerResult | null>(null);
  const [selectedOptionId, setSelectedOptionId] = useState('');
  const [selectedPlaceId, setSelectedPlaceId] = useState<string | null>(null);
  const [mobileTab, setMobileTab] = useState<'conditions' | 'map' | 'timeline'>('conditions');
  const [localData, setLocalData] = useState<LocalData>(emptyLocalData());
  const [loadedTripId, setLoadedTripId] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Mappable places
  const mappablePlaces = useMemo(
    () =>
      places.filter(
        (p) =>
          p.areaCode === 'BINH_MY' &&
          p.verification.area.status === 'verified' &&
          p.coordinates &&
          p.coordinateStatus === 'verified' &&
          p.verification.coordinates.status === 'verified'
      ),
    [places]
  );

  const routableExperiences = useMemo(
    () => experiences.filter((e) => e.routeEligible),
    [experiences]
  );

  // Selected option
  const selectedOption =
    result?.options.find((opt) => opt.id === selectedOptionId) ||
    result?.options[0] ||
    null;

  // Initial load: parse URL parameters & local storage
  useEffect(() => {
    const stored = readLocalData();
    setLocalData(stored.data);

    // Initial origin/destination fallback
    if (mappablePlaces.length > 0) {
      if (!originPlaceId) setOriginPlaceId(mappablePlaces[0].id);
      if (!destinationPlaceId) setDestinationPlaceId(mappablePlaces[0].id);
    }

    // Check URL for required experience
    const reqExp = searchParams.get('experience');
    if (reqExp && routableExperiences.some((e) => e.id === reqExp)) {
      setRequiredExperienceIds([reqExp]);
    }

    // Load saved trip if requested
    const loadId = searchParams.get('load');
    if (loadId) {
      const saved = stored.data.itineraries.find((it) => it.id === loadId);
      if (saved) {
        setLoadedTripId(saved.id);
        const req = saved.request;
        setDate(req.date);
        setStartTime(req.startTime);
        setEndTime(req.endTime);
        setAdults(req.adults);
        setChildren(req.children);
        setTransportMode(req.transportMode);
        setOriginPlaceId(req.originPlaceId || mappablePlaces[0]?.id || '');
        setDestinationPlaceId(req.destinationPlaceId || mappablePlaces[0]?.id || '');
        setInterestCategoryIds(req.interestCategoryIds);
        setRequiredExperienceIds(req.requiredExperienceIds);
        setResult({
          options: saved.options,
          blockingReasons: [],
          consideredExperienceIds: [],
          visitedSearchNodes: 0,
        });
        setSelectedOptionId(saved.options[0]?.id || '');
        setMobileTab('timeline');
        return;
      }
    }

    // Auto-generate initial itinerary recommendation on first mount
    if (mappablePlaces.length >= 2) {
      const defaultReq: TripRequest = {
        date: dateInHcm(7),
        startTime: '08:00',
        endTime: '17:00',
        adults: 2,
        children: 0,
        childAges: [],
        budgetVnd: null,
        childBudgetVnd: null,
        budgetBasis: 'group',
        includeMealCost: false,
        mealCostVnd: null,
        includeTransportCost: false,
        transportCostVnd: null,
        transportMode: 'car',
        originPlaceId: mappablePlaces[0].id,
        destinationPlaceId: mappablePlaces[0].id,
        interestCategoryIds: initialSeason ? [initialSeason.categoryId] : [],
        requiredExperienceIds: reqExp ? [reqExp] : [],
        pace: 'balanced',
        maxStops: 4,
        groupCostEstimatesVnd: {},
      };
      const initialRes = generateItineraryOptions(defaultReq, {
        places,
        experiences,
        sources,
        matrix: routeMatrix,
      });
      setResult(initialRes);
      if (initialRes.options.length > 0) {
        setSelectedOptionId(initialRes.options[0].id);
        setSelectedPlaceId(initialRes.options[0].stops[0]?.placeId || null);
      }
    }
  }, [places, experiences, sources, mappablePlaces, routableExperiences, searchParams, originPlaceId, destinationPlaceId, initialSeason]);

  useEffect(() => {
    if (searchParams.get('load')) return;
    const season = getSeasonTheme(searchParams.get('season'));
    if (season) setInterestCategoryIds([season.categoryId]);
  }, [searchParams]);

  // Handle submit form
  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();

    const parsedBudget = budgetText.trim() ? Number(budgetText.replace(/\D/g, '')) : null;

    const request: TripRequest = {
      date,
      startTime,
      endTime,
      adults: Math.max(1, adults),
      children: Math.max(0, children),
      childAges: [],
      budgetVnd: parsedBudget,
      childBudgetVnd: null,
      budgetBasis,
      includeMealCost: false,
      mealCostVnd: null,
      includeTransportCost: false,
      transportCostVnd: null,
      transportMode,
      originPlaceId: originPlaceId || mappablePlaces[0]?.id || null,
      destinationPlaceId: destinationPlaceId || mappablePlaces[0]?.id || null,
      interestCategoryIds,
      requiredExperienceIds,
      pace,
      maxStops,
      groupCostEstimatesVnd: {},
    };

    const plannerResult = generateItineraryOptions(request, {
      places,
      experiences,
      sources,
      matrix: routeMatrix,
    });

    setResult(plannerResult);
    if (plannerResult.options.length > 0) {
      setSelectedOptionId(plannerResult.options[0].id);
      setSelectedPlaceId(plannerResult.options[0].stops[0]?.placeId || null);
      setToastMessage('Đã tính toán hành trình đề xuất!');
      setTimeout(() => setToastMessage(null), 2500);
      setMobileTab('timeline');
    } else {
      setToastMessage('Không tìm thấy tuyến phù hợp điều kiện. Thử nới rộng thời gian hoặc chọn điểm khác.');
      setTimeout(() => setToastMessage(null), 4000);
    }
  };

  // Toggle category in favorites
  const toggleCategory = (catId: string) => {
    setInterestCategoryIds((prev) =>
      prev.includes(catId) ? prev.filter((id) => id !== catId) : [...prev, catId]
    );
  };

  // Toggle required stop
  const toggleRequiredExperience = (expId: string) => {
    setRequiredExperienceIds((prev) =>
      prev.includes(expId) ? prev.filter((id) => id !== expId) : [...prev, expId]
    );
  };

  // Remove a stop from current option and recalculate
  const handleRemoveStop = (stopIndex: number) => {
    if (!selectedOption || selectedOption.stops.length <= 2) {
      setToastMessage('Hành trình cần tối thiểu 2 điểm dừng.');
      setTimeout(() => setToastMessage(null), 2500);
      return;
    }

    const nextStops = selectedOption.stops.filter((_, idx) => idx !== stopIndex);
    const stopExperienceIds = nextStops.map((s) => s.experienceId);

    const request: TripRequest = {
      date,
      startTime,
      endTime,
      adults,
      children,
      childAges: [],
      budgetVnd: null,
      childBudgetVnd: null,
      budgetBasis: 'group',
      includeMealCost: false,
      mealCostVnd: null,
      includeTransportCost: false,
      transportCostVnd: null,
      transportMode,
      originPlaceId,
      destinationPlaceId,
      interestCategoryIds,
      requiredExperienceIds: requiredExperienceIds.filter((id) => stopExperienceIds.includes(id)),
      pace,
      maxStops,
      groupCostEstimatesVnd: {},
    };

    const recalculated = recalculateItinerary(
      request,
      stopExperienceIds,
      { places, experiences, sources, matrix: routeMatrix },
      selectedOption.label
    );

    if (recalculated) {
      const updatedOptions = result?.options.map((opt) =>
        opt.id === selectedOption.id ? recalculated : opt
      ) || [recalculated];

      setResult({
        options: updatedOptions,
        blockingReasons: [],
        consideredExperienceIds: result?.consideredExperienceIds || [],
        visitedSearchNodes: result?.visitedSearchNodes || 0,
      });
      setSelectedOptionId(recalculated.id);
      setToastMessage('Đã cập nhật lại lịch trình.');
      setTimeout(() => setToastMessage(null), 2000);
    }
  };

  const handleMoveStop = (stopIndex: number, direction: -1 | 1) => {
    if (!selectedOption) return;
    const destinationIndex = stopIndex + direction;
    if (destinationIndex < 0 || destinationIndex >= selectedOption.stops.length) return;
    const stopIds = selectedOption.stops.map((stop) => stop.experienceId);
    [stopIds[stopIndex], stopIds[destinationIndex]] = [stopIds[destinationIndex], stopIds[stopIndex]];
    const request: TripRequest = {
      date, startTime, endTime, adults, children, childAges: [],
      budgetVnd: null, childBudgetVnd: null, budgetBasis: 'group',
      includeMealCost: false, mealCostVnd: null, includeTransportCost: false,
      transportCostVnd: null, transportMode, originPlaceId, destinationPlaceId,
      interestCategoryIds, requiredExperienceIds: requiredExperienceIds.filter((id) => stopIds.includes(id)),
      pace, maxStops, groupCostEstimatesVnd: {},
    };
    const reordered = recalculateItinerary(request, stopIds, { places, experiences, sources, matrix: routeMatrix }, selectedOption.label);
    if (!reordered) {
      setToastMessage('Thứ tự này chưa ghép được với tuyến đường đã xác minh.');
      setTimeout(() => setToastMessage(null), 2500);
      return;
    }
    const options = result?.options.map((option) => option.id === selectedOption.id ? reordered : option) || [reordered];
    setResult({ options, blockingReasons: [], consideredExperienceIds: result?.consideredExperienceIds || [], visitedSearchNodes: result?.visitedSearchNodes || 0 });
    setSelectedOptionId(reordered.id);
    setToastMessage('Đã cập nhật thứ tự điểm dừng.');
    setTimeout(() => setToastMessage(null), 2000);
  };

  // Save current trip to localStorage
  const handleSaveTrip = () => {
    if (!selectedOption) return;
    const existingTrip = localData.itineraries.find((item) => item.id === loadedTripId);
    const now = new Date().toISOString();

    const trip: SavedItinerary = {
      id: loadedTripId || newLocalId(),
      title: `Chuyến đi Bình Mỹ · ${selectedOption.label} (${selectedOption.stops.length} điểm)`,
      createdAt: existingTrip?.createdAt || now,
      updatedAt: now,
      request: {
        date,
        startTime,
        endTime,
        adults,
        children,
        childAges: [],
        budgetVnd: budgetText ? Number(budgetText.replace(/\D/g, '')) : null,
        childBudgetVnd: null,
        budgetBasis,
        includeMealCost: false,
        mealCostVnd: null,
        includeTransportCost: false,
        transportCostVnd: null,
        transportMode,
        originPlaceId,
        destinationPlaceId,
        interestCategoryIds,
        requiredExperienceIds,
        pace,
        maxStops,
        groupCostEstimatesVnd: {},
      },
      options: [selectedOption],
    };

    const stored = readLocalData();
    const nextData = {
      ...stored.data,
      itineraries: [trip, ...stored.data.itineraries.filter((t) => t.id !== trip.id)],
    };

    const res = writeLocalData(nextData);
    if (res.ok) {
      setLocalData(nextData);
      setToastMessage(existingTrip ? 'Đã cập nhật hành trình đã lưu.' : 'Đã lưu hành trình vào thiết bị của bạn!');
      setTimeout(() => setToastMessage(null), 3000);
    }
  };

  // Download JSON export
  const handleDownload = () => {
    if (!selectedOption) return;
    downloadJson(`hanh-trinh-binh-my-${date}.json`, {
      date,
      option: selectedOption,
      stops: selectedOption.stops,
      createdAt: new Date().toISOString(),
    });
  };

  // Print itinerary
  const handlePrint = () => {
    window.print();
  };

  // Map places to show (stops in selected option)
  const mapPlaces = useMemo(() => {
    if (!selectedOption || !selectedOption.stops.length) return mappablePlaces;
    const stopPlaceIds = new Set(selectedOption.stops.map((s) => s.placeId));
    if (originPlaceId) stopPlaceIds.add(originPlaceId);
    if (destinationPlaceId) stopPlaceIds.add(destinationPlaceId);
    return mappablePlaces.filter((p) => stopPlaceIds.has(p.id));
  }, [selectedOption, originPlaceId, destinationPlaceId, mappablePlaces]);

  return (
    <div className="mx-auto max-w-[1440px] space-y-7 px-4 py-7 pb-28 sm:px-6 sm:py-10 md:pb-14 lg:px-8">
      {/* Toast */}
      {toastMessage && (
        <div role="status" aria-live="polite" className="fixed top-20 right-6 z-50 rounded-2xl bg-[#174C3C] text-white px-4 py-2.5 shadow-2xl border border-[#D6A545]/40 text-xs sm:text-sm font-bold animate-fade-in flex items-center gap-2">
          <CheckCircle2 size={16} className="text-[#D6A545]" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-4 border-b border-[#174C3C]/10">
        <div>
          <span className="text-sm font-bold text-[#A9761F]">
            Theo sở thích, thời gian và ngân sách
          </span>
          <h1 className="mt-2 text-3xl font-extrabold leading-tight text-[#174C3C] sm:text-4xl lg:text-5xl">
            Lập hành trình Bình Mỹ
          </h1>
          <p className="mt-2 max-w-2xl text-base leading-7 text-[#59675E]">
            Xem phương án khi có đủ thông tin về lịch, chi phí và tuyến đường. Bạn chủ động kiểm tra điều kiện thực tế trước khi đi.
          </p>
        </div>

        {/* Action Buttons Top */}
        {selectedOption && (
          <div className="flex items-center gap-2 shrink-0 no-print">
            <button
              type="button"
              onClick={handleSaveTrip}
              className="btn-tactile btn-primary-forest min-h-11 rounded-full px-4 text-sm"
            >
              <BookmarkCheck size={14} className="text-[#D6A545]" />
              <span>Lưu hành trình</span>
            </button>

            <button
              type="button"
              onClick={handleDownload}
              className="btn-tactile btn-secondary-sage min-h-11 rounded-full px-3 text-sm"
              title="Tải tệp lịch trình JSON"
            >
              <Download size={14} />
              <span className="hidden sm:inline">Tải về</span>
            </button>

            <button
              type="button"
              onClick={handlePrint}
              className="btn-tactile btn-secondary-sage min-h-11 rounded-full px-3 text-sm"
              title="In lịch trình"
            >
              <Printer size={14} />
              <span className="hidden sm:inline">In</span>
            </button>
          </div>
        )}
      </div>

      {/* MOBILE 3-TAB SWITCH (VISIBLE ON PHONE/TABLET) */}
      <div className="lg:hidden flex rounded-2xl border border-[#DCE5DB] bg-white p-1 shadow-sm no-print" role="group" aria-label="Các phần của hành trình">
        {[
          { id: 'conditions', label: '1. Điều kiện', icon: SlidersHorizontal },
          { id: 'map', label: '2. Bản đồ', icon: Route },
          { id: 'timeline', label: '3. Lịch trình', icon: CalendarDays },
        ].map((tab) => {
          const isSelected = mobileTab === tab.id;
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setMobileTab(tab.id as typeof mobileTab)}
              aria-pressed={isSelected}
              className={`min-h-11 flex-1 flex items-center justify-center gap-1.5 rounded-xl px-1.5 text-xs font-bold transition-all ${
                isSelected
                  ? 'bg-[#174C3C] text-white shadow-sm'
                  : 'text-[#26352E]/70 hover:text-[#174C3C]'
              }`}
            >
              <Icon size={14} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* 3-COLUMN DESKTOP LAYOUT (25% Conditions - 45% Map - 30% Timeline) */}
      <div className="grid items-start gap-5 lg:grid-cols-[1.1fr_1.8fr_1.3fr] xl:gap-6">
        {/* COLUMN 1: TRIP CONDITIONS FORM (approx 25%) */}
        <section
          className={`card-3d p-5 sm:p-6 space-y-5 bg-white ${
            mobileTab !== 'conditions' ? 'hidden lg:block' : 'block'
          }`}
        >
          <div className="flex items-center gap-2 text-sm font-black text-[#174C3C] pb-2 border-b border-[#174C3C]/10">
            <SlidersHorizontal size={16} className="text-[#D6A545]" />
            <span>Điều kiện chuyến đi</span>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4 text-xs sm:text-sm">
            <p className="rounded-xl bg-[#F7F4EA] px-3 py-2 text-[11px] leading-5 text-[#59675E]">
              Lịch trình chỉ được tính từ trải nghiệm có đủ giờ, thời lượng, vị trí và tuyến đường đã xác minh. Bạn sẽ cần xác nhận trực tiếp với nhà vườn trước chuyến đi.
            </p>
            {/* Ngày đi */}
            <div>
                  <label htmlFor="trip-date" className="block font-bold text-[#174C3C] mb-1">Ngày khởi hành</label>
              <div className="relative">
                <input
                  type="date"
                  id="trip-date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  min={dateInHcm(0)}
                  className="w-full rounded-xl border border-[#174C3C]/20 bg-[#F7F4EA]/40 px-3 py-2 text-xs sm:text-sm outline-none focus:border-[#174C3C] focus:bg-white"
                  required
                />
              </div>
            </div>

            {/* Giờ bắt đầu & kết thúc */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label htmlFor="trip-start-time" className="block font-bold text-[#174C3C] mb-1">Giờ bắt đầu</label>
                <input
                  type="time"
                  id="trip-start-time"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  className="w-full rounded-xl border border-[#174C3C]/20 bg-[#F7F4EA]/40 px-3 py-2 text-xs sm:text-sm outline-none focus:border-[#174C3C] focus:bg-white"
                  required
                />
              </div>
              <div>
                <label htmlFor="trip-end-time" className="block font-bold text-[#174C3C] mb-1">Giờ kết thúc</label>
                <input
                  type="time"
                  id="trip-end-time"
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                  className="w-full rounded-xl border border-[#174C3C]/20 bg-[#F7F4EA]/40 px-3 py-2 text-xs sm:text-sm outline-none focus:border-[#174C3C] focus:bg-white"
                  required
                />
              </div>
            </div>

            {/* Số người */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label htmlFor="trip-adults" className="block font-bold text-[#174C3C] mb-1">Người lớn</label>
                <input
                  type="number"
                  id="trip-adults"
                  min="1"
                  max="40"
                  value={adults}
                  onChange={(e) => setAdults(Number(e.target.value))}
                  className="w-full rounded-xl border border-[#174C3C]/20 bg-[#F7F4EA]/40 px-3 py-2 text-xs sm:text-sm outline-none focus:border-[#174C3C] focus:bg-white"
                  required
                />
              </div>
              <div>
                <label htmlFor="trip-children" className="block font-bold text-[#174C3C] mb-1">Trẻ em</label>
                <input
                  type="number"
                  id="trip-children"
                  min="0"
                  max="20"
                  value={children}
                  onChange={(e) => setChildren(Number(e.target.value))}
                  className="w-full rounded-xl border border-[#174C3C]/20 bg-[#F7F4EA]/40 px-3 py-2 text-xs sm:text-sm outline-none focus:border-[#174C3C] focus:bg-white"
                />
              </div>
            </div>

            {/* Ngân sách */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label htmlFor="trip-budget" className="font-bold text-[#174C3C]">Dự trù ngân sách (VND)</label>
                <div className="inline-flex text-[10px] rounded-lg border border-zinc-200 p-0.5">
                  <button
                    type="button"
                    onClick={() => setBudgetBasis('group')}
                    aria-pressed={budgetBasis === 'group'}
                    className={`px-1.5 py-0.5 rounded ${
                      budgetBasis === 'group' ? 'bg-[#174C3C] text-white font-bold' : 'text-zinc-600'
                    }`}
                  >
                    Cả nhóm
                  </button>
                  <button
                    type="button"
                    onClick={() => setBudgetBasis('person')}
                    aria-pressed={budgetBasis === 'person'}
                    className={`px-1.5 py-0.5 rounded ${
                      budgetBasis === 'person' ? 'bg-[#174C3C] text-white font-bold' : 'text-zinc-600'
                    }`}
                  >
                    Mỗi người
                  </button>
                </div>
              </div>
              <input
                type="text"
                id="trip-budget"
                placeholder="VD: 500.000 (để trống nếu không giới hạn)"
                value={budgetText}
                onChange={(e) => setBudgetText(e.target.value)}
                className="w-full rounded-xl border border-[#174C3C]/20 bg-[#F7F4EA]/40 px-3 py-2 text-xs sm:text-sm outline-none focus:border-[#174C3C] focus:bg-white"
              />
            </div>

            {/* Điểm xuất phát & Phương tiện */}
            <div className="space-y-3 pt-2 border-t border-zinc-100">
              <div>
                <label htmlFor="trip-origin" className="block font-bold text-[#174C3C] mb-1">Điểm bắt đầu & Kết thúc</label>
                <select
                  id="trip-origin"
                  value={originPlaceId}
                  onChange={(e) => {
                    setOriginPlaceId(e.target.value);
                    setDestinationPlaceId(e.target.value);
                  }}
                  className="w-full rounded-xl border border-[#174C3C]/20 bg-[#F7F4EA]/40 px-3 py-2 text-xs sm:text-sm outline-none focus:border-[#174C3C] focus:bg-white"
                >
                  <option value="">{mappablePlaces.length ? 'Chọn điểm đã xác minh' : 'Chưa có điểm ghé đủ dữ liệu bản đồ'}</option>
                  {mappablePlaces.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold text-[#174C3C] mb-1">Phương tiện di chuyển</label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { mode: 'car', label: 'Ô tô / Taxi', icon: Car },
                    { mode: 'bike', label: 'Xe máy', icon: Bike },
                    { mode: 'walk', label: 'Đi bộ dạo', icon: Footprints },
                    { mode: 'boat', label: 'Đường thủy', icon: Ship },
                  ].map((t) => {
                    const isSelected = transportMode === t.mode;
                    const Icon = t.icon;
                    return (
                      <button
                        key={t.mode}
                        type="button"
                        onClick={() => setTransportMode(t.mode as PlannerTransport)}
                        aria-pressed={isSelected}
                        className={`flex min-h-11 items-center gap-1.5 p-2 rounded-xl border text-xs font-bold transition-all ${
                          isSelected
                            ? 'bg-[#174C3C] text-white border-[#174C3C]'
                            : 'bg-[#F7F4EA]/40 border-zinc-200 text-[#26352E]/80 hover:bg-[#E7EFE4]'
                        }`}
                      >
                        <Icon size={14} className={isSelected ? 'text-[#D6A545]' : ''} />
                        <span>{t.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Nhóm trải nghiệm yêu thích */}
            <div className="space-y-2 pt-2 border-t border-zinc-100">
              <label className="block font-bold text-[#174C3C]">Nhóm trải nghiệm ưu tiên</label>
              <div className="grid grid-cols-2 gap-2">
                {categoriesData.map((cat) => {
                  const isChecked = interestCategoryIds.includes(cat.id);
                  return (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => toggleCategory(cat.id)}
                      aria-pressed={isChecked}
                      className={`min-h-11 text-left p-2 rounded-xl border text-[11px] font-bold transition-all ${
                        isChecked
                          ? 'bg-[#E7EFE4] text-[#174C3C] border-[#174C3C]'
                          : 'bg-[#F7F4EA]/40 border-zinc-200 text-[#26352E]/70'
                      }`}
                    >
                      {cat.name}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Điểm muốn ghé bắt buộc */}
            <div className="space-y-2 pt-2 border-t border-zinc-100">
              <label className="block font-bold text-[#174C3C]">Điểm chắc chắn muốn ghé</label>
              <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
                {routableExperiences.map((exp) => {
                  const isChecked = requiredExperienceIds.includes(exp.id);
                  return (
                    <label
                      key={exp.id}
                      className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-[#F7F4EA] cursor-pointer text-xs"
                    >
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => toggleRequiredExperience(exp.id)}
                        className="rounded accent-[#174C3C]"
                      />
                      <span className="truncate">{exp.name}</span>
                    </label>
                  );
                })}
              </div>
            </div>

            {/* Big CTA: Đề xuất hành trình */}
            <div className="pt-3">
              <button
                type="submit"
                className="btn-tactile btn-accent-gold min-h-12 w-full text-center text-sm py-3.5 shadow-lg active:scale-97"
              >
                <Sparkles size={16} className="text-[#174C3C]" />
                <span>Đề xuất hành trình</span>
              </button>
            </div>
          </form>
        </section>

        {/* COLUMN 2: INTERACTIVE LEAFLET MAP (approx 45%) */}
        <section
          className={`space-y-3 ${
            mobileTab !== 'map' ? 'hidden lg:block' : 'block'
          }`}
        >
          <div className="card-3d p-2 overflow-hidden bg-white">
            <VerifiedPlaceMap
              places={mapPlaces}
              selectedId={selectedPlaceId}
              onSelect={(id) => setSelectedPlaceId(id)}
              geometryRefs={selectedOption?.geometryRefs}
            />
          </div>

          <div className="flex items-center justify-between text-xs text-[#26352E]/70 px-2">
            <span className="inline-flex items-center gap-1.5">
              <MapPin size={13} className="text-[#174C3C]" />
              {selectedOption ? 'Các điểm dừng trong phương án đã chọn' : 'Vị trí có tọa độ đã xác minh'}
            </span>
            <span className="font-semibold text-[#174C3C]">
              {selectedOption ? `${selectedOption.stops.length} điểm trong lịch` : `${mapPlaces.length} vị trí trên bản đồ`}
            </span>
          </div>
        </section>

        {/* COLUMN 3: DETAILED TIMELINE & OPTIONS (approx 30%) */}
        <section
          className={`space-y-4 ${
            mobileTab !== 'timeline' ? 'hidden lg:block' : 'block'
          }`}
        >
          {/* OPTIONS TABS: [Tiết kiệm] [Cân bằng] [Nhiều trải nghiệm] */}
          {result?.options && result.options.length > 0 ? (
            <div className="card-3d p-4 bg-white space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-zinc-100">
                <span className="text-xs font-black uppercase tracking-wider text-[#D6A545]">
                  Phương án gợi ý
                </span>
                <span className="text-[11px] font-bold text-[#174C3C]">
                  {result.options.length} phương án
                </span>
              </div>

              <div className="grid grid-cols-3 gap-1.5">
                {result.options.map((opt) => {
                  const isSelected = (selectedOption?.id || '') === opt.id;
                  return (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => {
                        setSelectedOptionId(opt.id);
                        setSelectedPlaceId(opt.stops[0]?.placeId || null);
                      }}
                      className={`p-2 rounded-xl text-xs font-black transition-all text-center ${
                        isSelected
                          ? 'bg-[#174C3C] text-white shadow-md'
                          : 'bg-[#F7F4EA] text-[#26352E]/75 hover:bg-[#E7EFE4]'
                      }`}
                    >
                      <div>{opt.label}</div>
                      <div className="text-[10px] font-medium opacity-80 mt-0.5">
                        {opt.stops.length} điểm
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Selected Option Summary Stats */}
              {selectedOption && (
                <div className="rounded-2xl bg-[#E7EFE4] p-3 text-xs space-y-1.5">
                  <div className="flex items-center justify-between font-bold text-[#174C3C]">
                    <span>Dự toán kinh phí:</span>
                    <span className="text-sm font-black">{money(selectedOption.totalCostVnd)}</span>
                  </div>
                  <div className="flex items-center justify-between text-[#26352E]/80">
                    <span>Tổng thời gian:</span>
                    <span>~{Math.round(selectedOption.totalDurationMinutes / 60)} giờ ({selectedOption.totalTravelMinutes}p di chuyển)</span>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="card-3d p-6 bg-white text-center space-y-2">
              <Compass size={24} className="mx-auto text-[#174C3C]" />
              <p className="text-sm font-bold text-[#174C3C]">Chưa có phương án tính toán</p>
              <p className="text-xs text-[#26352E]/70">
                {result?.blockingReasons.length
                  ? 'Chưa thể tạo lịch với dữ liệu và điều kiện hiện tại.'
                  : !mappablePlaces.length
                    ? 'Hiện chưa có điểm ghé nào đủ vị trí và thông tin tuyến đã xác minh để tính hành trình. Bạn vẫn có thể xem địa điểm và liên hệ nhà vườn để xác nhận.'
                    : 'Chọn điều kiện ở cột bên trái và bấm “Đề xuất hành trình”.'}
              </p>
              {result?.blockingReasons.length ? (
                <ul className="mx-auto max-w-lg list-disc space-y-1 pl-5 text-left text-xs text-[#59675E]">
                  {result.blockingReasons.map((reason) => <li key={reason}>{reason}</li>)}
                </ul>
              ) : null}
            </div>
          )}

          {/* TIMELINE STOPS LIST */}
          {selectedOption && selectedOption.stops.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center justify-between px-1">
                <span className="text-xs font-black uppercase tracking-wider text-[#174C3C]">
                  Lịch trình chi tiết ({selectedOption.stops.length} chặng)
                </span>
                <span className="text-[11px] text-[#26352E]/60">Bấm điểm để xem trên bản đồ</span>
              </div>

              <div className="space-y-3 max-h-[580px] overflow-y-auto pr-1">
                {selectedOption.stops.map((stop, idx) => {
                  const isHighlighted = selectedPlaceId === stop.placeId;
                  const artworkSeason = categoryArtwork[stop.categoryId] || 'spring';
                  const stopImage = placeImagePaths[stop.placeId]?.[0];

                  return (
                    <article
                      key={`${stop.experienceId}-${idx}`}
                      className={`card-3d p-4 cursor-pointer transition-all ${
                        isHighlighted
                          ? 'border-[#D6A545] ring-2 ring-[#D6A545]/40 shadow-lg bg-[#FAF0DB]/20'
                          : 'hover:border-[#174C3C]/30 bg-white'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        {/* Number Badge */}
                        <div className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-[#174C3C] text-xs font-black text-white">
                          {idx + 1}
                        </div>

                        {/* Thumbnail Image */}
                        <div className="relative aspect-[4/3] w-16 shrink-0 overflow-hidden rounded-xl bg-zinc-100">
                          {stopImage ? <Image src={stopImage} alt={`Trải nghiệm tại ${stop.name}`} fill sizes="64px" className="object-cover" /> : <SeasonArtwork season={artworkSeason} className="h-full w-full" />}
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-1">
                            <span className="text-[11px] font-bold text-[#D6A545]">
                              {stop.arrivalTime} – {stop.departureTime}
                            </span>

                            {/* Remove Stop Button */}
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleRemoveStop(idx);
                              }}
                              className="text-zinc-400 hover:text-rose-600 p-1"
                              title="Bỏ điểm này khỏi lịch trình"
                              aria-label={`Bỏ điểm ${stop.name}`}
                            >
                              <Trash2 size={13} />
                            </button>
                          </div>

                          <div className="mt-1 flex flex-wrap items-center gap-1">
                            <button type="button" disabled={idx === 0} onClick={() => handleMoveStop(idx, -1)} className="min-h-9 rounded-lg px-2 text-[11px] font-semibold text-[#174C3C] hover:bg-[#E7EFE4] disabled:cursor-not-allowed disabled:opacity-40" aria-label={`Chuyển ${stop.name} lên trước`}>
                              ↑ Lên
                            </button>
                            <button type="button" disabled={idx === selectedOption.stops.length - 1} onClick={() => handleMoveStop(idx, 1)} className="min-h-9 rounded-lg px-2 text-[11px] font-semibold text-[#174C3C] hover:bg-[#E7EFE4] disabled:cursor-not-allowed disabled:opacity-40" aria-label={`Chuyển ${stop.name} xuống sau`}>
                              ↓ Xuống
                            </button>
                            <button type="button" onClick={() => setSelectedPlaceId(stop.placeId)} className="min-h-9 rounded-lg px-2 text-[11px] font-semibold text-[#174C3C] hover:bg-[#E7EFE4]">
                              Xem trên bản đồ
                            </button>
                          </div>

                          <h4 className="font-bold text-sm text-[#174C3C] leading-snug truncate mt-0.5">
                            {stop.name}
                          </h4>

                          <p className="mt-1 text-[11px] text-[#26352E]/70 line-clamp-1">
                            {stop.activities[0]}
                          </p>

                          <div className="mt-2 pt-2 border-t border-zinc-100 flex items-center justify-between text-[11px]">
                            <span className="text-[#26352E]/60">
                              {stop.travelMinutesFromPrevious > 0
                                ? `+${stop.travelMinutesFromPrevious}p di chuyển`
                                : 'Điểm xuất phát'}
                            </span>
                            <span className="font-bold text-[#174C3C]">
                              {money(stop.costVnd)}
                            </span>
                          </div>
                        </div>
                      </div>
                    </article>
                  );
                })}
              </div>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
