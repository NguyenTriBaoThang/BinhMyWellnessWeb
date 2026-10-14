'use client';

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import {
  MapPin,
  Navigation,
  Compass,
  Layers,
  Sparkles,
  ExternalLink,
  Clock,
  Users,
  CheckCircle2,
  Calendar,
  Maximize2,
  RotateCcw,
} from 'lucide-react';
import { Service } from '@/types';
import { formatVND } from '@/lib/utils';
import 'leaflet/dist/leaflet.css';

interface LeafletMapProps {
  services: Service[];
  onSelectService: (service: Service) => void;
}

const CATEGORY_COLORS: Record<string, { bg: string; text: string; border: string; icon: string }> = {
  'Nông nghiệp': { bg: '#10b981', text: '#ffffff', border: '#059669', icon: '🌾' },
  'Ẩm thực': { bg: '#f59e0b', text: '#ffffff', border: '#d97706', icon: '🍲' },
  'Thiên nhiên': { bg: '#f43f5e', text: '#ffffff', border: '#e11d48', icon: '🪷' },
  'Nghỉ ngơi': { bg: '#0ea5e9', text: '#ffffff', border: '#0284c7', icon: '☕' },
  'Văn hóa': { bg: '#8b5cf6', text: '#ffffff', border: '#7c3aed', icon: '🏛️' },
};

const MAP_LAYERS = {
  voyager: {
    name: 'Bản đồ Du lịch',
    url: 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png',
    attribution: '&copy; CartoDB &copy; OpenStreetMap',
  },
  satellite: {
    name: 'Vệ tinh Sông Nước',
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
    attribution: '&copy; Esri &copy; Maxar, Earthstar Geographics',
  },
  osm: {
    name: 'Bản đồ Tiêu chuẩn',
    url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    attribution: '&copy; OpenStreetMap contributors',
  },
};

const BINH_MY_CENTER = { lat: 10.9605, lng: 106.6375 };

