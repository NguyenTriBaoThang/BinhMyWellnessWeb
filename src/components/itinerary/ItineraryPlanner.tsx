'use client';

import { FormEvent, useEffect, useMemo, useState } from 'react';
import { ArrowDown, ArrowUp, CalendarDays, Check, Clock3, Download, Lock, Printer, Route, Save, Share2, TriangleAlert, Unlock, Users } from 'lucide-react';
import type { Category, Experience, Place, Source } from '@/lib/data/types';
import { categoriesData, routeMatrix } from '@/lib/data/repository';
import VerifiedPlaceMap from '@/components/explore/VerifiedPlaceMap';
import { generateItineraryOptions, recalculateItinerary, type ItineraryOption, type PlannerResult, type PlannerTransport, type TripPace, type TripRequest } from '@/lib/planner/engine';
import { downloadJson, emptyLocalData, newLocalId, readLocalData, writeLocalData, type LocalData, type SavedItinerary } from '@/lib/storage/local-data';

function dateInHcm(daysFromNow: number): string {
  const parts = new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Ho_Chi_Minh', year: 'numeric', month: '2-digit', day: '2-digit' }).formatToParts(new Date());
  const values = Object.fromEntries(parts.map((part) => [part.type, part.value]));
  const date = new Date(`${values.year}-${values.month}-${values.day}T00:00:00.000Z`);
  date.setUTCDate(date.getUTCDate() + daysFromNow);
  return date.toISOString().slice(0, 10);
}

function money(value: number | null): string {
  return value === null ? 'Liên hệ để biết giá' : new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', maximumFractionDigits: 0 }).format(value);
}

