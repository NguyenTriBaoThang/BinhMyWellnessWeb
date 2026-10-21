'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { MapPin, TriangleAlert } from 'lucide-react';
import type { Place } from '@/lib/data/types';
import { routeGeometries } from '@/lib/data/repository';

type MarkerRef = { id: string; layer: import('leaflet').CircleMarker };
const EMPTY_ROUTE_REFS: string[] = [];

export default function VerifiedPlaceMap({ places, selectedId, onSelect, geometryRefs }: {
  places: Place[];
  selectedId: string | null;
  onSelect?: (id: string) => void;
  geometryRefs?: string[];
}) {
  const elementRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<import('leaflet').Map | null>(null);
  const markersRef = useRef<MarkerRef[]>([]);
  const onSelectRef = useRef(onSelect);
  const [tileError, setTileError] = useState(false);
  onSelectRef.current = onSelect;
  const mappable = useMemo(() => places.filter((place) => place.areaCode === 'BINH_MY' && place.verification.area.status === 'verified' && place.coordinates && place.coordinateStatus === 'verified' && place.verification.coordinates.status === 'verified'), [places]);
  const routeIds = geometryRefs ?? EMPTY_ROUTE_REFS;

  useEffect(() => {
    let cancelled = false;
    let map: import('leaflet').Map | undefined;
    if (!mappable.length) return () => { cancelled = true; };
    import('leaflet').then((L) => {
      if (cancelled || !elementRef.current) return;
      const first = mappable[0].coordinates!;
      map = L.map(elementRef.current, { scrollWheelZoom: false }).setView([first.latitude, first.longitude], 13);
      mapRef.current = map;
      const tiles = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer">OpenStreetMap contributors</a>',
      });
      tiles.on('tileerror', () => setTileError(true));
      tiles.addTo(map);
      const bounds: Array<[number, number]> = [];
      markersRef.current = mappable.map((place) => {
        const point: [number, number] = [place.coordinates!.latitude, place.coordinates!.longitude];
        bounds.push(point);
        const marker = L.circleMarker(point, { radius: 9, color: '#fff', weight: 3, fillColor: '#1B4332', fillOpacity: 1 }).addTo(map!);
        marker.bindTooltip(place.name, { direction: 'top' });
        marker.on('click', () => onSelectRef.current?.(place.id));
        return { id: place.id, layer: marker };
      });
      const geometries = new Map(routeGeometries.features.map((feature) => [feature.id, feature]));
      routeIds.forEach((id, index) => {
        const feature = geometries.get(id);
        if (!feature) return;
        const line = feature.geometry.coordinates.map(([longitude, latitude]) => [latitude, longitude] as [number, number]);
        L.polyline(line, { color: index % 2 ? '#E76F51' : '#1B4332', weight: 5, opacity: 0.84 }).addTo(map!);
        bounds.push(...line);
      });
      if (bounds.length > 1) map.fitBounds(bounds, { padding: [32, 32] });
      window.setTimeout(() => map?.invalidateSize(), 80);
    }).catch(() => setTileError(true));
    return () => {
      cancelled = true;
      map?.remove();
      if (mapRef.current === map) mapRef.current = null;
      markersRef.current = [];
    };
  }, [places, mappable, routeIds]);

  useEffect(() => {
    import('leaflet').then((L) => markersRef.current.forEach(({ id, layer }) => {
      layer.setStyle({
        radius: id === selectedId ? 12 : 9,
        color: '#fff',
        weight: id === selectedId ? 4 : 3,
        fillColor: id === selectedId ? '#E76F51' : '#1B4332',
        fillOpacity: 1,
      });
      if (id === selectedId) layer.bringToFront();
    })).catch(() => undefined);
  }, [selectedId]);

  if (!mappable.length) {
    return <div className="grid min-h-[320px] place-items-center rounded-2xl border border-dashed border-emerald-900/20 bg-[#F8FAF9] p-8 text-center sm:min-h-[480px]">
      <div className="max-w-md"><span className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-[#EAF4EE] text-[#1B4332]"><MapPin size={25} /></span><h3 className="mt-4 text-lg font-extrabold text-[#1B4332]">Chưa có ghim vị trí đã xác minh</h3><p className="mt-2 text-sm leading-6 text-zinc-600">Các địa điểm vẫn xuất hiện trong danh sách để bạn đọc nguồn. Tọa độ sẽ chỉ được ghim sau khi xác minh đúng lối tiếp cận.</p></div>
    </div>;
  }

  return <div className="relative h-[420px] overflow-hidden rounded-2xl border border-zinc-200 bg-[#EAF4EE] sm:h-[560px]">
    <div ref={elementRef} className="absolute inset-0" role="application" aria-label="Bản đồ các địa điểm có tọa độ đã xác minh" />
    {tileError && <p role="status" className="absolute bottom-3 left-3 z-[500] rounded-lg bg-white/95 px-3 py-2 text-xs text-zinc-700 shadow">Bản đồ nền hiện không tải được; danh sách địa điểm vẫn dùng được.</p>}
    <p className="absolute right-3 top-3 z-[500] inline-flex items-center gap-1.5 rounded-lg bg-white/95 px-3 py-2 text-xs font-semibold text-[#1B4332] shadow"><TriangleAlert size={14} /> Chỉ ghim vị trí đã xác minh</p>
  </div>;
}