export default function LeafletMap({ services, onSelectService }: LeafletMapProps) {
  const [selectedService, setSelectedService] = useState<Service>(services[0] || null);
  const [activeCategory, setActiveCategory] = useState<string>('Tất cả');
  const [activeLayer, setActiveLayer] = useState<'voyager' | 'satellite' | 'osm'>('voyager');
  const [isMapLoaded, setIsMapLoaded] = useState(false);

  const mapContainerRef = useRef<HTMLDivElement>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const mapInstanceRef = useRef<any>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const tileLayerRef = useRef<any>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const markersRef = useRef<Map<string, any>>(new Map());

  // Filter services by category for map view
  const mapServices = services.filter((s) => {
    if (activeCategory === 'Tất cả') return true;
    return s.category === activeCategory;
  });

  // Initialize Leaflet Map (SSR-Safe)
  useEffect(() => {
    let isMounted = true;

    async function initMap() {
      if (!mapContainerRef.current || mapInstanceRef.current) return;

      const L = await import('leaflet');

      if (!isMounted || !mapContainerRef.current) return;

      const map = L.map(mapContainerRef.current, {
        center: [BINH_MY_CENTER.lat, BINH_MY_CENTER.lng],
        zoom: 14,
        minZoom: 12,
        maxZoom: 18,
        zoomControl: false,
      });

      L.control.zoom({ position: 'bottomright' }).addTo(map);

      // Add Tile Layer
      const initialTile = L.tileLayer(MAP_LAYERS[activeLayer].url, {
        attribution: MAP_LAYERS[activeLayer].attribution,
        maxZoom: 19,
      }).addTo(map);

      tileLayerRef.current = initialTile;
      mapInstanceRef.current = map;
      setIsMapLoaded(true);
    }

    initMap();

    return () => {
      isMounted = false;
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Handle Layer switch
  useEffect(() => {
    if (!mapInstanceRef.current || !tileLayerRef.current) return;
    import('leaflet').then((L) => {
      mapInstanceRef.current.removeLayer(tileLayerRef.current);
      const newTile = L.tileLayer(MAP_LAYERS[activeLayer].url, {
        attribution: MAP_LAYERS[activeLayer].attribution,
        maxZoom: 19,
      }).addTo(mapInstanceRef.current);
      tileLayerRef.current = newTile;
    });
  }, [activeLayer]);

  // Update Markers when map or filter or selection changes
  useEffect(() => {
    if (!mapInstanceRef.current || !isMapLoaded) return;

    import('leaflet').then((L) => {
      const map = mapInstanceRef.current;

      // Clear existing markers
      markersRef.current.forEach((marker) => map.removeLayer(marker));
      markersRef.current.clear();

      mapServices.forEach((service, index) => {
        const isSelected = selectedService?.id === service.id;
        const colorConfig = CATEGORY_COLORS[service.category] || {
          bg: '#10b981',
          text: '#ffffff',
          border: '#059669',
          icon: '📍',
        };

        const customHtml = `
          <div class="relative group cursor-pointer transition-transform duration-300 ${
            isSelected ? 'scale-125 z-50 animate-bounce' : 'hover:scale-110 z-20'
          }">
            <div style="background-color: ${colorConfig.bg}; border-color: ${colorConfig.border}"
                 class="w-9 h-9 rounded-2xl flex items-center justify-center text-white font-bold text-xs shadow-lg border-2 shadow-black/20 flex-col relative transition-all">
              <span class="text-[10px] leading-none mb-0.5">${colorConfig.icon}</span>
              <span class="text-[9px] font-black leading-none">${index + 1}</span>
            </div>
            ${
              isSelected
                ? `<div class="absolute -inset-1 rounded-2xl bg-emerald-400 opacity-60 blur-xs animate-ping -z-10"></div>`
                : ''
            }
          </div>
        `;

        const icon = L.divIcon({
          className: 'custom-leaflet-marker',
          html: customHtml,
          iconSize: [36, 36],
          iconAnchor: [18, 18],
          popupAnchor: [0, -20],
        });

        const marker = L.marker([service.latitude, service.longitude], { icon })
          .addTo(map)
          .bindTooltip(
            `<b>${service.providerName}</b><br><span style="color:#059669;font-weight:600">${formatVND(
              service.price
            )}</span>`,
            {
              direction: 'top',
              offset: [0, -14],
              className: 'custom-leaflet-tooltip font-sans text-xs',
            }
          )
          .on('click', () => {
            setSelectedService(service);
            map.flyTo([service.latitude, service.longitude], 15, { duration: 0.6 });
          });

        markersRef.current.set(service.id, marker);
      });
    });
  }, [mapServices, selectedService, isMapLoaded]);

  const handleResetCenter = () => {
    if (!mapInstanceRef.current) return;
    mapInstanceRef.current.flyTo([BINH_MY_CENTER.lat, BINH_MY_CENTER.lng], 14, { duration: 0.8 });
  };

  const handleSelectVenue = (service: Service) => {
    setSelectedService(service);
    if (mapInstanceRef.current) {
      mapInstanceRef.current.flyTo([service.latitude, service.longitude], 15, { duration: 0.6 });
    }
  };

  const categories = ['Tất cả', 'Nông nghiệp', 'Ẩm thực', 'Thiên nhiên', 'Nghỉ ngơi', 'Văn hóa'];

  return (
    <section id="map-section" className="scroll-mt-24 space-y-6">
      {/* Header section with modern badge and subtitle */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-river-100 text-river-900 text-xs font-bold mb-2 shadow-xs border border-river-200">
            <Compass className="w-4 h-4 text-river-700 animate-spin-slow" />
            <span>BẢN ĐỒ SỐ ĐỊA SINH THÁI THỜI GIAN THỰC</span>
          </div>
          <h2 className="text-2xl sm:text-4xl font-black text-forest-950 tracking-tight">
            Khám Phá Nhà Vườn & Ven Sông Bình Mỹ
          </h2>
          <p className="text-zinc-600 text-xs sm:text-sm mt-1 max-w-2xl">
            Tọa độ chuẩn xác của 8 cơ sở đối tác sinh thái trải dọc bờ hữu ngạn sông Sài Gòn, kênh Rạch Dứa và trục đường Hà Duy Phiên (Tỉnh lộ 9).
          </p>
        </div>

        {/* Layer Switcher & Reset Button */}
        <div className="flex items-center gap-2 self-start md:self-end">
          <div className="inline-flex p-1 bg-white rounded-2xl border border-zinc-200 shadow-xs">
            {(['voyager', 'satellite', 'osm'] as const).map((layerKey) => (
              <button
                key={layerKey}
                onClick={() => setActiveLayer(layerKey)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  activeLayer === layerKey
                    ? 'bg-forest-800 text-white shadow-xs'
                    : 'text-zinc-600 hover:text-forest-900 hover:bg-zinc-100'
                }`}
              >
                {MAP_LAYERS[layerKey].name}
              </button>
            ))}
          </div>

          <button
            onClick={handleResetCenter}
            title="Đưa bản đồ về trung tâm xã Bình Mỹ"
            className="p-2.5 bg-white hover:bg-forest-50 text-zinc-700 hover:text-forest-800 rounded-2xl border border-zinc-200 shadow-xs transition-all flex items-center gap-1.5 text-xs font-semibold"
          >
            <RotateCcw className="w-4 h-4 text-forest-600" />
            <span className="hidden sm:inline">Về trung tâm</span>
          </button>
        </div>
      </div>

      {/* Category Pills on top of map */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
        {categories.map((cat) => {
          const color = CATEGORY_COLORS[cat];
          const isCatActive = activeCategory === cat;
          return (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 flex items-center gap-1.5 border ${
                isCatActive
                  ? 'bg-forest-800 text-white border-forest-800 shadow-xs scale-102'
                  : 'bg-white text-zinc-700 hover:bg-zinc-50 border-zinc-200'
              }`}
            >
              {color && <span>{color.icon}</span>}
              <span>{cat}</span>
              {cat === 'Tất cả' && <span className="text-[10px] opacity-75">({services.length})</span>}
            </button>
          );
        })}
      </div>

      {/* Main Interactive Map Layout: Grid 12 cols */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        {/* Interactive Map Box: 8 cols */}
        <div className="lg:col-span-8 bg-zinc-100 rounded-3xl overflow-hidden border border-zinc-300 shadow-lg relative min-h-[440px] sm:min-h-[540px] flex flex-col">
          {/* Leaflet Container */}
          <div ref={mapContainerRef} className="w-full h-full min-h-[440px] sm:min-h-[540px] z-10" />

          {/* Floating Waterways Guide Overlay */}
          <div className="absolute top-4 left-4 z-20 pointer-events-none flex flex-col gap-2">
            <div className="bg-white/95 backdrop-blur-md px-3.5 py-2 rounded-2xl border border-emerald-200/90 shadow-md flex items-center gap-2 pointer-events-auto">
              <span className="w-3 h-3 rounded-full bg-river-500 animate-pulse"></span>
              <span className="text-xs font-bold text-river-950">
                Sông Sài Gòn & Kênh Rạch Dứa
              </span>
            </div>
            <div className="bg-white/90 backdrop-blur-md px-3 py-1.5 rounded-xl border border-zinc-200 shadow-xs text-[11px] text-zinc-600 hidden sm:flex items-center gap-1.5 pointer-events-auto">
              <span>💡 Nhấp vào từng điểm để khám phá nhà vườn</span>
            </div>
          </div>

          {/* Floating Bottom Quick Selection Carousel on Map */}
          <div className="absolute bottom-4 left-4 right-16 z-20 overflow-x-auto flex gap-2 no-scrollbar pointer-events-auto py-1">
            {mapServices.map((service, idx) => {
              const isSelected = selectedService?.id === service.id;
              const color = CATEGORY_COLORS[service.category];
              return (
                <button
                  key={service.id}
                  onClick={() => handleSelectVenue(service)}
                  className={`px-3 py-1.5 rounded-xl text-left transition-all shrink-0 backdrop-blur-md border shadow-md flex items-center gap-2 max-w-[210px] ${
                    isSelected
                      ? 'bg-forest-900 text-white border-emerald-400 scale-105 z-30'
                      : 'bg-white/95 hover:bg-white text-zinc-800 border-white/60'
                  }`}
                >
                  <span
                    style={{ backgroundColor: color?.bg || '#10b981' }}
                    className="w-5 h-5 rounded-lg text-white font-bold text-[10px] flex items-center justify-center shrink-0"
                  >
                    {idx + 1}
                  </span>
                  <div className="truncate">
                    <p className={`text-xs font-bold truncate ${isSelected ? 'text-white' : 'text-zinc-900'}`}>
                      {service.providerName}
                    </p>
                    <p className={`text-[10px] font-mono ${isSelected ? 'text-emerald-300 font-semibold' : 'text-forest-700'}`}>
                      {formatVND(service.price)}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Selected Venue Showcase Side Card: 4 cols */}
        {selectedService ? (
          <div className="lg:col-span-4 bg-white rounded-3xl p-6 border border-emerald-100 shadow-xl flex flex-col justify-between transition-all">
            <div className="space-y-4">
              {/* Photo & Category Tag */}
              <div className="relative h-48 sm:h-52 rounded-2xl overflow-hidden shadow-sm group">
                <Image
                  src={selectedService.image}
                  alt={selectedService.name}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

                <div className="absolute top-3 left-3 flex items-center gap-1.5">
                  <span className="bg-forest-900/90 backdrop-blur-md text-emerald-300 text-xs font-bold px-3 py-1 rounded-full border border-emerald-400/30">
                    {selectedService.category}
                  </span>
                  {selectedService.indoor && (
                    <span className="bg-white/90 backdrop-blur-md text-zinc-800 text-[11px] font-semibold px-2 py-1 rounded-full">
                      Mái che
                    </span>
                  )}
                </div>

                <div className="absolute bottom-3 left-3 right-3 text-white">
                  <span className="text-[11px] font-bold text-emerald-300 uppercase tracking-wider block">
                    {selectedService.providerName}
                  </span>
                  <h3 className="font-extrabold text-base leading-snug line-clamp-1 drop-shadow-sm">
                    {selectedService.name}
                  </h3>
                </div>
              </div>

              {/* Address with Google Maps link */}
              <div className="bg-forest-50/60 p-3.5 rounded-2xl border border-emerald-100 space-y-2">
                <div className="flex items-start gap-2 text-xs text-forest-950">
                  <MapPin className="w-4 h-4 text-forest-600 shrink-0 mt-0.5" />
                  <span className="leading-relaxed">
                    {selectedService.providerAddress || 'Xã Bình Mỹ, Huyện Củ Chi, TP.HCM'}
                  </span>
                </div>

                <a
                  href={`https://www.google.com/maps/dir/?api=1&destination=${selectedService.latitude},${selectedService.longitude}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-[11px] font-bold text-forest-700 hover:text-forest-900 hover:underline pt-1"
                >
                  <Navigation className="w-3.5 h-3.5 text-forest-600" />
                  <span>Mở Google Maps chỉ đường</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>

              {/* Capacity & Price Details */}
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="bg-zinc-50 p-2.5 rounded-xl border border-zinc-200">
                  <span className="text-[10px] text-zinc-500 font-medium block">Thời lượng trải nghiệm</span>
                  <span className="font-bold text-zinc-900 flex items-center gap-1 mt-0.5">
                    <Clock className="w-3.5 h-3.5 text-forest-600" />
                    {selectedService.duration} phút
                  </span>
                </div>
                <div className="bg-zinc-50 p-2.5 rounded-xl border border-zinc-200">
                  <span className="text-[10px] text-zinc-500 font-medium block">Chi phí / khách</span>
                  <span className="font-black text-forest-800 text-sm font-mono mt-0.5 block">
                    {formatVND(selectedService.price)}
                  </span>
                </div>
              </div>

              {/* Operating Slots */}
              <div>
                <span className="text-[11px] font-bold text-zinc-500 uppercase tracking-wider block mb-1.5">
                  Khung giờ đón khách:
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {selectedService.slots.map((slot) => (
                    <span
                      key={slot}
                      className="px-2.5 py-1 rounded-lg bg-zinc-100 text-zinc-800 text-xs font-mono font-semibold"
                    >
                      {slot}
                    </span>
                  ))}
                </div>
              </div>

              {/* Description summary */}
              <p className="text-xs text-zinc-600 line-clamp-2 leading-relaxed">
                {selectedService.description}
              </p>
            </div>

            {/* Action buttons */}
            <div className="pt-5 border-t border-zinc-100 flex flex-col gap-2">
              <button
                onClick={() => onSelectService(selectedService)}
                className="w-full py-3 rounded-2xl bg-forest-700 hover:bg-forest-800 text-white font-extrabold text-sm transition-all shadow-md shadow-forest-700/25 flex items-center justify-center gap-2 group cursor-pointer"
              >
                <Calendar className="w-4 h-4 text-emerald-300 group-hover:scale-110 transition-transform" />
                <span>Đặt Chỗ Trải Nghiệm Này</span>
              </button>
            </div>
          </div>
        ) : (
          <div className="lg:col-span-4 bg-white rounded-3xl p-8 border border-zinc-200 text-center flex flex-col items-center justify-center text-zinc-500 text-sm">
            <Compass className="w-10 h-10 text-zinc-400 mb-2 animate-bounce" />
            <p>Chọn một địa điểm trên bản đồ để xem chi tiết nhà vườn</p>
          </div>
        )}
      </div>
    </section>
  );
}