export default function ItineraryPlanner({ places, experiences, categories, sources }: { places: Place[]; experiences: Experience[]; categories: Category[]; sources: Source[] }) {
  const [date, setDate] = useState(() => dateInHcm(7));
  const [startTime, setStartTime] = useState('08:00');
  const [endTime, setEndTime] = useState('17:00');
  const [adults, setAdults] = useState(2);
  const [children, setChildren] = useState(0);
  const [childAgesText, setChildAgesText] = useState('');
  const [budgetText, setBudgetText] = useState('');
  const [childBudgetText, setChildBudgetText] = useState('');
  const [includeMealCost, setIncludeMealCost] = useState(false);
  const [mealCostText, setMealCostText] = useState('');
  const [includeTransportCost, setIncludeTransportCost] = useState(false);
  const [transportCostText, setTransportCostText] = useState('');
  const [budgetBasis, setBudgetBasis] = useState<'group' | 'person'>('group');
  const [transportMode, setTransportMode] = useState<PlannerTransport>('car');
  const [originPlaceId, setOriginPlaceId] = useState('');
  const [destinationPlaceId, setDestinationPlaceId] = useState('');
  const [interestCategoryIds, setInterestCategoryIds] = useState<string[]>([]);
  const [requiredExperienceIds, setRequiredExperienceIds] = useState<string[]>([]);
  const [lockedExperienceIds, setLockedExperienceIds] = useState<string[]>([]);
  const [pace, setPace] = useState<TripPace>('balanced');
  const [maxStops, setMaxStops] = useState(4);
  const [costEstimateText, setCostEstimateText] = useState<Record<string, string>>({});
  const [result, setResult] = useState<PlannerResult | null>(null);
  const [selectedOptionId, setSelectedOptionId] = useState('');
  const [selectedPlaceId, setSelectedPlaceId] = useState<string | null>(null);
  const [mobileTab, setMobileTab] = useState<'conditions' | 'map' | 'plan'>('conditions');
  const [localData, setLocalData] = useState<LocalData>(emptyLocalData());
  const [savedItineraryId, setSavedItineraryId] = useState('');
  const [notice, setNotice] = useState('');

  const mappablePlaces = useMemo(() => places.filter((place) => place.areaCode === 'BINH_MY' && place.verification.area.status === 'verified' && place.coordinates && place.coordinateStatus === 'verified' && place.verification.coordinates.status === 'verified'), [places]);
  const routePlaceIds = useMemo(() => new Set(routeMatrix.edges.filter((edge) => edge.status === 'verified').flatMap((edge) => [edge.fromPlaceId, edge.toPlaceId])), []);
  const startChoices = useMemo(() => places.filter((place) => routePlaceIds.has(place.id) && place.areaCode === 'BINH_MY' && place.verification.area.status === 'verified' && place.coordinates && place.coordinateStatus === 'verified'), [places, routePlaceIds]);
  const selectedOption = result?.options.find((option) => option.id === selectedOptionId) ?? result?.options[0] ?? null;

  useEffect(() => {
    const stored = readLocalData();
    setLocalData(stored.data);
    if (stored.warning) setNotice(stored.warning);
    const params = new URLSearchParams(window.location.search);
    const sharedText = params.get('share');
    if (sharedText !== null) {
      try {
        if (window.location.href.length > 1800) throw new Error('too-long');
        const value: unknown = JSON.parse(sharedText);
        if (!value || typeof value !== 'object') throw new Error('invalid');
        const shared = value as Record<string, unknown>;
        const ids = shared.experiences;
        const categories = shared.categories;
        if (shared.v !== 1 || typeof shared.date !== 'string' || typeof shared.start !== 'string' || typeof shared.end !== 'string'
          || !['car', 'bike', 'walk', 'boat'].includes(String(shared.mode)) || typeof shared.origin !== 'string' || typeof shared.destination !== 'string'
          || !Array.isArray(ids) || ids.length < 2 || ids.length > 6 || ids.some((id) => typeof id !== 'string' || !experiences.some((item) => item.id === id && item.routeEligible))
          || new Set(ids).size !== ids.length || !Array.isArray(categories) || categories.length > 4 || categories.some((id) => typeof id !== 'string' || !categoriesData.some((item) => item.id === id))
          || !startChoices.some((place) => place.id === shared.origin) || !startChoices.some((place) => place.id === shared.destination)
          || !/^\d{4}-\d{2}-\d{2}$/.test(shared.date) || !/^\d{2}:\d{2}$/.test(shared.start) || !/^\d{2}:\d{2}$/.test(shared.end)) throw new Error('invalid');
        const request: TripRequest = {
          date: shared.date, startTime: shared.start, endTime: shared.end, adults: 2, children: 0, childAges: [],
          budgetVnd: null, childBudgetVnd: null, budgetBasis: 'group', includeMealCost: false, mealCostVnd: null,
          includeTransportCost: false, transportCostVnd: null, transportMode: shared.mode as PlannerTransport,
          originPlaceId: shared.origin, destinationPlaceId: shared.destination, interestCategoryIds: categories as string[],
          requiredExperienceIds: ids as string[], pace: 'balanced', maxStops: ids.length, groupCostEstimatesVnd: {},
        };
        setDate(request.date); setStartTime(request.startTime); setEndTime(request.endTime); setTransportMode(request.transportMode);
        setOriginPlaceId(request.originPlaceId!); setDestinationPlaceId(request.destinationPlaceId!); setInterestCategoryIds(request.interestCategoryIds); setRequiredExperienceIds(request.requiredExperienceIds); setMaxStops(request.maxStops);
        const sharedResult = generateItineraryOptions(request, { places, experiences, sources, matrix: routeMatrix });
        setResult(sharedResult); setSelectedOptionId(sharedResult.options[0]?.id ?? ''); setSelectedPlaceId(sharedResult.options[0]?.stops[0]?.placeId ?? null); setMobileTab('plan');
        setNotice(sharedResult.options.length ? 'Đã tải lựa chọn được chia sẻ. Hãy kiểm tra dữ liệu và xác nhận trực tiếp trước khi đi.' : 'Lựa chọn đã tải, nhưng dữ liệu tuyến hiện có chưa đủ để tính hành trình.');
      } catch {
        setNotice('Liên kết chia sẻ không hợp lệ hoặc quá dài; các lựa chọn cũ không được thay đổi.');
      }
      return;
    }
    const savedId = params.get('load');
    if (savedId) {
      const saved = stored.data.itineraries.find((item) => item.id === savedId);
      if (!saved) { setNotice('Không tìm thấy hành trình đã lưu trên thiết bị này.'); return; }
      const request = saved.request;
      setDate(request.date); setStartTime(request.startTime); setEndTime(request.endTime); setAdults(request.adults); setChildren(request.children); setChildAgesText(request.childAges.join(', '));
      setBudgetText(request.budgetVnd?.toString() ?? ''); setChildBudgetText(request.childBudgetVnd?.toString() ?? ''); setBudgetBasis(request.budgetBasis);
      setIncludeMealCost(request.includeMealCost); setMealCostText(request.mealCostVnd?.toString() ?? ''); setIncludeTransportCost(request.includeTransportCost); setTransportCostText(request.transportCostVnd?.toString() ?? '');
      setTransportMode(request.transportMode); setOriginPlaceId(request.originPlaceId ?? ''); setDestinationPlaceId(request.destinationPlaceId ?? '');
      setInterestCategoryIds(request.interestCategoryIds); setRequiredExperienceIds(request.requiredExperienceIds); setPace(request.pace); setMaxStops(request.maxStops);
      setCostEstimateText(Object.fromEntries(Object.entries(request.groupCostEstimatesVnd).map(([id, value]) => [id, String(value)])));
      const generated = generateItineraryOptions(request, { places, experiences, sources, matrix: routeMatrix });
      const savedOption = saved.options[0];
      const recalculated = savedOption ? recalculateItinerary(request, savedOption.stops.map((stop) => stop.experienceId), { places, experiences, sources, matrix: routeMatrix }, savedOption.label) : null;
      const restored = recalculated ? { ...generated, options: [recalculated, ...generated.options.filter((item) => item.id !== recalculated.id)].slice(0, 3) } : generated;
      setResult(restored); setSelectedOptionId(restored.options[0]?.id ?? ''); setSelectedPlaceId(restored.options[0]?.stops[0]?.placeId ?? null); setMobileTab('plan');
      setNotice(recalculated ? 'Đã mở lại hành trình trên thiết bị và kiểm tra lại giờ, giá, sức chứa, đường đi.' : 'Hành trình cũ đã mở; dữ liệu tuyến hiện tại không còn đủ để xác nhận các điểm đã lưu.');
    }
    const experienceId = params.get('experience');
    if (!savedId && experienceId) {
      const experience = experiences.find((item) => item.id === experienceId && item.routeEligible && item.evidence.status === 'verified');
      if (experience) { setRequiredExperienceIds([experience.id]); setNotice('Đã thêm trải nghiệm này làm điểm bắt buộc. Nhập điều kiện rồi tính hành trình.'); }
      else setNotice('Trải nghiệm này chưa đủ dữ liệu xác minh để thêm vào tuyến tự động.');
    }
  }, [places, experiences, sources, startChoices]);

  const buildRequest = (): TripRequest => {
    const parseOptional = (value: string) => value.trim() ? Number(value) : null;
    const ages = childAgesText.trim() ? childAgesText.split(/[\s,;]+/).filter(Boolean).map(Number) : [];
    const estimates = Object.fromEntries(Object.entries(costEstimateText).filter(([, value]) => value.trim()).map(([id, value]) => [id, Number(value)]));
    return {
      date, startTime, endTime, adults, children, childAges: ages,
      budgetVnd: parseOptional(budgetText), childBudgetVnd: parseOptional(childBudgetText), budgetBasis,
      includeMealCost, mealCostVnd: parseOptional(mealCostText), includeTransportCost, transportCostVnd: parseOptional(transportCostText), transportMode,
      originPlaceId: originPlaceId || null, destinationPlaceId: destinationPlaceId || null,
      interestCategoryIds, requiredExperienceIds, pace, maxStops, groupCostEstimatesVnd: estimates,
    };
  };

  const applyRequest = (request: TripRequest) => {
    setDate(request.date); setStartTime(request.startTime); setEndTime(request.endTime);
    setAdults(request.adults); setChildren(request.children); setChildAgesText(request.childAges.join(', '));
    setBudgetText(request.budgetVnd?.toString() ?? ''); setChildBudgetText(request.childBudgetVnd?.toString() ?? '');
    setBudgetBasis(request.budgetBasis); setIncludeMealCost(request.includeMealCost); setMealCostText(request.mealCostVnd?.toString() ?? '');
    setIncludeTransportCost(request.includeTransportCost); setTransportCostText(request.transportCostVnd?.toString() ?? '');
    setTransportMode(request.transportMode); setOriginPlaceId(request.originPlaceId ?? ''); setDestinationPlaceId(request.destinationPlaceId ?? '');
    setInterestCategoryIds(request.interestCategoryIds); setRequiredExperienceIds(request.requiredExperienceIds); setPace(request.pace); setMaxStops(request.maxStops);
    setCostEstimateText(Object.fromEntries(Object.entries(request.groupCostEstimatesVnd).map(([id, value]) => [id, String(value)])));
  };

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const next = generateItineraryOptions(buildRequest(), { places, experiences, sources, matrix: routeMatrix });
    setResult(next);
    setSelectedOptionId(next.options[0]?.id ?? '');
    setSelectedPlaceId(next.options[0]?.stops[0]?.placeId ?? null);
    setLockedExperienceIds([]);
    setMobileTab('plan');
    setNotice(next.options.length ? 'Đây là hành trình dự kiến; hãy xác nhận thông tin trực tiếp trước khi đi.' : 'Chưa đủ dữ liệu xác minh để tính một tuyến khả thi.');
  };

  const saveItinerary = () => {
    if (!result || !selectedOption) return;
    const timestamp = new Date().toISOString();
    const saved: SavedItinerary = {
      id: newLocalId(), title: `Bình Mỹ · ${date}`, createdAt: timestamp, updatedAt: timestamp,
      request: buildRequest(), options: [selectedOption],
    };
    const next = { ...localData, itineraries: [saved, ...localData.itineraries].slice(0, 25) };
    const write = writeLocalData(next);
    if (write.ok) setLocalData(next);
    setNotice(write.message);
  };

  const exportCurrent = () => {
    if (!selectedOption) return;
    downloadJson(`binh-my-hanh-trinh-${date}.json`, { schemaVersion: 1, exportedAt: new Date().toISOString(), request: buildRequest(), option: selectedOption });
    setNotice('Đã tải JSON hành trình xuống thiết bị.');
  };

  const copySummary = async () => {
    if (!selectedOption) return;
    const summary = [`Hành trình dự kiến Bình Mỹ — ${date}`, ...selectedOption.stops.map((stop, index) => `${index + 1}. ${stop.arrivalTime} ${stop.name} · ${money(stop.costVnd)}`), `Tổng: ${money(selectedOption.totalCostVnd)}`, 'Giá, lịch và lối vào cần xác nhận trực tiếp.'].join('\n');
    try { await navigator.clipboard.writeText(summary); setNotice('Đã sao chép tóm tắt hành trình.'); }
    catch { setNotice('Trình duyệt không cho phép sao chép. Hãy dùng nút Xuất JSON hoặc In.'); }
  };

  const copyShareLink = async () => {
    if (!selectedOption) return;
    const request = buildRequest();
    const shared = {
      v: 1, date: request.date, start: request.startTime, end: request.endTime, mode: request.transportMode,
      origin: request.originPlaceId, destination: request.destinationPlaceId,
      experiences: selectedOption.stops.map((stop) => stop.experienceId), categories: request.interestCategoryIds,
    };
    const url = new URL('/itinerary', window.location.origin);
    url.searchParams.set('share', JSON.stringify(shared));
    if (url.href.length > 1800) { setNotice('Liên kết vượt giới hạn 1.800 ký tự; hãy rút gọn lựa chọn trước khi chia sẻ.'); return; }
    try { await navigator.clipboard.writeText(url.href); setNotice('Đã sao chép liên kết; liên kết chỉ chứa mã điểm và lựa chọn chuyến đi.'); }
    catch { setNotice('Trình duyệt không cho phép sao chép liên kết.'); }
  };

  const editOrder = (from: number, to: number) => {
    if (!selectedOption) return;
    const ids = selectedOption.stops.map((stop) => stop.experienceId);
    if (to < 0 || to >= ids.length) return;
    if (lockedExperienceIds.includes(ids[from]) || lockedExperienceIds.includes(ids[to])) { setNotice('Mở khóa điểm trước khi đổi thứ tự.'); return; }
    [ids[from], ids[to]] = [ids[to], ids[from]];
    const updated = recalculateItinerary(buildRequest(), ids, { places, experiences, sources, matrix: routeMatrix }, selectedOption.label);
    if (!updated) { setNotice('Thứ tự này không còn thỏa giờ mở cửa, thời lượng hoặc đường đi đã xác minh.'); return; }
    setResult((current) => current ? { ...current, options: current.options.map((item) => item.id === selectedOption.id ? updated : item) } : current);
    setSelectedOptionId(updated.id);
    setSelectedPlaceId(updated.stops[Math.min(from, updated.stops.length - 1)]?.placeId ?? null);
    setNotice('Đã tính lại giờ và chi phí cho thứ tự mới.');
  };

  const removeStop = (index: number) => {
    if (!selectedOption) return;
    const experienceId = selectedOption.stops[index]?.experienceId;
    if (experienceId && (requiredExperienceIds.includes(experienceId) || lockedExperienceIds.includes(experienceId))) return;
    const ids = selectedOption.stops.map((stop) => stop.experienceId).filter((_, stopIndex) => stopIndex !== index);
    const updated = recalculateItinerary(buildRequest(), ids, { places, experiences, sources, matrix: routeMatrix }, selectedOption.label);
    if (!updated) { setNotice('Không thể bỏ điểm này vì hành trình cần ít nhất hai điểm và phải tính lại được toàn tuyến.'); return; }
    setResult((current) => current ? { ...current, options: current.options.map((item) => item.id === selectedOption.id ? updated : item) } : current);
    setSelectedOptionId(updated.id);
    setSelectedPlaceId(updated.stops[0]?.placeId ?? null);
    setNotice('Đã cập nhật hành trình và tính lại các ràng buộc.');
  };

  const candidates = experiences.filter((item) => item.routeEligible && item.placeId && item.evidence.status === 'verified');
  const currentMapPlaces = useMemo(() => selectedOption ? mappablePlaces.filter((place) => selectedOption.stops.some((stop) => stop.placeId === place.id)) : mappablePlaces, [mappablePlaces, selectedOption]);

  return <section className="mx-auto max-w-[1600px] px-4 py-8 sm:px-6 lg:px-8">
    <div className="mb-6"><p className="text-xs font-bold uppercase tracking-[.18em] text-[#40916C]">Lập hành trình</p><h1 className="mt-2 text-3xl font-black tracking-tight text-[#1B4332] sm:text-4xl">Sắp xếp chuyến Bình Mỹ theo điều kiện của bạn</h1><p className="mt-3 max-w-3xl text-sm leading-6 text-zinc-600">Bộ tính toán dùng dữ liệu đường và hoạt động đã xác minh. Không có đường đi hoặc thông tin bắt buộc thì trang sẽ nêu rõ lý do, không tự vẽ tuyến.</p></div>
    {localData.itineraries.length > 0 && <div className="mb-4 flex flex-col gap-2 rounded-xl border border-zinc-200 bg-white p-3 sm:flex-row"><label className="flex-1 text-xs font-semibold text-zinc-600">Mở hành trình đã lưu<select value={savedItineraryId} onChange={(event) => setSavedItineraryId(event.target.value)} className="mt-1 w-full rounded-lg border border-zinc-200 bg-white px-3 py-2.5 text-sm">{savedItineraryId === '' && <option value="">Chọn hành trình trên thiết bị này</option>}{localData.itineraries.map((trip) => <option key={trip.id} value={trip.id}>{trip.title} · {trip.request.date}</option>)}</select></label><button type="button" disabled={!savedItineraryId} onClick={() => window.location.assign(`/itinerary?load=${encodeURIComponent(savedItineraryId)}`)} className="self-end rounded-lg bg-[#1B4332] px-4 py-2.5 text-xs font-bold text-white disabled:opacity-40">Mở lại và kiểm tra</button></div>}
    <div className="mb-4 grid grid-cols-3 rounded-xl border border-zinc-200 bg-white p-1 lg:hidden">{([['conditions', 'Điều kiện'], ['map', 'Bản đồ'], ['plan', 'Hành trình']] as const).map(([id, label]) => <button key={id} type="button" aria-pressed={mobileTab === id} onClick={() => setMobileTab(id)} className={`rounded-lg px-2 py-2.5 text-xs font-bold ${mobileTab === id ? 'bg-[#1B4332] text-white' : 'text-zinc-600'}`}>{label}</button>)}</div>
    <div className="grid items-start gap-4 print:grid-cols-1 lg:grid-cols-[300px_minmax(0,1fr)_380px]">
      <aside className={`${mobileTab === 'conditions' ? 'block' : 'hidden'} print:hidden lg:block rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm`}>
        <h2 className="flex items-center gap-2 font-extrabold text-[#1B4332]"><CalendarDays size={17} /> Điều kiện chuyến đi</h2>
        <form onSubmit={submit} className="mt-4 space-y-3">
          <label className="grid gap-1 text-xs font-semibold text-zinc-600">Ngày đi<input required type="date" min={dateInHcm(0)} value={date} onChange={(event) => setDate(event.target.value)} className="rounded-lg border border-zinc-200 px-3 py-2.5 text-sm text-zinc-900" /></label>
          <div className="grid grid-cols-2 gap-2"><label className="grid gap-1 text-xs font-semibold text-zinc-600">Người lớn<input type="number" min={0} max={50} value={adults} onChange={(event) => setAdults(Number(event.target.value))} className="rounded-lg border border-zinc-200 px-3 py-2.5 text-sm" /></label><label className="grid gap-1 text-xs font-semibold text-zinc-600">Trẻ em<input type="number" min={0} max={50} value={children} onChange={(event) => setChildren(Number(event.target.value))} className="rounded-lg border border-zinc-200 px-3 py-2.5 text-sm" /></label></div>
          {children > 0 && <label className="grid gap-1 text-xs font-semibold text-zinc-600">Tuổi từng trẻ, cách nhau bằng dấu phẩy<input value={childAgesText} onChange={(event) => setChildAgesText(event.target.value)} placeholder="Ví dụ: 5, 9" className="rounded-lg border border-zinc-200 px-3 py-2.5 text-sm" /><span className="font-normal text-zinc-500">Không dùng giá người lớn thay cho trẻ em.</span></label>}
          <div className="grid grid-cols-2 gap-2"><label className="grid gap-1 text-xs font-semibold text-zinc-600">Bắt đầu<input type="time" value={startTime} onChange={(event) => setStartTime(event.target.value)} className="rounded-lg border border-zinc-200 px-3 py-2.5 text-sm" /></label><label className="grid gap-1 text-xs font-semibold text-zinc-600">Kết thúc<input type="time" value={endTime} onChange={(event) => setEndTime(event.target.value)} className="rounded-lg border border-zinc-200 px-3 py-2.5 text-sm" /></label></div>
          <label className="grid gap-1 text-xs font-semibold text-zinc-600">Ngân sách VND<input inputMode="numeric" value={budgetText} onChange={(event) => setBudgetText(event.target.value.replace(/[^0-9]/g, ''))} placeholder="Để trống nếu chưa xác định" className="rounded-lg border border-zinc-200 px-3 py-2.5 text-sm" /></label>
          <label className="grid gap-1 text-xs font-semibold text-zinc-600">Tính ngân sách<select value={budgetBasis} onChange={(event) => setBudgetBasis(event.target.value as 'group' | 'person')} className="rounded-lg border border-zinc-200 bg-white px-3 py-2.5 text-sm"><option value="group">Cả nhóm</option><option value="person">Mỗi người</option></select></label>
          {budgetBasis === 'person' && children > 0 && <label className="grid gap-1 text-xs font-semibold text-zinc-600">Dự trù riêng cho mỗi trẻ<input inputMode="numeric" value={childBudgetText} onChange={(event) => setChildBudgetText(event.target.value.replace(/[^0-9]/g, ''))} placeholder="VND / trẻ" className="rounded-lg border border-zinc-200 px-3 py-2.5 text-sm" /></label>}
          <p className="rounded-lg bg-[#F8FAF9] p-3 text-xs leading-5 text-zinc-600">Ngân sách mỗi người được nhân theo số người lớn và mức riêng bạn nhập cho trẻ em. Chi phí chưa có nguồn sẽ không được coi là 0 đồng.</p>
          <fieldset className="space-y-2 rounded-xl border border-zinc-200 p-3"><legend className="px-1 text-xs font-bold text-zinc-700">Các khoản tính vào ngân sách</legend><label className="flex items-center gap-2 text-xs text-zinc-700"><input type="checkbox" checked={includeMealCost} onChange={(event) => setIncludeMealCost(event.target.checked)} className="accent-[#1B4332]" />Ăn uống cho cả nhóm</label>{includeMealCost && <input aria-label="Dự trù ăn uống cho cả nhóm, VND" inputMode="numeric" value={mealCostText} onChange={(event) => setMealCostText(event.target.value.replace(/[^0-9]/g, ''))} placeholder="Dự trù ăn uống (VND)" className="w-full rounded-lg border border-zinc-200 px-3 py-2 text-xs" />}<label className="flex items-center gap-2 text-xs text-zinc-700"><input type="checkbox" checked={includeTransportCost} onChange={(event) => setIncludeTransportCost(event.target.checked)} className="accent-[#1B4332]" />Di chuyển cho cả nhóm</label>{includeTransportCost && <input aria-label="Dự trù di chuyển cho cả nhóm, VND" inputMode="numeric" value={transportCostText} onChange={(event) => setTransportCostText(event.target.value.replace(/[^0-9]/g, ''))} placeholder="Dự trù di chuyển (VND)" className="w-full rounded-lg border border-zinc-200 px-3 py-2 text-xs" />}<p className="text-[11px] leading-5 text-zinc-500">Đây là mức bạn tự nhập. Nếu đã đặt ngân sách giới hạn, cần nhập số tiền cho mỗi khoản đã chọn.</p></fieldset>
          <label className="grid gap-1 text-xs font-semibold text-zinc-600">Phương tiện<select value={transportMode} onChange={(event) => setTransportMode(event.target.value as PlannerTransport)} className="rounded-lg border border-zinc-200 bg-white px-3 py-2.5 text-sm"><option value="car">Ô tô</option><option value="bike">Xe máy</option><option value="walk">Đi bộ</option><option value="boat">Đường thủy</option></select></label>
          <label className="grid gap-1 text-xs font-semibold text-zinc-600">Điểm xuất phát<select value={originPlaceId} onChange={(event) => setOriginPlaceId(event.target.value)} disabled={!startChoices.length} className="rounded-lg border border-zinc-200 bg-white px-3 py-2.5 text-sm disabled:bg-zinc-100"><option value="">{startChoices.length ? 'Chọn điểm xuất phát' : 'Chưa có điểm và tuyến xác minh'}</option>{startChoices.map((place) => <option key={place.id} value={place.id}>{place.name}</option>)}</select></label>
          <label className="grid gap-1 text-xs font-semibold text-zinc-600">Điểm kết thúc<select value={destinationPlaceId} onChange={(event) => setDestinationPlaceId(event.target.value)} disabled={!startChoices.length} className="rounded-lg border border-zinc-200 bg-white px-3 py-2.5 text-sm disabled:bg-zinc-100"><option value="">{startChoices.length ? 'Chọn điểm kết thúc' : 'Chưa có điểm và tuyến xác minh'}</option>{startChoices.map((place) => <option key={place.id} value={place.id}>{place.name}</option>)}</select></label>
          <fieldset><legend className="text-xs font-semibold text-zinc-600">Nhịp chuyến đi</legend><div className="mt-1 grid grid-cols-3 gap-1">{([['relaxed', 'Thong thả'], ['balanced', 'Vừa'], ['active', 'Nhanh']] as const).map(([value, label]) => <button key={value} type="button" aria-pressed={pace === value} onClick={() => setPace(value)} className={`rounded-lg border px-2 py-2 text-[11px] font-bold ${pace === value ? 'border-[#1B4332] bg-[#EAF4EE] text-[#1B4332]' : 'border-zinc-200 text-zinc-600'}`}>{label}</button>)}</div></fieldset>
          <label className="grid gap-1 text-xs font-semibold text-zinc-600">Số điểm tối đa<input type="number" min={2} max={6} value={maxStops} onChange={(event) => setMaxStops(Number(event.target.value))} className="rounded-lg border border-zinc-200 px-3 py-2.5 text-sm" /></label>
          <fieldset><legend className="text-xs font-semibold text-zinc-600">Nhóm bạn muốn ưu tiên</legend><div className="mt-2 grid gap-1.5">{categories.map((category) => <label key={category.id} className="flex items-center gap-2 text-xs text-zinc-700"><input type="checkbox" checked={interestCategoryIds.includes(category.id)} onChange={(event) => setInterestCategoryIds((items) => event.target.checked ? [...items, category.id] : items.filter((id) => id !== category.id))} className="accent-[#1B4332]" />{category.name}</label>)}</div></fieldset>
          <fieldset><legend className="text-xs font-semibold text-zinc-600">Điểm bắt buộc</legend><div className="mt-2 grid gap-1.5">{candidates.length ? candidates.map((experience) => <label key={experience.id} className="flex items-start gap-2 text-xs text-zinc-700"><input type="checkbox" checked={requiredExperienceIds.includes(experience.id)} onChange={(event) => setRequiredExperienceIds((items) => event.target.checked ? [...items, experience.id] : items.filter((id) => id !== experience.id))} className="mt-0.5 accent-[#1B4332]" />{experience.name}</label>) : <p className="text-xs leading-5 text-zinc-500">Chưa có điểm đủ dữ liệu xác minh để đưa vào tuyến.</p>}</div></fieldset>
          {experiences.length > 0 && <details className="rounded-lg border border-zinc-200 p-3"><summary className="cursor-pointer text-xs font-bold text-zinc-700">Nhập dự trù cá nhân cho hoạt động</summary><p className="mt-2 text-[11px] leading-5 text-zinc-500">Mức này chỉ là dự trù cả nhóm do bạn nhập, không phải giá của nhà vườn.</p>{experiences.map((experience) => <label key={experience.id} className="mt-2 grid gap-1 text-[11px] text-zinc-600">{experience.name}<input inputMode="numeric" value={costEstimateText[experience.id] ?? ''} onChange={(event) => setCostEstimateText((values) => ({ ...values, [experience.id]: event.target.value.replace(/[^0-9]/g, '') }))} placeholder="VND cho cả nhóm" className="rounded-md border border-zinc-200 px-2 py-2 text-xs" /></label>)}</details>}
          <button type="submit" className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#1B4332] px-4 py-3 text-sm font-bold text-white hover:bg-[#143627]"><Route size={16} /> Tìm tuyến phù hợp</button>
        </form>
      </aside>

      <div className={`${mobileTab === 'map' ? 'block' : 'hidden'} print:hidden lg:block lg:sticky lg:top-24`}><VerifiedPlaceMap places={currentMapPlaces} selectedId={selectedPlaceId} onSelect={setSelectedPlaceId} geometryRefs={selectedOption?.geometryRefs} /></div>

      <aside className={`${mobileTab === 'plan' ? 'block' : 'hidden'} lg:block rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm`}>
        <div className="flex items-center justify-between gap-3"><h2 className="flex items-center gap-2 font-extrabold text-[#1B4332]"><Clock3 size={17} /> Hành trình dự kiến</h2>{selectedOption && <span className="rounded-full bg-[#EAF4EE] px-2.5 py-1 text-[11px] font-bold text-[#1B4332]">{selectedOption.label}</span>}</div>
        {!result && <div className="mt-4 rounded-xl border border-dashed border-zinc-300 p-5 text-sm leading-6 text-zinc-600">Nhập điều kiện chuyến đi rồi chọn <strong>Tìm tuyến phù hợp</strong>. Kết quả sẽ có giờ đến, giờ rời và căn cứ chọn từng điểm.</div>}
        {result && !selectedOption && <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 p-4"><div className="flex items-start gap-2"><TriangleAlert size={18} className="mt-0.5 shrink-0 text-amber-700" /><div><h3 className="font-bold text-amber-950">Chưa đủ dữ liệu để tính tuyến</h3><ul className="mt-2 list-disc space-y-1 pl-4 text-xs leading-5 text-amber-950">{result.blockingReasons.map((reason) => <li key={reason}>{reason}</li>)}</ul><p className="mt-3 text-xs leading-5 text-amber-950">Hiện dữ liệu không có điểm nào đồng thời có tọa độ, giờ hoạt động, thời lượng và chặng đường được xác minh. Hãy xem các điểm đang có tư liệu; chi tiết còn thiếu được liệt kê ở từng trang.</p></div></div></div>}
        {selectedOption && <>
          {result && result.options.length > 1 && <div className="mt-4 grid gap-2">{result.options.map((option) => <button key={option.id} type="button" aria-pressed={option.id === selectedOption.id} onClick={() => setSelectedOptionId(option.id)} className={`rounded-xl border p-3 text-left ${option.id === selectedOption.id ? 'border-[#1B4332] bg-[#EAF4EE]' : 'border-zinc-200 bg-white'}`}><span className="flex items-center justify-between gap-2 text-xs font-extrabold text-[#1B4332]"><span>{option.label}</span><span>{money(option.totalCostVnd)}</span></span><span className="mt-1 block text-[11px] text-zinc-600">{option.stops.length} điểm · {option.totalTravelMinutes} phút di chuyển · {option.totalDurationMinutes} phút tổng</span></button>)}</div>}
          <div className="mt-4 rounded-xl bg-[#F8FAF9] p-3"><p className="text-xs text-zinc-500">Tổng chi phí</p><p className="mt-1 font-extrabold text-[#1B4332]">{money(selectedOption.totalCostVnd)}</p><p className="mt-1 text-[11px] text-zinc-500">{selectedOption.totalDurationMinutes} phút trong khung chuyến · {selectedOption.totalTravelMinutes} phút di chuyển</p></div>
          <ol className="mt-4 space-y-3">{selectedOption.stops.map((stop, index) => <li key={`${stop.experienceId}-${index}`} className={`rounded-xl border p-3 transition ${selectedPlaceId === stop.placeId ? 'border-[#40916C] bg-[#F3F8F5]' : 'border-zinc-200'}`}><button type="button" onClick={() => { setSelectedPlaceId(stop.placeId); setMobileTab('map'); }} className="w-full text-left"><span className="inline-flex items-center gap-1 text-[11px] font-bold text-[#40916C]"><Check size={13} /> ĐIỂM {index + 1} · {stop.arrivalTime}–{stop.departureTime}</span><span className="mt-1 block font-bold leading-5 text-zinc-900">{stop.name}</span><span className="mt-1 block text-xs leading-5 text-zinc-600">{stop.explanation}</span></button><div className="mt-2 flex items-center justify-between gap-2 border-t border-zinc-100 pt-2"><span className="text-[11px] text-zinc-500">{stop.travelMinutesFromPrevious} phút chặng trước · {money(stop.costVnd)}{stop.costSource === 'user_estimate' ? ' · dự trù của bạn' : ''}</span><span className="flex shrink-0 gap-1"><button type="button" onClick={() => editOrder(index, index - 1)} disabled={index === 0} className="rounded-md p-1 text-zinc-600 hover:bg-zinc-100 disabled:opacity-30" aria-label="Đưa điểm lên trước"><ArrowUp size={15} /></button><button type="button" onClick={() => editOrder(index, index + 1)} disabled={index === selectedOption.stops.length - 1} className="rounded-md p-1 text-zinc-600 hover:bg-zinc-100 disabled:opacity-30" aria-label="Đưa điểm xuống sau"><ArrowDown size={15} /></button><button type="button" onClick={() => removeStop(index)} className="rounded-md px-2 py-1 text-[11px] font-semibold text-[#E76F51] hover:bg-orange-50">Bỏ</button></span></div></li>)}</ol>
          <div className="mt-3 space-y-2">{selectedOption.stops.map((stop) => <details key={`details-${stop.experienceId}`} className="rounded-xl border border-zinc-200 px-3 py-2"><summary className="cursor-pointer text-xs font-bold text-zinc-700">Hoạt động và điều kiện tại {stop.name}</summary><ul className="mt-2 list-disc space-y-1 pl-4 text-xs leading-5 text-zinc-600">{stop.activities.map((activity) => <li key={activity}>{activity}</li>)}</ul><p className="mt-2 text-xs leading-5 text-zinc-600">{stop.bookingRequirement}</p><button type="button" aria-pressed={lockedExperienceIds.includes(stop.experienceId)} onClick={() => setLockedExperienceIds((ids) => ids.includes(stop.experienceId) ? ids.filter((id) => id !== stop.experienceId) : [...ids, stop.experienceId])} className="mt-2 inline-flex items-center gap-1 rounded-lg border border-zinc-200 px-2.5 py-1.5 text-[11px] font-bold text-zinc-700">{lockedExperienceIds.includes(stop.experienceId) ? <Lock size={13} /> : <Unlock size={13} />}{lockedExperienceIds.includes(stop.experienceId) ? 'Đã khóa vị trí' : 'Khóa vị trí điểm này'}</button>{requiredExperienceIds.includes(stop.experienceId) && <span className="ml-2 text-[11px] font-bold text-[#1B4332]">Điểm bắt buộc</span>}</details>)}</div>
          <p className="mt-3 rounded-lg bg-[#F8FAF9] p-3 text-[11px] leading-5 text-zinc-600">Bộ tính toán chừa giờ nghỉ trưa 12:00–13:00 nếu lịch tham quan trùng khoảng này. Mọi khoảng đợi vẫn nằm trong tổng thời gian.</p>
          <ul className="mt-4 space-y-1.5 text-[11px] leading-5 text-zinc-600">{selectedOption.warnings.map((warning) => <li key={warning} className="flex gap-2"><TriangleAlert size={13} className="mt-0.5 shrink-0 text-[#E76F51]" />{warning}</li>)}</ul>
          <div className="mt-4 grid grid-cols-2 gap-2"><button type="button" onClick={saveItinerary} className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#1B4332] px-3 py-2.5 text-xs font-bold text-white"><Save size={14} /> Lưu trên thiết bị</button><button type="button" onClick={exportCurrent} className="inline-flex items-center justify-center gap-2 rounded-lg border border-zinc-200 px-3 py-2.5 text-xs font-bold text-zinc-700"><Download size={14} /> Xuất JSON</button><button type="button" onClick={() => window.print()} className="inline-flex items-center justify-center gap-2 rounded-lg border border-zinc-200 px-3 py-2.5 text-xs font-bold text-zinc-700"><Printer size={14} /> In / PDF</button><button type="button" onClick={copySummary} className="inline-flex items-center justify-center gap-2 rounded-lg border border-zinc-200 px-3 py-2.5 text-xs font-bold text-zinc-700"><Share2 size={14} /> Sao chép</button></div>
          <button type="button" onClick={copyShareLink} className="mt-2 inline-flex w-full items-center justify-center gap-2 rounded-lg border border-zinc-200 px-3 py-2.5 text-xs font-bold text-zinc-700"><Share2 size={14} /> Sao chép liên kết chỉ gồm lựa chọn công khai</button>
        </>}
        {notice && <p role="status" className="mt-3 text-xs leading-5 text-zinc-600">{notice}</p>}
        <div className="mt-4 flex items-start gap-2 rounded-xl bg-[#F8FAF9] p-3 text-[11px] leading-5 text-zinc-600"><Users size={14} className="mt-0.5 shrink-0" />Hành trình chỉ lưu trên thiết bị này. Website không gửi yêu cầu đặt chỗ, không giữ chỗ và không thu tiền.</div>
      </aside>
    </div>
  </section>;
}
