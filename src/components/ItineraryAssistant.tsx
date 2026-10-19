'use client';

import { FormEvent, useEffect, useRef, useState } from 'react';
import { CalendarDays, Car, CheckCircle2, Clock3, MapPin, MessageCircle, Navigation, Save, Send } from 'lucide-react';
import type { ItineraryPlan, ItineraryRequest } from '@/lib/itinerary/engine';
import { formatVND } from '@/lib/utils';

type PlannerResponse = {
  status?: string;
  assistantMessage?: string;
  trip?: ItineraryRequest;
  plan?: ItineraryPlan & { warnings: string[] };
  mode?: string;
  map?: { provider: string | null; routesAvailable: boolean };
  error?: string;
};

type ChatMessage = { role: 'user' | 'assistant'; text: string };
type SavedItem = { id: string; code: string; date: string; status: string; totalCostVnd: number | null };

function dateAfter(days: number): string {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

function decodePolyline(encoded: string): Array<[number, number]> {
  const points: Array<[number, number]> = [];
  let index = 0;
  let lat = 0;
  let lng = 0;
  while (index < encoded.length) {
    let result = 0;
    let shift = 0;
    let byte: number;
    do { byte = encoded.charCodeAt(index++) - 63; result |= (byte & 0x1f) << shift; shift += 5; } while (byte >= 0x20 && index < encoded.length);
    lat += result & 1 ? ~(result >> 1) : result >> 1;
    result = 0;
    shift = 0;
    do { byte = encoded.charCodeAt(index++) - 63; result |= (byte & 0x1f) << shift; shift += 5; } while (byte >= 0x20 && index < encoded.length);
    lng += result & 1 ? ~(result >> 1) : result >> 1;
    points.push([lat / 1e5, lng / 1e5]);
  }
  return points;
}

function PlanMap({ plan }: { plan: ItineraryPlan }) {
  const element = useRef<HTMLDivElement>(null);
  useEffect(() => {
    let cancelled = false;
    let map: import('leaflet').Map | undefined;
    import('leaflet').then((L) => {
      if (cancelled || !element.current) return;
      const points = plan.stops.filter((stop) => Number.isFinite(stop.latitude) && Number.isFinite(stop.longitude)).map((stop) => [stop.latitude, stop.longitude] as [number, number]);
      if (!points.length) return;
      map = L.map(element.current, { scrollWheelZoom: false, zoomControl: true }).setView(points[0], 13);
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors',
        maxZoom: 19,
      }).addTo(map);
      const bounds: Array<[number, number]> = [...points];
      plan.stops.forEach((stop, index) => {
        if (!Number.isFinite(stop.latitude) || !Number.isFinite(stop.longitude)) return;
        const marker = L.circleMarker([stop.latitude, stop.longitude], {
          radius: 9, color: '#14532d', weight: 2, fillColor: '#34d399', fillOpacity: 1,
        }).addTo(map!);
        const label = document.createElement('span');
        label.textContent = `${index + 1}. ${stop.name}`;
        marker.bindTooltip(label);
        if (stop.routeFromPrevious?.encodedPolyline) {
          const routePoints = decodePolyline(stop.routeFromPrevious.encodedPolyline);
          if (routePoints.length > 1) {
            L.polyline(routePoints, { color: '#0f766e', weight: 4, opacity: 0.8 }).addTo(map!);
            bounds.push(...routePoints);
          }
        }
      });
      if (plan.returnRoute?.encodedPolyline) {
        const returnPoints = decodePolyline(plan.returnRoute.encodedPolyline);
        if (returnPoints.length > 1) {
          L.polyline(returnPoints, { color: '#7c3aed', weight: 4, opacity: 0.75, dashArray: '8 6' }).addTo(map);
          bounds.push(...returnPoints);
        }
      }
      if (bounds.length > 1) map.fitBounds(bounds, { padding: [24, 24] });
      window.setTimeout(() => map?.invalidateSize(), 80);
    }).catch(() => undefined);
    return () => { cancelled = true; map?.remove(); };
  }, [plan]);

  return <div ref={element} role="img" aria-label="Bản đồ các điểm dừng đã xác minh trong hành trình" className="h-[360px] w-full rounded-2xl bg-zinc-100" />;
}

