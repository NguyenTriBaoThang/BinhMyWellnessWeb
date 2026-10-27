'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { MapPin, Navigation } from 'lucide-react';
import type { Place } from '@/lib/data/types';
import { routeGeometries } from '@/lib/data/repository';

type MarkerRef = { id: string; layer: import('leaflet').CircleMarker | import('leaflet').Marker };
const EMPTY_ROUTE_REFS: string[] = [];

export default function VerifiedPlaceMap({
  places,
  selectedId,
  onSelect,
  geometryRefs,
}: {
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

  const mappable = useMemo(
    () =>
      places.filter(
        (place) =>
          place.areaCode === 'BINH_MY' &&
          place.verification.area.status === 'verified' &&
          place.coordinates &&
          place.coordinateStatus === 'verified' &&
          place.verification.coordinates.status === 'verified'
      ),
    [places]
  );
  const routeIds = geometryRefs ?? EMPTY_ROUTE_REFS;

  useEffect(() => {
    let cancelled = false;
    let map: import('leaflet').Map | undefined;

    if (!mappable.length) {
      return () => {
        cancelled = true;
      };
    }

    import('leaflet').then((L) => {
      if (cancelled || !elementRef.current) return;

      const first = mappable[0].coordinates!;
      map = L.map(elementRef.current, {
        scrollWheelZoom: false,
        zoomControl: true,
      }).setView([first.latitude, first.longitude], 13);
      mapRef.current = map;

      const tiles = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution:
          '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer">OpenStreetMap</a>',
      });
      tiles.on('tileerror', () => setTileError(true));
      tiles.addTo(map);

      const bounds: Array<[number, number]> = [];

      markersRef.current = mappable.map((place, idx) => {
        const point: [number, number] = [
          place.coordinates!.latitude,
          place.coordinates!.longitude,
        ];
        bounds.push(point);

        const customHtml = `
          <div class="bm-itinerary-marker ${place.id === selectedId ? 'is-selected' : ''}">
            ${idx + 1}
          </div>
        `;

        const icon = L.divIcon({
          className: 'bm-itinerary-marker-icon',
          html: customHtml,
          iconSize: [36, 36],
          iconAnchor: [18, 18],
        });

        const marker = L.marker(point, { icon }).addTo(map!);
        marker.bindTooltip(
          `<strong>${place.name}</strong><br/><span style="font-size:11px;color:#174C3C;">Bình Mỹ, Củ Chi</span>`,
          { direction: 'top', offset: [0, -18] }
        );

        marker.on('click', () => onSelectRef.current?.(place.id));
        return { id: place.id, layer: marker };
      });

      // Route lines
      const geometries = new Map(
        routeGeometries.features.map((feature) => [feature.id, feature])
      );
      routeIds.forEach((id) => {
        const feature = geometries.get(id);
        if (!feature) return;
        const line = feature.geometry.coordinates.map(
          ([longitude, latitude]) => [latitude, longitude] as [number, number]
        );
        L.polyline(line, {
          color: '#174C3C',
          weight: 4,
          opacity: 0.85,
          dashArray: '8, 8',
        }).addTo(map!);
        bounds.push(...line);
      });

      if (bounds.length > 1) {
        map.fitBounds(bounds, { padding: [40, 40] });
      }

      window.setTimeout(() => map?.invalidateSize(), 100);
    }).catch(() => setTileError(true));

    return () => {
      cancelled = true;
      map?.remove();
      if (mapRef.current === map) mapRef.current = null;
      markersRef.current = [];
    };
  }, [places, mappable, routeIds, selectedId]);

  // Pan to selected marker
  useEffect(() => {
    if (!selectedId || !mapRef.current) return;
    const target = mappable.find((p) => p.id === selectedId);
    if (target?.coordinates) {
      mapRef.current.panTo([target.coordinates.latitude, target.coordinates.longitude], {
        animate: true,
        duration: 0.8,
      });
    }
  }, [selectedId, mappable]);

  if (!mappable.length) {
    return (
      <div className="grid min-h-[360px] place-items-center rounded-3xl border border-dashed border-[#174C3C]/20 bg-[#F7F4EA] p-8 text-center sm:min-h-[500px]">
        <div className="max-w-md">
          <span className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-[#E7EFE4] text-[#174C3C]">
            <MapPin size={26} />
          </span>
          <h3 className="mt-4 text-lg font-black text-[#174C3C]">
            Chưa có ghim vị trí trên bản đồ
          </h3>
          <p className="mt-2 text-xs sm:text-sm leading-relaxed text-[#26352E]/70">
            Các điểm đến vẫn hiển thị đầy đủ trong danh sách để bạn khám phá.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative h-[420px] overflow-hidden rounded-3xl border border-[#174C3C]/15 bg-[#E7EFE4] sm:h-[580px] shadow-inner">
      <div
        ref={elementRef}
        className="absolute inset-0"
        role="application"
        aria-label="Bản đồ các điểm đến sinh thái Bình Mỹ"
      />
      {tileError && (
        <p
          role="status"
          className="absolute bottom-3 left-3 z-[500] rounded-xl bg-white/95 px-3 py-2 text-xs text-[#26352E] shadow"
        >
          Bản đồ nền tạm thời chưa tải được, danh sách điểm đến vẫn dùng bình thường.
        </p>
      )}
      <div className="absolute top-3 right-3 z-[500] inline-flex items-center gap-1.5 rounded-full bg-white/95 px-3 py-1.5 text-xs font-bold text-[#174C3C] shadow-md border border-[#174C3C]/10 backdrop-blur-sm">
        <Navigation size={13} className="text-[#D6A545]" />
        <span>Bản đồ du lịch Bình Mỹ</span>
      </div>
    </div>
  );
}
