'use client';

import { useMemo, useState } from 'react';
import {
  CalendarDays,
  Clock3,
  ExternalLink,
  Map as MapIcon,
  MapPin,
  Navigation,
  Phone,
} from 'lucide-react';

type MapLocation = {
  id: string;
  name: string;
  address: string;
  description: string;
  hours?: string;
  phone?: string;
};

const ACTIVE_MONTHS = [1, 2, 3, 7, 8, 9] as const;

const LOCATIONS: Record<string, MapLocation> = {
  'kdl-binh-my': {
    id: 'kdl-binh-my',
    name: 'Khu Du lịch Sinh thái Bình Mỹ',
    address: 'Số 298, Đường Sông Lu, Ấp An Hòa, Xã Bình Mỹ, Thành phố Hồ Chí Minh',
    description: 'Điểm đón khách và trải nghiệm vườn, Vườn Ký Ức BM, workshop và các hoạt động sông nước của Bình Mỹ.',
    hours: '08:00–17:00 hằng ngày (theo website điểm đến)',
    phone: '0969 380 117',
  },
  'kdl-ven-song': {
    id: 'kdl-ven-song',
    name: 'KDL Sinh thái ven sông Bình Mỹ',
    address: 'Số 22 Đường Nguyễn Thị Da, Xã Bình Mỹ, Thành phố Hồ Chí Minh',
    description: 'Khu du lịch sinh thái ven sông; vui lòng liên hệ cơ sở để xác nhận giờ mở cửa và dịch vụ trước chuyến đi.',
  },
  'cau-rach-day': {
    id: 'cau-rach-day',
    name: 'Điểm chèo xuồng Rạch Đáy',
    address: 'Cầu Rạch Đáy, Đường Đỗ Thị Nhặt, Ấp An Hòa, Xã Bình Mỹ, Thành phố Hồ Chí Minh',
    description: 'Điểm tập trung chèo xuồng Rạch Đáy. Hãy liên hệ điểm đón 298 Sông Lu để được hướng dẫn điểm tập trung theo lịch tour.',
    phone: '0969 380 117',
  },
};

const MONTH_PLANS: Record<number, { title: string; focus: string; locationIds: string[]; notice: string }> = {
  1: {
    title: 'Du xuân Bình Mỹ',
    focus: 'Vườn Ký Ức BM, trải nghiệm vườn và chủ đề Tết xưa.',
    locationIds: ['kdl-binh-my'],
    notice: 'Chủ đề Tết theo kế hoạch tháng 1; cần xác nhận ngày tổ chức và dịch vụ với điểm đến.',
  },
  2: {
    title: 'Valentine bên sông Bình Mỹ',
    focus: 'Không gian sinh thái, ẩm thực và hoạt động dành cho cặp đôi.',
    locationIds: ['kdl-ven-song', 'kdl-binh-my'],
    notice: 'Chương trình Valentine là nội dung kế hoạch; cần xác nhận lịch, dịch vụ và đặt chỗ với cơ sở.',
  },
  3: {
    title: 'Tháng Thanh niên: Trải nghiệm làng nghề',
    focus: 'Workshop thủ công tại khu du lịch và hành trình chèo xuồng Rạch Đáy.',
    locationIds: ['kdl-binh-my', 'cau-rach-day'],
    notice: 'Điểm đón Rạch Đáy đã được xác định; workshop và lịch tham quan cần xác nhận trước khi đi.',
  },
  7: {
    title: 'Trại hè xanh: Nông dân nhí Bình Mỹ',
    focus: 'Hoạt động làm vườn, vào bếp và trò chơi cho trẻ em theo tài liệu tháng 7.',
    locationIds: ['kdl-binh-my'],
    notice: 'Địa điểm thật được hiển thị; ngày tổ chức, sức chứa và hoạt động cho đoàn cần cơ sở xác nhận.',
  },
  8: {
    title: 'Bếp quê Bình Mỹ: Về Bình Mỹ – Thưởng thức vị quê',
    focus: 'Phiên chợ món quê và workshop nấu ăn theo kế hoạch tháng 8.',
    locationIds: ['kdl-binh-my'],
    notice: 'Địa điểm tổ chức lễ hội và danh sách gian hàng chưa được xác nhận; vui lòng liên hệ trước.',
  },
  9: {
    title: 'Trăng về Bình Mỹ: Đêm hội Trung thu',
    focus: 'Workshop đèn lồng, rước đèn và hoạt động Trung thu theo tài liệu tháng 9.',
    locationIds: ['kdl-binh-my'],
    notice: 'Đây là kế hoạch mùa vụ; cần xác nhận ngày Trung thu, sân khấu và chương trình với cơ sở.',
  },
};

