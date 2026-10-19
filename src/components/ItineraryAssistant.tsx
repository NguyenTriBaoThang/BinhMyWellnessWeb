'use client';

import { FormEvent, useCallback, useEffect, useRef, useState } from 'react';
import { CalendarDays, Car, CheckCircle2, Clock3, MapPin, MessageCircle, Navigation, Save, Send, Sparkles } from 'lucide-react';
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

const BINH_MY_MAP_CENTER: [number, number] = [10.98, 106.6];

function PlanMap({ plan, selectedStopId, onSelectStop }: {
  plan: ItineraryPlan | null;
  selectedStopId: string | null;
  onSelectStop: (serviceId: string) => void;
}) {
  const element = useRef<HTMLDivElement>(null);
  const mapRef = useRef<import('leaflet').Map | null>(null);
  const markerRefs = useRef<Array<{ id: string; point: [number, number]; button: HTMLButtonElement }>>([]);
  const selectedRef = useRef(selectedStopId);
  const onSelectRef = useRef(onSelectStop);
  selectedRef.current = selectedStopId;
  onSelectRef.current = onSelectStop;

  useEffect(() => {
    let cancelled = false;
    let map: import('leaflet').Map | undefined;
    import('leaflet').then((L) => {
      if (cancelled || !element.current) return;
      const points = (plan?.stops ?? []).filter((stop) => Number.isFinite(stop.latitude) && Number.isFinite(stop.longitude)).map((stop) => [stop.latitude, stop.longitude] as [number, number]);
      map = L.map(element.current, { scrollWheelZoom: false, zoomControl: true }).setView(points[0] ?? BINH_MY_MAP_CENTER, points.length ? 13 : 12);
      mapRef.current = map;
      const mapTilerKey = process.env.NEXT_PUBLIC_MAPTILER_KEY?.trim();
      const tileLayer = mapTilerKey
        ? L.tileLayer(`https://api.maptiler.com/maps/streets-v4/256/{z}/{x}/{y}.png?key=${encodeURIComponent(mapTilerKey)}`, {
          attribution: '<a href="https://www.maptiler.com/copyright/" target="_blank" rel="noopener">&copy; MapTiler</a> <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener">&copy; OpenStreetMap contributors</a>',
          maxZoom: 19,
          crossOrigin: true,
        })
        : L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '&copy; OpenStreetMap contributors',
          maxZoom: 19,
        });
      tileLayer.addTo(map);
      const bounds: Array<[number, number]> = [...points];
      const markers: typeof markerRefs.current = [];
      (plan?.stops ?? []).forEach((stop, index) => {
        if (!Number.isFinite(stop.latitude) || !Number.isFinite(stop.longitude)) return;
        const point: [number, number] = [stop.latitude, stop.longitude];
        const button = document.createElement('button');
        button.type = 'button';
        button.className = `bm-itinerary-marker${selectedRef.current === stop.serviceId ? ' is-selected' : ''}`;
        button.textContent = String(index + 1);
        button.setAttribute('aria-label', `${index + 1}. ${stop.name}`);
        const marker = L.marker(point, {
          title: stop.name,
          keyboard: true,
          icon: L.divIcon({ className: 'bm-itinerary-marker-icon', html: button, iconSize: [36, 42], iconAnchor: [18, 36] }),
        }).addTo(map!);
        marker.on('click', () => onSelectRef.current(stop.serviceId));
        markers.push({ id: stop.serviceId, point, button });
        if (stop.routeFromPrevious?.encodedPolyline) {
          const routePoints = decodePolyline(stop.routeFromPrevious.encodedPolyline);
          if (routePoints.length > 1) {
            L.polyline(routePoints, { color: '#0f766e', weight: 4, opacity: 0.8 }).addTo(map!);
            bounds.push(...routePoints);
          }
        }
      });
      const returnRoute = plan?.returnRoute;
      if (returnRoute?.encodedPolyline) {
        const returnPoints = decodePolyline(returnRoute.encodedPolyline);
        if (returnPoints.length > 1) {
          L.polyline(returnPoints, { color: '#7c3aed', weight: 4, opacity: 0.75, dashArray: '8 6' }).addTo(map);
          bounds.push(...returnPoints);
        }
      }
      markerRefs.current = markers;
      if (bounds.length > 1) map.fitBounds(bounds, { padding: [44, 44] });
      const selected = markers.find((marker) => marker.id === selectedRef.current);
      if (selected) map.setView(selected.point, Math.max(map.getZoom(), 14));
      window.setTimeout(() => map?.invalidateSize(), 80);
    }).catch(() => undefined);
    return () => {
      cancelled = true;
      map?.remove();
      if (mapRef.current === map) mapRef.current = null;
      markerRefs.current = [];
    };
  }, [plan]);

  useEffect(() => {
    const selected = markerRefs.current.find((marker) => marker.id === selectedStopId);
    markerRefs.current.forEach((marker) => marker.button.classList.toggle('is-selected', marker.id === selectedStopId));
    if (selected && mapRef.current) mapRef.current.flyTo(selected.point, Math.max(mapRef.current.getZoom(), 14), { duration: 0.65 });
  }, [selectedStopId, plan]);

  return (
    <div className="relative h-full min-h-[320px] w-full bg-emerald-50">
      <div ref={element} role="application" aria-label="Bản đồ hành trình Bình Mỹ" className="absolute inset-0" />
      {(!plan || plan.stops.length === 0) && (
        <div className="pointer-events-none absolute left-4 top-4 rounded-full border border-white/80 bg-white/95 px-3 py-1.5 text-xs font-semibold text-forest-900 shadow">
          {'Khu v\u1ef1c B\u00ecnh M\u1ef9 - t\u00e2m b\u1ea3n \u0111\u1ed3 m\u1eb7c \u0111\u1ecbnh'}
        </div>
      )}
    </div>
  );
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
  const [selectedStopId, setSelectedStopId] = useState<string | null>(null);
  const [mobilePanel, setMobilePanel] = useState<'chat' | 'itinerary'>('chat');
  const requestKey = useRef('');
  const chatMessagesRef = useRef<HTMLDivElement>(null);
  const selectStop = useCallback((serviceId: string) => {
    setSelectedStopId(serviceId);
    setMobilePanel('itinerary');
  }, []);

  useEffect(() => {
    const feed = chatMessagesRef.current;
    if (feed) feed.scrollTop = feed.scrollHeight;
  }, [messages, busy]);

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

  const sendPrompt = async (prompt: string) => {
    const message = prompt.trim();
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
      setSelectedStopId(data.plan?.stops[0]?.serviceId ?? null);
      setMobilePanel('itinerary');
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

  const sendMessage = (event: FormEvent) => {
    event.preventDefault();
    void sendPrompt(input);
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
        availablePlaces: null, latitude: item.service.latitude ?? Number.NaN,
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
      setSelectedStopId(stops[0]?.serviceId ?? null);
      setMobilePanel('itinerary');
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

  const plan = result?.plan ?? null;
  const suggestions = [
    'T\u00f4i th\u00edch l\u00e0m v\u01b0\u1eddn v\u00e0 \u0103n tr\u01b0a, ng\u00e2n s\u00e1ch 600.000 \u0111\u1ed3ng.',
    'Gia \u0111\u00ecnh c\u00f3 tr\u1ebb em, mu\u1ed1n tr\u1ea3i nghi\u1ec7m ngo\u00e0i tr\u1eddi bu\u1ed5i s\u00e1ng.',
    'G\u1ee3i \u00fd m\u1ed9t l\u1ecbch tr\u00ecnh th\u01b0 th\u00e1i cho hai ng\u01b0\u1eddi.',
  ];

  return (
    <main className="mx-auto max-w-[1600px] px-3 py-4 sm:px-5 lg:py-5">
      <header className="mb-3 rounded-3xl bg-gradient-to-r from-forest-900 via-emerald-900 to-river-900 px-5 py-4 text-white shadow-xl sm:px-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-[10px] font-bold tracking-wide"><MessageCircle className="h-3.5 w-3.5" /> {'L\u1eacP L\u1ecaCH T\u1eea D\u1eee LI\u1ec6U \u0110\u00c3 X\u00c1C MINH'}</p>
            <h1 className="mt-2 text-2xl font-black sm:text-3xl">{'Thi\u1ebft k\u1ebf m\u1ed9t ng\u00e0y \u1edf B\u00ecnh M\u1ef9'}</h1>
          </div>
          <div className="max-w-xl rounded-2xl border border-white/15 bg-white/10 px-4 py-2 text-xs leading-relaxed text-emerald-50">
            {'AI h\u1ed7 tr\u1ee3 hi\u1ec3u y\u00eau c\u1ea7u; planner ki\u1ec3m tra d\u1eef li\u1ec7u, ca tr\u1ed1ng, s\u1ee9c ch\u1ee9a, th\u1eddi gian v\u00e0 ng\u00e2n s\u00e1ch. Nh\u00e0 v\u01b0\u1eddn v\u1eabn c\u1ea7n x\u00e1c nh\u1eadn y\u00eau c\u1ea7u \u0111\u1eb7t ch\u1ed7.'}
          </div>
        </div>
      </header>

      {notice && <p role="status" className="mb-3 rounded-2xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-950">{notice}</p>}

      <div className="grid gap-3 lg:relative lg:h-[calc(100svh-150px)] lg:min-h-[650px]">
        <div className="relative h-[42svh] min-h-[320px] overflow-hidden rounded-3xl border border-emerald-900/10 bg-emerald-50 shadow-inner lg:absolute lg:inset-0 lg:h-full">
          <PlanMap plan={plan} selectedStopId={selectedStopId} onSelectStop={selectStop} />
        </div>

        <div className="flex gap-2 rounded-2xl border border-zinc-200 bg-white p-1.5 shadow-sm lg:hidden">
          <button type="button" aria-pressed={mobilePanel === 'chat'} onClick={() => setMobilePanel('chat')} className={`flex-1 rounded-xl px-3 py-2 text-xs font-bold ${mobilePanel === 'chat' ? 'bg-forest-800 text-white' : 'text-zinc-600'}`}><MessageCircle className="mr-1.5 inline h-3.5 w-3.5" />{'Chat'}</button>
          <button type="button" aria-pressed={mobilePanel === 'itinerary'} onClick={() => setMobilePanel('itinerary')} className={`flex-1 rounded-xl px-3 py-2 text-xs font-bold ${mobilePanel === 'itinerary' ? 'bg-forest-800 text-white' : 'text-zinc-600'}`}><MapPin className="mr-1.5 inline h-3.5 w-3.5" />{'L\u1ecbch tr\u00ecnh'}</button>
        </div>

        <div className="grid gap-3 md:grid-cols-2 lg:relative lg:z-10 lg:h-full lg:grid-cols-[320px_minmax(0,1fr)_320px] lg:gap-4 lg:pointer-events-none xl:grid-cols-[380px_minmax(0,1fr)_380px]">
          <aside className={`pointer-events-auto ${mobilePanel === 'chat' ? 'flex' : 'hidden'} h-[min(72svh,700px)] min-h-0 flex-col overflow-hidden rounded-3xl border border-zinc-200 bg-white/95 shadow-2xl backdrop-blur lg:flex lg:h-full`}>
            <details open className="max-h-[310px] shrink-0 overflow-y-auto border-b border-zinc-200">
              <summary className="sticky top-0 z-[1] flex cursor-pointer list-none items-center gap-2 bg-white/95 px-4 py-3 text-sm font-bold text-zinc-900 backdrop-blur">
                <CalendarDays className="h-4 w-4 text-emerald-700" /> {'\u0110i\u1ec1u ki\u1ec7n chuy\u1ebfn \u0111i'}
              </summary>
              <div className="grid grid-cols-2 gap-2 px-4 pb-4 text-xs">
                <label className="col-span-2 font-semibold text-zinc-700">{'Ng\u00e0y'}<input type="date" min={dateAfter(0)} value={date} onChange={(event) => setDate(event.target.value)} className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2" /></label>
                <label className="font-semibold text-zinc-700">{'Ng\u01b0\u1eddi l\u1edbn'}<input type="number" min="0" max="50" value={adults} onChange={(event) => setAdults(event.target.value)} className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2" /></label>
                <label className="font-semibold text-zinc-700">{'Tr\u1ebb em'}<input type="number" min="0" max="50" value={children} onChange={(event) => setChildren(event.target.value)} className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2" /></label>
                <label className="font-semibold text-zinc-700">{'B\u1eaft \u0111\u1ea7u'}<input type="time" value={startTime} onChange={(event) => setStartTime(event.target.value)} className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2" /></label>
                <label className="font-semibold text-zinc-700">{'K\u1ebft th\u00fac'}<input type="time" value={endTime} onChange={(event) => setEndTime(event.target.value)} className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2" /></label>
                <label className="font-semibold text-zinc-700">{'Ng\u00e2n s\u00e1ch (VND)'}<input type="number" min="0" value={budget} onChange={(event) => setBudget(event.target.value)} placeholder={'Kh\u00f4ng gi\u1edbi h\u1ea1n'} className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2" /></label>
                <label className="font-semibold text-zinc-700">{'T\u00ednh ng\u00e2n s\u00e1ch'}<select value={budgetBasis} onChange={(event) => setBudgetBasis(event.target.value as 'GROUP' | 'PER_PERSON')} className="mt-1 w-full rounded-lg border border-zinc-300 bg-white px-3 py-2"><option value="GROUP">{'C\u1ea3 nh\u00f3m'}</option><option value="PER_PERSON">{'M\u1ed7i ng\u01b0\u1eddi'}</option></select></label>
                <label className="col-span-2 font-semibold text-zinc-700">{'Di chuy\u1ec3n'}<select value={transportMode} onChange={(event) => setTransportMode(event.target.value as 'car' | 'bike' | 'walk')} className="mt-1 w-full rounded-lg border border-zinc-300 bg-white px-3 py-2"><option value="car">{'\u00d4 t\u00f4'}</option><option value="bike">{'Xe m\u00e1y'}</option><option value="walk">{'\u0110i b\u1ed9'}</option></select></label>
              </div>
              <div className="border-t border-zinc-100 px-4 py-3">
                <p className="flex items-center gap-2 text-xs font-bold text-zinc-800"><Navigation className="h-3.5 w-3.5 text-river-700" /> {'T\u00ednh tuy\u1ebfn \u0111\u01b0\u1eddng (t\u00f9y ch\u1ecdn)'}</p>
                <label className="mt-2 flex items-start gap-2 text-[11px] leading-relaxed text-zinc-700"><input type="checkbox" checked={routeConsent} onChange={(event) => setRouteConsent(event.target.checked)} className="mt-0.5" /> {'T\u00f4i \u0111\u1ed3ng \u00fd g\u1eedi t\u1ecda \u0111\u1ed9 xu\u1ea5t ph\u00e1t \u0111\u1ebfn Goong \u0111\u1ec3 t\u00ednh ETA.'}</label>
                <div className="mt-2 grid grid-cols-2 gap-2"><input value={latitude} onChange={(event) => setLatitude(event.target.value)} placeholder={'V\u0129 \u0111\u1ed9'} className="min-w-0 rounded-lg border border-zinc-300 px-2.5 py-2 text-xs" /><input value={longitude} onChange={(event) => setLongitude(event.target.value)} placeholder={'Kinh \u0111\u1ed9'} className="min-w-0 rounded-lg border border-zinc-300 px-2.5 py-2 text-xs" /></div>
                <label className="mt-2 flex items-center gap-2 text-[11px] text-zinc-700"><input type="checkbox" checked={returnToOrigin} onChange={(event) => setReturnToOrigin(event.target.checked)} /> {'T\u00ednh \u0111\u01b0\u1eddng quay l\u1ea1i \u0111i\u1ec3m xu\u1ea5t ph\u00e1t'}</label>
                <p className="mt-1.5 text-[10px] leading-relaxed text-zinc-500">{'Kh\u00f4ng c\u00f3 s\u1ef1 \u0111\u1ed3ng \u00fd ho\u1eb7c Goong kh\u00f4ng kh\u1ea3 d\u1ee5ng th\u00ec kh\u00f4ng hi\u1ec3n th\u1ecb ETA \u0111\u01b0\u1eddng b\u1ed9.'}</p>
              </div>
            </details>

            {savedItems.length > 0 && (
              <details className="max-h-36 shrink-0 overflow-y-auto border-b border-zinc-200">
                <summary className="sticky top-0 z-[1] cursor-pointer bg-white/95 px-4 py-3 text-xs font-bold text-zinc-800 backdrop-blur">{'H\u00e0nh tr\u00ecnh \u0111\u00e3 l\u01b0u'} ({savedItems.length})</summary>
                <div className="space-y-2 px-3 pb-3">
                  {savedItems.map((item) => <button key={item.id} onClick={() => openSavedItinerary(item.id)} className="flex w-full items-center justify-between gap-3 rounded-xl border border-zinc-200 p-2.5 text-left hover:bg-zinc-50"><span><span className="block text-[11px] font-bold text-zinc-900">{item.code} · {item.date}</span><span className="mt-1 block text-[10px] text-zinc-500">{item.status}</span></span><span className="text-[10px] font-bold text-forest-800">{item.totalCostVnd === null ? 'Gi\u00e1 c\u1ea7n x\u00e1c nh\u1eadn' : formatVND(item.totalCostVnd)}</span></button>)}
                </div>
              </details>
            )}

            <section className="flex min-h-0 flex-1 flex-col">
              <div className="flex items-center justify-between gap-2 border-b border-zinc-100 px-4 py-3">
                <h2 className="flex items-center gap-2 text-sm font-bold text-zinc-900"><MessageCircle className="h-4 w-4 text-emerald-700" /> {'Tr\u00f2 chuy\u1ec7n l\u1eadp l\u1ecbch'}</h2>
                <span className="rounded-full bg-zinc-100 px-2 py-1 text-[9px] font-semibold text-zinc-500">{result?.mode || 'RULE_BASED_FALLBACK'}</span>
              </div>
              <div ref={chatMessagesRef} role="log" aria-live="polite" aria-relevant="additions text" className="min-h-0 flex-1 space-y-3 overflow-y-auto p-3">
                {!messages.some((message) => message.role === 'user') && (
                  <div className="space-y-2 rounded-2xl bg-emerald-50 p-3">
                    <p className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wide text-emerald-900"><Sparkles className="h-3.5 w-3.5" /> {'Th\u1eed m\u1ed9t y\u00eau c\u1ea7u'}</p>
                    {suggestions.map((suggestion) => <button key={suggestion} type="button" disabled={busy} onClick={() => void sendPrompt(suggestion)} className="block w-full rounded-xl border border-emerald-100 bg-white px-3 py-2 text-left text-[11px] leading-relaxed text-zinc-700 transition hover:border-emerald-400 hover:text-emerald-900 disabled:opacity-50">{suggestion}</button>)}
                  </div>
                )}
                {messages.map((message, index) => <div key={index} className={`max-w-[95%] whitespace-pre-wrap rounded-2xl px-3 py-2.5 text-xs leading-relaxed ${message.role === 'user' ? 'ml-auto bg-forest-800 text-white' : 'border border-zinc-100 bg-white text-zinc-800 shadow-sm'}`}>{message.text}</div>)}
                {busy && <div role="status" className="flex items-center gap-2 px-2 text-xs text-zinc-500"><span className="h-2 w-2 animate-pulse rounded-full bg-emerald-600" /> {'Tr\u1ee3 l\u00fd \u0111ang xem c\u00e1c ca tr\u1ed1ng v\u00e0 x\u1ebfp th\u1eddi gian...'}</div>}
              </div>
              <form onSubmit={sendMessage} className="flex gap-2 border-t border-zinc-200 p-3">
                <input value={input} onChange={(event) => setInput(event.target.value)} maxLength={2000} placeholder={'Nh\u1eafn s\u1edf th\u00edch, ng\u00e2n s\u00e1ch ho\u1eb7c th\u1eddi gian...'} className="min-w-0 flex-1 rounded-xl border border-zinc-300 px-3 py-2.5 text-xs focus:border-emerald-600 focus:outline-none focus:ring-2 focus:ring-emerald-100" />
                <button type="submit" disabled={busy || !input.trim()} className="inline-flex items-center justify-center gap-2 rounded-xl bg-forest-800 px-3 text-white transition hover:bg-forest-900 disabled:opacity-50" aria-label={'G\u1eedi y\u00eau c\u1ea7u'}>{busy ? <span className="text-xs">…</span> : <Send className="h-4 w-4" />}</button>
              </form>
            </section>
          </aside>

          <div className="hidden pointer-events-none lg:block" aria-hidden="true" />

          <aside className={`pointer-events-auto ${mobilePanel === 'itinerary' ? 'flex' : 'hidden'} h-[min(72svh,700px)] min-h-0 flex-col overflow-hidden rounded-3xl border border-zinc-200 bg-white/95 shadow-2xl backdrop-blur lg:flex lg:h-full`}>
            <div className="shrink-0 border-b border-zinc-200 p-4">
              <div className="flex items-center justify-between gap-2">
                <h2 className="flex items-center gap-2 text-sm font-bold text-zinc-900"><MapPin className="h-4 w-4 text-emerald-700" /> {'C\u00e1c \u0111i\u1ec3m d\u1eebng'}</h2>
                {plan && <span className={`rounded-full px-2 py-1 text-[9px] font-bold ${plan.feasibility === 'FEASIBLE' ? 'bg-emerald-100 text-emerald-900' : 'bg-amber-100 text-amber-900'}`}>{plan.feasibility === 'FEASIBLE' ? 'KH\u1ea2 THI' : 'CH\u01afA C\u00d3 L\u1ecaCH PH\u00d9 H\u1ee2P'}</span>}
              </div>
              {plan ? <>
                <p className="mt-3 text-xl font-black text-zinc-900">{plan.totalCostVnd === null ? `${formatVND(plan.knownCostVnd)} + gi\u00e1 c\u1ea7n x\u00e1c nh\u1eadn` : formatVND(plan.totalCostVnd)}</p>
                <p className="mt-1 text-[11px] text-zinc-600">{plan.stops.length} {'\u0111i\u1ec3m d\u1eebng'} · {plan.totalTravelMinutes === null ? 'ETA ch\u01b0a kh\u1ea3 d\u1ee5ng' : `${plan.totalTravelMinutes} ph\u00fat ETA qua Goong`}</p>
              </> : <p className="mt-2 text-xs leading-relaxed text-zinc-600">{'C\u00e1c \u0111i\u1ec3m v\u00e0 tuy\u1ebfn \u0111\u01b0\u1eddng s\u1ebd xu\u1ea5t hi\u1ec7n sau khi b\u1ea1n g\u1eedi y\u00eau c\u1ea7u.'}</p>}
              {plan && <button onClick={saveItinerary} disabled={busy || !plan.stops.length} className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-forest-800 px-3 py-2.5 text-xs font-bold text-white transition hover:bg-forest-900 disabled:opacity-50"><Save className="h-4 w-4" />{savedId ? 'C\u1eadp nh\u1eadt h\u00e0nh tr\u00ecnh' : 'L\u01b0u h\u00e0nh tr\u00ecnh'}</button>}
            </div>

            {plan?.warnings.length ? <div className="shrink-0 border-b border-blue-100 bg-blue-50 px-4 py-3"><p className="text-[10px] font-bold uppercase text-blue-900">{'L\u01b0u \u00fd'}</p><ul className="mt-1 space-y-1 text-[10px] leading-relaxed text-blue-950">{plan.warnings.map((warning, index) => <li key={index}>- {warning}</li>)}</ul></div> : null}

            <div className="min-h-0 flex-1 space-y-2 overflow-y-auto p-3">
              {!plan && <div className="rounded-2xl border border-dashed border-zinc-300 bg-white p-5 text-center text-xs leading-relaxed text-zinc-500">{'B\u1ea3n \u0111\u1ed3 \u0111ang hi\u1ec3n th\u1ecb khu v\u1ef1c B\u00ecnh M\u1ef9. H\u00e3y n\u00f3i v\u1edbi tr\u1ee3 l\u00fd \u0111\u1ec3 t\u00ecm d\u1ecbch v\u1ee5 c\u00f3 l\u1ecbch tr\u1ed1ng \u0111\u00e3 x\u00e1c minh.'}</div>}
              {plan && plan.stops.length === 0 && <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-xs leading-relaxed text-amber-950">{'Ch\u01b0a c\u00f3 ph\u01b0\u01a1ng \u00e1n ph\u00f9 h\u1ee3p v\u1edbi ca tr\u1ed1ng \u0111\u00e3 x\u00e1c minh, th\u1eddi l\u01b0\u1ee3ng v\u00e0 ng\u00e2n s\u00e1ch hi\u1ec7n t\u1ea1i.'}</div>}
              {plan?.stops.map((stop, index) => (
                <button id={`itinerary-stop-${encodeURIComponent(stop.serviceId)}`} key={stop.serviceId} type="button" aria-pressed={selectedStopId === stop.serviceId} onClick={() => selectStop(stop.serviceId)} className={`w-full rounded-2xl border p-3 text-left shadow-sm transition ${selectedStopId === stop.serviceId ? 'border-emerald-500 bg-emerald-50 ring-2 ring-emerald-100' : 'border-zinc-200 bg-white hover:border-emerald-300 hover:bg-emerald-50/50'}`}>
                  <span className="flex items-start gap-3">
                    <span className={`grid h-7 w-7 shrink-0 place-items-center rounded-full text-xs font-black ${selectedStopId === stop.serviceId ? 'bg-amber-600 text-white' : 'bg-forest-800 text-white'}`}>{index + 1}</span>
                    <span className="min-w-0 flex-1">
                      <span className="block text-[10px] font-bold uppercase tracking-wide text-emerald-800">{stop.providerName}</span>
                      <span className="mt-0.5 block text-sm font-bold text-zinc-900">{stop.name}</span>
                      <span className="mt-2 flex items-center gap-1.5 text-[10px] text-zinc-600"><Clock3 className="h-3 w-3 shrink-0" />{stop.arrivalTime}–{stop.departureTime} · ca {stop.slot} · {stop.durationMinutes} {'ph\u00fat'}</span>
                      <span className="mt-1 flex items-center gap-1.5 text-[10px] text-zinc-600"><Car className="h-3 w-3 shrink-0" />{stop.routeFromPrevious ? `${stop.routeFromPrevious.durationMinutes} ph\u00fat · ${stop.routeFromPrevious.distanceMeters} m (${stop.routeFromPrevious.provider})` : 'Ch\u01b0a c\u00f3 ETA tuy\u1ebfn \u0111\u1ebfn \u0111i\u1ec3m n\u00e0y'}</span>
                      <span className="mt-2 block text-xs font-bold text-forest-900">{stop.costVnd === null ? `Gi\u00e1 c\u1ea7n nh\u00e0 v\u01b0\u1eddn x\u00e1c nh\u1eadn (\u0111\u00e3 bi\u1ebft ${formatVND(stop.knownCostVnd)})` : formatVND(stop.costVnd)}</span>
                      <span className="mt-1 block text-[10px] leading-relaxed text-zinc-500">{stop.availablePlaces === null ? 'S\u1ee9c ch\u1ee9a c\u1ea7n nh\u00e0 v\u01b0\u1eddn x\u00e1c nh\u1eadn l\u1ea1i.' : `C\u00f2n ${stop.availablePlaces} ch\u1ed7 theo l\u1ea7n ki\u1ec3m tra; nh\u00e0 v\u01b0\u1eddn s\u1ebd x\u00e1c nh\u1eadn l\u1ea1i.`}</span>
                    </span>
                  </span>
                </button>
              ))}
            </div>

            {savedId && plan && (
              <div className="shrink-0 space-y-2 border-t border-emerald-200 bg-emerald-50 p-3">
                {plan.hasUnknownCosts && <p className="text-[10px] leading-relaxed text-amber-900">{'C\u00f3 gi\u00e1 ch\u01b0a x\u00e1c \u0111\u1ecbnh; h\u00e3y trao \u0111\u1ed5i v\u1edbi nh\u00e0 v\u01b0\u1eddn tr\u01b0\u1edbc khi g\u1eedi \u0111\u1eb7t ch\u1ed7.'}</p>}
                <div className="grid grid-cols-2 gap-2"><input value={name} onChange={(event) => setName(event.target.value)} placeholder={'T\u00ean ng\u01b0\u1eddi li\u00ean h\u1ec7'} className="min-w-0 rounded-lg border border-zinc-300 bg-white px-2.5 py-2 text-xs" /><input value={phone} onChange={(event) => setPhone(event.target.value)} placeholder={'S\u1ed1 \u0111i\u1ec7n tho\u1ea1i'} className="min-w-0 rounded-lg border border-zinc-300 bg-white px-2.5 py-2 text-xs" /></div>
                <label className="flex items-start gap-2 text-[10px] leading-relaxed text-zinc-800"><input type="checkbox" checked={confirmed} onChange={(event) => setConfirmed(event.target.checked)} className="mt-0.5" /> {'T\u00f4i x\u00e1c nh\u1eadn g\u1eedi y\u00eau c\u1ea7u t\u1edbi t\u1eebng nh\u00e0 v\u01b0\u1eddn; \u0111\u00e2y ch\u01b0a ph\u1ea3i x\u00e1c nh\u1eadn \u0111\u1eb7t ch\u1ed7 hay thanh to\u00e1n.'}</label>
                <button onClick={requestBookings} disabled={!confirmed || bookingBusy || plan.hasUnknownCosts || !name.trim() || !phone.trim()} className="w-full rounded-xl bg-emerald-800 px-3 py-2.5 text-xs font-bold text-white disabled:opacity-50">{bookingBusy ? '\u0110ang g\u1eedi...' : 'G\u1eedi y\u00eau c\u1ea7u \u0111\u1eb7t ch\u1ed7'}</button>
              </div>
            )}
          </aside>
        </div>
      </div>
    </main>
  );
}