export default function ItineraryAssistant() {
  const [date, setDate] = useState(dateAfter(7));
  const [adults, setAdults] = useState('2');
  const [children, setChildren] = useState('0');
  const [budget, setBudget] = useState('');
  const [budgetBasis, setBudgetBasis] = useState<'GROUP' | 'PER_PERSON'>('GROUP');
  const [startTime, setStartTime] = useState('08:00');
  const [endTime, setEndTime] = useState('17:00');
  const [transportMode, setTransportMode] = useState<'car' | 'bike' | 'walk'>('car');
  const [routeConsent, setRouteConsent] = useState(false);
  const [returnToOrigin, setReturnToOrigin] = useState(false);
  const [latitude, setLatitude] = useState('');
  const [longitude, setLongitude] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [confirmed, setConfirmed] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([{ role: 'assistant', text: 'Mình có thể gợi ý lịch trình từ dịch vụ và ca trống đã được xác minh. Hãy nói sở thích hoặc chỉnh các thông tin bên dưới.' }]);
  const [result, setResult] = useState<PlannerResponse | null>(null);
  const [savedId, setSavedId] = useState<string | null>(null);
  const [notice, setNotice] = useState('');
  const [busy, setBusy] = useState(false);
  const [bookingBusy, setBookingBusy] = useState(false);
  const [savedItems, setSavedItems] = useState<SavedItem[]>([]);
  const requestKey = useRef('');

  useEffect(() => {
    fetch('/api/itineraries', { cache: 'no-store' }).then((response) => response.ok ? response.json() : null)
      .then((data) => { if (data?.itineraries) setSavedItems(data.itineraries); }).catch(() => undefined);
    fetch('/api/auth/me').then((response) => response.json()).then((data) => {
      if (data.user) { setName(data.user.name || ''); setPhone(data.user.phone || ''); }
    }).catch(() => undefined);
  }, []);

  const makeTrip = (): Partial<ItineraryRequest> & { returnToOrigin?: boolean } => ({
    date,
    adults: Number(adults),
    children: Number(children),
    ...(budget ? { budgetVnd: Number(budget) } : {}),
    budgetBasis,
    startTime,
    endTime,
    transportMode,
    interests: result?.trip?.interests ?? [],
    ...(routeConsent && latitude !== '' && longitude !== '' ? { origin: { latitude: Number(latitude), longitude: Number(longitude), label: 'Điểm xuất phát do khách cung cấp' } } : {}),
    ...(routeConsent && returnToOrigin && latitude !== '' && longitude !== '' ? { returnTo: { latitude: Number(latitude), longitude: Number(longitude), label: 'Điểm xuất phát do khách cung cấp' } } : {}),
    returnToOrigin,
  });

  const sendMessage = async (event: FormEvent) => {
    event.preventDefault();
    const message = input.trim();
    if (!message || busy) return;
    setInput('');
    setMessages((current) => [...current, { role: 'user', text: message }]);
    setBusy(true);
    setNotice('');
    setSavedId(null);
    requestKey.current = '';
    setConfirmed(false);
    try {
      const hasPoint = Number.isFinite(Number(latitude)) && Number.isFinite(Number(longitude)) && latitude !== '' && longitude !== '';
      const response = await fetch('/api/ai/itinerary', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message,
          trip: makeTrip(),
          allowExternalRouting: routeConsent && hasPoint,
          origin: routeConsent && hasPoint ? { latitude: Number(latitude), longitude: Number(longitude), label: 'Điểm xuất phát do khách cung cấp' } : undefined,
        }),
      });
      const data = await response.json() as PlannerResponse;
      if (!response.ok) throw new Error(data.error || 'Không tạo được lịch trình.');
      setResult(data);
      if (data.trip) {
        setDate(data.trip.date);
        setAdults(String(data.trip.adults));
        setChildren(String(data.trip.children));
        setBudget(data.trip.budgetVnd === undefined ? '' : String(data.trip.budgetVnd));
        setBudgetBasis(data.trip.budgetBasis);
        setStartTime(data.trip.startTime);
        setEndTime(data.trip.endTime);
        setTransportMode(data.trip.transportMode);
        setReturnToOrigin(!!data.trip.returnTo);
        if (data.trip.origin) {
          setLatitude(String(data.trip.origin.latitude));
          setLongitude(String(data.trip.origin.longitude));
          setRouteConsent(true);
        }
      }
      setMessages((current) => [...current, { role: 'assistant', text: data.assistantMessage || 'Đã cập nhật lịch trình.' }]);
    } catch (error) {
      const text = error instanceof Error ? error.message : 'Không tạo được lịch trình.';
      setNotice(text);
      setMessages((current) => [...current, { role: 'assistant', text }]);
    } finally {
      setBusy(false);
    }
  };

  const saveItinerary = async () => {
    if (!result?.trip || !result.plan?.stops.length) return;
    setBusy(true);
    setNotice('');
    try {
      const response = await fetch(savedId ? `/api/itineraries/${savedId}` : '/api/itineraries', {
        method: savedId ? 'PUT' : 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ trip: makeTrip(), allowExternalRouting: routeConsent }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Không lưu được hành trình.');
      setSavedId(data.itinerary.id);
      setResult((current) => current ? { ...current, plan: data.plan } : current);
      const listResponse = await fetch('/api/itineraries', { cache: 'no-store' });
      if (listResponse.ok) setSavedItems((await listResponse.json()).itineraries || []);
      setNotice('Đã lưu hành trình vào tài khoản của bạn.');
    } catch (error) {
      setNotice(error instanceof Error ? error.message : 'Không lưu được hành trình.');
    } finally {
      setBusy(false);
    }
  };

  const openSavedItinerary = async (id: string) => {
    setBusy(true);
    setNotice('');
    try {
      const response = await fetch(`/api/itineraries/${id}`, { cache: 'no-store' });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Không tải được hành trình.');
      const itinerary = data.itinerary;
      const trip = itinerary.constraints as ItineraryRequest;
      const stops = itinerary.stops.map((item: any) => ({
        serviceId: item.serviceId, providerId: item.service.providerId,
        name: item.service.name, providerName: item.service.provider.name,
        address: item.service.provider.address, category: item.service.category,
        date: item.date, arrivalTime: item.arrivalTime, departureTime: item.departureTime,
        durationMinutes: item.service.duration, slot: item.slot,
        costVnd: item.estimatedCostVnd, knownCostVnd: item.estimatedCostVnd ?? 0,
        availablePlaces: 0, latitude: item.service.latitude ?? Number.NaN,
        longitude: item.service.longitude ?? Number.NaN,
        routeFromPrevious: item.routeGeometry && item.routeProvider ? {
          provider: item.routeProvider, distanceMeters: item.distanceFromPreviousM ?? 0,
          durationMinutes: item.travelFromPreviousMin ?? 0, encodedPolyline: item.routeGeometry, isRealtime: false,
        } : null,
      }));
      const plan: ItineraryPlan = {
        date: itinerary.date, groupSize: itinerary.adults + itinerary.children,
        adults: itinerary.adults, children: itinerary.children, transportMode: itinerary.transportMode,
        stops, totalCostVnd: itinerary.totalCostVnd, knownCostVnd: itinerary.knownCostVnd,
        hasUnknownCosts: itinerary.hasUnknownCosts,
        totalTravelMinutes: stops.every((stop: any) => stop.routeFromPrevious) && (!itinerary.returnRouteGeometry || itinerary.returnTravelMinutes !== null) ? stops.reduce((sum: number, stop: any) => sum + stop.routeFromPrevious.durationMinutes, 0) + (itinerary.returnTravelMinutes ?? 0) : null,
        returnRoute: itinerary.returnRouteGeometry && itinerary.returnRouteProvider ? {
          provider: itinerary.returnRouteProvider, distanceMeters: itinerary.returnDistanceM ?? 0,
          durationMinutes: itinerary.returnTravelMinutes ?? 0, encodedPolyline: itinerary.returnRouteGeometry, isRealtime: false,
        } : null, feasibility: stops.length ? 'FEASIBLE' : 'NO_FEASIBLE_PLAN',
        fallbackMode: 'RULE_BASED',
        warnings: Array.isArray(itinerary.warnings) ? itinerary.warnings : [], rejectedReasons: [],
      };
      setDate(trip.date); setAdults(String(trip.adults)); setChildren(String(trip.children));
      setBudget(trip.budgetVnd === undefined ? '' : String(trip.budgetVnd));
      setBudgetBasis(trip.budgetBasis); setStartTime(trip.startTime); setEndTime(trip.endTime);
      setTransportMode(trip.transportMode); setReturnToOrigin(!!trip.returnTo);
      setRouteConsent(!!trip.origin);
      setLatitude(trip.origin ? String(trip.origin.latitude) : '');
      setLongitude(trip.origin ? String(trip.origin.longitude) : '');
      setResult({ status: 'FEASIBLE', trip, plan, mode: itinerary.fallbackMode });
      setSavedId(itinerary.id); setConfirmed(false); requestKey.current = '';
      setMessages((current) => [...current, { role: 'assistant', text: `Đã mở hành trình ${itinerary.code}. Bạn có thể chỉnh điều kiện rồi cập nhật lại.` }]);
    } catch (error) {
      setNotice(error instanceof Error ? error.message : 'Không tải được hành trình.');
    } finally { setBusy(false); }
  };

  const requestBookings = async () => {
    if (!savedId || !confirmed || bookingBusy) return;
    setBookingBusy(true);
    setNotice('');
    if (!requestKey.current) requestKey.current = crypto.randomUUID();
    try {
      const response = await fetch(`/api/itineraries/${savedId}/book`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Idempotency-Key': requestKey.current },
        body: JSON.stringify({ confirm: true, name, phone }),
      });
      const data = await response.json();
      if (data.itineraryStatus) setSavedItems((current) => current.map((item) => item.id === savedId ? { ...item, status: data.itineraryStatus } : item));
      if (!response.ok) throw new Error(data.error || 'Không gửi được yêu cầu.');
      setNotice(`Đã gửi ${data.bookings.length} yêu cầu riêng cho nhà vườn. Chưa có thanh toán nào được thực hiện.`);
    } catch (error) {
      setNotice(error instanceof Error ? error.message : 'Không gửi được yêu cầu.');
    } finally {
      setBookingBusy(false);
    }
  };

  const plan = result?.plan;

  return (
    <main className="mx-auto max-w-7xl space-y-8 px-4 py-8 sm:px-6 sm:py-12">
      <header className="rounded-3xl bg-gradient-to-r from-forest-900 via-emerald-900 to-river-900 p-6 text-white shadow-xl sm:p-9">
        <p className="inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-xs font-bold"><MessageCircle className="h-4 w-4" /> LẬP LỊCH TỪ DỮ LIỆU ĐÃ XÁC MINH</p>
        <h1 className="mt-4 text-3xl font-black sm:text-4xl">Thiết kế một ngày ở Bình Mỹ</h1>
        <p className="mt-2 max-w-3xl text-sm leading-relaxed text-emerald-50">AI chỉ hiểu yêu cầu; planner kiểm tra ca trống, sức chứa, thời gian và ngân sách. Nhà vườn vẫn cần xác nhận từng yêu cầu đặt chỗ.</p>
      </header>

      <div className="grid gap-6 lg:grid-cols-12">
        <section className="space-y-5 lg:col-span-4">
          <div className="rounded-3xl border border-zinc-200 bg-white p-5 shadow-sm">
            <h2 className="flex items-center gap-2 font-bold text-zinc-900"><CalendarDays className="h-4 w-4 text-emerald-700" /> Điều kiện chuyến đi</h2>
            <div className="mt-4 grid grid-cols-2 gap-3 text-xs">
              <label className="col-span-2 font-semibold text-zinc-700">Ngày<input type="date" min={dateAfter(0)} value={date} onChange={(event) => setDate(event.target.value)} className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2" /></label>
              <label className="font-semibold text-zinc-700">Người lớn<input type="number" min="0" max="50" value={adults} onChange={(event) => setAdults(event.target.value)} className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2" /></label>
              <label className="font-semibold text-zinc-700">Trẻ em<input type="number" min="0" max="50" value={children} onChange={(event) => setChildren(event.target.value)} className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2" /></label>
              <label className="font-semibold text-zinc-700">Bắt đầu<input type="time" value={startTime} onChange={(event) => setStartTime(event.target.value)} className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2" /></label>
              <label className="font-semibold text-zinc-700">Kết thúc<input type="time" value={endTime} onChange={(event) => setEndTime(event.target.value)} className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2" /></label>
              <label className="font-semibold text-zinc-700">Ngân sách (VND)<input type="number" min="0" value={budget} onChange={(event) => setBudget(event.target.value)} placeholder="Không giới hạn" className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2" /></label>
              <label className="font-semibold text-zinc-700">Tính ngân sách<select value={budgetBasis} onChange={(event) => setBudgetBasis(event.target.value as 'GROUP' | 'PER_PERSON')} className="mt-1 w-full rounded-lg border border-zinc-300 bg-white px-3 py-2"><option value="GROUP">Cả nhóm</option><option value="PER_PERSON">Mỗi người</option></select></label>
              <label className="col-span-2 font-semibold text-zinc-700">Di chuyển<select value={transportMode} onChange={(event) => setTransportMode(event.target.value as 'car' | 'bike' | 'walk')} className="mt-1 w-full rounded-lg border border-zinc-300 bg-white px-3 py-2"><option value="car">Ô tô</option><option value="bike">Xe máy</option><option value="walk">Đi bộ</option></select></label>
            </div>
          </div>

          <div className="rounded-3xl border border-zinc-200 bg-white p-5 shadow-sm">
            <h2 className="flex items-center gap-2 font-bold text-zinc-900"><Navigation className="h-4 w-4 text-river-700" /> Tính tuyến đường (tùy chọn)</h2>
            <label className="mt-3 flex items-start gap-2 text-xs leading-relaxed text-zinc-700"><input type="checkbox" checked={routeConsent} onChange={(event) => setRouteConsent(event.target.checked)} className="mt-0.5" /> Tôi đồng ý gửi tọa độ bên dưới đến dịch vụ định tuyến Goong để tính ETA.</label>
            <div className="mt-3 grid grid-cols-2 gap-2"><input value={latitude} onChange={(event) => setLatitude(event.target.value)} placeholder="Vĩ độ" className="min-w-0 rounded-lg border border-zinc-300 px-3 py-2 text-xs" /><input value={longitude} onChange={(event) => setLongitude(event.target.value)} placeholder="Kinh độ" className="min-w-0 rounded-lg border border-zinc-300 px-3 py-2 text-xs" /></div>
            <label className="mt-3 flex items-center gap-2 text-xs text-zinc-700"><input type="checkbox" checked={returnToOrigin} onChange={(event) => setReturnToOrigin(event.target.checked)} /> Tính đường quay lại điểm xuất phát</label>
            <p className="mt-2 text-[11px] leading-relaxed text-zinc-500">Không có sự đồng ý hoặc Goong không khả dụng thì hệ thống không hiển thị ETA đường bộ giả.</p>
          </div>

          <div className="rounded-3xl border border-zinc-200 bg-white p-5 shadow-sm">
            <div className="mb-3 flex items-center justify-between"><h2 className="font-bold text-zinc-900">Trao đổi với trợ lý</h2><span className="text-[10px] font-semibold text-zinc-500">{result?.mode || 'RULE_BASED_FALLBACK'}</span></div>
            <div className="max-h-64 space-y-3 overflow-y-auto rounded-2xl bg-zinc-50 p-3" aria-live="polite">
              {messages.map((message, index) => <div key={index} className={`max-w-[95%] rounded-2xl px-3 py-2 text-xs leading-relaxed ${message.role === 'user' ? 'ml-auto bg-forest-800 text-white' : 'bg-white text-zinc-800 shadow-sm'}`}>{message.text}</div>)}
            </div>
            <form onSubmit={sendMessage} className="mt-3 flex gap-2"><input value={input} onChange={(event) => setInput(event.target.value)} maxLength={2000} placeholder="Ví dụ: thích làm vườn và ăn trưa, ngân sách…" className="min-w-0 flex-1 rounded-xl border border-zinc-300 px-3 py-2.5 text-xs" /><button disabled={busy || !input.trim()} className="rounded-xl bg-forest-800 px-3 text-white disabled:opacity-50" aria-label="Gửi yêu cầu">{busy ? <span className="text-xs">…</span> : <Send className="h-4 w-4" />}</button></form>
          </div>
          {savedItems.length > 0 && <div className="rounded-3xl border border-zinc-200 bg-white p-5 shadow-sm"><h2 className="font-bold text-zinc-900">Hành trình đã lưu</h2><div className="mt-3 space-y-2">{savedItems.map((item) => <button key={item.id} onClick={() => openSavedItinerary(item.id)} className="flex w-full items-center justify-between gap-3 rounded-xl border border-zinc-200 p-3 text-left hover:bg-zinc-50"><span><span className="block text-xs font-bold text-zinc-900">{item.code} · {item.date}</span><span className="mt-1 block text-[11px] text-zinc-500">{item.status}</span></span><span className="text-xs font-bold text-forest-800">{item.totalCostVnd === null ? 'Giá cần xác nhận' : formatVND(item.totalCostVnd)}</span></button>)}</div></div>}
        </section>

        <section className="space-y-5 lg:col-span-8">
          {notice && <p role="status" className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-950">{notice}</p>}
          {!plan && <div className="flex min-h-72 items-center justify-center rounded-3xl border border-dashed border-zinc-300 bg-white p-8 text-center text-sm text-zinc-500">Gửi yêu cầu để xem các điểm dừng khả thi theo ca trống đã xác minh.</div>}
          {plan && <>
            <div className="flex flex-wrap items-center justify-between gap-3 rounded-3xl border border-zinc-200 bg-white p-5 shadow-sm">
              <div className="flex flex-1 flex-wrap items-center justify-between gap-3">
              <div><p className="text-xs font-bold uppercase tracking-wide text-emerald-800">{plan.feasibility === 'NO_FEASIBLE_PLAN' ? 'Chưa có lịch khả thi' : `${plan.stops.length} điểm dừng đề xuất`}</p><h2 className="mt-1 text-2xl font-black text-zinc-900">{plan.totalCostVnd === null ? `Từ ${formatVND(plan.knownCostVnd)} + giá cần xác nhận` : formatVND(plan.totalCostVnd)}</h2><p className="mt-1 text-xs text-zinc-600">{plan.totalTravelMinutes === null ? 'ETA di chuyển chưa khả dụng' : `${plan.totalTravelMinutes} phút ước tính · ${result?.map?.provider || 'Goong'}`}</p></div>
              <button onClick={saveItinerary} disabled={busy || !plan.stops.length || !!savedId} className="inline-flex items-center gap-2 rounded-xl bg-forest-800 px-4 py-2.5 text-sm font-bold text-white disabled:opacity-50"><Save className="h-4 w-4" />{savedId ? 'Đã lưu' : 'Lưu hành trình'}</button>
            </div>
              {savedId && <button onClick={saveItinerary} disabled={busy} className="rounded-xl border border-forest-800 px-3 py-2 text-xs font-bold text-forest-900 disabled:opacity-50">Cập nhật điều kiện và lịch trình</button>}
            </div>
            {plan.warnings.length > 0 && <ul className="space-y-1 rounded-2xl border border-blue-200 bg-blue-50 p-4 text-xs text-blue-950">{plan.warnings.map((warning, index) => <li key={index}>• {warning}</li>)}</ul>}
            {plan.stops.length > 0 && <div className="grid gap-5 xl:grid-cols-2">
              <div className="overflow-hidden rounded-3xl border border-zinc-200 bg-white p-2 shadow-sm"><PlanMap plan={plan} /><p className="flex items-start gap-2 px-3 py-3 text-xs leading-relaxed text-zinc-600"><MapPin className="mt-0.5 h-4 w-4 shrink-0 text-emerald-700" />Điểm dừng lấy từ dịch vụ có tọa độ đã xác minh. Đường/ETA chỉ xuất hiện khi Goong trả tuyến hợp lệ.</p></div>
              <div className="space-y-3">
                {plan.stops.map((stop, index) => <article key={stop.serviceId} className="rounded-3xl border border-zinc-200 bg-white p-4 shadow-sm"><p className="text-[11px] font-bold uppercase text-emerald-800">{stop.providerName}</p><h3 className="mt-1 font-bold text-zinc-900">{index + 1}. {stop.name}</h3><p className="mt-2 flex items-center gap-2 text-xs text-zinc-600"><Clock3 className="h-3.5 w-3.5" />{stop.arrivalTime}–{stop.departureTime} · ca {stop.slot} · {stop.durationMinutes} phút</p><p className="mt-1 flex items-center gap-2 text-xs text-zinc-600"><Car className="h-3.5 w-3.5" />{stop.routeFromPrevious ? `${stop.routeFromPrevious.durationMinutes} phút · ${stop.routeFromPrevious.distanceMeters} m (${stop.routeFromPrevious.provider})` : 'Chưa có ETA tuyến đến điểm này'}</p><p className="mt-2 text-sm font-bold text-forest-900">{stop.costVnd === null ? `Giá cần nhà vườn xác nhận (đã biết ${formatVND(stop.knownCostVnd)})` : formatVND(stop.costVnd)}</p><p className="mt-1 text-[11px] text-zinc-500">Còn {stop.availablePlaces} chỗ theo lần kiểm tra lúc lập lịch; nhà vườn cần xác nhận lại.</p></article>)}
              </div>
            </div>}
    {savedId && <div className="space-y-3 rounded-3xl border border-emerald-200 bg-emerald-50 p-5">
              <h3 className="flex items-center gap-2 font-bold text-emerald-950"><CheckCircle2 className="h-5 w-5" />Hành trình đã lưu</h3>
              {plan.hasUnknownCosts && <p className="text-xs text-amber-900">Có giá chưa xác định; cần trao đổi với nhà vườn trước khi gửi đặt chỗ.</p>}
              <div className="grid gap-2 sm:grid-cols-2"><input value={name} onChange={(event) => setName(event.target.value)} placeholder="Tên người liên hệ" className="rounded-xl border border-zinc-300 bg-white px-3 py-2 text-sm" /><input value={phone} onChange={(event) => setPhone(event.target.value)} placeholder="Số điện thoại" className="rounded-xl border border-zinc-300 bg-white px-3 py-2 text-sm" /></div>
              <label className="flex items-start gap-2 text-xs leading-relaxed text-zinc-800"><input type="checkbox" checked={confirmed} onChange={(event) => setConfirmed(event.target.checked)} className="mt-0.5" />Tôi xác nhận gửi yêu cầu đến từng nhà vườn; đây chưa phải xác nhận đặt chỗ hay thanh toán.</label>
              <button onClick={requestBookings} disabled={!confirmed || bookingBusy || plan.hasUnknownCosts} className="rounded-xl bg-emerald-800 px-4 py-2.5 text-sm font-bold text-white disabled:opacity-50">{bookingBusy ? 'Đang gửi…' : 'Gửi yêu cầu đặt chỗ'}</button>
            </div>}
          </>}
        </section>
      </div>
    </main>
  );
}