export default function MonthlyDestinationMap() {
  const [activeMonth, setActiveMonth] = useState<number>(1);
  const [selectedLocationId, setSelectedLocationId] = useState('kdl-binh-my');
  const monthPlan = MONTH_PLANS[activeMonth];
  const monthLocations = useMemo(
    () => monthPlan.locationIds.map((id) => LOCATIONS[id]),
    [monthPlan]
  );
  const selectedLocation = monthLocations.find((location) => location.id === selectedLocationId) ?? monthLocations[0];
  const mapUrl = `https://maps.google.com/maps?q=${encodeURIComponent(selectedLocation.address)}&output=embed`;
  const directionsUrl = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(selectedLocation.address)}`;

  const selectMonth = (month: number) => {
    setActiveMonth(month);
    setSelectedLocationId(MONTH_PLANS[month].locationIds[0]);
  };

  return (
    <section id="map-section" className="scroll-mt-24 space-y-5">
      <div className="max-w-3xl">
        <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-river-200 bg-river-100 px-3.5 py-1.5 text-xs font-bold text-river-900">
          <MapIcon className="h-4 w-4 text-river-700" />
          BẢN ĐỒ ĐỊA ĐIỂM THEO THÁNG HOẠT ĐỘNG
        </div>
        <h2 className="text-2xl font-black tracking-tight text-forest-950 sm:text-4xl">
          Địa điểm thật tại Bình Mỹ
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-zinc-600">
          Chọn tháng để xem đúng các điểm đến có trong kế hoạch. Bản đồ tìm theo địa chỉ của từng điểm; lịch chương trình cần được cơ sở xác nhận.
        </p>
      </div>

      <nav aria-label="Chọn tháng hoạt động" className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
        {ACTIVE_MONTHS.map((month) => (
          <button
            key={month}
            type="button"
            aria-pressed={activeMonth === month}
            onClick={() => selectMonth(month)}
            className={`shrink-0 rounded-xl border px-4 py-2 text-sm font-bold transition-colors ${
              activeMonth === month
                ? 'border-forest-800 bg-forest-800 text-white shadow-sm'
                : 'border-zinc-200 bg-white text-zinc-700 hover:bg-zinc-50'
            }`}
          >
            Tháng {month}
          </button>
        ))}
      </nav>

      <div className="grid grid-cols-1 items-stretch gap-5 lg:grid-cols-12">
        <div className="relative min-h-[400px] overflow-hidden rounded-3xl border border-zinc-300 bg-zinc-100 shadow-lg lg:col-span-8 sm:min-h-[520px]">
          <iframe
            key={selectedLocation.id}
            title={`Bản đồ ${selectedLocation.name}`}
            src={mapUrl}
            className="absolute inset-0 h-full w-full border-0"
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          />
          <a
            href={directionsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="absolute bottom-4 left-4 inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2.5 text-xs font-bold text-forest-900 shadow-lg ring-1 ring-black/5 hover:bg-forest-50"
          >
            <Navigation className="h-4 w-4 text-forest-700" />
            Chỉ đường đến điểm đang chọn
            <ExternalLink className="h-3.5 w-3.5" />
          </a>
        </div>

        <aside className="flex flex-col gap-4 rounded-3xl border border-emerald-100 bg-white p-5 shadow-sm lg:col-span-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-emerald-700">Tháng {activeMonth} · {monthPlan.title}</p>
            <p className="mt-2 text-sm leading-relaxed text-zinc-600">{monthPlan.focus}</p>
          </div>

          <div className="space-y-2" aria-label={`Địa điểm tháng ${activeMonth}`}>
            {monthLocations.map((location, index) => {
              const isSelected = selectedLocation.id === location.id;
              return (
                <button
                  key={location.id}
                  type="button"
                  aria-pressed={isSelected}
                  onClick={() => setSelectedLocationId(location.id)}
                  className={`w-full rounded-2xl border p-3 text-left transition-colors ${
                    isSelected ? 'border-emerald-500 bg-emerald-50' : 'border-zinc-200 bg-white hover:bg-zinc-50'
                  }`}
                >
                  <span className="flex items-start gap-2.5">
                    <span className={`mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-lg text-xs font-black ${isSelected ? 'bg-forest-800 text-white' : 'bg-zinc-100 text-zinc-700'}`}>
                      {index + 1}
                    </span>
                    <span className="min-w-0">
                      <span className="block text-sm font-bold text-zinc-900">{location.name}</span>
                      <span className="mt-1 flex items-start gap-1 text-xs leading-relaxed text-zinc-600">
                        <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-700" />
                        {location.address}
                      </span>
                    </span>
                  </span>
                </button>
              );
            })}
          </div>

          <div className="flex-1 rounded-2xl bg-zinc-50 p-4">
            <div className="flex items-start gap-2">
              <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-forest-700" />
              <div>
                <h3 className="text-sm font-extrabold text-zinc-900">{selectedLocation.name}</h3>
                <p className="mt-1 text-xs leading-relaxed text-zinc-600">{selectedLocation.description}</p>
              </div>
            </div>
            {selectedLocation.hours && (
              <p className="mt-3 flex items-start gap-2 text-xs text-zinc-700">
                <Clock3 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-forest-700" /> {selectedLocation.hours}
              </p>
            )}
            {selectedLocation.phone && (
              <a href={`tel:${selectedLocation.phone.replaceAll(' ', '')}`} className="mt-2 inline-flex items-center gap-2 text-xs font-semibold text-forest-800 hover:underline">
                <Phone className="h-3.5 w-3.5" /> {selectedLocation.phone}
              </a>
            )}
          </div>

          <a
            href="/#experiences-grid"
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-forest-800 px-3.5 py-2.5 text-xs font-bold text-white hover:bg-forest-900"
          >
            Xem dịch vụ và đặt chỗ
            <ExternalLink className="h-3.5 w-3.5" />
          </a>

          <p className="flex items-start gap-2 rounded-xl border border-amber-200 bg-amber-50 p-3 text-xs leading-relaxed text-amber-900">
            <CalendarDays className="mt-0.5 h-4 w-4 shrink-0" /> {monthPlan.notice}
          </p>
        </aside>
      </div>
    </section>
  );
}
